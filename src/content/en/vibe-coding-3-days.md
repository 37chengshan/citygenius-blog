---
title: "Ship a Full-Stack AI App in 3 Days with <em>Vibe Coding</em>"
description: "From idea to launch: building scholar-ai. How AI-assisted coding helped ship a FastAPI backend and a React frontend fast, plus real-world lessons from implementing RAG."
date: "2026.05.15"
readTime: "8 min read"
tag: "Vibe Coding"
category: "AI"
tags: ["Vibe Coding", "AI", "全栈开发", "FastAPI", "React", "RAG"]
tagFilters:
  "Vibe Coding": "full-stack"
  "AI": "ai"
  "全栈开发": "full-stack"
  "FastAPI": "full-stack"
  "React": "full-stack"
  "RAG": "ai"
image: "lab-1.webp"
imageAlt: "Scholar AI editorial hero artwork"
imageWidth: 1003
imageHeight: 1568
badge: "Featured"
sideNote: "Scholar AI · Vibe Coding ·<br/>FastAPI · React · RAG"
caption: "<b>Feature story visual.</b>(CityGenius, MMXXVI)"
authorMeta: "College Student · Full-Stack Developer · Vibe Coding Enthusiast"
featured: true
related:
  - date: "2026.05.08"
    title: "macOS Native Development Notes: SwiftUI vs AppKit"
    desc: "Traps and lessons from building macOS tools. What SwiftUI is good at, where it falls short, and when to fall back to AppKit."
    tag: "macOS · Swift"
    slug: "swiftui-appkit"
  - date: "2026.04.15"
    title: "Local AI Models in Practice: Image Watermark Removal and Multilingual Translation"
    desc: "Exploring the possibilities of on-device AI. TFLite image processing and offline translation model integration."
    tag: "AI/ML · 移动端"
    slug: "local-ai-tflite"
---

<div class="tldr">
<b>TL;DR</b>
I shipped Scholar AI's MVP in 3 days with Vibe Coding: an academic tool that searches papers, auto-generates summaries, does multilingual translation, and answers questions with RAG. Stack: Python / FastAPI / React / PostgreSQL / ChromaDB. Vibe Coding is great for rapid prototypes and standardized features, but complex business logic and performance-critical paths still need handwritten code — treat it as your coding copilot, not autopilot.
</div>

## What Is <em>Vibe Coding</em>

Vibe Coding comes from Andrej Karpathy. The core idea: instead of hand-writing every line of code, you describe your intent and let AI generate most of the implementation. Your role shifts from "person who writes code" to "person who directs code."

Sounds like laziness, but it actually demands a higher level of skill — you need to know exactly what you're building, be able to judge the quality of AI-generated code, and know when to step in manually. For me, it was a completely new way of programming.

> "There's a new kind of coding I call 'vibe coding', where you fully give in to the vibes, embrace exponentials, and forget that the code even exists."
> — Andrej Karpathy

## The Project: <em>Scholar AI</em>

Scholar AI is a research assistant tool. As a college student who reads papers and organizes literature constantly, I know how painful that process is. I wanted a tool that could quickly find relevant papers, auto-generate summaries, and even handle multilingual translation.

This idea sat in my head for a long time, but the traditional approach would have taken at least one or two weeks. Then I tried Vibe Coding — three days later, a working MVP was live.

<div class="info-card">
<div class="ic-title">Project Overview</div>
<ul>
<li><strong>Project:</strong> Scholar AI</li>
<li><strong>Stack:</strong> Python / FastAPI / React / PostgreSQL / ChromaDB</li>
<li><strong>Core features:</strong> Paper search · Smart summaries · Multilingual translation · RAG Q&A</li>
<li><strong>Build time:</strong> 3 days (MVP)</li>
<li><strong>GitHub:</strong> <a href="https://github.com/37chengshan/scholar-ai" target="_blank" rel="noreferrer noopener">37chengshan/scholar-ai</a></li>
</ul>
</div>

## Day 1: <em>Backend from Scratch</em>

Day one's goal was simple: get a working backend running. I used Claude as my main coding assistant, generating code by describing what I needed.

<div class="step-list">
<div class="step-item">
<span class="step-num">01</span>
<div>
<h4>Define the API surface</h4>
<p>Describe the endpoints you need in plain language, let the AI generate an OpenAPI spec, then generate FastAPI route code from the spec. This took about 30 minutes.</p>
</div>
</div>
<div class="step-item">
<span class="step-num">02</span>
<div>
<h4>Database design</h4>
<p>Describe how the data models relate, let the AI generate SQLAlchemy models and Alembic migration scripts. Hit a few type-mapping issues and fixed a couple of fields by hand.</p>
</div>
</div>
<div class="step-item">
<span class="step-num">03</span>
<div>
<h4>RAG pipeline</h4>
<p>This was the fun part. Describe the retrieval-augmented generation flow: chunking → embedding → retrieval → generation. The AI scaffolded the ChromaDB integration and OpenAI API calls for me.</p>
</div>
</div>
</div>

## Day 2: <em>Frontend Takes Shape</em>

Day two was frontend. I went with React + TypeScript plus the shadcn/ui component library. Vibe Coding's speed boost is even more obvious on the frontend — describe a page's layout and interactions, and the AI can usually generate usable component code in one shot.

Key lesson: **don't try to describe an entire page at once**. Break it into small components and describe them one by one — the results are far better. For example, "a search box with autocomplete that shows paper titles and authors in the dropdown" gives much better results than "build a search page."

<div class="pull-quote">
<p>Vibe Coding doesn't let you stop thinking — it lets you spend your brainpower where it matters more: product thinking and user experience.</p>
<cite>Personal note</cite>
</div>

## Day 3: <em>Integration & Polish</em>

Day three was integration and polish. Frontend-backend wiring, error handling, loading states, responsive layout — this "dirty work" is where Vibe Coding is actually most efficient. Describe a problem, the AI proposes a fix, you verify, move on.

A few traps I hit:

- **CORS config**: AI-generated CORS middleware sometimes drops specific headers — add them by hand
- **Streaming responses**: SSE (Server-Sent Events) has a lot of fiddly details; the AI's first attempt had bugs, but once I described the errors clearly, the fix was quick
- **Vector DB performance**: ChromaDB's defaults get slow with larger datasets — tune the index parameters manually

## <em>Reflections</em>

Shipping a full-stack AI app MVP in three days used to be unthinkable. Vibe Coding genuinely changed my development rhythm — from "writing code" to a loop of "describe requirements, verify output, iterate."

But it has limits. For complex business logic, performance-critical paths, and anything that needs a deep understanding of the underlying tech, handwritten code is still irreplaceable. Vibe Coding shines at **rapid prototypes** and **standardized features**.

My advice: treat Vibe Coding as your coding copilot, not autopilot. Stay in control and keep understanding the code — that's how you actually get the most out of it.

## FAQ

### Can you really build a full-stack AI app in three days?

Yes — but it's an MVP. Day 1 backend, Day 2 frontend, Day 3 integration and polish. The precondition: you have to be in the "describe requirements, verify output, iterate" loop, know exactly what you're building, and be able to judge the quality of the AI's code.

### Is Vibe Coding good for big projects?

Not for complex business logic, performance-critical paths, or anything that needs a deep dive into fundamentals — handwritten code is still irreplaceable there. It's best at rapid prototypes and standardized features.

### Do you still need to know how to code?

Yes. Your role shifts from "person who writes code" to "person who directs code" — you still need to judge code quality and know when to step in. The AI's CORS middleware dropped specific headers; its first SSE attempt had bugs. A human has to fix those.

### Any tips for describing frontend work?

Don't describe a whole page at once — break it into small components and describe them one by one. "A search box with autocomplete showing paper titles and authors in the dropdown" beats "build a search page" every time.
