---
title: How to Get an OpenRouter API Key
description: A short step-by-step guide for creating an OpenRouter API key and testing it with a simple request.
date: 2026-03-22
publish-to: topics
icon: simple-icons:openrouter
image: og-image.jpg
titleLines: 1
topics: instructions
---

OpenRouter is an API gateway that provides access to multiple AI models (OpenAI, Anthropic, Google, Meta, and others) through a single API.

Instead of managing separate API keys, you use one OpenRouter key for everything.

Getting an API key takes about 2 minutes.

## Step 1. Create an Account

Go to [https://openrouter.ai](https://openrouter.ai)

## Step 2. Top Up

OpenRouter uses a prepaid billing model.

Go to [https://openrouter.ai/credits](https://openrouter.ai/credits)

Add funds to your account (minimum is typically `$5`). You need a positive balance to use the API.

## Step 3. Generate an API Key

Go to [https://openrouter.ai/keys](https://openrouter.ai/keys)

- Click `Create`
- Enter a name (for example `My App`)
- Optionally set a usage limit and expiration
- Submit form and **copy the key immediately**. It will not be shown again

Your key will look like this:

```text
sk-or-v1-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

Copy the **entire** key, from `sk-or-v1-` to the last character.

## Quick Test

You can test your key with a simple request (`$OPENROUTER_API_KEY` is your key):

```bash
curl https://openrouter.ai/api/v1/chat/completions \
  -H "Authorization: Bearer $OPENROUTER_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "openrouter/free",
    "messages": [
      {"role": "user", "content": "Hello"}
    ]
  }'
```

If everything is set up correctly, you will receive a response from the model.
