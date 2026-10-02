---
title: "Write Agent Skills Like <em>Reusable Lesson Plans</em>"
description: "The biggest time sink in student AI projects isn't a weak model — it's re-explaining the same workflow every time. Writing workflows as Agent Skills is like writing experiment steps into a reusable lesson plan."
date: "2026.05.28"
readTime: "6 min read"
tag: "Agent Skill"
category: "AI"
tags: ["Agent Skill", "AI", "学习方法", "Prompt Engineering", "学生开发"]
tagFilters:
  "Agent Skill": "ai"
  "AI": "ai"
  "学习方法": "ai"
  "Prompt Engineering": "ai"
  "学生开发": "full-stack"
image: "lab-3.webp"
imageAlt: "Agent Skill as reusable lesson plan article cover"
imageWidth: 1254
imageHeight: 1254
badge: "Agent Skill"
sideNote: "Agent Skill · Lesson Plans ·<br/>Reuse · Constraints · Acceptance"
caption: "<b>Skill as curriculum.</b>(CityGenius, MMXXVI)"
authorMeta: "College Student · Full-Stack Developer · AI Toolchain Explorer"
featured: false
related:
  - date: "2026.05.21"
    title: "From Desktop App to Claude Skill: Distilling a Design System's Reusable Logic"
    desc: "A full teardown of compressing a complex app's capabilities into a Skill."
    tag: "Claude Code · Skill"
    slug: "open-design-to-skill"
  - date: "2026.05.15"
    title: "Ship a Full-Stack AI App in 3 Days with Vibe Coding"
    desc: "From idea to launch: building scholar-ai."
    tag: "Vibe Coding · AI"
    slug: "vibe-coding-3-days"
---

<div class="tldr">
<b>TL;DR</b>
A Prompt answers "how do I answer this time." A Skill answers "how do I handle this kind of task from now on." Write Agent Skills like reusable lesson plans: a Skill should answer four things — when to use it, where the steps start and stop, what quality bar counts as done, and how to bail out when it fails. Put constraints up front, lock quality with a minimal acceptance bar (local build passes, links work, frontmatter complete), and version it in the repo alongside your code.
</div>

## You're Not Writing a Prompt, You're Writing a <em>Lesson Plan</em>

For students building AI projects, the most common waste isn't compute — it's re-explaining. Every new session means restating the project background, directory conventions, hard no-nos, acceptance criteria, and how to roll back when things fail. A Prompt answers "how do I answer this time." A Skill answers "how do I handle this kind of task from now on."

Think of an Agent Skill as a reusable lesson plan and you'll immediately see it has to answer four things:

1. **When to use it**: which tasks should trigger it.
2. **Step boundaries**: what comes first, what comes next, where it must stop.
3. **Quality bar**: what counts as done, what has to be redone.
4. **Failure exit**: what's the fallback when it gets stuck.

## <em>Distilling</em> a Skill from a Real Assignment

I recently turned "write a technical note and publish it to the blog" into a Skill. The original version was one sentence:

> Help me write an article about some tech, in the style of my previous blog posts.

It drifted every time: sometimes it read like an academic paper, sometimes like an ad, sometimes it just dropped the frontmatter. Only after rewriting it lesson-plan style did it stabilize.

<div class="info-card">
<div class="ic-title">Lesson Plan Skeleton</div>
<div class="ic-body">
First read 1–2 existing articles to match the tone; then list 3 arguments, each with a concrete example; finally fill in the frontmatter, related articles, and publishing checks. No vague summaries. No inventing things you didn't actually do.
</div>
</div>

The key here isn't piling on more adjectives — it's putting **constraints up front**. The more freedom AI has, the more its output looks like the internet average. The earlier you set boundaries, the more it looks like your project.

## Three Kinds of Skills Worth Building for Student Projects

Not every workflow deserves to be a Skill. For student dev work, prioritize these three:

- **Publishing**: writing articles, updating READMEs, preparing release notes.
- **Engineering**: scaffolding projects, adding CI, running builds, fixing common config errors.
- **Research**: paper/competitor summaries, experiment logs, failure postmortems.

They all share one trait: **repeatable steps, checkable results**. If a task has a different goal every time, forcing it into a Skill just adds noise.

## Hold Quality with a Minimal <em>Acceptance Bar</em>

The most overlooked part of a Skill is the definition of "done." Without an acceptance bar, the agent will confidently hand you a half-finished job. My habit is to hard-code a few lines at the end:

- Local `npm run build` passes.
- Internal links work under the target deploy path.
- Article frontmatter fields are complete.
- No new dependencies that weren't asked for.

It sounds plain, but it replaces "feels about done" with executable checks. Especially useful for student projects — you might not have a code review buddy, but you can have a checklist.

## Next Step: Put the Skill in the Repo

A Skill shouldn't sit in your chat history. Put it in the repo's skills/ directory or docs folder, versioned alongside your code — that's when reuse becomes real. You can also state the applicable models, directory conventions, and hard no-nos at the top, so future-you (or a teammate) doesn't have to do archaeology.

Where Vibe Coding actually saves time isn't having AI finish everything for you — it's locking in the parts you've already figured out. A Skill is that locked-in form: like a lesson plan, teach once, use many times.

## FAQ

### What's the real difference between a Skill and a Prompt?

The most common waste in student AI projects isn't compute — it's re-explaining: restating project background, directory conventions, and hard no-nos every new session. A Prompt answers "how do I answer this time." A Skill answers "how do I handle this kind of task from now on."

### What does a Skill need to spell out at minimum?

Four things: which tasks trigger it (when to use); what comes first, next, and where it stops (step boundaries); what counts as done and what must be redone (quality bar); and the fallback when it gets stuck (failure exit).

### Which workflows deserve to become Skills?

The ones with repeatable steps and checkable results. For student dev work, prioritize three kinds: publishing (articles, README updates, release notes), engineering (scaffolding, CI, fixing common config errors), and research (paper summaries, experiment logs, failure postmortems). Forcing a task with a different goal every time into a Skill just adds noise.

### How do you stop the agent from handing in half-finished work?

Hard-code a minimal acceptance bar at the end of the Skill: local `npm run build` passes, internal links work under the target deploy path, article frontmatter is complete, no unrequested new dependencies. It replaces "feels about done" with executable checks.

### Where should a Skill live?

Not in your chat history. Put it in the repo's skills/ directory or docs folder, versioned alongside your code — that's when reuse becomes real. State the applicable models, directory conventions, and hard no-nos at the top, so future-you doesn't have to do archaeology.
