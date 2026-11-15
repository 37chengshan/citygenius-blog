---
title: "eduevidence: no evidence, no new study"
description: "A retrieved snippet is not evidence. A nine-stage protocol and an evidence graph end in ADOPT, PILOT, REJECT or INSUFFICIENT EVIDENCE."
date: "2026.09.17"
readTime: "12 min read"
tag: "EduEvidence"
category: "AI"
tags: ["EduEvidence", "Skill", "Evidence", "Education", "Research Methods"]
tagFilters:
  "EduEvidence": "ai"
  "Skill": "ai"
  "Evidence": "ai"
  "Education": "ai"
  "Research Methods": "ai"
image: "illu-eduevidence.webp"
imageAlt: "EduEvidence research engine"
imageWidth: 1536
imageHeight: 922
badge: "EduEvidence"
sideNote: "EduEvidence · Research Engine ·<br/>nine-stage · graph · ADOPT"
caption: "<b>From question to decision.</b>(CityGenius, MMXXVI)"
authorMeta: "University student · Full-stack developer · AI toolchain explorer"
featured: false
repo: "https://github.com/37chengshan/eduevidence"
related:
  - date: "2026.09.17"
    title: "agent-mcp: one worker pool for every Agent CLI"
    desc: "A control plane for unified dispatch and fault tolerance."
    tag: "Agent MCP · AI"
    slug: "project-agent-mcp"
  - date: "2026.05.28"
    title: "Writing an Agent Skill like a reusable lesson plan"
    desc: "Turn a workflow into a Skill so you explain it once, not every time."
    tag: "Agent Skill · AI"
    slug: "agent-skill-as-lesson-plan"
  - date: "2026.05.21"
    title: "From a desktop app to a Claude Skill"
    desc: "Compressing a complex app into a reusable Skill."
    tag: "Claude Code · Skill"
    slug: "open-design-to-skill"
---

Someone asked: should we give students an AI coding assistant?

If you let a model answer directly, you get something that sounds smooth: more productivity, personalization, the future is here. Reading the literature is a different story. CHI 2023 has controlled results of 1.15× and 1.8×, and also "no significant difference after a week". PNAS 2025 measured −17% on an unsupervised exam.

**AI doesn't lack search. It lacks evidence discipline.**

EduEvidence turns a "decision question" into an answer that is backed by evidence, can be piloted, and can be evaluated, instead of a longer summary.

The README's product line is: **From Research Questions to Evidence-Based Decisions.**

It ships as an **AI Agent Skill**. Inside the Skill runs the **EduEvidence Research Engine**, which is persistent and auditable, and compresses a decision question into an evidence-grounded answer.

Three frozen principles:

1. **A retrieved snippet is a locator, not evidence.**  
   OpenAlex / Semantic Scholar / Sciverse give you leads. To count as evidence, a lead has to enter a traceable citation chain.

2. **No new study may be designed without an evidence-grounded Knowledge Gap.**  
   A frozen scientific rule: a study design must explicitly cite a grounded Gap ID.

3. **`result.json` / HTML / Markdown are projections, not a fact store.**  
   The real fact layer is the versioned, immutable revisions of the **Evidence Graph**.

The output is not a binary allow / forbid either. It has four states:

**ADOPT / PILOT / REJECT / INSUFFICIENT EVIDENCE**, plus an actionable intervention and evaluation plan.

<div class="tldr">
<b>TL;DR</b>
EduEvidence is an AI Agent Skill built for one problem: when AI advises on education decisions, it talks smoothly and cites nothing. It locks in three rules: retrieved snippets are only pointers, not evidence; no study gets designed without an evidence-grounded knowledge gap; the real fact layer is a versioned, immutable Evidence Graph: reports are just projections. At the end you don't get a yes/no, you get four outcomes (ADOPT, PILOT, REJECT, INSUFFICIENT EVIDENCE), plus how to pilot and how to evaluate.
</div>

## Problem

Educational decisions have three traps:


<figure class="illu method">
  <img src="/citygenius-blog/assets/fig-edu-nine-stage.webp" alt="Nine-stage protocol" width="1444" height="824" loading="lazy" />
  <figcaption>Six Research Core stages plus three Decision Extension stages.</figcaption>
</figure>

- **Citations that look real**: the year, journal and conclusion all line up, but the details fall apart when you check them
- **Correlation read as causation**: "scores went up after using it" is often just selection bias
- **Skipped boundaries**: who it works for, and under what conditions it stops working, usually get erased

Real studies like CHI 2023 and PNAS 2025 are a reminder that AI-assisted coding may speed up short tasks, and may also hold people back in transfer and unsupervised settings. A blanket "improves productivity" with no boundary conditions is not a usable input for a decision.

## Method

The engine splits the full research cycle into parts:

- **Research Core**: frame the question → search → grade evidence → Gap → synthesis
- **Decision Extension**: plan → pilot design → evaluation → update the decision

Three public workflows:

| Workflow | What it answers |
|--------|----------|
| Evidence Review | What the existing evidence supports, and what it can't |
| Decision & Pilot | How to run a pilot and how to verify it |
| Evaluate & Update | How new data rewrites the decision |

Multiple domains are handled by **contracts**, not by copying the engine: `education` and `policy` each declare their own frame schema, outcome taxonomy and method list, and unknown tokens **fail closed**.

<figure class="illu method">
  <img src="/citygenius-blog/assets/chart-edu-decisions.webp" alt="Four decision states" width="1402" height="648" loading="lazy" />
  <figcaption>ADOPT / PILOT / REJECT / insufficient evidence.</figcaption>
</figure>

## Approach

After installation, hosts such as Claude Code / Cursor / Codex / OMP can load the Skill automatically on teaching-decision questions.

```bash
npm install -g eduevidence
eduevidence skill --host claude
```

The Native Core **depends only on the Python standard library**. It needs no Agent MCP and no daemon. That is deliberate: a research engine shouldn't be tied to one orchestration framework.

Search channels come in two kinds: zero-config (OpenAlex / Semantic Scholar / CrossRef…) and key-based (Sciverse and others). Sciverse gives citation-level locators, which then go into the Graph for structuring.

## Results

- **Benchmark simulation ≠ empirical evidence.** `benchmarks/results/` is only a simulated harness. The first empirical round is B2 vs B3 (10 questions × 3 repeats), and it can't be written up as "crushes the baseline".
- **Four states are harder to sell than two, but more useful.** "Insufficient evidence" is a legitimate conclusion, not a failure.
- **Projections change, the fact layer doesn't.** Reports can be rearranged. Once a Graph revision lands, it shouldn't be quietly rewritten.

Current version is **6.2.0**. The Landing page, Research Studio and the Deep Research comparison page can all be opened directly. For an example report:

```bash
open examples/ai-coding-assistant-evidence/EduEvidence_Report.html
```

It won't make the educational decision for you. It only guarantees that before you say "go" or "no go", where the evidence came from, what the Gap is, and how the pilot will be verified are all written down.

Main repo: [37chengshan/eduevidence](https://github.com/37chengshan/eduevidence).

## FAQ
### How is EduEvidence different from just asking an AI?
Ask an AI directly and you get something that sounds smooth. EduEvidence compresses a decision question into an answer that is evidence-backed, pilotable, and evaluable, ending in ADOPT, PILOT, REJECT, or INSUFFICIENT EVIDENCE, plus an executable intervention and evaluation plan.
### Does a retrieved paper abstract count as evidence?
No. Retrieved snippets are only locators (leads). To become evidence, something must enter a traceable citation chain. That's the first frozen principle.
### Will it just tell me whether students should get an AI coding assistant?
It won't make the decision for you. It only guarantees: before you say "go" or "no go" (where the evidence comes from, what the knowledge gap is, how the pilot gets verified), all written down.
### Do I have to install Agent MCP to use it?
No. Native Core only depends on the Python standard library and isn't welded to any single orchestration framework; hosts like Claude Code, Cursor, Codex, and OMP can all auto-load the Skill.
### Is "insufficient evidence" a failure?
No. It's a legitimate conclusion, not a failure. Four states are harder to sell than two, but more useful.
