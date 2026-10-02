---
title: "From Desktop App to Claude Skill: Distilling a Design System's Reusable Logic"
description: "Using Open Design as an example: how to break down an app with 149 design systems, 110 templates, and 11 craft specs into a clean Claude Code Skill. Core ideas: three-axis composition, six-part assembly, advisor-style interaction."
date: "2026.05.21"
readTime: "10 min read"
tag: "Claude Code"
category: "AI"
tags: ["Claude Code", "Skill", "设计系统", "Prompt Engineering", "Open Design"]
tagFilters:
  "Claude Code": "ai"
  "Skill": "ai"
  "设计系统": "design"
  "Prompt Engineering": "ai"
  "Open Design": "design"
image: "lab-5.webp"
imageAlt: "Open Design to Claude Skill article cover"
imageWidth: 904
imageHeight: 1740
badge: "Claude Code"
sideNote: "Open Design · Skill ·<br/>Design System · Prompt"
caption: "<b>Design system distillation.</b>(CityGenius, MMXXVI)"
authorMeta: "College Student · Full-Stack Developer · AI Toolchain Explorer"
featured: false
related:
  - date: "2026.05.15"
    title: "Ship a Full-Stack AI App in 3 Days with Vibe Coding"
    desc: "From idea to launch: building scholar-ai."
    tag: "Vibe Coding · AI"
    slug: "vibe-coding-3-days"
  - date: "2026.05.08"
    title: "SwiftUI vs AppKit: Picking Your Battles"
    desc: "Where to draw the line in native desktop tools."
    tag: "macOS · Swift"
    slug: "swiftui-appkit"
---

<div class="tldr">
<b>TL;DR</b>
Open Design is a macOS desktop app that generates brand-consistent HTML pages through "three-axis composition" (149 brand design systems × 110 page templates × 11 craft specs). Turning it into a Claude Code Skill isn't about porting features — it's about distilling three design patterns: a six-part-assembled prompt structure, an advisor-style interaction flow, and a token-preview hard gate. Remember: a Skill distills logic and patterns, not UI and experience.
</div>

## One App, 149 <em>Design Languages</em>

Open Design is a macOS desktop app that does one thing directly: you tell it what kind of page you want, and it assembles a brand-consistent HTML artifact. Inside it are three repositories — 149 brand design systems, 110 page templates, 11 generic craft specs. Every generation picks one from each axis and assembles the final output.

The question: can this logic move into Claude Code as a Skill?

The answer is yes, and it works surprisingly well. But the process isn't simply "porting features over" — it's re-understanding the design patterns, then re-expressing them with Claude's native capabilities.

## First, Understand Its <em>Three-Axis Architecture</em>

Open Design's core is a three-axis composition system:

<div class="info-card">
<div class="ic-title">Three-axis composition</div>
<ul>
<li><strong>Design systems (look)</strong> — the visual language of 149 brands, one DESIGN.md per brand, defining 9 dimensions like color, typography, components, and layout</li>
<li><strong>Templates (shape)</strong> — 110 page types, from SaaS landing pages to dashboards to slide decks, one SKILL.md per template</li>
<li><strong>Craft specs (quality)</strong> — 11 generic rule sets: typography, color, anti-AI-slop, state coverage, accessibility, and more</li>
</ul>
</div>

The relationship between the three axes is clear: design systems decide "which tokens to use," craft specs decide "how to use these tokens," and templates decide "what shape the output takes." When there's a conflict, the brand wins; craft specs fill in what the brand doesn't cover.

This architecture is itself a design pattern — **separation of concerns**. Brand visuals decouple from generic quality constraints; template shape decouples from specific content. Only by understanding this can you translate it into a Skill correctly.

## Step One of Distillation: <em>Identify the Core Patterns</em>

Before writing the Skill, I spent a lot of time reading Open Design's source code. Not to copy it line by line, but to find its core design patterns.

### Pattern 1: Six-Part Assembly

Open Design's daemon uses `composeSystemPrompt()` to build the system prompt, stitching six parts together in order:

```text
1. Identity & Workflow — 定义 agent 角色和工作流
2. Active Design System — 当前品牌的 DESIGN.md 全文
3. Active Craft References — 当前模板需要的工艺规范
4. Active Template Skill — 当前模板的 SKILL.md 工作流
5. Project Metadata — 模式、平台、场景等元信息
6. Output Contract — HTML 输出格式约定
```

The key to this pattern: **each part is independent, swappable, and has a clear responsibility**. In a Claude Skill, you don't need to actually concatenate into one string — the agent reads the files separately with the Read tool, which is equivalent.

### Pattern 2: Advisor-Style Interaction

Open Design isn't a "pick from a menu" tool. Its interaction flow is:

```text
方向 → 5 个深入问题 → 智能推荐 → 确认 → 构建
```

The 5 questions cover: content, audience, visual style, brand preference, scale. Then a matching algorithm scores templates and design systems, recommending the Top 3 combinations.

The value of this pattern: **it gives users the final say, but uses the algorithm to narrow the choices**. In a Skill, this flow is implemented natively with the `AskUserQuestion` tool.

### Pattern 3: Token-Preview Hard Gate

Before building, Open Design shows a token preview: background color, accent color, fonts. The user has to explicitly say "go" before generation runs.

This is a **HARD-GATE** pattern — a confirmation step that prevents wasting tokens. In a Claude Skill, this logic is implemented with conditional checks.

## The Skill's <em>Actual Structure</em>

Landing these three patterns in a Claude Skill, the final structure looks like this:

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

The frontmatter defines the Skill's metadata and available tools. `allowed-tools` is key — it constrains what the Skill is allowed to call.

The body breaks into several core parts:

**1. Identity** — defines the agent's role as "design advisor," not a menu picker.

**2. Resource Map** — points to the in-app resource paths:

```text
OD = /Applications/Open Design.app/Contents/Resources/open-design
$OD/design-systems/<brand>/DESIGN.md
$OD/design-templates/<template>/SKILL.md
$OD/craft/<name>.md
```

**3. Arguments** — defines the input modes:

| Input | Mode | Behavior |
|------|------|------|
| (empty) | Advisor | Full 5-stage consultation |
| `brand template` | Direct | Skip Q&A |
| `--browse term` | Browse | Search resources |
| `--compare b1 b2` | Compare | Compare two design systems |

**4. Workflow** — detailed 5-stage flow, each stage using `AskUserQuestion` for interaction.

**5. Matching Algorithm** — scoring formula for templates and design systems, weighted across four dimensions: keywords, scenario, style, scale.

**6. Output Contract** — HTML must be self-contained, wrapped in an `<artifact>` tag.

## Translating the <em>Matching Algorithm</em>

Open Design's matching algorithm is an interesting design. It converts the user's 5 answers into scores for templates and design systems:

```text
模板评分 = 3×关键词匹配 + 2×场景匹配 + 2×风格匹配 + 2×规模匹配 + 1×featured
设计系统评分 = 3×风格匹配 + 3×品牌匹配 + 2×色调匹配
```

In a Skill, this algorithm needs no code — it's expressed as a **matching index table**. The agent reads the user's answers, scores them against the table, and recommends the Top 3.

This "algorithm-as-table" approach is a unique strength of Claude Skills. A traditional code implementation would need dozens of lines of logic; in a Skill, one structured table is enough.

## Reusing the <em>Craft Specs</em>

The 11 craft specs are among the most valuable parts of Open Design. They're not tied to any brand or template — they're generic design-quality constraints:

<div class="info-card">
<div class="ic-title">Key craft specs</div>
<ul>
<li><strong>typography</strong> — font-size ratio 1.2/1.25, line-height 1.0–1.6, ALL CAPS tracking ≥ 0.06em, line length 50–75ch</li>
<li><strong>color</strong> — 4-layer palette (neutrals 70–90%, accents 5–10%, semantics 0–5%, effects <1%), max 2 accents per screen</li>
<li><strong>anti-ai-slop</strong> — 7 "sins" to avoid: default indigo, two-color gradients, emoji as icons, fake data, etc.</li>
<li><strong>state-coverage</strong> — 5 required states: Loading / Empty / Error / Populated / Edge</li>
</ul>
</div>

These specs are referenced by template frontmatter (`od.craft.requires`); the agent applies both brand tokens and craft constraints during generation.

In a Skill, this pattern is implemented as "read + apply" — the agent first reads the craft files the template requires, then follows both brand and craft rules during generation.

## What It Does and Doesn't Do

After converting Open Design into a Claude Skill:

**What works:**
- Full advisor-style interaction flow
- Smart Top-3 recommendations
- Brand-consistent HTML output
- Automatic craft-spec application
- Browse and Compare modes

**What doesn't:**
- Pixel-level device-frame rendering (needs the app's frame assets)
- Decorative features like community pets
- Live preview (needs the app's preview pane)
- Complex animations in some templates

The core functionality works fully, but the "app experience" layer can't be fully migrated. Which proves a principle: **a Skill distills logic and patterns, not UI and experience**.

## A <em>General Method</em> for Distilling Design Patterns

From the Open Design case, here's a general method for distilling design patterns into Skills:

**Step 1: Identify the core architecture**
Don't rush to write code. Spend time understanding the app's core architecture first — what independent parts does it have? How do they relate?

**Step 2: Find the design patterns**
Behind every architectural decision is a design pattern. Separation of concerns, advisor-style interaction, hard gates — these patterns are more valuable than the concrete implementation.

**Step 3: Express it with Claude's native capabilities**
A Skill isn't a translation of code — it's a re-expression of logic. Use `AskUserQuestion` instead of UI interaction, tables instead of algorithms, Read instead of file loading.

**Step 4: Define boundaries**
Be explicit about what the Skill can and can't do. Don't try to replicate the whole app — distilling the most valuable parts is enough.

**Step 5: Test and iterate**
Use the Skill for real, and adjust when you hit problems. The matching algorithm may need several rounds of tuning; the interaction flow may need simplification.

## Closing Thoughts

Open Design's three-axis architecture — design systems × templates × craft specs — is itself an elegant design pattern. Converting it into a Claude Skill is really about answering one question: **which logic deserves to be distilled into reusable agent capabilities?**

The answer isn't "all the features" — it's "the core design patterns." Six-part assembly, advisor-style interaction, token-preview hard gates — these patterns outlive any specific implementation.

If you have a complex app you want to turn into a Skill, start by identifying its core design patterns. Code can be rewritten; design patterns are the real assets.

## FAQ

### What exactly is the three-axis composition?

Design systems (look: the visual language of 149 brands, one DESIGN.md per brand), templates (shape: 110 page types, one SKILL.md per template), craft specs (quality: 11 generic rule sets). Design systems decide "which tokens to use," craft specs decide "how to use these tokens," templates decide "what shape the output takes." When in conflict, the brand wins.

### After converting to a Skill, what can't be ported over?

Things at the "app experience" layer can't make it over: pixel-level device-frame rendering, live preview, complex animations in some templates. But the full advisor-style interaction flow, Top-3 smart recommendations, brand-consistent HTML output, and automatic craft-spec application all work fine.

### How is the matching algorithm implemented in a Skill?

No code needed — it's expressed as a "matching index table." For example, template score = 3×keyword match + 2×scenario match + 2×style match + 2×scale match + 1×featured. The agent reads the user's answers, scores them against the table, and recommends the Top 3 combinations.

### What's the general method for distilling design patterns?

Five steps: first identify the core architecture (which independent parts, how they relate); then find the design patterns; re-express with Claude's native capabilities (AskUserQuestion instead of UI interaction, tables instead of algorithms); then define boundaries; finally test and iterate.

### How is a Skill different from just "porting features over"?

It's not translating code — it's re-expressing logic. Don't try to replicate the whole app; distilling the most valuable parts is enough. Code can be rewritten, but design patterns are the real assets.
