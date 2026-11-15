---
title: "From Desktop App to Claude Skill: Distilling a Design System's Reusable Logic"
description: "Using Open Design as the example: how to break an app with 149 design systems, 110 templates and 11 craft guides into a cleanly structured Claude Code Skill. The core ideas are three-axis composition, six-part assembly and consultant-style interaction."
date: "2026.05.21"
readTime: "10 min read"
tag: "Claude Code"
category: "AI"
tags: ["Claude Code", "Skill", "Design systems", "Prompt Engineering", "Open Design"]
tagFilters:
  "Claude Code": "ai"
  "Skill": "ai"
  "Design systems": "design"
  "Prompt Engineering": "ai"
  "Open Design": "design"
image: "lab-5.webp"
imageAlt: "Open Design to Claude Skill article cover"
imageWidth: 904
imageHeight: 1740
badge: "Claude Code"
sideNote: "Open Design · Skill ·<br/>Design System · Prompt"
caption: "<b>Design system distillation.</b>(CityGenius, MMXXVI)"
authorMeta: "Student · Full-stack developer · AI toolchain explorer"
featured: false
related:
  - date: "2026.05.15"
    title: "Building a Full-Stack AI App in Three Days with Vibe Coding"
    desc: "From idea to launch: how scholar-ai got built."
    tag: "Vibe Coding · AI"
    slug: "vibe-coding-3-days"
  - date: "2026.05.08"
    title: "SwiftUI or AppKit"
    desc: "Where to draw the line in native desktop tools."
    tag: "macOS · Swift"
    slug: "swiftui-appkit"
---

## Problem

Open Design is a macOS desktop app that does something simple: you tell it what kind of page you want, and it assembles a brand-consistent HTML artifact. Inside it sit three repositories: 149 brand design systems, 110 page templates and 11 general craft guides. Every generation picks one from each axis and puts them together into the final output.

The question: can this logic move into Claude Code as a Skill?

Yes, and it works surprisingly well. But it isn't a matter of "porting the features". You have to understand the design pattern first, then re-express it with Claude's native abilities.

## Approach

### First, the <em>three-axis architecture</em>

At the heart of Open Design is a three-axis composition system:

<div class="info-card">
<div class="ic-title">Three-axis composition</div>
<ul>
<li><strong>Design system (look)</strong> — the visual language of 149 brands, each with a DESIGN.md covering nine dimensions including color, typography, components and layout</li>
<li><strong>Template (shape)</strong> — 110 page types, from SaaS landing pages to dashboards to slide decks, each with its own SKILL.md</li>
<li><strong>Craft guide (quality)</strong> — 11 general rule sets: typography, color, anti-AI-slop, state coverage, accessibility and more</li>
</ul>
</div>

The relationship between the three is clear. The design system decides which tokens to use, the craft guide decides how to use them, and the template decides what shape comes out. When they conflict, the brand wins, and craft fills in whatever the brand doesn't cover.

The architecture is itself a design pattern: **separation of concerns**. Brand visuals are decoupled from general quality constraints, and template shape is decoupled from actual content. You need to see this before you can turn it into a Skill properly.

### Step one: <em>spot the core patterns</em>

Before writing any Skill, I spent a lot of time reading the Open Design source. Not to copy it line by line, but to find the core design patterns.

### Pattern one: six-part assembly

Open Design's daemon builds the system prompt with `composeSystemPrompt()`, joining six parts in order:

```text
1. Identity & Workflow — defines the agent role and workflow
2. Active Design System — the full DESIGN.md of the current brand
3. Active Craft References — the craft guides the current template needs
4. Active Template Skill — the SKILL.md workflow of the current template
5. Project Metadata — mode, platform, scenario and other metadata
6. Output Contract — the HTML output format
```

What matters here is that **each part is independent, replaceable and has one clear job**. In a Claude Skill you don't need to build one big string. The agent reads these files one by one with the Read tool, which has the same effect.

### Pattern two: consultant-style interaction

Open Design is not a "pick from a menu" tool. Its flow is:

```text
Direction → 5 probing questions → smart recommendation → confirm → build
```

The five questions cover content, audience, visual style, brand preference and scale. A matching algorithm then scores templates and design systems and recommends the top 3 combinations.

The value here is that **the user keeps the choice, while the algorithm narrows the options**. In the Skill, this flow is implemented natively with the `AskUserQuestion` tool.

### Pattern three: a hard gate on the token preview

Before building, Open Design shows a token preview: background color, accent color, typeface. The user has to explicitly say "start" before generation runs.

This is a **HARD-GATE** pattern: a confirmation step that keeps you from wasting tokens. In a Claude Skill, this logic is written as a conditional.

### What the <em>Skill looks like</em>

Putting these three patterns into a Claude Skill gives this structure:

```yaml
---
name: open-design
description: |
  Use when the user wants to generate brand-consistent web artifacts
  using Open Design's three-axis composition system.
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Grep
  - Glob
  - AskUserQuestion
---
```

The frontmatter defines the Skill's metadata and the tools it may use. `allowed-tools` matters a lot, because it sets the boundary of what the Skill can do.

The body has several core parts:

**1. Identity** — defines the agent as a "design consultant", not a menu picker.

**2. Resource Map** — points to the resource paths inside the app:

```text
OD = /Applications/Open Design.app/Contents/Resources/open-design
$OD/design-systems/<brand>/DESIGN.md
$OD/design-templates/<template>/SKILL.md
$OD/craft/<name>.md
```

**3. Arguments** — defines the different input modes:

| Input | Mode | Behavior |
|------|------|------|
| empty | Consultant | Full five-stage consultation |
| `brand template` | Direct | Skip the Q&A |
| `--browse term` | Browse | Search resources |
| `--compare b1 b2` | Compare | Compare two design systems |

**4. Workflow** — the detailed flow of five stages, each one interactive through `AskUserQuestion`.

**5. Matching Algorithm** — the scoring formulas for templates and design systems, weighted over keywords, scenario, style and scale.

**6. Output Contract** — the HTML must be self-contained and wrapped in an `<artifact>` tag.

### <em>Translating</em> the matching algorithm

Open Design's matching algorithm is an interesting piece of design. It turns the user's five answers into scores for templates and design systems:

```text
Template score = 3×keyword match + 2×scenario match + 2×style match + 2×scale match + 1×featured
Design system score = 3×style match + 3×brand match + 2×tone match
```

In the Skill, this algorithm needs no code. It is expressed as a **matching index table**. The agent reads the user's answers, scores them against the table, and recommends the top 3.

Expressing an algorithm as a table is something a Claude Skill is good at. A traditional implementation needs dozens of lines of logic, while in a Skill one structured table is enough.

### <em>Reusing</em> the craft guides

The 11 craft guides are among the most valuable parts of Open Design. They aren't tied to any brand or template. They are general design-quality constraints:

<div class="info-card">
<div class="ic-title">Key craft guides</div>
<ul>
<li><strong>typography</strong> — type scale of 1.2/1.25, line height 1.0-1.6, ALL CAPS tracking ≥0.06em, line length 50-75ch</li>
<li><strong>color</strong> — a four-layer palette (neutrals 70-90%, accents 5-10%, semantic colors 0-5%, effect colors &lt;1%), at most two accent colors per screen</li>
<li><strong>anti-ai-slop</strong> — seven sins to avoid: default indigo, two-color gradients, emoji as icons, fake data and so on</li>
<li><strong>state-coverage</strong> — five required states: Loading / Empty / Error / Populated / Edge</li>
</ul>
</div>

Templates reference these guides in their frontmatter (`od.craft.requires`), so the agent applies brand tokens and craft constraints together at generation time.

In the Skill this works as "read, then apply". The agent first reads the craft files the template needs, then follows both the brand rules and the craft rules while generating.

## Results

After turning Open Design into a Claude Skill, here is how it turned out:

**What it can do:**
- The full consultant-style interaction flow
- Top 3 recommendations
- Brand-consistent HTML output
- Automatic application of the craft guides
- Browse and Compare modes

**What it can't do:**
- Pixel-level rendering of device frames (needs the app's frame assets)
- Decorative features such as community pets
- Live preview (needs the app's preview pane)
- The complex animations in some templates

The core features work fully, but the "app experience" can't move over completely. That points to a principle: **a Skill distills logic and patterns, not interface and experience**.

### A general method for <em>distilling patterns</em>

From the Open Design case, here is a general method for turning design patterns into a Skill:

**Step 1: identify the core architecture**
Don't rush to write code. First understand the app's core architecture. Which independent parts does it consist of, and how do they relate?

**Step 2: find the design patterns**
Behind every architectural decision there is a pattern. Separation of concerns, consultant-style interaction, hard gates: these patterns are worth more than any specific implementation.

**Step 3: express it with Claude's native abilities**
A Skill is not a translation of code, it is a re-expression of logic. Use `AskUserQuestion` instead of UI interaction, tables instead of algorithms, Read instead of file loading.

**Step 4: define the boundary**
Be clear about what the Skill can and can't do. Don't try to copy the whole app. Distilling the most valuable part is enough.

**Step 5: test and iterate**
Use the Skill for real, and adjust when problems show up. The matching algorithm may need several rounds of tuning, and the interaction flow may need simplifying.

## Status

Open Design's three-axis architecture of design system × template × craft guide is an elegant pattern in itself. Turning it into a Claude Skill came down to one question: **which logic is worth distilling into a reusable agent ability?**

The answer isn't "every feature". It is "the core design patterns". Six-part assembly, consultant-style interaction and the hard gate on the token preview are worth more than any one app's implementation.

If you have a complex app you want to turn into a Skill, start by identifying its core design patterns. Code can be rewritten, but design patterns are the real asset.
