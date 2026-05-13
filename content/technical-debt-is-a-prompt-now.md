---
description: "Technical debt used to be friction. With LLMs, it becomes a prompt: bad architecture can teach machines to repeat the same mistakes."
language: en
translationKey: technical-debt-is-a-prompt-now
date: 2026-05-14
publish-to: all
icon: streamline-ultimate-color:programming-hold-code-2
titleLines: 1
comments: true
topics: ai
image: og-image.jpg
---

# Technical Debt Is a Prompt Now

In ["What Is Code?"](https://martinfowler.com/articles/what-is-code.html){target="_blank"}, Unmesh Joshi argues that LLMs force us to distinguish two roles of code.

Code is instructions for machines. That part is becoming cheaper to produce. But code is also a conceptual model: the vocabulary, names, boundaries, relationships, abstractions, and invariants through which people understand a system.

That second role becomes more important, not less, when LLMs enter the workflow. A good codebase gives the model stable concepts to follow. Clear names, well-shaped boundaries, tests, types, and invariants become part of the context. They act as a harness.

There is a second-order consequence here:

**Technical debt used to be friction. Now it is a prompt.**

Before LLMs, bad architecture mostly hurt by slowing people down. A confusing codebase made every change more expensive. Developers had to read more, remember more accidental complexity, ask more questions, and work around old compromises. Technical debt was a tax on future change.

That is still true. But it is no longer the whole story.

Technical debt could already compound through human habit and local precedent. Developers copy nearby code. New code mirrors old code. Bad decisions propagate by example. LLMs do not introduce this dynamic — they accelerate it. What used to spread at the speed of human attention now spreads at the speed of generation.

With LLM-assisted development, the existing codebase is not only the thing being changed. It is also evidence: names, modules, interfaces, tests, call patterns, and local conventions all suggest what kind of code belongs here.

In a healthy codebase, this is useful. The codebase narrows the search space. It teaches the model the local vocabulary. It makes some outputs more likely and others less likely.

But the reverse is also true.

In a degraded codebase, the model does not see "technical debt" as debt. It sees examples. It sees precedent. It sees a style to continue.

A vague boundary becomes a pattern.\
A misleading name becomes vocabulary.\
A fake abstraction becomes architecture.\
A missing invariant becomes permission.

Traditional technical debt is a cost-of-change problem. It makes future work slower. Generative technical debt is a probability-distribution problem. It changes what gets written next.

That is the multiplier. Bad structure leads to worse context. Worse context leads to worse generated code. Worse generated code further degrades the structure. The system begins to reproduce its own confusion.

This is related to cognitive debt, but not identical to it. Cognitive debt accumulates when a team uses abstractions it no longer understands. Generative debt accumulates when a codebase contains confused concepts that models are likely to continue.

Cognitive debt is about what the team no longer understands. Generative debt is about what the model is now likely to reproduce.

If code is context, architecture is model steering. That changes the value of refactoring.

A refactoring that clarifies a domain concept does not merely help the next human reader. It improves the prompt surface of the codebase. A test that encodes an invariant does not merely catch regressions. It teaches the model what must not be violated. A well-named boundary changes what future generated code is likely to assume.

Bad architecture used to make the next change harder. Now it can teach machines to make the next change wrong in the same way.
