---
title: "d-token: Before Context Leaves Your Machine"
description: "Compress redundancy, make routing explicit, and leave a receipt — before the request goes out. One real request sent 33,705 fewer tokens."
date: "2026.09.17"
readTime: "11 分钟阅读"
tag: "d-token"
category: "AI"
tags: ["d-token", "Rust", "Tauri", "Token", "Local-first"]
tagFilters:
  "d-token": "ai"
  "Rust": "full-stack"
  "Tauri": "full-stack"
  "Token": "ai"
  "Local-first": "ai"
image: "illu-d-token.webp"
imageAlt: "d-token 本地控制面"
imageWidth: 1536
imageHeight: 922
badge: "d-token"
sideNote: "d-token · Local Control Plane ·<br/>compress · route · receipt"
caption: "<b>Context before it leaves.</b>(CityGenius, MMXXVI)"
authorMeta: "大学生 · 全栈开发者 · AI 工具链探索者"
featured: false
related:
  - date: "2026.09.17"
    title: "agent-mcp：把各种 Agent CLI 收进一个工作池"
    desc: "主 Agent 只拆解汇合，执行交给控制面。"
    tag: "Agent MCP · AI"
    slug: "project-agent-mcp"
  - date: "2026.09.17"
    title: "ompweb：给 omp 一个本地工作台"
    desc: "Local-first，读会话文件，不重写 Agent。"
    tag: "ompweb · Local-first"
    slug: "project-ompweb"
  - date: "2026.09.17"
    title: "eduevidence：没有证据，就不设计新研究"
    desc: "九阶段协议与 Evidence Graph。"
    tag: "EduEvidence · Skill"
    slug: "project-eduevidence"
---

I opened the bill. The number was climbing, but I couldn't say what it was spent on.

The same files I'd fed the model last round got sent again this round, byte for byte. Tool logs, search results, duplicated README snippets… context leaks like a bucket with a hole. And whether any "optimization" actually worked — there was no receipt to check against.

d-token answers three questions:

1. Where did these tokens actually go?
2. Which provider really handled the request?
3. Did compression actually happen — or does it just feel cheaper?

<div class="tldr">
<b>TL;DR</b>
d-token is a context control plane that runs on your own machine: requests from your AI coding agent pass through it first — duplicates get compressed, routing stays explicit — then go out to the model provider, with a receipt for every request. In one measured real request, it cut the physical payload by 33,705 tokens — not an estimate, but the difference between Local Tokens and Provider Tokens on the receipt. Three rules: secrets never leave your machine, routing never switches silently, and a broken config can be rolled back.
</div>

The README is blunt about what it is: **a local context control plane for AI coding agents**.

It sits between "the agent you're using" and "the model provider you configured". It compresses redundancy **before context leaves your machine**, keeps routing **explicit**, and makes config changes **recoverable** — not a pile of scripts and guesswork.

```
AI coding agent
     ↓
   d-token   connect · optimize · route · observe
     ↓
 your configured model provider
```

Three hard rules:

- **Local-first**: secrets never end up in plain logs; the control plane runs on your machine.
- **Explicit routing**: every request takes a stated path, never silently switches providers.
- **One receipt per request**: source agent, route, transforms, Local / Provider Tokens, recovery status.

## Problem

AI coding agents keep resending the same files, logs, and tool outputs. The token bill quietly grows, but:


<figure class="illu method">
  <img src="/citygenius-blog/assets/chart-d-token-savings.webp" alt="Measured savings in one request" width="1416" height="830" loading="lazy" />
  <figcaption>One real routed request on 2026-08-04: 33,705 fewer tokens sent (not an average).</figcaption>
</figure>

- Can't tell which session burns the most
- Can't tell whether an "optimization" actually worked
- Break a config, and there's no way back

No prompt-engineering trick fixes this. What's needed is infrastructure that is **visible and roll-back-able**.

Local is the premise, not an option.
Context carries source paths, secret boundaries, internal company structure. Put compression and routing in a third-party black box and you hand over visibility too.

d-token keeps settings, diagnostics, request metadata, and rollback history on your machine. Plain logs never store full prompts, full responses, source text, or API keys. Your chosen provider still receives the requests you send — but now there's a door you control in between.

<figure class="illu method">
  <img src="/citygenius-blog/assets/fig-d-token-pipeline.webp" alt="Four-stage pipeline" width="1416" height="758" loading="lazy" />
  <figcaption>Agent → compression transforms → explicit routing → configured provider.</figcaption>
</figure>

## Approach

The desktop app is **Tauri 2 + Rust core**. The Rust side handles connection state, routing decisions, the compression pipeline, and receipts; the frontend only does display and the safe-config flow.

Config changes aren't "save and it applies". They go: **preview → redacted diff → backup → verify → roll back**. When something breaks, you diagnose, fix, recover — the README calls it "the config doctor".

Status semantics are deliberately spelled apart:

- `detected` ≠ `configured` ≠ `connected` ≠ `verified`
- passing tests ≠ "passing real compression"

The deeper lesson: when you build middleware in the AI toolchain, **honesty beats a feature list**.

## Results

The README records one number: **33,705 fewer tokens in a single real routed request** (measured, 2026-08-04).

Not "save 30% on average" marketing — a reproducible measurement. The receipt shows Local Tokens vs. Provider Tokens side by side. How much you saved is on paper, not a feeling.

Currently at **`0.2.0-beta.1`**, a public unsigned pre-release (macOS ARM64 / Windows x64). Unsigned builds may trigger OS security warnings — verify the repo and hashes; don't bypass system protections.

On the roadmap:

- v0.3: cross-agent Context Relay, Session Cache, cc-switch follow / lock / observe
- v0.4: multi-agent adapters, low-risk auto-fix, stable signing

Deep compression, Headroom-style integrations, and full signed distribution are still on the way.

```bash
git clone https://github.com/37chengshan/d-token.git
cd d-token/code/apps/desktop
npm ci
npm run tauri:dev
```

Main repo: [37chengshan/d-token](https://github.com/37chengshan/d-token).

## FAQ

### What exactly is d-token for?

It's a local context control plane for AI coding agents, sitting between "the agent you use" and "the provider you configured": it compresses redundancy before context leaves your machine, keeps routing explicit, and makes config changes recoverable.

### Does it really save tokens? How many?

The README records one measurement: a single real routed request on 2026-08-04 sent 33,705 fewer tokens. Note this is a single data point, not an average; the receipt shows Local Tokens vs. Provider Tokens, so the savings are on paper, not a feeling.

### Will it upload my code or secrets?

No. Local-first is a hard rule: settings, diagnostics, request metadata, and rollback records stay on your machine, and plain logs never store full prompts, full responses, source text, or API keys. Your chosen provider still receives the requests you send — but now there's a door you control in between.

### What if I break a config?

Changes aren't "save and it applies" — they go through five steps: preview → redacted diff → backup → verify → roll back. When something breaks, you diagnose, fix, and recover; the author calls it "the config doctor".

### Can I use it now?

It's at 0.2.0-beta.1, a public unsigned pre-release (macOS ARM64 / Windows x64). Unsigned builds may trigger OS security warnings — after downloading, verify the repo and hashes; don't bypass system protections.
