---
title: "EduEvidence: No Evidence, No New Study Design"
description: "Retrieved snippets are not evidence. A nine-stage protocol + evidence graph that outputs ADOPT, PILOT, REJECT, or INSUFFICIENT EVIDENCE."
date: "2026.09.17"
readTime: "12 分钟阅读"
tag: "EduEvidence"
category: "AI"
tags: ["EduEvidence", "Skill", "Evidence", "教育", "研究方法"]
tagFilters:
  "EduEvidence": "ai"
  "Skill": "ai"
  "Evidence": "ai"
  "教育": "ai"
  "研究方法": "ai"
image: "illu-eduevidence.webp"
imageAlt: "EduEvidence 研究引擎"
imageWidth: 1536
imageHeight: 922
badge: "EduEvidence"
sideNote: "EduEvidence · Research Engine ·<br/>nine-stage · graph · ADOPT"
caption: "<b>From question to decision.</b>(CityGenius, MMXXVI)"
authorMeta: "大学生 · 全栈开发者 · AI 工具链探索者"
featured: false
related:
  - date: "2026.09.17"
    title: "agent-mcp：把各种 Agent CLI 收进一个工作池"
    desc: "控制面统一派发与容错。"
    tag: "Agent MCP · AI"
    slug: "project-agent-mcp"
  - date: "2026.05.28"
    title: "把 Agent Skill 当成可复用教案来写"
    desc: "工作流写成 Skill，少解释一遍是一遍。"
    tag: "Agent Skill · AI"
    slug: "agent-skill-as-lesson-plan"
  - date: "2026.05.21"
    title: "从桌面应用到 Claude Skill"
    desc: "把复杂应用能力压缩成可复用 Skill。"
    tag: "Claude Code · Skill"
    slug: "open-design-to-skill"
---

Someone asked: should we give students an AI coding assistant?

Ask a model directly and it'll give you something that sounds smooth: efficiency gains, personalization, the future is here. The literature tells a different story — CHI 2023 has controlled studies at 1.15× / 1.8×, but also "no significant difference after a week"; PNAS 2025 measured −17% in unsupervised exams.

**AI doesn't lack search. It lacks evidence discipline.**

<div class="tldr">
<b>TL;DR</b>
EduEvidence is an AI Agent Skill built for one problem: when AI advises on education decisions, it talks smoothly and cites nothing. It locks in three rules: retrieved snippets are only pointers, not evidence; no study gets designed without an evidence-grounded knowledge gap; the real fact layer is a versioned, immutable Evidence Graph — reports are just projections. At the end you don't get a yes/no, you get four outcomes — ADOPT, PILOT, REJECT, INSUFFICIENT EVIDENCE — plus how to pilot and how to evaluate.
</div>

What EduEvidence does is turn a "decision question" into an answer that is evidence-backed, pilotable, and evaluable — not a longer summary.

The README's product line is: **From Research Questions to Evidence-Based Decisions.**

It ships as an **AI Agent Skill**; inside the Skill runs the **EduEvidence Research Engine** — persistent, auditable, compressing decision questions into evidence-grounded answers.

Three frozen principles:

1. **Retrieved snippets are locators, not evidence.**  
   OpenAlex / Semantic Scholar / Sciverse give you leads; to become evidence, something must enter a traceable citation chain.

2. **Without an evidence-grounded Knowledge Gap, no new study gets designed.**  
   A frozen scientific rule: study design must explicitly reference a grounded Gap ID.

3. **`result.json` / HTML / Markdown are projections, not the fact store.**  
   The real fact layer is versioned, immutable revisions of the **Evidence Graph**.

The output isn't a binary "allow / ban" either. It's four states:

**ADOPT / PILOT / REJECT / INSUFFICIENT EVIDENCE**, plus an executable intervention and evaluation plan.

## The Problem

Education decisions have three traps:

<figure class="illu method">
  <img src="/citygenius-blog/assets/fig-edu-nine-stage.webp" alt="九阶段协议" width="1444" height="824" loading="lazy" />
  <figcaption>Research Core 六阶段 + Decision Extension 三阶段。</figcaption>
</figure>

- **Citations that look real**: the year, journal, and conclusion all check out, but the details don't survive scrutiny
- **Correlation passed off as causation**: "scores went up after adoption" is usually just selection bias
- **Skipped applicability boundaries**: who it works for, under what conditions it fails — often erased

Real studies like CHI 2023 and PNAS 2025 remind us: AI-assisted coding may speed up short tasks, but it can also drag in transfer and unsupervised settings. "Faster across the board" with no boundary conditions is unusable as decision input.

## The Method

The engine splits the full research cycle open:

- **Research Core**: frame the question → retrieve → grade evidence → Gap → synthesize
- **Decision Extension**: option → pilot design → evaluate → update the decision

Three public workflows:

| Workflow | Answers |
|--------|----------|
| Evidence Review | What the existing evidence supports — and what it can't support |
| Decision & Pilot | How to pilot, how to verify |
| Evaluate & Update | How new data rewrites the decision |

Multi-domain support works through **contracts**, not engine copies: `education` and `policy` each declare their frame schema, outcome taxonomy, and method list; unknown tokens **fail closed**.

<figure class="illu method">
  <img src="/citygenius-blog/assets/chart-edu-decisions.webp" alt="四态决策" width="1402" height="648" loading="lazy" />
  <figcaption>ADOPT / PILOT / REJECT / 证据不足。</figcaption>
</figure>

## How It Works

After install, hosts like Claude Code / Cursor / Codex / OMP can auto-load the Skill on "teaching decision" type questions.

```bash
npm install -g eduevidence
eduevidence skill --host claude
```

Native Core **only depends on the Python standard library** — no Agent MCP, no daemon. That's deliberate: a research engine shouldn't be welded to one orchestration framework.

Retrieval channels come in zero-config (OpenAlex / Semantic Scholar / CrossRef…) and keyed (Sciverse etc.). Sciverse is for citation-level locating; then things go into the Graph for structuring.

## Results

- **Benchmark simulation ≠ evidence.** `benchmarks/results/` is just a simulation harness; the first real empirical round is B2 vs B3 (10 questions × 3 repeats) — it can't be written up as "dominates across the board."
- **Four states are harder to sell than two, but more useful.** "Insufficient evidence" is a legitimate conclusion, not a failure.
- **Projections can change; the fact layer can't.** Reports can be reordered; once a Graph revision lands, it shouldn't be quietly rewritten.

Currently at **6.2.0**. The Landing / Research Studio / Deep Research comparison pages all open directly. Sample report:

```bash
open examples/ai-coding-assistant-evidence/EduEvidence_Report.html
```

It won't make education decisions for you. It only guarantees: before you say "go" or "no go" — where the evidence comes from, what the Gap is, how the pilot gets verified — all written down.

Main repo: [37chengshan/eduevidence](https://github.com/37chengshan/eduevidence).

## FAQ
### How is EduEvidence different from just asking an AI?
Ask an AI directly and you get something that sounds smooth. EduEvidence compresses a decision question into an answer that is evidence-backed, pilotable, and evaluable — ending in ADOPT, PILOT, REJECT, or INSUFFICIENT EVIDENCE, plus an executable intervention and evaluation plan.
### Does a retrieved paper abstract count as evidence?
No. Retrieved snippets are only locators — leads. To become evidence, something must enter a traceable citation chain. That's the first frozen principle.
### Will it just tell me whether students should get an AI coding assistant?
It won't make the decision for you. It only guarantees: before you say "go" or "no go" — where the evidence comes from, what the knowledge gap is, how the pilot gets verified — all written down.
### Do I have to install Agent MCP to use it?
No. Native Core only depends on the Python standard library and isn't welded to any single orchestration framework; hosts like Claude Code, Cursor, Codex, and OMP can all auto-load the Skill.
### Is "insufficient evidence" a failure?
No. It's a legitimate conclusion, not a failure. Four states are harder to sell than two, but more useful.
