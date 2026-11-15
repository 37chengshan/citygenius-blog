---
title: "agent-mcp: turning Agent CLIs into one work pool"
description: "Opening several terminals is easy. Keeping them under control is the hard part. The main agent only splits and merges; dispatch, timeouts and resuming belong to a control plane, and each task gets the CLI that fits it."
date: "2026.09.17"
readTime: "12 min read"
tag: "Agent MCP"
category: "AI"
tags: ["Agent MCP", "AI", "Multi-agent", "MCP", "Agent CLI"]
tagFilters:
  "Agent MCP": "ai"
  "AI": "ai"
  "Multi-agent": "ai"
  "MCP": "ai"
  "Agent CLI": "ai"
image: "illu-agent-mcp.webp"
imageAlt: "Multi-agent orchestration control plane"
imageWidth: 1536
imageHeight: 922
badge: "Agent MCP"
sideNote: "agent-mcp · Control Plane ·<br/>spawn · wait · steer"
caption: "<b>Agent work pool.</b>(CityGenius, MMXXVI)"
authorMeta: "Student · Full-stack developer · AI toolchain tinkerer"
featured: false
related:
  - date: "2026.09.17"
    title: "d-token: before context leaves your machine"
    desc: "A local control plane that trims redundancy, routes explicitly, and issues one receipt per request."
    tag: "d-token · Rust"
    slug: "project-d-token"
  - date: "2026.09.17"
    title: "ompweb: a local workbench for omp"
    desc: "No rewrite of the agent. It reads session files and turns the terminal into a workspace."
    tag: "ompweb · Local-first"
    slug: "project-ompweb"
  - date: "2026.05.15"
    title: "Building a full-stack AI app in three days with vibe coding"
    desc: "From a written requirement to a live MVP."
    tag: "Vibe Coding · AI"
    slug: "vibe-coding-3-days"
---

Last Wednesday I was splitting up a refactor that touched many files. I cut the work into five pieces and opened three terminals at once: Claude wrote the shared types, Codex updated the callers, and omp ran a dependency scan.

Forty minutes in, I was keeping notes in a memo app to track who had finished. On the left, Claude was stuck on a permission prompt. In the middle, Codex's output was scrolling too fast to read. On the right, omp had been done for ages, and nothing told me. How many tokens it all cost, I would work out afterward. By the end of the night, two of the three sessions were dead and their context was gone.

That is not "the model isn't strong enough". **Nobody was doing the scheduling.**

The agent-mcp README is clear about this: the point is not to "open a few more agents". The point is to turn any CLI into a work pool that can be **dispatched, monitored, resumed and terminated**.

The main agent does only two things: **split** and **merge**.

Dispatching, waiting, interjecting, timeouts, queueing, resuming and downgrading all go to the control plane. Model reasoning still happens inside each CLI's own native runtime. agent-mcp does not rewrite the agent loop, and it does not lock you to a single model.

Another principle: **match the backend to the task**.

Read-heavy exploration goes to a fast backend (omp / pi / grok). Deep planning goes to a strong one (claude). Cost and quality get matched on the spot, instead of running everything on one model.

## Problem

Opening a few terminals is simple. What's hard is this:


<figure class="illu method">
  <img src="/citygenius-blog/assets/chart-agent-mcp-scale.webp" alt="Control plane scale" width="1400" height="820" loading="lazy" />
  <figcaption>Public scale figures: 34 MCP tools, 589 tests, 11 built-in CLI adapters.</figcaption>
</figure>

- What if a subtask runs off the rails?
- What if all the slots are full?
- What if I realize halfway through that the direction is wrong and want to step in?
- While the main agent waits for results, it can't sit idle, and it can't poll blindly until its context fills up.
- Who is running, how far along they are, how much they've burned: all of it depends on a person watching.

The CLIs also don't talk to each other. Some emit JSONL, some only plain text, the usage fields have different names, and resume works in some and not in others. If you ignore those differences, multiple agents only magnify the mess.

<figure class="illu method">
  <img src="/citygenius-blog/assets/fig-agent-mcp-flow.webp" alt="Dispatch path" width="1400" height="780" loading="lazy" />
  <figcaption>The main agent only splits and merges; dispatch, waiting and fault tolerance are handled by the control plane.</figcaption>
</figure>

## Approach

From the outside, agent-mcp is a set of **MCP tools**. Any host that supports MCP can mount it. The ones I use most:

- `estimate_complexity`: classifies a task as S/M/L locally, with zero tokens and no spawning. **Do it directly by default; split only when needed.**
- `spawn_agent`: dispatches a sub-agent with a chosen CLI, model and timeout, and returns an `agent_id` right away.
- `wait_agent`: a short blocking wait for a terminal state, returning a summary.
- `steer_agent`: interjects mid-run. It ends the current run and continues from the same node.
- `followup_task`: merges pending messages and triggers the next turn.
- `orchestrate_task`: a task graph with dependencies. Independent tasks run in parallel; dependent ones run in order.

Underneath is a daemon control plane. **A run is the only unit of execution.** When slots are full, tasks queue automatically. When a task times out, the whole process tree is terminated. When a token budget is exceeded, the task can be rerun on a cheaper tier. `session_id` is the ownership boundary.

The adapter layer ships with 11 CLIs (claude / grok / opencode / omp / codex / kimi / copilot and others), normalizing their event streams, usage and sessions. A CLI that isn't on the list can be connected with a JSON config file, with no code changes.

DeepSeek Harness is natively supported too: one `insert` patch registers all 34 tools as `mcp__agentmcp__*`. If the daemon isn't running it gets started automatically, and a dropped connection reconnects with exponential backoff.

The lessons are practical. **Don't split everything by default.** In an early version, even tiny jobs spawned a pile of sub-agents, and the coordination overhead was bigger than the task. The complexity gate came after that.

**The adapter layer is messier than I expected.** Headless mode, event streams, resume and permission flags are different in every CLI. Normalizing them was the real engineering work.

**A thick control plane makes debugging heavy.** When something breaks, I have to look at the main agent, the daemon log and the child processes together. That's a lot for a personal project, and I'm still trimming it down.

## Status

Since finishing it, my workflow has changed. It used to be "I watch everything myself". Now it's "split, dispatch, wait in a loop, merge".

For one cross-file refactor, I first ran `estimate_complexity`, which rated it L. Then `orchestrate_task` declared the dependencies: change the shared types first, then the callers, then review. Scans with no dependencies ran in parallel, and each subtask could use a different CLI.

When the scope grew too wide midway, `steer_agent` narrowed it. When a run died, the timeout caught it and the session could still be resumed.

The current version is **v4.0.0a1**: 34 MCP tools, 589 tests passing. It hasn't made me "faster, better and cheaper" across the board, but it has pulled me away from staring at terminals.

The limits are still there.
The project is still alpha. How well each adapter has been tested is uneven. The sandbox is mostly "one policy translated into each CLI's own flags", not real isolation. Cross-vendor review still needs more mileage on complicated merges.

Next I'll prioritize testing the adapters, enforcing policy at the point of execution, and simplifying setup.

```bash
curl -fsSL https://raw.githubusercontent.com/37chengshan/agent-mcp/main/install.sh | bash
```

Main repo: [37chengshan/agent-mcp](https://github.com/37chengshan/agent-mcp). Issues are welcome, and so is blunt criticism.
