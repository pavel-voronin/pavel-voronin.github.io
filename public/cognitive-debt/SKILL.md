---
name: cognitive-debt-check
description: Build up understanding of unfamiliar code through a short feedback loop.
  Run after large batches of generated code, or before working with someone else's module.
---

# Cognitive Debt Check

The user points at a piece of code — a file, a module, a directory.
Take it through an understanding loop.

## 1. Describe the code along three axes

Briefly, without retelling the implementation:

- **Essence** — what it's responsible for and what it deliberately doesn't do.
- **Boundaries** — what it talks to on the outside, what it hides inside, how it's extended.
- **Contracts** — what it takes as input and what it returns.

## 2. Hand it over

Ask the user to explain, freely and in their own words, what they understood.
Don't quiz them and don't prompt — just listen.

## 3. Correct

Compare what they said against the code: confirm what's right, fix the errors,
fill in what's missing. Be concrete and brief. Repeat the loop until their picture
matches the code — a few rounds are usually enough.
