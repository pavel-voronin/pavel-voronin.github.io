---
description: "A tiny local Rust daemon over TDLib that holds one Telegram user session and exposes live raw updates as NDJSON for agents and pipelines."
language: en
translationKey: tgdyk
date: 2026-07-07
publish-to: all
icon: streamline-ultimate-color:send-email-fly
titleLines: 2
comments: true
topics: AI toolchain, Telegram
image: og-image.jpg
---

# tgdyk: Telegram as an event stream for local agents

::external-link-card
---
url: https://github.com/pavel-voronin/tgdyk
title: pavel-voronin/tgdyk
icon: streamline-ultimate-color:github-logo-1
---
::

Telegram is where signals live for many of us: work chats, channels, alerts, direct messages. If you're building an agent or any automation, sooner or later you face the same task: giving your tooling eyes inside your Telegram.

The Bot API doesn't work for this. A bot is a separate entity: it doesn't see your dialogs, doesn't read the channels you follow, and only operates where it has been explicitly added. You need a user session. Libraries like Telethon or gramjs solve the problem, but every script drags a full client along with it: authorization, session storage, reconnects. Once you have several tools, this turns into duplicating the same infrastructure over and over.

I wrote [tgdyk](https://github.com/pavel-voronin/tgdyk) — a tiny local daemon that solves exactly one problem: it holds a single Telegram user session and hands out live TDLib updates to local tools as NDJSON.

## How it works

A single Rust binary on top of TDLib. Four commands:

- `setup` — enter your `api_id` and `api_hash` from [my.telegram.org/apps](https://my.telegram.org/apps), your phone number and the code. Once.
- `daemon` — starts TDLib and publishes updates over a local Unix socket.
- `stream` — prints raw TDLib updates line by line as JSON.
- `doctor` — checks TDLib, the config, the paths, and the connection to the daemon.

From there it's plain Unix composition:

```bash
./tgdyk stream | jq .
```

New text messages only:

```bash
./tgdyk stream | jq -r 'select(.["@type"] == "updateNewMessage") | .message.content.text.text // empty'
```

That's where tgdyk's responsibility ends. Everything downstream — filtering, routing, reacting — is assembled from what you already have: shell, jq, a Python script, an LLM call.

## Why agents need this

The typical scenario: an agent runs in the background, and you want Telegram events to reach it without polling and without you in the loop. A message in a work chat, an alert from a monitoring channel, a reply to your post — all of it arrives in the stream as structured JSON, and what happens next is up to you: wake the agent, push to a queue, hit a webhook.

A pipeline is one line:

```bash
./tgdyk stream \
  | jq -c 'select(.["@type"] == "updateNewMessage")' \
  | while read -r msg; do
      # your handler goes here: a script, a queue, an agent call
      echo "$msg" >> inbox.ndjson
    done
```

No SDK, no language lock-in. If a tool can read stdin or a Unix socket, it can read your Telegram.

You don't even have to write these pipelines by hand. Modern agents are fluent in the CLI and Unix composition — jq, streams, redirects, systemd units. Tell your agent "subscribe to channel X and put the alerts in a queue," and it will build the plumbing itself. tgdyk gives it a primitive that this assembles from reliably.

## Design decisions

**Raw updates.** tgdyk doesn't invent its own schema on top of TDLib. The TDLib types are the contract: they're documented, stable, and cover everything that happens in an account. Any wrapper would mean losing information and adding one more layer to maintain.

**Live only.** tgdyk doesn't store history and has no replay. If you need persistence, it's one line in your pipeline (`>> inbox.ndjson`), and you choose the format and the storage yourself. The only thing on disk is TDLib's standard local database with the session and its cache.

**A local Unix socket.** No ports, no tokens, no auth layer. Access to the stream is governed by filesystem permissions. This is a deliberate narrowing: tgdyk is a tool for your machine, not a network service.

**TDLib included.** Building TDLib is a well-known pain. Releases bundle `libtdjson` for macOS (Intel and Apple Silicon) and Linux (x64 and arm64), so the path from download to stream is a few commands.

## Limitations

`stream` only delivers what happens after you connect — start it before the events you want to catch. The daemon runs in the foreground: systemd, tmux, or a supervisor, your choice. And most importantly: this is your user session. Anything that connects to the socket sees your entire account — treat the machine running the daemon accordingly.

## Summary

tgdyk occupies one narrow spot in the pipeline: a live bridge between your Telegram account and local tools. Everything else is your composition.

Rust, MIT, binary releases for macOS and Linux: [github.com/pavel-voronin/tgdyk](https://github.com/pavel-voronin/tgdyk)
