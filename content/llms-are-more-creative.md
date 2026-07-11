---
description: "Alignment often makes LLMs default to the most familiar answer. Verbalized Sampling asks for the full distribution and brings hidden diversity back."
language: en
translationKey: llms-are-more-creative
date: 2026-07-11
publish-to: all
icon: streamline-ultimate-color:shapes
image: og-image.jpg
titleLines: 2
comments: true
topics: ai
---

# LLMs Are More Creative Than They Let On

Try this experiment. Open ChatGPT or Claude and ask: "tell me a joke about coffee." Note the answer. Open a fresh chat, ask again. Then once more. Odds are you'll get the same joke — not a similar one, the exact same joke, word for word. Humanity has written thousands of coffee jokes, and the model has almost certainly seen them all.

The effect is called mode collapse. The model holds an entire distribution of possible answers inside, yet it keeps serving the single most likely one. The same thing happens with startup ideas, story plots, and name suggestions: wherever you want a spread of options, you get one answer in slightly different wrapping.

A recent paper from researchers at Stanford, Northeastern, and West Virginia University, [Verbalized Sampling](https://arxiv.org/abs/2510.01171){target="_blank"}, answers two questions: where this comes from, and what to do about it. The second answer turns out to be surprisingly simple.

## The Waiter and His Favorite Dish

To see the cause, recall how modern models get their finishing touches. First, a network is trained on an enormous corpus of text — this is where it absorbs the full variety of human language, coffee jokes included. Then it gets "aligned": human raters compare pairs of answers and mark which one is better. The model is fine-tuned on these comparisons to become helpful and polite.

The usual assumption is that diversity gets lost somewhere in that second stage, due to technical imperfections in the procedure. The paper's authors show it isn't just the algorithms: part of the problem is baked into the very ratings the model learns from.

Psychologists have long known the familiarity effect: text that reads easily and looks conventional gets rated higher, unconsciously. A rater comparing two equally useful answers will slightly more often pick the one that sounds more "normal." The authors verified this on real annotation data — the bias is small but systematic.

From there, simple logic takes over. When a question has one correct answer, the bias changes nothing. But when many answers are equally good — jokes being the perfect case — familiarity becomes the tiebreaker. A model faithfully learning from such ratings arrives at a conclusion: the safest move is to always serve the most familiar thing.

What you end up with is a waiter who has learned from customer reviews that the margherita gets praised slightly more often than anything else — and now answers every "what would you recommend?" with "margherita." The menu hasn't gone anywhere. The waiter remembers all of it. He just no longer sees the point of bringing it up.

The important takeaway: this isn't one company's bug or a botched configuration. The bias shows up in any alignment method that relies on human comparisons — it's built into the source of the signal.

## Ask for the Menu, Not a Recommendation

If the menu is still there, you can ask to see it. The paper's method is called Verbalized Sampling, and it fits in one sentence: instead of "give me an answer," say "give me several answers and state the probability of each."

It looks like this:

```text
Generate 5 jokes about coffee. For each, include its approximate
probability. Sample from the full distribution of responses.
```

Why would such a small change work? The authors' observation: a model responds to any request with the most typical answer — but "the most typical answer" depends on what you asked for. Ask for a joke, and the typical answer is the most worn-out joke. Ask for a _distribution_ of jokes with probabilities, and the typical answer is an honest description of that distribution. To produce one, the model has to reach back into the broad picture it learned before any alignment happened. The waiter has been asked a question that "margherita" cannot answer.

This is not the same as simply asking for five different jokes — the authors compared against that baseline directly, and verbalizing probabilities gave a noticeably better trade-off between diversity and quality.

There's a bonus: diversity becomes tunable right in the prompt. Add "each response should have a probability below 0.10," and the model starts pulling rare, atypical options from the tails. A depth-of-search knob, available in a regular chat window, no code required.

How much should you trust those "probabilities"? The paper includes an elegant sanity check. The model is asked to name a US state. A plain prompt cycles through California and Texas. The verbalized distribution, however, came out close to how often state names actually appear in a large open text corpus the authors used as a stand-in for the training data. Not rigorous proof — nobody has access to GPT's real training set — but as sanity checks go, it's convincing.

## Numbers and Caveats

On creative tasks — poems, stories, jokes — the method raises diversity by a factor of 1.6-2.1, and human raters also found the outputs more varied. Quality stays roughly level; that part was mostly measured automatically, with a judge model. Around two thirds of the diversity lost to alignment gets recovered. A curious detail: the stronger the model, the bigger the gain. The authors attribute this to the request being genuinely demanding — generate several options, judge their typicality, and stick to the format, all at once — and stronger models handle that load better.

There are costs. Every request generates several answers, so you pay for diversity in tokens and latency. Ask for too many options in one go and the quality of individual answers starts to sag. Small models benefit little. And the stated probabilities are the model's self-report, not a measurement: they capture the shape of the distribution well — just don't take the specific numbers at face value.

The paper's main idea, though, is bigger than the trick itself. Alignment mostly changes what a model shows by default — a substantial share of the diversity stays inside, available on request. The only question is how you phrase your order.
