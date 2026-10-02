---
title: "ompweb: A Local Workbench for omp"
description: "No rewriting the agent — just read the local session files. Session tree, terminal, MCP, and worktrees, all on one desk."
date: "2026.09.17"
readTime: "11 分钟阅读"
tag: "ompweb"
category: "AI"
tags: ["ompweb", "oh-my-pi", "Local-first", "Next.js", "Electron"]
tagFilters:
  "ompweb": "ai"
  "oh-my-pi": "ai"
  "Local-first": "ai"
  "Next.js": "full-stack"
  "Electron": "full-stack"
image: "illu-ompweb.webp"
imageAlt: "ompweb 本地工作台"
imageWidth: 1536
imageHeight: 922
badge: "ompweb"
sideNote: "ompweb · Local-first ·<br/>sessions · PTY · MCP"
caption: "<b>Workbench for omp.</b>(CityGenius, MMXXVI)"
authorMeta: "大学生 · 全栈开发者 · AI 工具链探索者"
featured: false
related:
  - date: "2026.09.17"
    title: "agent-mcp：把各种 Agent CLI 收进一个工作池"
    desc: "控制面统一派发，CLI 按任务匹配。"
    tag: "Agent MCP · AI"
    slug: "project-agent-mcp"
  - date: "2026.09.17"
    title: "d-token：上下文离开本机之前"
    desc: "本地压缩与显式路由。"
    tag: "d-token · Rust"
    slug: "project-d-token"
  - date: "2026.09.17"
    title: "eduevidence：没有证据，就不设计新研究"
    desc: "九阶段协议与 Evidence Graph。"
    tag: "EduEvidence · Skill"
    slug: "project-eduevidence"
---

omp in the terminal is "good enough". Sessions, tool calls, permission prompts — all doable in a terminal window.

But not good.

Want to revisit yesterday's session? `ls` through a pile of JSONL. Compare three branches side by side? Open three terminal windows. Check whether MCP is hooked up? Dig through config files. Switch Git worktrees? Open another pane.

<div class="tldr">
<b>TL;DR</b>
ompweb is a local workbench for oh-my-pi: it doesn't rewrite the agent, it just reads its session files — the session tree, terminal, MCP status, and Git worktrees all laid out on one desk. One hard rule in the design: OMP writes sessions, ompweb only displays and orchestrates; session authority always stays with OMP. The stack is Next.js 16 + Electron 44, and one npx line gets it running.
</div>

I didn't want to replace omp. I wanted a **desk**: the sessions, terminals, files, and MCP status that already exist, laid out where I can see them.

ompweb's positioning is on page one of the README: **a modern, high-performance, local-first web workspace and native desktop app for oh-my-pi**.

The key design is just one line — **don't rewrite the agent, just read its session files.**

```
~/.omp/agent/sessions/   ← single source of truth for sessions
        ↓ browse / branch / archive (narrow writes)
     ompweb (Next.js / Electron)
        ↓ live execution
  omp --mode rpc-ui  ← OMP stays the runtime
```

Local sessions get scanned straight from JSONL by Node; **live work goes through `omp --mode rpc-ui`** (NDJSON over stdio). The OMP SDK lives on the Bun side — the Node service deliberately never imports it, to avoid mixing runtimes.

In one line: **OMP writes sessions, ompweb displays and orchestrates; the UI holds no authority.**

## Problem

Terminals have three ceilings:


<figure class="illu method">
  <img src="/citygenius-blog/assets/fig-ompweb-local-first.webp" alt="Local-first architecture" width="1416" height="802" loading="lazy" />
  <figcaption>Session JSONL is the authority; ompweb displays and writes narrowly; live execution goes through omp.</figcaption>
</figure>

1. **History is invisible** — sessions live in files, not in front of you
2. **Multi-window has no structure** — branching, comparing, rolling back all depend on manual window juggling
3. **The ecosystem is invisible** — MCP, skills, Git state scattered everywhere

Rewrite an agent and you split the ecosystem. ompweb chose to stand next to omp, not across from it.

<figure class="illu method">
  <img src="/citygenius-blog/assets/chart-ompweb-stack.webp" alt="Runtime baseline" width="1392" height="675" loading="lazy" />
  <figcaption>Node ≥22.19, Next.js 16.3, Electron 44.</figcaption>
</figure>

## Approach

The stack is **Next.js 16 + Electron 44**, Node ≥ 22.19.

- **Web**: `npx @37chengshan/ompweb@latest` opens it, listening on `127.0.0.1:30177`
- **Desktop**: Electron shell, tray-resident, Dock status, independent window lifecycle
- **Remote-ready**: `--password`, `--hostname`, `--no-open` — built for servers

Later I added a Rust `ompweb-host` daemon: Git / PTY / session scanning / settings / supervisor, over bounded NDJSON (UDS / Named Pipe).

Features are laid out as a "workbench", not a "chat window":

- Session tree navigation and branching
- Real-time multi-agent collaboration
- Interactive web PTY
- Visual MCP / Skill management
- Code and rich-media preview
- Git multi-worktree switching

The boundary is clear. **The write path is deliberately narrow.** Session authority lives with OMP; ompweb keeps only low-risk operations like rename / archive / delete / branch-parent. Try to write everything and you'll fight the live process.

**Guard the SDK boundary.** The OMP SDK is Bun-only; the Node/Next service can't just import it for convenience. Work has to go through `omp --mode rpc-ui`.

**The architecture gets thicker.** After adding the host daemon, the debugging surface grows — UI, Next, host, omp, four layers. That's the cost of local-first; docs and secure defaults (loopback / password) have to keep up.

Try it with one `npx`, or grab an installer from Releases (mac / Windows / Linux). MIT license; upstream lineage comes from the pi-web / oh-my-pi ecosystem.

It doesn't invent a new agent — it just puts the omp sessions that already exist on a desk you can actually use.

```bash
npx @37chengshan/ompweb@latest
```

Main repo: [37chengshan/ompweb](https://github.com/37chengshan/ompweb).

## FAQ

### Is ompweb meant to replace omp?

No. The author is explicit: it's not about replacing omp, it's about wanting a "desk". ompweb doesn't rewrite the agent, it just reads its session files; live execution still goes through omp — standing next to omp, not across from it.

### How does it read my sessions?

`~/.omp/agent/sessions/` is the single source of truth: local history gets scanned from JSONL by Node, live work goes through `omp --mode rpc-ui` (NDJSON over stdio). In one line: OMP writes sessions, ompweb displays and orchestrates.

### Is it safe to change sessions with it?

The write path is deliberately narrow — only low-risk operations like rename / archive / delete / branch-parent. Try to write everything and you'll fight the live process — that's a boundary the author set on purpose.

### How do I run it? What do I need?

Web version, one line: `npx @37chengshan/ompweb@latest`, listening on 127.0.0.1:30177 by default; desktop installers too (mac / Windows / Linux). The stack is Next.js 16 + Electron 44, needs Node ≥ 22.19, MIT license.

### Can I use it remotely on a server?

Yes — with `--password`, `--hostname`, `--no-open` flags, built for servers. Loopback only by default; the author notes that docs and secure defaults have to keep up.
