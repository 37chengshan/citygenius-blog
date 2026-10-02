---
title: "SwiftUI vs. AppKit: Knowing When to Switch"
description: "Lessons and pitfalls from building macOS tools. The conveniences and limits of SwiftUI, when to go back to AppKit, and how to do on-device inference with Core ML."
date: "2026.05.08"
readTime: "7 分钟阅读"
tag: "macOS"
category: "macOS"
tags: ["macOS", "Swift", "SwiftUI", "AppKit", "Core ML"]
tagFilters:
  "macOS": "macos"
  "Swift": "macos"
  "SwiftUI": "macos"
  "AppKit": "macos"
  "Core ML": "ai"
image: "lab-2.webp"
imageAlt: "SwiftUI AppKit article cover artwork"
imageWidth: 768
imageHeight: 1024
badge: "macOS"
sideNote: "SwiftUI · AppKit ·<br/>Toolbar · Layout · Core ML"
caption: "<b>Native workflow visual.</b>(CityGenius, MMXXVI)"
authorMeta: "大学生 · macOS 开发者 · 原生工具实践者"
featured: false
related:
  - date: "2026.05.15"
    title: "用 Vibe Coding 三天搞定一个全栈 AI 应用"
    desc: "从想法到上线，记录 scholar-ai 的开发过程。"
    tag: "Vibe Coding · 全栈"
    slug: "vibe-coding-3-days"
  - date: "2026.04.15"
    title: "本地 AI 模型实战"
    desc: "TFLite 图片处理、离线翻译模型和性能优化。"
    tag: "AI/ML · 移动端"
    slug: "local-ai-tflite"
---

<div class="tldr">
<b>TL;DR</b>
My rule of thumb for macOS tools is simple: if it's mostly content display and basic interaction, SwiftUI is fast and good. The moment it approaches the detail density of a desktop-grade productivity tool (window management, menu bar, shortcuts, drag and drop, fine scrolling), bring AppKit back early — it's not legacy baggage, it's a capability boundary. In practice I work in three layers: SwiftUI handles page structure and state display, AppKit handles windows, menus, and focus — the desktop details users actually feel — and the shared layer holds the data models and Core ML inference. One thing to remember: native feel isn't looking like macOS; it's the user never noticing "this is a wrapper" when working the edges.
</div>

## Why This Question Keeps Coming Up

Building macOS tools, SwiftUI's first impression is always great: fast to write, live previews, clean structure. But the moment you touch window management, menu bar behavior, complex lists, shortcuts, drag and drop, and fine scrolling control, AppKit comes back to the desk sooner or later.

My rule of thumb is simple now: if the requirement is typical content display and basic interaction, SwiftUI is efficient enough; if the requirement starts approaching the detail density of a "desktop-grade productivity tool," accept early that AppKit isn't legacy baggage — it's a capability boundary.

## My Current Layering Habit

<div class="info-card">
<div class="ic-title">Layering in Practice</div>
<ul>
<li><strong>SwiftUI:</strong> page structure, forms, state-driven display</li>
<li><strong>AppKit:</strong> windows, menus, input focus, bridging complex controls</li>
<li><strong>Shared layer:</strong> data models, commands, file system, Core ML inference</li>
</ul>
</div>

The nice thing is you don't have to pick a side up front. SwiftUI handles speed and expressiveness; AppKit handles the "desktop-native details" users actually feel.

## When to Go Back to AppKit Decisively

- You need stable multi-window behavior and lifecycle control
- You're building complex tables, sidebars, command menus, a shortcut system
- You start working around scrolling, focus, text selection, drag and drop, or list performance

> Native feel isn't looking like macOS — it's the user not noticing "this is a wrapper" when working the edges.
> Dev note

## On Core ML

If the tool needs on-device inference, I put model calls and caching strategy in a standalone service layer and don't stuff inference logic directly into views. Then, whether the front is SwiftUI or AppKit, the UI only cares about state, not model lifecycle.

What's actually worth the time isn't "how to write all the code in SwiftUI" — it's how to make users feel it's just a natural macOS tool.

## FAQ
### Do I have to pick between SwiftUI and AppKit?
No need to pick a side up front. My layering habit: SwiftUI does page structure, forms, and state-driven display; AppKit handles windows, menus, input focus, and bridging complex controls; data models, commands, file system, and Core ML inference live in the shared layer.
### When should I decisively go back to AppKit?
Three signals: you need stable multi-window behavior and lifecycle control; you're building complex tables, sidebars, command menus, a shortcut system; you start working around scrolling, focus, text selection, drag and drop, or list performance.
### What counts as truly native feel?
Not looking like macOS — the user not noticing "this is a wrapper" when working the edges.
### Where should Core ML inference code go?
Prefer a standalone service layer, together with the caching strategy, not stuffed directly into views. Then, whether the front is SwiftUI or AppKit, the UI only cares about state, not model lifecycle.
