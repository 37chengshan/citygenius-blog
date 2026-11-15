---
title: "ompweb: a local workbench for omp"
description: "It doesn't rewrite the Agent, it only reads local session files. Session tree, terminal, MCP and worktrees all laid out on one desk."
date: "2026.09.17"
readTime: "11 min read"
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
imageAlt: "ompweb local workbench"
imageWidth: 1536
imageHeight: 922
badge: "ompweb"
sideNote: "ompweb · Local-first ·<br/>sessions · PTY · MCP"
caption: "<b>Workbench for omp.</b>(CityGenius, MMXXVI)"
authorMeta: "University student · Full-stack developer · AI toolchain explorer"
featured: false
related:
  - date: "2026.09.17"
    title: "agent-mcp: one worker pool for every Agent CLI"
    desc: "A control plane that dispatches centrally and matches CLIs to tasks."
    tag: "Agent MCP · AI"
    slug: "project-agent-mcp"
  - date: "2026.09.17"
    title: "d-token: before context leaves your machine"
    desc: "Local compression and explicit routing."
    tag: "d-token · Rust"
    slug: "project-d-token"
  - date: "2026.09.17"
    title: "eduevidence: no evidence, no new study"
    desc: "A nine-stage protocol and an Evidence Graph."
    tag: "EduEvidence · Skill"
    slug: "project-eduevidence"
---

omp in the terminal is honestly good enough. Sessions, tool calls and permission prompts all work fine in white text on black.

But it isn't pleasant to use.

To look back at yesterday's session, all I can do is `ls` a pile of JSONL files. To compare three branches side by side, I have to open three terminal windows. To check whether MCP is connected, I dig through a config file. To switch a Git worktree, I open yet another pane.

I don't want to replace omp. I want a **desk**: one place where the sessions, terminals, files and MCP status that already exist are laid out in view.

ompweb's positioning is on the first page of the README: **a modern, high-performance, local-first web workspace and native desktop app for oh-my-pi**.

There is only one key design decision:

**Don't rewrite the Agent. Only read its session files.**

```
~/.omp/agent/sessions/   ← the only source of truth for sessions
        ↓ browse / branch / archive (narrow writes)
     ompweb (Next.js / Electron)
        ↓ live execution
  omp --mode rpc-ui  ← OMP is still the runtime
```

Local sessions are scanned straight from JSONL in Node. **Live work goes through `omp --mode rpc-ui`** (NDJSON over stdio). The OMP SDK lives on the Bun side, and the Node server deliberately doesn't import it, so the two runtimes don't get mixed up.

In one line: **OMP writes the sessions, ompweb displays and orchestrates them. The UI is not the authority.**

<div class="tldr">
<b>TL;DR</b>
ompweb is a local workbench for oh-my-pi: it doesn't rewrite the agent, it just reads its session files — the session tree, terminal, MCP status, and Git worktrees all laid out on one desk. One hard rule in the design: OMP writes sessions, ompweb only displays and orchestrates; session authority always stays with OMP. The stack is Next.js 16 + Electron 44, and one npx line gets it running.
</div>

## Problem

The terminal has three ceilings:


<figure class="illu method">
  <img src="/citygenius-blog/assets/fig-ompweb-local-first.webp" alt="Local-first architecture" width="1416" height="802" loading="lazy" />
  <figcaption>Session JSONL is the source of truth. ompweb displays and makes narrow writes. Live execution goes through omp.</figcaption>
</figure>

1. **History is invisible.** Sessions live in files, not in front of you.
2. **Multiple windows have no structure.** Branching, comparing and rolling back are managed by hand across windows.
3. **The ecosystem is hidden.** MCP, skills and Git state are scattered in different places.

If I rewrote an Agent, I'd be splitting the ecosystem. ompweb chooses to stand next to omp, not across from it.

<figure class="illu method">
  <img src="/citygenius-blog/assets/chart-ompweb-stack.webp" alt="Runtime baseline" width="1392" height="675" loading="lazy" />
  <figcaption>Node ≥22.19, Next.js 16.3, Electron 44.</figcaption>
</figure>

## Approach

The stack is **Next.js 16 + Electron 44**, with Node ≥ 22.19.

- **Web**: `npx @37chengshan/ompweb@latest` and it's up, listening on `127.0.0.1:30177`
- **Desktop**: an Electron shell with a tray icon, Dock status and its own window lifecycle
- **Remote access**: `--password`, `--hostname` and `--no-open`, handy for running in the background on a server

Later I added a Rust `ompweb-host` daemon: Git / PTY / session scanning / settings / supervisor, talking over bounded NDJSON (UDS / Named Pipe).

The feature set is laid out like a workbench, not a chat window:

- Session tree navigation and branching
- Live multi-Agent collaboration
- Interactive Web PTY
- Visual MCP / Skill management
- Code and rich-media preview
- Git multi-worktree switching

The boundaries are clear. **The write path is kept narrow on purpose.** OMP is the authority on sessions. ompweb only keeps low-risk operations like rename / archive / delete / branch-parent. If it tried to write everything, it would collide with the live process.

**Keep the SDK boundary.** The OMP SDK is Bun-only, so the Node/Next server can't just import it to save effort. The work has to go through `omp --mode rpc-ui`.

**The architecture gets thicker.** Once the host daemon is in, there's more to debug: UI, Next, host and omp, four layers. That's the price of local-first, so the docs and safe defaults (loopback / password) have to keep up.

You can try it with one `npx` command, and there are installers on Releases (mac / Windows / Linux). It's MIT licensed, and builds on the pi-web / oh-my-pi ecosystem upstream.

It doesn't invent a new Agent. It just puts the omp sessions that already exist onto a desk you can actually work at.

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
