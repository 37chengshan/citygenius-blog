---
title: "Write an Agent Skill like a <em>reusable lesson plan</em>"
description: "The biggest time sink in student AI projects usually isn't a weak model. It's explaining the same process again and again. Write the workflow as an Agent Skill, like putting lab steps into a lesson plan you can reuse."
date: "2026.05.28"
readTime: "6 min read"
tag: "Agent Skill"
category: "AI"
tags: ["Agent Skill", "AI", "Study Method", "Prompt Engineering", "Student Dev"]
tagFilters:
  "Agent Skill": "ai"
  "AI": "ai"
  "Study Method": "ai"
  "Prompt Engineering": "ai"
  "Student Dev": "full-stack"
image: "lab-3.webp"
imageAlt: "Agent Skill as reusable lesson plan article cover"
imageWidth: 1254
imageHeight: 1254
badge: "Agent Skill"
sideNote: "Agent Skill · Lesson plan ·<br/>Reuse · Constraints · Acceptance"
caption: "<b>Skill as curriculum.</b>(CityGenius, MMXXVI)"
authorMeta: "University student · Full-stack developer · AI toolchain explorer"
featured: false
related:
  - date: "2026.05.21"
    title: "From a desktop app to a Claude Skill: extracting the reusable logic of a design system"
    desc: "A full walkthrough of compressing a complex app's abilities into a Skill."
    tag: "Claude Code · Skill"
    slug: "open-design-to-skill"
  - date: "2026.05.15"
    title: "Building a full-stack AI app in three days with Vibe Coding"
    desc: "From idea to launch: how scholar-ai got built."
    tag: "Vibe Coding · AI"
    slug: "vibe-coding-3-days"
---

<div class="tldr">
<b>TL;DR</b>
A Prompt answers "how do I answer this time." A Skill answers "how do I handle this kind of task from now on." Write Agent Skills like reusable lesson plans: a Skill should answer four things — when to use it, where the steps start and stop, what quality bar counts as done, and how to bail out when it fails. Put constraints up front, lock quality with a minimal acceptance bar (local build passes, links work, frontmatter complete), and version it in the repo alongside your code.
</div>

## Problem

The most common waste in student AI projects isn't compute. It's explaining things twice. Every new session, you have to say it all again: the project background, the directory conventions, what's off limits, the acceptance criteria, how to roll back after a failure. A prompt answers "how to respond this time." A Skill answers "how to do this kind of task from now on."

Think of an Agent Skill as a reusable lesson plan and you'll see it has to answer at least four questions:

1. **When to use it:** which tasks should trigger it.
2. **Step boundaries:** what comes first, what comes next, where it must stop.
3. **Quality bar:** what counts as done, and what has to be redone.
4. **Way out:** what the fallback is when it gets stuck.

## Approach

### <em>Extracting</em> a Skill from a real assignment

Recently I turned "write a technical note and publish it to my blog" into a Skill. The first version was a single sentence:

> Write an article about such-and-such technology, in the style of my earlier posts.

It drifted every time. Sometimes it read like a paper, sometimes like an ad, sometimes it skipped the frontmatter entirely. It only became stable after I rewrote it as a lesson plan.

<div class="info-card">
<div class="ic-title">Lesson plan outline</div>
<div class="ic-body">
First read one or two existing articles to match the tone. Then list three points, each with a concrete example. Finally add the frontmatter, related articles and the publishing checks. No empty summaries, and no making up things I haven't done.
</div>
</div>

The point isn't to pile on more adjectives. It's to **put the constraints first**. The freer the AI is, the more its output looks like the internet average. The earlier you give it boundaries, the more it looks like your project.

### Three kinds of Skill worth keeping in a student project

Not every process deserves to be a Skill. For student developers, these three are the best place to start:

- **Publishing:** writing articles, updating the README, preparing release notes.
- **Engineering:** setting up a project, adding CI, running builds, fixing common config errors.
- **Research:** summaries of papers or competitors, experiment logs, failure retrospectives.

What they share is that **the steps repeat and the result can be checked**. If the goal is different every time, forcing it into a Skill just makes a mess.

### Hold the line with a <em>minimum acceptance bar</em>

The easiest part of a Skill to forget is the definition of "done." Without an acceptance bar, the Agent will confidently hand you a half-finished job. My habit is to pin down a few lines at the end:

- `npm run build` passes locally.
- Internal links work under the deployed path.
- All frontmatter fields are present.
- No new dependencies unless I asked for them.

It sounds plain, but it swaps "feels about right" for checks that can actually run. This helps student projects in particular: you may not have a code review partner, but you can have a checklist.

## Status

### Next: put the Skill in the repo

A Skill shouldn't live in a chat history. Put it in the repo's skills/ or docs folder and version it with the code, and only then can you really reuse it. You can also state the intended model, directory conventions and prohibitions at the top, so future you (or a teammate) doesn't have to dig through old context.

Where Vibe Coding really saves time isn't in letting the AI finish everything for you. It's in fixing in place what you've already figured out. A Skill is how you do that. Like a lesson plan, you teach it once and use it many times.

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
