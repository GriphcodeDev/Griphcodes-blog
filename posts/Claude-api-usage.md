---
layout: post.liquid
title: Claude api usage
description: How to use Claudes api
date: 2026-05-03
---

# The Complete Developer's Guide to the Claude API (2026)

> *A practical, no-fluff guide to integrating Anthropic's Claude into your applications — from your first API call to production-grade patterns.*

---

## Table of Contents

1. [What Is the Claude API?](#what-is-the-claude-api)
2. [Understanding Models and Pricing](#understanding-models-and-pricing)
3. [Getting Your API Key](#getting-your-api-key)
4. [Your First API Call](#your-first-api-call)
5. [The Messages API — Core Patterns](#the-messages-api--core-patterns)
6. [System Prompts](#system-prompts)
7. [Multi-Turn Conversations](#multi-turn-conversations)
8. [Streaming Responses](#streaming-responses)
9. [Tool Use (Function Calling)](#tool-use-function-calling)
10. [Prompt Caching — Cut Costs by 90%](#prompt-caching--cut-costs-by-90)
11. [Batch Processing — Cut Costs by 50%](#batch-processing--cut-costs-by-50)
12. [Vision and Multimodal Inputs](#vision-and-multimodal-inputs)
13. [Error Handling and Reliability](#error-handling-and-reliability)
14. [Production Best Practices](#production-best-practices)
15. [Cost Optimization Summary](#cost-optimization-summary)

---

## What Is the Claude API?

The Claude API is a RESTful HTTP interface hosted at `https://api.anthropic.com` that gives you programmatic access to Anthropic's family of Claude language models. Unlike using Claude through claude.ai (a subscription product), the API is billed per token — meaning you pay only for exactly what you use.

The API is centered around a single, unified endpoint — the **Messages API** — which handles everything from simple question-answering to complex agentic workflows with tool calling, file analysis, and long-context reasoning.

**Who should use it?**
- Developers building AI-powered applications
- Teams integrating Claude into internal tooling
- Engineers running high-volume, automated pipelines

---

## Understanding Models and Pricing

Anthropic uses a three-tier model family. Choosing the right tier is the single most impactful cost and performance decision you will make.

### Current Model Tiers (May 2026)

| Model | API String | Input (per MTok) | Output (per MTok) | Context | Best For |
|---|---|---|---|---|---|
| **Claude Haiku 4.5** | `claude-haiku-4-5-20251001` | $1.00 | $5.00 | 200K | High-volume, low-latency tasks |
| **Claude Sonnet 4.6** | `claude-sonnet-4-6` | $3.00 | $15.00 | 1M | Balanced: most production workloads |
| **Claude Opus 4.6** | `claude-opus-4-6` | $5.00 | $25.00 | 1M | Complex reasoning, agentic workflows |

> MTok = Million Tokens. A token is roughly 4 characters or 0.75 words in English.

### What Is a Token?

This is foundational. The API does not charge per request — it charges per token. Every character you send (your prompt) and every character Claude generates (the response) is counted.

```
"Hello, world!" ≈ 4 tokens
A typical paragraph ≈ 75–100 tokens
A 10-page document ≈ 2,000–3,000 tokens
```

Input tokens (what you send) and output tokens (what Claude returns) are billed separately, with output consistently more expensive. This reflects the additional compute required to generate tokens versus reading them.

### Model Selection Strategy

- **Use Haiku 4.5** for classification, routing, summarization, extraction, and any task requiring sub-second latency at scale.
- **Use Sonnet 4.6** for the vast majority of production workloads — coding, customer assistants, document analysis. It handles over 90% of tasks without compromise.
- **Use Opus 4.6** when you need the absolute best reasoning — legal analysis, complex multi-step agents, advanced coding tasks.

> **Rule of thumb:** Start with Sonnet 4.6. Drop to Haiku if latency or cost is a constraint. Escalate to Opus only if output quality falls short.

---

## Getting Your API Key

1. Go to [console.anthropic.com](https://console.anthropic.com) and create an account.
2. Navigate to **API Keys** in your account settings.
3. Click **Create Key**, give it a descriptive name (e.g., `prod-app`, `dev-testing`), and copy it immediately.

> ⚠️ **Critical:** Your API key is displayed only once. Store it securely — in an environment variable, a secrets manager, or a `.env` file. Never hardcode it in source code.

```bash
# Store it as an environment variable
export ANTHROPIC_API_KEY="sk-ant-..."
```

Use workspaces to segment API keys by environment (dev, staging, prod) for cleaner billing and access control.

---

## Your First API Call

The simplest way to test the API is with `curl`. This sends a single message to Claude and returns a JSON response.

```bash
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{
    "model": "claude-sonnet-4-6",
    "max_tokens": 1024,
    "messages": [
      {"role": "user", "content": "Explain the concept of recursion in one paragraph."}
    ]
  }'
```

### Breaking Down the Request

| Field | Purpose |
|---|---|
| `x-api-key` | Authentication — your API key |
| `anthropic-version` | API versioning — always `2023-06-01` |
| `content-type` | Tells the server to parse the body as JSON |
| `model` | Which Claude model to use |
| `max_tokens` | Hard cap on output length — prevents runaway costs |
| `messages` | The conversation — an array of `role`/`content` pairs |

### The Response

```json
{
  "id": "msg_01XFDUDYJgAACzvnptvVoYEL",
  "type": "message",
  "role": "assistant",
  "content": [
    {
      "type": "text",
      "text": "Recursion is a programming technique where a function calls itself..."
    }
  ],
  "model": "claude-sonnet-4-6",
  "stop_reason": "end_turn",
  "usage": {
    "input_tokens": 20,
    "output_tokens": 85
  }
}
```

The `usage` field is important — it tells you exactly how many tokens were consumed, which maps directly to your cost.

### Using the Python SDK

For production applications, Anthropic's official Python SDK is the recommended approach. It handles authentication, request formatting, retries, and error parsing automatically.

```bash
pip install anthropic
```

```python
import anthropic

client = anthropic.Anthropic()  # Reads ANTHROPIC_API_KEY from environment

message = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=1024,
    messages=[
        {"role": "user", "content": "Explain the concept of recursion in one paragraph."}
    ]
)

print(message.content[0].text)
```

### Using the Node.js SDK

```bash
npm install @anthropic-ai/sdk
```

```javascript
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic(); // Reads ANTHROPIC_API_KEY from environment

const message = await client.messages.create({
  model: "claude-sonnet-4-6",
  max_tokens: 1024,
  messages: [
    { role: "user", content: "Explain the concept of recursion in one paragraph." }
  ],
});

console.log(message.content[0].text);
```

---

## The Messages API — Core Patterns

The Messages API is built around a conversation model. Every request contains a `messages` array where each item has a `role` (`user` or `assistant`) and `content`.

### Key Parameters

| Parameter | Type | Description |
|---|---|---|
| `model` | string | The Claude model to use |
| `max_tokens` | integer | Maximum tokens to generate (required) |
| `messages` | array | Conversation history |
| `system` | string | System prompt (instructions for Claude) |
| `temperature` | float | Randomness — 0 (deterministic) to 1 (creative) |
| `stop_sequences` | array | Strings that stop generation when encountered |

### Stop Reasons

The response's `stop_reason` field tells you why generation ended:

| Value | Meaning |
|---|---|
| `end_turn` | Claude finished naturally |
| `max_tokens` | Hit the `max_tokens` limit |
| `stop_sequence` | A stop sequence was triggered |
| `tool_use` | Claude wants to call a tool |

If you see `max_tokens` frequently, your limit is too low for the task.

---

## System Prompts

A system prompt is a set of persistent instructions that define Claude's behavior, persona, and constraints for the entire conversation. It is set once and does not appear in the `messages` array.

```python
message = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=1024,
    system="You are a senior software engineer specializing in Python. "
           "Always provide concise, idiomatic code. "
           "When explaining code, focus on the 'why' not just the 'what'.",
    messages=[
        {"role": "user", "content": "How do I read a CSV file efficiently?"}
    ]
)
```

**Best practices for system prompts:**
- Be explicit about the persona, tone, and output format
- Define what Claude should and should not do
- Include examples if the task is complex or has edge cases
- Keep it focused — bloated system prompts add cost to every call

---

## Multi-Turn Conversations

To maintain a conversation, you pass the entire history with each request. The API is stateless — it has no memory between calls. You are responsible for managing and passing the conversation state.

```python
conversation_history = []

def chat(user_message: str) -> str:
    conversation_history.append({
        "role": "user",
        "content": user_message
    })

    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1024,
        system="You are a helpful coding assistant.",
        messages=conversation_history
    )

    assistant_message = response.content[0].text

    conversation_history.append({
        "role": "assistant",
        "content": assistant_message
    })

    return assistant_message

# Usage
print(chat("What is a Python decorator?"))
print(chat("Can you show me an example?"))
print(chat("How does that differ from a closure?"))
```

> ⚠️ **Token cost grows with conversation length.** Every turn re-sends the full history. For long conversations, consider summarizing older turns to reduce costs.

---

## Streaming Responses

By default, the API waits until Claude finishes generating the full response before returning it. For user-facing applications, this creates a noticeable lag. Streaming sends tokens back as they are generated, creating the real-time "typing" effect.

```python
with client.messages.stream(
    model="claude-sonnet-4-6",
    max_tokens=1024,
    messages=[{"role": "user", "content": "Write a short story about a robot."}]
) as stream:
    for text in stream.text_stream:
        print(text, end="", flush=True)
```

Streaming is strongly recommended for any interactive, user-facing interface.

---

## Tool Use (Function Calling)

Tool use allows you to define functions that Claude can invoke. Instead of trying to answer a question directly, Claude can request to call a tool with structured arguments, and your code executes it and returns the result.

This is the foundation of agentic applications.

```python
tools = [
    {
        "name": "get_weather",
        "description": "Get the current weather for a given city.",
        "input_schema": {
            "type": "object",
            "properties": {
                "city": {
                    "type": "string",
                    "description": "The name of the city, e.g. 'Stockholm'"
                }
            },
            "required": ["city"]
        }
    }
]

response = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=1024,
    tools=tools,
    messages=[
        {"role": "user", "content": "What's the weather like in Tokyo?"}
    ]
)

# Claude will respond with a tool_use block instead of text
if response.stop_reason == "tool_use":
    tool_call = next(b for b in response.content if b.type == "tool_use")
    print(f"Claude wants to call: {tool_call.name}")
    print(f"With arguments: {tool_call.input}")
    # -> {"city": "Tokyo"}
    
    # Your code executes the function and passes the result back
    result = get_weather(tool_call.input["city"])  # Your actual function
    
    # Continue the conversation with the tool result
    final_response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1024,
        tools=tools,
        messages=[
            {"role": "user", "content": "What's the weather like in Tokyo?"},
            {"role": "assistant", "content": response.content},
            {
                "role": "user",
                "content": [{
                    "type": "tool_result",
                    "tool_use_id": tool_call.id,
                    "content": str(result)
                }]
            }
        ]
    )
    print(final_response.content[0].text)
```

---

## Prompt Caching — Cut Costs by 90%

Prompt caching is one of the most powerful cost-reduction features available. If you repeatedly send the same large content — a system prompt, document, or tool definition — Claude can cache that content and read from cache on subsequent calls at a fraction of the cost.

**Cache hit pricing on Sonnet 4.6: $0.30/MTok vs. $3.00/MTok standard (90% reduction)**

```python
response = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=1024,
    system=[
        {
            "type": "text",
            "text": "You are a legal document analyst. " + legal_guidelines,  # Large doc
            "cache_control": {"type": "ephemeral"}  # Cache this block
        }
    ],
    messages=[
        {"role": "user", "content": "Summarize section 3 of the contract."}
    ]
)
```

**When caching saves the most:**
- Long system prompts (>1,000 tokens) sent on every request
- Document analysis where the same document is queried multiple times
- Tool definitions for large tool schemas
- RAG applications where context documents repeat

The first call pays a cache **write** cost (1.25x standard rate for a 5-minute TTL). All subsequent calls within that TTL pay only 0.1x the standard rate — a 90% reduction.

---

## Batch Processing — Cut Costs by 50%

For workloads that do not require real-time responses, the Batch API processes requests asynchronously and returns results within 24 hours at 50% off standard pricing.

This is ideal for: data pipelines, bulk document analysis, offline report generation, and evaluation runs.

```python
batch = client.messages.batches.create(
    requests=[
        {
            "custom_id": f"request-{i}",
            "params": {
                "model": "claude-sonnet-4-6",
                "max_tokens": 1024,
                "messages": [{"role": "user", "content": doc}]
            }
        }
        for i, doc in enumerate(documents)
    ]
)

print(f"Batch ID: {batch.id}")  # Poll this later for results
```

---

## Vision and Multimodal Inputs

Claude can analyze images, PDFs, and other documents alongside text. Pass them as base64-encoded content in the messages array.

```python
import base64

with open("diagram.png", "rb") as f:
    image_data = base64.standard_b64encode(f.read()).decode("utf-8")

response = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=1024,
    messages=[
        {
            "role": "user",
            "content": [
                {
                    "type": "image",
                    "source": {
                        "type": "base64",
                        "media_type": "image/png",
                        "data": image_data
                    }
                },
                {
                    "type": "text",
                    "text": "Describe the architecture shown in this diagram."
                }
            ]
        }
    ]
)
```

Supported formats: `image/jpeg`, `image/png`, `image/gif`, `image/webp`, and PDFs via `application/pdf`.

---

## Error Handling and Reliability

The API returns structured HTTP error codes. Your application must handle these gracefully.

| HTTP Status | Error | Action |
|---|---|---|
| `400` | `invalid_request_error` | Fix your request — bad parameters |
| `401` | `authentication_error` | Check your API key |
| `403` | `permission_error` | Check key permissions |
| `429` | `rate_limit_error` | Back off and retry |
| `500` | `api_error` | Retry with exponential backoff |
| `529` | `overloaded_error` | Retry — Anthropic is at capacity |

```python
import anthropic
import time

def call_with_retry(client, max_retries=3, **kwargs):
    for attempt in range(max_retries):
        try:
            return client.messages.create(**kwargs)
        except anthropic.RateLimitError:
            wait = 2 ** attempt  # Exponential backoff: 1s, 2s, 4s
            print(f"Rate limited. Retrying in {wait}s...")
            time.sleep(wait)
        except anthropic.APIError as e:
            if e.status_code >= 500:
                time.sleep(2 ** attempt)
            else:
                raise  # Don't retry 4xx errors — they won't fix themselves
    raise Exception("Max retries exceeded")
```

---

## Production Best Practices

**1. Always set `max_tokens` intentionally.**
Do not set it to an arbitrarily large number. Know what your task requires and cap it there.

**2. Use environment variables for API keys.**
Never hardcode credentials. Use `python-dotenv`, AWS Secrets Manager, or similar tooling.

**3. Log token usage on every request.**
Instrument `response.usage.input_tokens` and `response.usage.output_tokens` as first-class metrics to catch cost anomalies early.

**4. Wrap the API in a service layer.**
Do not scatter raw API calls throughout your codebase. Centralize them in a service module that enforces token budgets, handles retries, and logs all interactions.

**5. Use separate API keys per environment.**
Dev, staging, and production should each have isolated API keys and workspace budgets.

**6. Implement circuit breakers for agentic workflows.**
If Claude is calling tools in a loop, enforce a maximum number of tool cycles and exit gracefully with a user-visible message if exceeded.

**7. Pick the right model, then profile.**
Start with Sonnet 4.6 as your default. Profile latency and cost in production. Drop to Haiku for tasks that don't need Sonnet-level intelligence.

---

## Cost Optimization Summary

| Strategy | Savings Potential |
|---|---|
| Use Haiku instead of Sonnet for simple tasks | ~67% |
| Prompt caching for repeated large contexts | Up to 90% |
| Batch API for non-real-time workloads | 50% |
| Prompt caching + Batch API combined | Up to 95% |
| Trim unnecessary content from prompts | Variable |
| Use streaming to reduce perceived latency (not cost) | — |

---

## Further Reading

- [Official API Documentation](https://docs.anthropic.com)
- [Claude API Overview](https://platform.claude.com/docs/en/api/overview)
- [Prompt Engineering Guide](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview)
- [Tool Use Documentation](https://docs.anthropic.com/en/docs/build-with-claude/tool-use)
- [Prompt Caching Documentation](https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching)
- [Batch API Documentation](https://docs.anthropic.com/en/docs/build-with-claude/batch-processing)

---

*Last updated: May 2026 | Pricing verified against official Anthropic documentation*
