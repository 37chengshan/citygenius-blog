---
title: "d-token: before context leaves your machine"
description: "Compress redundancy before the request goes out, spell out the route, and leave a receipt. One real request sent 33,705 fewer tokens."
date: "2026.09.17"
readTime: "11 min read"
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
imageAlt: "d-token local control plane"
imageWidth: 1536
imageHeight: 922
badge: "d-token"
sideNote: "d-token · Local Control Plane ·<br/>compress · route · receipt"
caption: "<b>Context before it leaves.</b>(CityGenius, MMXXVI)"
authorMeta: "Student · Full-stack developer · AI toolchain tinkerer"
featured: false
related:
  - date: "2026.09.17"
    title: "agent-mcp: turning Agent CLIs into one work pool"
    desc: "The main agent only splits and merges; execution belongs to the control plane."
    tag: "Agent MCP · AI"
    slug: "project-agent-mcp"
  - date: "2026.09.17"
    title: "ompweb: a local workbench for omp"
    desc: "Local-first. It reads session files and doesn't rewrite the agent."
    tag: "ompweb · Local-first"
    slug: "project-ompweb"
  - date: "2026.09.17"
    title: "eduevidence: no evidence, no new study"
    desc: "A nine-stage protocol and an Evidence Graph."
    tag: "EduEvidence · Skill"
    slug: "project-eduevidence"
---

I open the bill and the number keeps climbing, but I can't say where it went.

The same files that were fed to the model last turn get sent again, unchanged, this turn. Tool logs, search results, repeated README fragments... the context is a leaky bucket. Whether any "optimization" actually helps, there's no receipt to check against.

d-token has to answer three questions:

1. Where did these tokens go?
2. Which provider actually handled the request?
3. Did compression really happen, or does it just "feel cheaper"?

The README states the positioning bluntly: **a local context control plane for AI coding agents**.

It sits between "the agent you're using" and "the model provider you configured". It compresses redundancy **before the context leaves your machine**, keeps routing **explicit**, and makes config changes **recoverable**, instead of a pile of scripts and guesswork.

```
AI coding agent
      ↓
   d-token   connect · optimize · route · observe
      ↓
 your configured model provider
```

Three hard rules:

- **Local-first**: secrets stay out of ordinary logs; the control plane runs on your machine.
- **Explicit routing**: every request takes a clear path, and the provider is never switched silently.
- **One receipt per request**: source agent, route, transforms, Local / Provider tokens, recovery state.

<div class="tldr">
<b>TL;DR</b>
d-token is a context control plane that runs on your own machine: requests from your AI coding agent pass through it first — duplicates get compressed, routing stays explicit — then go out to the model provider, with a receipt for every request. In one measured real request, it cut the physical payload by 33,705 tokens — not an estimate, but the difference between Local Tokens and Provider Tokens on the receipt. Three rules: secrets never leave your machine, routing never switches silently, and a broken config can be rolled back.
</div>

## Problem

AI coding agents resend the same files, logs and tool output again and again. The token bill creeps up, and yet:


<figure class="illu method">
  <img src="/citygenius-blog/assets/chart-d-token-savings.webp" alt="Savings measured on a single request" width="1416" height="830" loading="lazy" />
  <figcaption>One real routed request on 2026-08-04: 33,705 fewer tokens sent (not an average).</figcaption>
</figure>

- I can't tell which session burns the most
- I can't tell whether an "optimization" is working
- When a config breaks, there's no way back

Another prompt-engineering trick won't fix this. What's needed is a layer of infrastructure that you can **see into and roll back**.

Local is a precondition, not an option.
Context holds source paths, key boundaries and a company's internal structure. If compression and routing sit inside a third-party black box, you've handed over visibility too.

d-token keeps settings, diagnostics, request metadata and rollback records on your machine. Ordinary logs don't save full prompts, full responses, source code or API keys. The provider you chose still receives the requests you choose to send, but there's now a gate in between that you control.

<figure class="illu method">
  <img src="/citygenius-blog/assets/fig-d-token-pipeline.webp" alt="Four-stage path" width="1416" height="758" loading="lazy" />
  <figcaption>Agent → compression transforms → explicit routing → configured provider.</figcaption>
</figure>

## Approach

The desktop app is **Tauri 2 + a Rust core**. The Rust side handles connection state, routing decisions, the compression pipeline and receipts. The frontend only handles display and the safe config flow.

A config change doesn't take effect on save. It goes through: **preview → redacted diff → backup → verify → rollback**. When something breaks, you can diagnose, repair and restore. The README calls this the "config doctor".

The status wording is deliberately kept apart too:

- `detected` ≠ `configured` ≠ `connected` ≠ `verified`
- tests passing ≠ "real compression passing"

The deeper lesson: when you build a middle layer in an AI toolchain, **honesty matters more than a feature list**.

## Results

The number recorded in the README: **one real routed request physically sent 33,705 fewer tokens** (measured, 2026-08-04).

That's not marketing like "saves 30% on average". It's one reproducible measurement. The receipt shows Local Token against Provider Token, so how much was saved is written down and doesn't depend on feel.

The current version is **`0.2.0-beta.1`**, a public unsigned pre-release (macOS ARM64 / Windows x64). Unsigned builds may trigger system security warnings. Please check the repo and the hashes, and don't bypass the system protection.

Still on the roadmap:

- v0.3: cross-agent Context Relay, Session Cache, cc-switch follow / lock / observe
- v0.4: multi-agent adapters, low-risk automatic repair, stable signing

Deep compression, Headroom-style integrations and fully signed distribution are all still ahead.

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
