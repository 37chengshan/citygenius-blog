---
title: "Daily Receipt: Building a Bookkeeping App with a Team of AI Agents"
description: "It reads payment notifications, logs every spend, and prints your day as a receipt at night. Three weeks and 497 commits, and the most useful thing I learned: write down what you said, word for word."
date: "2026.11.14"
readTime: "10 min read"
tag: "Daily Receipt"
category: "AI"
tags: ["Daily Receipt", "Android", "Jetpack Compose", "AI Agent", "Multi-agent"]
tagFilters:
  "Daily Receipt": "android"
  "Android": "android"
  "Jetpack Compose": "android"
  "AI Agent": "ai"
  "Multi-agent": "ai"
image: "project-xiaopiao-cover.webp"
imageAlt: "A thermal printer feeding out a receipt on a desk at night"
imageWidth: 1672
imageHeight: 940
badge: "Daily Receipt"
sideNote: "Android · Compose ·<br/>Agent · SSE · sherpa-onnx"
caption: "<b>One day, one receipt.</b>(CityGenius, MMXXVI)"
authorMeta: "Student · Full-stack developer · AI toolchain explorer"
featured: false
related:
  - date: "2026.09.17"
    title: "ompweb: a local workbench for omp"
    desc: "Local-first. It reads session files and doesn't rewrite the agent."
    tag: "ompweb · Local-first"
    slug: "project-ompweb"
  - date: "2026.05.15"
    title: "Building a Full-Stack AI App in Three Days with Vibe Coding"
    desc: "From idea to launch: how scholar-ai got built."
    tag: "Vibe Coding · Full-stack"
    slug: "vibe-coding-3-days"
---

<div class="tldr">
<b>TL;DR</b>
Daily Receipt (今日小票) is the Android bookkeeping app I built for Alipay's Emergent Agent Award. It reads Alipay and WeChat Pay notifications to log each payment on its own, and at night it prints your day as a receipt with line items, a total and a one-line comment. The AI writes the words; the numbers come only from the ledger, and every number in an answer needs a source. Several agents built the first version in parallel, each in its own lane, and subagents kept iterating after that: 497 commits on the development repo's main branch in three weeks, and 911 unit-test cases. The biggest lesson: getting AI to write code is easy, getting it to remember what I said is hard, so I started keeping my own words, verbatim, in the repo.
</div>

The first season of Alipay's Emergent Agent Award has a track called "everyday helper". The contest came with a wish pool. After removing duplicates it held 812 requests, and the biggest group, 149 of them, was about spending and bookkeeping. The most-supported single wish was "catch the auto-renewals that quietly take my money", with 298 votes.

What I wanted to build was simple. When money goes out, log it automatically. At night, print the day as a receipt with line items, a total and a comment that doesn't lecture you. I called it Daily Receipt: a native Android app, a web version for the judges, and a small Node server behind both.

The spec was locked on October 27 and the deadline is December 5. Most of the code in between was written by several AI agents working in parallel. This post covers how it was built and the most painful lesson I learned while directing them.

## Problem

There are plenty of bookkeeping apps already. The hard part is sticking with it. Every purchase means opening the app, picking a category and typing an amount, and most people give up within a few days. So the first problem was making logging take almost no effort.

The second problem is putting AI next to money. A model can easily write "you ordered a lot of takeout today". It can just as easily make up a number on the way. If the figures in a ledger don't add up, nobody will trust the app.

The third problem was my own time. The contest gave me a little over five weeks to ship Android, web and a backend, plus receipt animations, subscription detection and sharing with friends. Writing it line by line myself was never going to work, so AI agents had to work in parallel. The two things that go wrong with parallel agents are breaking each other's code and forgetting what I asked for.

## Approach

### Logging: read notifications, not screenshots

The first plan was screenshot recognition on iOS. On the day the spec was locked I switched to Android only. The reason was simple: Android has `NotificationListenerService`. Once the user grants access, the app can read Alipay and WeChat Pay notifications and recognize payments, password-free charges, buy-now-pay-later, auto-renewals, incoming money and refunds with no effort from the user. On iOS, a third-party app can't read other apps' notifications.

Some notifications hide the amount, such as red packets and transfers. For those the app logs an entry marked "amount to fill in", and one tap completes it. You can also log by hand, with one line of text ("lunch 32"), by voice, or by importing a CSV statement. All of these write to the same ledger, and duplicates are merged. Amounts are stored as whole cents to avoid rounding errors.

Voice input had a nasty surprise. I started with the system `SpeechRecognizer`. On my vivo phone it bound to the built-in assistant service and never called back, so the screen said "listening" forever. I switched to on-device sherpa-onnx: a small zipformer model picked by phone language (25 MB for Chinese, 44 MB for English) that shows text as you speak, plus a bookkeeping hotword list with amount units, verbs like "spent" and "got", category names and recent merchants. For better accuracy you can download the 240 MB SenseVoice model. A spoken "thirty-five fifty" becomes 35.5 before it reaches the ledger. Audio and models stay on the phone.

### AI: fetch the numbers first, then talk

<figure class="illu method">
  <img src="/citygenius-blog/assets/project-xiaopiao-arch-en.webp" alt="Daily Receipt system architecture" width="1600" height="847" loading="lazy" />
  <figcaption>Daily Receipt's architecture. On the left are two entry points. The Android app parses payment notifications on the phone, and the raw data inside the red dashed box never leaves it; only structured fields go to the cloud. The web app uses the same API. In the cloud on the right, the agent runtime reads the structured ledger and knowledge books before calling the model, and every number in the answer must pass a "has a source" check.</figcaption>
</figure>

When you ask about your ledger, the AI isn't allowed to do the math itself. The agent on the server fetches data through read-only tools, for example looking up entries, filtering by category or comparing with the same days last week. It calls the tools first, then writes the answer from their results. Everything streams to the screen over SSE, so you can see what it looked up. Before an answer goes out, one more check runs: a number without a source can't appear in it.

At first the app used only a free model from commandcode. In production the main model is now DeepSeek v4.1 Flash, with the free model as a fallback. Users never pick a model, and the API key lives only on the server. In my tests one model call took 3 to 17 seconds, so both the number of tool calls and the total time per question are capped. If it hits a cap, it stops and says so instead of turning one question into an endless conversation.

The one-line comment on the receipt is still template-based. The random pick is seeded by the date, so reprinting the same day gives the same line. The interface for a model-written comment is already in place, and swapping it in won't touch anything else.

### Development: lanes first, then parallel

Before any parallel work, I split the Android app into lanes in a BRIEF document. The capture lane owns data and notification parsing. The receipt lane owns the theme, shared components and the receipt screen. The insights lane owns stats, badges and scheduled jobs. The merchant lane owns the shop mode and the mini games. Each agent may only edit files in its own lane. Shared files, like the navigation shell `AppShell.kt`, are off limits to everyone; if an agent needs a sub-page, it navigates inside its own screen.

Each agent commits on its own worktree branch and never pushes or merges; merging is left to the main session. On day one, four Android lanes and two web lanes were merged into main, and that was the first version. The machine has 16 GB of RAM shared by four agents, so the rules say: run quick compiles day to day, run tests when needed, never `clean`, never start an emulator. Every piece of pure logic (parsers, detectors, aggregation) needs JUnit tests. That's what made merging feel safe. After that first push, I stopped splitting work into big lanes and dispatched subagents per problem instead.

Lanes fixed the "breaking each other's code" problem. They didn't fix "forgetting what I asked for". On day two, testing on a real phone, I caught myself repeating the same things: "Why is there a sample receipt again? This is mock data." "I already said this clearly." Start a new session or dispatch a new subagent, and decisions we'd settled got undone. The sample receipt I'd removed came back.

So I added a "verbatim log" to the development repo. It records my product and design requests in order, word for word, typos and slang included. Each one gets a number and a note on where it landed. There's one rule: when two requests conflict, the later one wins. Design docs cite requests by number instead of paraphrasing them, so nothing drifts as it gets passed along. The file is over 150 lines now, and it works better than any summary.

Getting AI to write code is easy. Getting it to remember what I said is the hard part.

## Results

<figure class="illu method">
  <img src="/citygenius-blog/assets/project-xiaopiao-screens.webp" alt="Four screens of Daily Receipt on a real Android phone" width="1600" height="900" loading="lazy" />
  <figcaption>Screenshots from a real Android phone (Chinese UI), left to right: the ledger home, the October report with an AI summary, the receipt studio (paper, ink and layout are all adjustable), and the decision wheel. The screenshots use a sample ledger, not real user data.</figcaption>
</figure>

From October 27 to November 14, the development repo's main branch got 497 commits. The Android app has 381 Kotlin source files, and its unit tests span 103 files with 911 `@Test` cases. On November 13 I published the v0.5.0 APK on GitHub; it installs on Android 8.0 and up. The public repo holds releases and docs; development happens in a separate private repo.

These features already work in the app.

- **Daily receipt**: one tap prints the ledger as a receipt, with printing, stamping and tear-off animations and a sound you can turn off.
- **Subscription detective**: finds subscriptions in repeated charges and shows the next charge date, the running total and how to cancel. It answers the most-supported wish in the pool.
- **Ask your ledger**: query and sum in plain language; the AI fetches data through read-only tools.
- **Regret simulator**: change a spending scenario and see how the totals move.
- **Circles**: join a small circle of family or friends with an invite code or QR code. Shared receipts carry only category totals, not merchants or line items. There are also light games like a personality quiz and a decision wheel.

## Where It Stands

It's a 0.5.1 preview that still changes every day, and it goes to the contest on December 5.

A few things aren't done. The receipt comment isn't model-written yet. Shop mode is still an experiment: anonymous, opt-in aggregate data to help neighborhood shops understand demand. It's off by default, cells with fewer than 20 people stay hidden, and the simulated scenes in the UI don't mean any real shop data is connected.

The AI's boundaries are still moving too. The original principle was "people make every choice", so the AI gave no advice at all. I hadn't actually set that rule, and on November 14 I removed it, because it also blocked things like meal ideas and workout plans. Now the AI can suggest ways to spend, shop and eat. The red lines stay: no investment or return conclusions, no medical judgments, numbers only from tool results or the user's own words, and it never places an order.

The APK and docs are on [GitHub](https://github.com/37chengshan/xiaopiao). Give it a try, and feel free to leave feedback in Issues.

## FAQ
### Does Daily Receipt upload my payment history?
Notification text, statements and images are parsed on the phone. Cloud sync uses only structured fields such as amount, time and category. Receipts shared to a circle carry only category totals, with no merchant names or line items. You can also keep a ledger without signing in.
### Do I need to buy a receipt printer?
No. The receipt is an on-screen animation; printing, stamping and tearing all happen in the app.
### Why Android only?
Automatic logging depends on reading payment notifications. Android allows that once the user grants access; on iOS, a third-party app can't read other apps' notifications. The web version is there for the contest judges.
### Don't parallel agents break each other's code?
The key is splitting lanes first. Each agent edits only files in its own lane, shared files stay untouched, each one commits on its own worktree branch, and everything is merged at the end. All pure logic needs unit tests.
