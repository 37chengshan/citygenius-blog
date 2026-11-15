---
title: "SwiftUI vs. AppKit: Where I Draw the Line"
description: "Lessons from building macOS tools. What SwiftUI does well, where it falls short, when to go back to AppKit, and how to run local inference with Core ML."
date: "2026.05.08"
readTime: "7 min read"
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
caption: "<b>SwiftUI first, AppKit when needed.</b>(CityGenius, MMXXVI)"
authorMeta: "Student · macOS developer · Native tools in practice"
featured: false
related:
  - date: "2026.05.15"
    title: "Building a Full-Stack AI App in Three Days with Vibe Coding"
    desc: "From idea to launch: how scholar-ai got built."
    tag: "Vibe Coding · Full-stack"
    slug: "vibe-coding-3-days"
  - date: "2026.04.15"
    title: "Running Local AI Models in Practice"
    desc: "TFLite image processing, offline translation models and performance tuning."
    tag: "AI/ML · Mobile"
    slug: "local-ai-tflite"
---

<div class="tldr">
<b>TL;DR</b>
My rule of thumb for macOS tools is simple: if it's mostly content display and basic interaction, SwiftUI is fast and good. The moment it approaches the detail density of a desktop-grade productivity tool (window management, menu bar, shortcuts, drag and drop, fine scrolling), bring AppKit back early. It's not legacy baggage, it's a capability boundary. In practice I work in three layers: SwiftUI handles page structure and state display, AppKit handles windows, menus, and focus (the desktop details users actually feel), and the shared layer holds the data models and Core ML inference. One thing to remember: native feel isn't looking like macOS; it's the user never noticing "this is a wrapper" when working the edges.
</div>

## Why This Keeps Coming Up

When I start a macOS tool, SwiftUI always makes a great first impression: it's quick to write, the preview is right there, and the structure is clean. But once I touch window management, menu bar behavior, complex lists, keyboard shortcuts, drag and drop, or fine scroll control, AppKit shows up on my desk again sooner or later.

My rule of thumb is simple. If the app is mostly content display and basic interaction, SwiftUI is efficient enough. If it starts to need the detail density of a "desktop-grade productivity tool", accept early that AppKit is not legacy baggage. It's where SwiftUI's limits end.

## How I Split the Layers

<div class="info-card">
<div class="ic-title">Layering in practice</div>
<ul>
<li><strong>SwiftUI:</strong> page skeleton, forms, state-driven views</li>
<li><strong>AppKit:</strong> windows, menus, input focus, bridging complex controls</li>
<li><strong>Shared layer:</strong> data models, commands, file system, Core ML inference</li>
</ul>
</div>

This way I don't have to pick a side up front. SwiftUI gives me speed and expressiveness, and AppKit handles the "native desktop details" that users actually notice.

## When to Go Back to AppKit

- You need reliable multi-window behavior and control over window lifecycles
- You're building complex tables, sidebars, command menus, or a full keyboard shortcut system
- You keep working around scrolling, focus, text selection, drag and drop, or list performance

> Native feel isn't looking like macOS. It's that users poking at the edges never sense they're inside a shell.
> Dev notes

## About Core ML

If a tool needs local inference, I put model calls and the caching strategy in a separate service layer instead of stuffing inference logic into views. Then whether the front end is SwiftUI or AppKit, the UI only cares about state, not the model's lifecycle.

What's worth the time isn't figuring out how to write everything in SwiftUI. It's making the app feel like a natural macOS tool.

## FAQ
### Do I have to pick between SwiftUI and AppKit?
No need to pick a side up front. My layering habit: SwiftUI does page structure, forms, and state-driven display; AppKit handles windows, menus, input focus, and bridging complex controls; data models, commands, file system, and Core ML inference live in the shared layer.
### When should I decisively go back to AppKit?
Three signals: you need stable multi-window behavior and lifecycle control; you're building complex tables, sidebars, command menus, a shortcut system; you start working around scrolling, focus, text selection, drag and drop, or list performance.
### What counts as truly native feel?
Not looking like macOS — the user not noticing "this is a wrapper" when working the edges.
### Where should Core ML inference code go?
Prefer a standalone service layer, together with the caching strategy, not stuffed directly into views. Then, whether the front is SwiftUI or AppKit, the UI only cares about state, not model lifecycle.
