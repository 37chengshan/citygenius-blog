---
title: "agent-mcp: Turning Agent CLIs Into One Work Pool"
description: "Opening more terminals is easy; staying in control is hard. The main agent only splits and merges — dispatch, timeouts, and resume go to the control plane, and each CLI gets matched to the task."
date: "2026.09.17"
readTime: "12 分钟阅读"
tag: "Agent MCP"
category: "AI"
tags: ["Agent MCP", "AI", "多 Agent", "MCP", "Agent CLI"]
tagFilters:
  "Agent MCP": "ai"
  "AI": "ai"
  "多 Agent": "ai"
  "MCP": "ai"
  "Agent CLI": "ai"
image: "illu-agent-mcp.webp"
imageAlt: "多 Agent 编排控制面"
imageWidth: 1536
imageHeight: 922
badge: "Agent MCP"
sideNote: "agent-mcp · Control Plane ·<br/>spawn · wait · steer"
caption: "<b>Agent work pool.</b>(CityGenius, MMXXVI)"
authorMeta: "大学生 · 全栈开发者 · AI 工具链探索者"
featured: false
related:
  - date: "2026.09.17"
    title: "d-token：上下文离开本机之前"
    desc: "本地控制面压缩冗余、显式路由、每请求一张回执。"
    tag: "d-token · Rust"
    slug: "project-d-token"
  - date: "2026.09.17"
    title: "ompweb：给 omp 一个本地工作台"
    desc: "不重写 Agent，只读会话文件，把终端扩成工作区。"
    tag: "ompweb · Local-first"
    slug: "project-ompweb"
  - date: "2026.05.15"
    title: "用 Vibe Coding 三天搞定一个全栈 AI 应用"
    desc: "从需求描述到 MVP 上线。"
    tag: "Vibe Coding · AI"
    slug: "vibe-coding-3-days"
---

Last Wednesday I was breaking down a cross-file refactor. The task split into five parts, three terminals open at once: Claude writing the shared types, Codex changing the call sites, omp running the dependency scan.

Forty minutes later I was tracking in a notes app who had finished. Claude on the left was stuck at a permission prompt, Codex in the middle was scrolling too fast to read, omp on the right had finished ages ago and nobody told me. Token spend got reconciled after the fact. By the time I wrapped up that night, two of the three sessions were dead, context gone.

That wasn't "the model isn't strong enough". That was **nobody doing the scheduling**.

<div class="tldr">
<b>TL;DR</b>
agent-mcp turns agent CLIs like Claude, Codex, and omp into one work pool: the main agent only splits tasks and merges results, while dispatch, waiting, timeouts, and resume all go to the control plane. It doesn't rewrite the agent loop or tie you to one model — instead it matches the model to the task: read-heavy exploration goes to fast models, deep-reasoning planning goes to strong ones. Currently v4.0.0a1, with 34 MCP tools and 589 passing tests.
</div>

The agent-mcp README is clear: the point isn't "open more agents" — it's turning any CLI into a **dispatchable, monitorable, resumable, killable work pool**.

The main agent does exactly two things: **split** and **merge**.

Dispatch, waiting, steering, timeouts, queueing, resume, and downgrade all go to the control plane. Model inference still happens in each CLI's native runtime; agent-mcp doesn't rewrite the agent loop or lock you to a single model.

The other principle: **match the model to the task**.

Read-heavy exploration goes to fast models (omp / pi / grok); deep-reasoning planning goes to strong ones (claude). Cost and quality get matched on the spot, not "one model for everything".

## Problem

Opening more terminals is easy. The hard part:


<figure class="illu method">
  <img src="/citygenius-blog/assets/chart-agent-mcp-scale.webp" alt="Control plane scale numbers" width="1400" height="820" loading="lazy" />
  <figcaption>Public scale numbers: 34 MCP tools, 589 tests, 11 built-in CLI adapters.</figcaption>
</figure>

- What if a subtask runs wild?
- How do you queue when all slots are full?
- How do you steer when you realize the direction is wrong mid-way?
- The main agent can't idle while waiting for results — but dumb polling would blow up the context.
- Who's running, where, and how much is burning — all tracked by a human.

And the CLIs don't speak to each other: some emit JSONL, some only plain text, usage field names differ completely, and resume support is hit or miss. Ignore those differences and multi-agent just amplifies the chaos.

<figure class="illu method">
  <img src="/citygenius-blog/assets/fig-agent-mcp-flow.webp" alt="Dispatch flow" width="1400" height="780" loading="lazy" />
  <figcaption>The main agent only splits and merges; dispatch, waiting, and fault tolerance belong to the control plane.</figcaption>
</figure>

## Approach

From the outside, agent-mcp is a set of **MCP tools**. Any MCP-capable host can plug them in. The ones I use most:

- `estimate_complexity`: grades S/M/L locally, zero tokens, no spawn — **do it directly by default, split only when needed**
- `spawn_agent`: dispatches a sub-agent, takes CLI / model / timeout, hands you an `agent_id` immediately
- `wait_agent`: blocks briefly until termination, returns a summary
- `steer_agent`: steers mid-flight — kills the current run, continues from the same node
- `followup_task`: merges pending messages, triggers the next turn
- `orchestrate_task`: task graphs with dependencies — parallel where independent, ordered where not

Underneath is a daemon control plane. **A Run is the only unit of execution**. Full slots mean automatic queueing. A timed-out task kills the whole process tree. Blow the token budget and it reruns at a lower tier. `session_id` is the ownership boundary.

The adapter layer normalizes event streams, usage, and sessions for 11 built-in CLIs (claude / grok / opencode / omp / codex / kimi / copilot, and more). A CLI not on the list just needs a JSON config — no code changes.

DeepSeek Harness gets native integration too: one `insert` patch registers all 34 tools under `mcp__agentmcp__*`; the daemon auto-starts if down and reconnects with exponential backoff.

The constraints are practical. **Don't split everything by default.** Early versions spawned a pile of sub-agents for tiny things, and coordination cost more than the task itself. That's why the complexity gate exists.

**The adapter layer is messier than you'd think.** Headless modes, event streams, resume, permission flags — every vendor has its own. Normalization is the real engineering.

**A thick control plane makes debugging heavy.** When something breaks you have to look at the main agent, daemon logs, and subprocesses at once. That's heavy for a personal project; still trimming.

## Status

After building it, my workflow changed: from "I watch everything myself" to "split, dispatch, wait in a loop, merge".

A cross-file refactor: first `estimate_complexity` grades it L, then `orchestrate_task` declares dependencies — shared types first, call sites next, review last. Independent scans run in parallel. Each subtask can name a different CLI.

Scope crept mid-way; `steer_agent` narrowed it. Something hung; the timeout caught it, and the session could still resume.

Currently **v4.0.0a1**: 34 MCP tools, 589 tests passing. It didn't make me "faster, cheaper, better" — but it did free me from staring at terminals.

Limits remain.
Still alpha. Adapter test coverage is uneven; the sandbox is mostly "one policy translated into each CLI's own flags" — not real isolation; cross-vendor review in complex merges needs more mileage.

Next up: fill in adapter test coverage, enforce policy at the actual execution point, then simplify onboarding.

```bash
curl -fsSL https://raw.githubusercontent.com/37chengshan/agent-mcp/main/install.sh | bash
```

Main repo: [37chengshan/agent-mcp](https://github.com/37chengshan/agent-mcp). Issues welcome — complaints too.

## FAQ

### How is this different from just opening more terminals?

Terminals have no scheduler: runaway subtasks, slot queueing, mid-course correction, token reconciliation — all on a human. In agent-mcp, a Run is the only unit of execution: full slots queue automatically, timed-out tasks kill the whole process tree, blown token budgets rerun at a lower tier, and session_id draws the ownership boundary.

### Does it lock me into one model?

No. Inference still happens in each CLI's native runtime; agent-mcp doesn't rewrite the agent loop. The principle is match-the-model-to-the-task: read-heavy exploration to fast models (omp / pi / grok), deep-reasoning planning to strong ones (claude), cost and quality matched on the spot.

### Do small tasks need splitting into sub-agents too?

No. Early versions spawned a pile of sub-agents for tiny things, and coordination cost more than the task. Now there's estimate_complexity: local S/M/L grading, zero token cost, do it directly by default, split only when needed.

### My CLI isn't one of the 11 — what then?

One JSON config plugs it in, no code changes. The adapter layer normalizes each vendor's event streams, usage fields, and sessions; the differences get ironed out there.

### Is it stable now?

v4.0.0a1, still alpha. Adapter test coverage is uneven; the sandbox is currently just "one policy translated into each CLI's own flags" — not real isolation; cross-vendor review in complex merges needs more mileage. The author says adapter coverage comes first.
