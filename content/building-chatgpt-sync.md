---
description: A build log on turning ChatGPT conversations into a local Markdown archive through CDP, backend JSON, and incremental sync.
date: 2026-04-30
publish-to: all
icon: streamline-ultimate-color:conversation-sync
titleLines: 1
comments: true
topics: build log, AI toolchain
image: og-image.jpg
---

# Building `chatgpt-sync`

::external-link-card
---
url: https://github.com/pavel-voronin/chatgpt-sync
title: pavel-voronin/chatgpt-sync
icon: streamline-ultimate-color:github-logo-1
---
::

[`chatgpt-sync`](https://github.com/pavel-voronin/chatgpt-sync) started as a small local tool for exporting ChatGPT conversations into Markdown files. The initial idea was simple: use an already authenticated ChatGPT session, read the conversation list, fetch each conversation, render it into Markdown, and keep the result in a local workspace. After a few iterations, the project became less of a one-shot exporter and more of a sync engine. The difference is mostly operational: an exporter can assume that it runs once and either succeeds or fails, while a sync engine has to handle repeated runs, partial progress, moved files, missing assets, unavailable conversations, backend failures, and changes in the remote data model.

The project is a TypeScript/Node CLI. It does not use the public OpenAI API and it does not implement its own login flow. Instead, it connects to a separate Chrome instance through Chrome DevTools Protocol and uses an already authenticated ChatGPT profile. Chrome is used as the authenticated browser context; the tool then performs backend requests from inside that context and writes Markdown files, assets, and an `index.json` file into a local workspace.

The basic flow now looks like this:

```text
authenticated Chrome profile
→ CDP session
→ ChatGPT backend requests from browser runtime
→ conversation JSON
→ Markdown renderer
→ local workspace
```

This post is a build log of how the architecture moved toward that shape.

## Starting with the browser session

The first implementation decision was to avoid owning authentication. The tool should not store a password, automate a login form, or implement a separate auth protocol. It should assume that the user has a Chrome profile where ChatGPT already works, and it should operate through that profile. This made CDP the natural entry point: the program can inspect tabs, open or reuse a ChatGPT tab, enable `Network`, `Page`, and `Runtime` domains, and evaluate JavaScript in the page context.

This approach also means that the normal working setup is a separate Chrome process with a separate profile, not the user’s everyday GUI Chrome. That avoids interfering with the user’s browser and gives the CLI a controlled runtime. The CDP layer stayed small: connect to the WebSocket debugger URL, keep track of pending CDP requests, dispatch events, create or select the ChatGPT tab, apply a few browser-session preparations, and expose helpers for runtime evaluation.

The early version relied more on navigation. It opened a conversation page and captured the backend response that the ChatGPT UI loaded. That was enough to prove the path from Chrome session to Markdown output, but it tied export to UI navigation. Later versions changed this: the tool now performs a direct `fetch("/backend-api/conversation/{id}")` from the browser runtime. Chrome is still needed for authentication and browser-originated context, but exporting a conversation no longer depends on navigating the tab to that conversation.

## Backend API instead of DOM

A DOM-based exporter would have been easier to prototype but worse as a sync tool. The DOM is the rendered interface, not the conversation data model. It can miss hidden state, mix UI details into content, depend on layout changes, and make it hard to handle assets, citations, Canvas documents, or alternative branches.

The project therefore moved toward backend JSON. The list of conversations is read from the ChatGPT backend, and each conversation is exported from its backend payload. This gives the renderer access to the mapping, metadata, content parts, attachments, references, and other structures that are not reliably available as visible page text.

The cost is that this is not a stable public contract. The tool depends on internal ChatGPT backend endpoints, expected headers, and the current shape of conversation JSON. That trade-off is central to the project: backend JSON is much more useful than DOM text for this task, but it requires defensive code and debug hooks because the format can change.

## Header capture became its own problem

At first it was tempting to think that cookies would be enough. In practice, backend requests need more context. The ChatGPT web app sends authorization and several client/session/build/language/route headers, and some of them are not always available in the first network event. The tool now listens to both `Network.requestWillBeSent` and `Network.requestWillBeSentExtraInfo`, merges headers by request id, identifies backend requests by path and target headers, and validates that a usable header context has been collected.

This also changed the preparation phase. If the selected tab is already on a conversation URL, the tool moves it back to the ChatGPT root before collecting headers. If the right backend requests do not appear, it performs a lightweight probe to the conversations endpoint from the page context. The goal is not to guess headers manually, but to observe the headers that the real web app is using and then reuse the relevant parts for list and conversation fetches.

That became one of the more important reliability improvements. The sync process now has an explicit “prepare backend context” phase instead of assuming that any visible ChatGPT page is immediately enough.

## Separating scan from export

The next architectural change was splitting the process into scan and export phases. Reading the conversation list and exporting full conversation payloads have different costs and failure modes. List scanning is relatively cheap, can be paginated, and can save summaries as it goes. Conversation export is heavier: it fetches full payloads, renders Markdown, downloads assets, writes files, and updates status.

The scan phase now reads pages of conversation summaries, applies the selected mode, and records which conversations are new or changed. Those conversations become `pending` in `index.json`. The export phase then takes a bounded batch of pending conversations and exports them one by one.

This made incremental sync easier to reason about. If scanning fails after several pages, the summaries already seen can remain in the index, but the watermark is not advanced. If export fails, the remaining conversations stay pending. A later run can continue without assuming that the previous run completed cleanly.

The project also distinguishes first-run bootstrap from normal sync. A first run with no watermark has to be explicit: export the latest N conversations, export conversations from the last N days, or scan the full history. After that, incremental sync can use a watermark plus an overlap window to avoid missing borderline updates.

## The index is sync state, not the archive

The local state file is `workspace/index.json`. It stores the sync watermark, backend lock information, and per-conversation state such as summary, status, and last synced update marker. The important part is what it does not try to be: it is not the full database of the archive.

Earlier versions stored more file metadata in the index. Later versions reduced this and moved toward workspace-driven sync. The Markdown files themselves contain frontmatter with the conversation id, title, source URL, and update timestamp. On startup, the tool recursively scans the workspace, reads frontmatter, and builds a map from `conversation_id` to the current Markdown path.

This allows the user to move exported files around inside the workspace. New conversations are written to the inbox directory, but existing conversations are updated where they already live. If a previously exported file disappears, the sync engine can mark that conversation as locally removed instead of recreating it blindly. This made the filesystem part of the model instead of treating it as a disposable output directory.

## Rendering turned out to be most of the work

The Markdown renderer became the largest and most product-specific part of the project. A ChatGPT conversation is not just a flat list of messages. It is a tree with a `current_node`, message metadata, content parts, attachments, tool messages, possible Canvas state, research reports, citations, and other references.

One early issue was branch handling. A recursive walk over children can mix alternative branches of the conversation. The renderer now builds the path from `current_node` back to the root and renders that path in order. This means the Markdown follows the currently visible branch rather than trying to preserve every alternative response.

The renderer also filters internal or non-user-facing content. System messages, raw tool calls, model context, reasoning-related internals, and canmore service messages are not useful as normal Markdown transcript content. Some of them are ignored; some are used to reconstruct visible artifacts. This is especially relevant for Canvas. The raw canmore create/update messages are not rendered as a log, but they are used to maintain the active text document state, so the output can contain the resulting document rather than the implementation protocol.

Deep Research required another special case. Some report content is not stored like a normal assistant message. The renderer detects the relevant metadata, parses the widget state, extracts the report message, and renders it as Markdown. Citations and content references are also handled separately: source footnotes, nav lists, entity references, and inline link lists are converted into Markdown links or source sections where possible.

This is the part of the project where “exporting chat messages” became too small a description. The renderer has to preserve useful artifacts, not only visible text.

## Assets and partial failure

Assets are handled through placeholders during render and resolved after files are downloaded. The project supports several placement strategies: a fixed assets folder, assets next to the Markdown file, assets at the workspace root, or a subfolder next to the current Markdown file. Before a conversation is re-exported, old asset artifacts for that Markdown file are removed so that stale files do not remain attached to an updated export.

Asset download also needed a non-fatal failure mode. A conversation can be exportable even when one file is no longer available or one signed download URL fails. In that case, the Markdown should still be written, and the missing asset should be replaced with a readable note. On the other hand, statuses such as 429 or 5xx are treated as backend-level problems and can stop the run.

This was a small but important distinction: one missing file should not destroy the text export, but backend pressure or service failure should not be ignored.

## Backend locks and unavailable conversations

Once the tool became suitable for repeated runs, backend failure handling had to be more explicit. Some errors indicate that continuing is probably wrong: 401, 403, 408, 429, 5xx, or a missing/unknown backend status. These can set a backend lock in the index. A later run can exit early while the lock is active instead of repeatedly hitting the same failing backend.

A 404 for one conversation is handled differently. It does not necessarily mean that the backend is unavailable; it can mean that this specific conversation payload cannot be fetched. In that case the conversation is marked `unavailable`, and the rest of the sync can continue. This became part of the current error model in the latest version.

The same general rule appears in several places: distinguish local or item-level failure from global backend failure, keep enough state to retry safely, and avoid turning every error into either a full crash or silent success.

## Current shape

The current architecture is a small local CLI with a few clear layers: CDP session preparation, backend header capture, list scanning, conversation export, Markdown rendering, asset handling, and index storage. The tool uses ChatGPT’s web app context to access structured backend data, but the user-facing result is just files in a local workspace.

The main trade-off remains unchanged. This is not an official ChatGPT integration, so the backend contract can break. The project compensates with debug modes, raw JSON dumps, unknown-part rendering, typed backend errors, throttling, batch limits, and a renderer that can be extended when new content shapes appear.

The final design is still simple in form: run a CLI, use an authenticated Chrome profile, write Markdown files. Most of the work is in the details around making that repeatable without treating the local archive as a temporary dump and without assuming that the remote system is stable.

## Trying it locally

The project is on GitHub: [pavel-voronin/chatgpt-sync](https://github.com/pavel-voronin/chatgpt-sync). The README has the full setup notes, but the short version is:

1. Clone the repository and install dependencies.

```bash
git clone https://github.com/pavel-voronin/chatgpt-sync.git
cd chatgpt-sync
npm install
```

2. Start a dedicated Chrome instance with a CDP endpoint. The Chrome profile used here must already be authenticated in ChatGPT.

```bash
open -na "/Applications/Google Chrome.app" --args \
  --headless \
  --disable-gpu \
  --remote-debugging-port=9222 \
  --user-data-dir="$HOME/.chrome-chatgpt-sync" \
  --no-first-run \
  about:blank
```

After the first start, open the same profile without `--headless` if you need to sign in to ChatGPT manually, then restart it in headless mode.

3. Create a local env file and choose the first-run bootstrap mode.

```bash
cat > .env.local <<'EOF'
CHATGPT_SYNC_CDP_HTTP=http://127.0.0.1:9222
CHATGPT_SYNC_WORKSPACE_DIR=./output
CHATGPT_SYNC_BOOTSTRAP_MODE=count
CHATGPT_SYNC_BOOTSTRAP_COUNT=5
EOF
```

4. Run the sync.

```bash
npm start
```

The default output goes into `./output`. The Markdown files are written there, and sync state is stored in `output/index.json`. After the first run, normal incremental runs can be started with the same command:

```bash
npm start
```

For the full list of options, see the project’s [README](https://github.com/pavel-voronin/chatgpt-sync).
