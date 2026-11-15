---
title: "Building a Full-Stack AI App in Three Days with <em>Vibe Coding</em>"
description: "From idea to launch, the story of scholar-ai. How I used AI-assisted coding to stand up a FastAPI backend and a React frontend fast, and what retrieval-augmented generation (RAG) looked like in practice."
date: "2026.05.15"
readTime: "8 min read"
tag: "Vibe Coding"
category: "AI"
tags: ["Vibe Coding", "AI", "Full-Stack", "FastAPI", "React", "RAG"]
tagFilters:
  "Vibe Coding": "full-stack"
  "AI": "ai"
  "Full-Stack": "full-stack"
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
authorMeta: "Student · Full-stack developer · Vibe Coding enthusiast"
featured: true
related:
  - date: "2026.05.08"
    title: "Notes on Native macOS Development: SwiftUI vs. AppKit"
    desc: "Lessons from building macOS tools. What SwiftUI does well, where it falls short, and when to go back to AppKit."
    tag: "macOS · Swift"
    slug: "swiftui-appkit"
  - date: "2026.04.15"
    title: "Local AI Models in Practice: Watermark Removal and Multilingual Translation"
    desc: "Running local AI models on mobile. TFLite image processing and integrating offline translation models."
    tag: "AI/ML · Mobile"
    slug: "local-ai-tflite"
---

## Problem

### What Is <em>Vibe Coding</em>

The term Vibe Coding comes from Andrej Karpathy. The idea is that you don't hand-write every line. You describe what you want and let AI generate most of the implementation. Your role shifts from "the person who writes code" to "the person who directs code".

It sounds lazy, but it actually asks for more. You need a clear picture of what you're building, the judgment to tell whether the generated code is any good, and a sense of when to step in by hand. For me it was a completely new way to program.

> "There's a new kind of coding I call 'vibe coding', where you fully give in to the vibes, embrace exponentials, and forget that the code even exists."
> — Andrej Karpathy

### The Project: <em>Scholar AI</em>

Scholar AI is a research assistant tool. As a student who constantly reads papers and organizes references, I know how painful that is. I wanted a tool that could find related papers quickly, write summaries automatically, and even translate between languages.

The idea had been sitting in my head for a long time, but building it the traditional way would take at least a week or two. Then I tried Vibe Coding, and three days later a working MVP was live.

<div class="info-card">
<div class="ic-title">Project overview</div>
<ul>
<li><strong>Name:</strong> Scholar AI</li>
<li><strong>Stack:</strong> Python / FastAPI / React / PostgreSQL / ChromaDB</li>
<li><strong>Core features:</strong> paper search · smart summaries · multilingual translation · RAG Q&amp;A</li>
<li><strong>Timeline:</strong> 3 days (MVP)</li>
<li><strong>GitHub:</strong> <a href="https://github.com/37chengshan/scholar-ai" target="_blank" rel="noreferrer noopener">37chengshan/scholar-ai</a></li>
</ul>
</div>

## Approach

### Day 1, Backend <em>from Scratch</em>

The goal for day one was clear: get a backend running. I used Claude as my main coding assistant and generated code by describing what I needed.

<div class="step-list">
<div class="step-item">
<span class="step-num">01</span>
<div>
<h4>Define the API</h4>
<p>I described the endpoints I needed in plain language, had the AI produce an OpenAPI spec, then generated the FastAPI routes from that spec. This took about 30 minutes.</p>
</div>
</div>
<div class="step-item">
<span class="step-num">02</span>
<div>
<h4>Design the database</h4>
<p>I described how the data models relate to each other and had the AI generate SQLAlchemy models and Alembic migrations. A few type-mapping problems came up, and I fixed several fields by hand.</p>
</div>
</div>
<div class="step-item">
<span class="step-num">03</span>
<div>
<h4>Build the RAG pipeline</h4>
<p>This was the most fun part. I described the retrieval-augmented generation flow: chunk documents → embed → retrieve → generate. The AI set up the skeleton for the ChromaDB integration and the OpenAI API calls.</p>
</div>
</div>
</div>

### Day 2, Frontend <em>Taking Shape</em>

Day two was the frontend. I picked React + TypeScript with the shadcn/ui component library. The speed-up from Vibe Coding is even bigger here. Describe a page's layout and interactions, and the AI can produce usable component code almost in one shot.

The main lesson: **don't try to describe a whole page at once**. Break it into small components and describe them one by one, and the results are much better. "A search box with autocomplete that shows paper titles and authors in a dropdown" gets a far more precise result than "build a search page".

<div class="pull-quote">
<p>Vibe Coding doesn't mean you stop thinking. It lets you spend your effort where it matters more: product thinking and user experience.</p>
<cite>My own take</cite>
</div>

### Day 3, Integration <em>and Polish</em>

Day three was integration and polish. Connecting front end and back end, error handling, loading states, responsive layout. This grunt work is where Vibe Coding is most efficient. Describe a problem, the AI proposes a fix, you check it, and you move on.

A few pitfalls I ran into:

- **CORS config**: the CORS middleware the AI generated sometimes missed specific headers, so I had to add them by hand
- **Streaming responses**: SSE (Server-Sent Events) has a lot of details, and the first version the AI wrote had a bug, but once I described the error clearly the fix came fast
- **Vector database performance**: ChromaDB's default config slows down with large data, so I had to tune the index parameters by hand

## Results

Finishing a full-stack AI app MVP in three days would have been unthinkable before. Vibe Coding really changed my rhythm, from "writing code" to a loop of "describe, verify, iterate".

It has limits, though. For complex business logic, performance-critical paths, and anything that needs a deep understanding of the underlying principles, hand-written code is still irreplaceable. Vibe Coding fits best for **quick prototypes** and **standard features**.

My advice: treat Vibe Coding as your coding copilot, not an autopilot. Stay in touch with your code and keep control of it, and that's when it really pays off.
