---
title: Cognitive Debt
description: What cognitive debt is, whether it is scary, and how to manage it.
date: 2026-06-02
publish-to: all
translationKey: cognitive-debt
icon: streamline-ultimate-color:programming-user-chat
image: og-image.jpg
titleLines: 1
comments: true
topics: AI, engineering
---

# Cognitive Debt

Cognitive debt is the gap between the code and your understanding of it. As long as you write the code yourself, the debt barely accumulates: understanding comes along the way, line by line. But once someone else starts writing it — and today that someone is usually AI — the link between what's written and what's understood breaks. The code arrives finished, while the understanding has to be acquired through a separate effort. And the more code there is, the more of that effort it takes.

The good news is that you don't need to acquire all of it. Reading every line is a losing strategy by definition: it takes about as long as writing the whole thing yourself. Almost all understanding rests on just a few things — they cut cognitive debt the most, while everything else returns far less.

**Essence** — the boundary of responsibility tells you more about the intent than a list of functions:

- what the code is responsible for;
- what it deliberately doesn't do.

**Boundaries** — where the code ends and the rest of the system begins:

- what it talks to on the outside;
- what it hides inside;
- how it's meant to be extended.

**Contracts** — what the code promises to whoever calls it:

- what it takes as input;
- what it returns.

A short feedback loop with the agent helps you grasp all three:

1. first, the agent describes the essence, boundaries, and contracts — its interpretation of the code;
2. then you freely explain, out loud and in your own words, everything you understood;
3. the agent replies again: it agrees, corrects you, and fills in what you missed.

A few rounds like this, and understanding comes together in minutes, not hours of reading. It works as a mini-exam where the agent is both examiner and cheat sheet: you don't read the code in full, but you understand what matters. That is control over cognitive debt at minimal cost.

P.S. This exercise is easy to wrap into a dedicated skill right inside the project and run from time to time — especially after large chunks of generated code.

::file-artifact
---
name: Cognitive Debt Check
description: A reusable project skill for building understanding of unfamiliar code through a short feedback loop.
filename: /cognitive-debt/SKILL.md
icon: local:office-file-md
expandable: true
---
::
