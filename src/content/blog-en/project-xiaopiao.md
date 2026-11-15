---
title: "Daily Receipt: How a Team of AI Models Turned My Idea into an App"
description: "A bookkeeping app, from idea to phone: question the idea first, give each model its own job, build a dedicated UI skill, and write down what you said, word for word."
date: "2026.11.14"
readTime: "12 min read"
tag: "Daily Receipt"
category: "AI"
tags: ["Daily Receipt", "AI Dev Workflow", "Multi-agent", "Agent Skill", "Android"]
tagFilters:
  "Daily Receipt": "ai"
  "AI Dev Workflow": "ai"
  "Multi-agent": "ai"
  "Agent Skill": "ai"
  "Android": "android"
image: "project-xiaopiao-cover.webp"
imageAlt: "A thermal printer feeding out a receipt on a desk at night"
imageWidth: 1672
imageHeight: 940
badge: "Daily Receipt"
sideNote: "Opus · Fable · DeepSeek ·<br/>Haiku · Codex · Skills"
caption: "<b>From an idea to an app.</b>(CityGenius, MMXXVI)"
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
Daily Receipt (今日小票) is an Android bookkeeping app I built. It reads Alipay and WeChat Pay notifications to log each payment on its own, and at night it prints your day as a receipt. This post is mostly about how it got built. Each model had its own job: Opus 5.5 planned and wrote the frontend, Fable 5.2 answered the questions I wasn't sure about, DeepSeek inside omp wrote the backend and handled chores, Haiku did search and research, and Codex did cross-review and image generation. The UI leaned on a UI skill we built for it, and the requirements lived in a verbatim log of my own words. Three weeks in, the development repo has 497 commits and 911 unit-test cases, and v0.5.0 installs on a real phone.
</div>

The trigger for this app was an AI agent contest run by Alipay. It came with a wish pool. After removing duplicates it held 812 requests, and the biggest group, 149 of them, was about spending and bookkeeping. The most-supported wish was "catch the auto-renewals that quietly take my money", with 298 votes. Those numbers told me plenty of people actually want this.

The idea itself is simple. When money goes out, log it automatically. At night, print the day as a receipt with line items, a total and a comment that doesn't lecture you. I called it Daily Receipt: a native Android app, plus a web version and a small Node server I built myself.

That's three parts for one person. So this post isn't just a product tour. I want to show how an idea turned, step by step, into an app you can install on your phone: how I stress-tested the idea, how I split the work between models, which skills I used, and where I tripped. All of it carries over to other projects.

## Problem

The product problem is clear. There are plenty of bookkeeping apps; the hard part is sticking with it. Every purchase means opening the app, picking a category and typing an amount, and most people quit within days. And when AI sits next to money, the worst case is a made-up number.

The development problems were bigger. One person building three parts has to lean on AI, and within two days I hit three walls. First, the features AI wrote worked, but the UI was ugly; looking at it on my phone I complained that the buttons looked awful. Second, open a new session and settled decisions got undone; the sample receipt I'd removed came back. Third, with too many agents running at once, they kept rewriting each other's work and nothing got finished.

Almost everything below is about fixing those three.

## Approach

### Question the idea first

Before writing code, I used a skill called grilling to have AI question me instead: who's the main user, app or web, how entries come in, whether data may leave the phone. Two rounds produced 11 decisions (D1 to D11) in `docs/SPEC.md`. Anything I didn't answer clearly took the recommended default and was marked as an assumption, open to change.

On the day the spec was locked I overturned a big one. The first plan was screenshot recognition on iOS. Then I realized Android, once the user grants access, can read Alipay and WeChat Pay notifications, which makes logging truly hands-free, so I went Android only. Every later change to requirements goes into the spec with a date and a reason. Any new session that reads the spec knows what to build now and why.

### Give each model its own job

<figure class="illu method">
  <img src="/citygenius-blog/assets/project-xiaopiao-team-en.webp" alt="Diagram of how models split the work on Daily Receipt" width="1600" height="740" loading="lazy" />
  <figcaption>How the work was split on Daily Receipt. I set the direction, test on a real phone and make the final call; the five models below each own one area and share context through the same repo, spec, verbatim log and skills.</figcaption>
</figure>

In the current split, each of the five models owns one area.

- **Opus 5.5** plans and writes the frontend. It breaks down tasks and writes specs, and it builds the app's main flow and UI itself. In the development repo's commit credits it shows up 180 times, from the first day to the last.
- **Fable 5.2** is the one I ask when I'm not sure: before locking a plan, or when the same bug shows up a second time and normal debugging is stuck.
- **DeepSeek inside omp** (deepseek-v4.1-flash) writes the backend and does chores. Opus writes detailed specs for the web app and server, DeepSeek implements them, and Opus does the final polish. Device testing often goes to it too. It's credited on 70-odd commits.
- **Haiku** does search and research: reading the repo, checking docs, finding open-source implementations on GitHub. It returns conclusions and file locations, so the main session doesn't have to read piles of files.
- **Codex** does cross-review and image generation. A different model catches problems the first one can't see in its own work, and the photos on the landing page came from Codex as well.

I didn't start with this split. On day one I used lanes to have several Sonnet agents build the first version in parallel. The capture lane owned data and notification parsing, receipt owned the theme and the receipt screen, insights owned stats and badges, and merchant owned the shop mode and mini games. Each agent could only edit files in its own lane, committed on its own worktree branch, and never pushed or merged. The machine had 16 GB of RAM shared by four agents, so the rules said quick compiles only and no emulators.

On day two I told the main session to only coordinate and leave all implementation to workers. By that evening it had fallen apart; in my words, the agents were "changing things back and forth and can't finish anything". I stopped all of them. The app's main flow went back to Opus, with one omp worker on web and device testing and one Codex on chores, and from then on at most 5 parallel workers.

My takeaway: parallel work suits jobs with clear boundaries, like building a backend from a spec or scaffolding separate lanes. The app's main flow, where every change touches everything else, goes better when one model writes it end to end.

### Write down what you said

Splitting the work stopped agents from breaking each other's code. It didn't stop them from forgetting what I asked for. On day two, testing on a real phone, I caught myself repeating the same things: "Why is there a sample receipt again? This is mock data." "I already said this clearly."

So I added a "verbatim log" to the development repo. It records my product and design requests in order, word for word, typos and slang included. Each one gets a number and a note on where it landed. There's one rule: when two requests conflict, the later one wins. Design docs cite requests by number instead of paraphrasing them, so nothing drifts as it gets passed along. The changes to the split above are all recorded in that file too.

Getting AI to write code is easy. Getting it to remember what I said is the hard part.

### Build a dedicated UI skill

To fix ugly UI without complaining every time, I had AI take apart other people's apps and fold what it learned into our own UI skill, `app-ui-design`. Whichever model writes UI now reads it first.

At its core is a fixed order: structure → hierarchy → spacing → type → color → details → motion. Later steps can't rescue earlier mistakes. Ugly AI-made UI almost always skips the early steps: it reaches for color first, builds hierarchy from font size alone, and makes every button solid. So the skill has a very concrete rule: at most one solid primary button per screen, secondary actions outlined or tinted, minor actions as plain text.

The material comes from the 20 Refactoring UI principles, Emil Kowalski's design-engineering skills (MIT licensed), Apple's talks on fluid interfaces, and the Material 3 and iOS guidelines, all restated in our own words. There's also a teardown file. For example, for another app's "usage receipt", we sampled a 25-second screen recording at 2 frames per second, 50 frames in all, and measured it frame by frame: only 4 font sizes, paper that feeds down from the top of the screen, and a printing sound made of 7 ratchet clicks. Daily Receipt's print animation follows the same idea.

The skill also requires stress-testing UI with worst-case data (very long names, empty lists, lots of entries, load failures) and comparing a few variants side by side for important components. Every time I complain on a real phone, it goes into the skill once, and every model follows it from then on.

### Other skills and tools

- **ego-browser**: every web task goes through it, from opening the web app to screenshots and interaction tests.
- **android-remote-control**: an MCP server that lets agents operate my phone directly.
- **animate**: for motion, it walks through whether to animate at all, which curve to use and how to interrupt.
- **archify**: architecture diagrams; the one below was made with it.
- **Orca**: dispatches omp workers, supervises parallel tasks and collects results.
- **Figma**: the design system's variables and components map one to one onto `Tokens.kt` in the code.

### Key product decisions

<figure class="illu method">
  <img src="/citygenius-blog/assets/project-xiaopiao-arch-en.webp" alt="Daily Receipt system architecture" width="1600" height="847" loading="lazy" />
  <figcaption>Daily Receipt's architecture. On the left are two entry points. The Android app parses payment notifications on the phone, and the raw data inside the red dashed box never leaves it; only structured fields go to the cloud. The web app uses the same API. In the cloud on the right, the agent runtime reads the structured ledger and knowledge books before calling the model, and every number in the answer must pass a "has a source" check.</figcaption>
</figure>

Logging relies on Android's `NotificationListenerService` to read payment notifications, covering payments, password-free charges, buy-now-pay-later, auto-renewals, incoming money and refunds. Red packets and transfers that hide the amount get an entry marked "amount to fill in". Amounts are stored as whole cents to avoid rounding errors.

Voice input had a nasty surprise. The system `SpeechRecognizer` never called back on my vivo phone, so the screen said "listening" forever. I switched to on-device sherpa-onnx with a 25 MB Chinese model that shows text as you speak, plus a bookkeeping hotword list. A spoken "thirty-five fifty" becomes 35.5 before it reaches the ledger, and audio and models stay on the phone.

When you ask about your ledger, the AI isn't allowed to do the math itself. The agent on the server fetches data through read-only tools, for example looking up entries, filtering by category or comparing with the same days last week, then writes the answer from the results and streams it over SSE. Before an answer goes out, one more check runs: a number without a source can't appear in it. At first the app used only a free model from commandcode; in production the main model is now DeepSeek v4.1 Flash with the free model as a fallback, and the key lives only on the server.

## Results

<figure class="illu method">
  <img src="/citygenius-blog/assets/project-xiaopiao-screens.webp" alt="Four screens of Daily Receipt on a real Android phone" width="1600" height="900" loading="lazy" />
  <figcaption>Screenshots from a real Android phone (Chinese UI), left to right: the ledger home, the October report with an AI summary, the receipt studio (paper, ink and layout are all adjustable), and the decision wheel. The screenshots use a sample ledger, not real user data.</figcaption>
</figure>

From October 27 to November 14, the development repo's main branch got 497 commits. The Android app has 381 Kotlin source files, and its unit tests span 103 files with 911 `@Test` cases. In the commit credits, Opus 5.5 appears 180 times, Sonnet 84 times (mostly in the first two days of lane work), and DeepSeek in omp 70-odd times.

On November 13 I published the v0.5.0 APK on GitHub; it installs on Android 8.0 and up. Working today: the daily receipt (with printing, stamping and tear-off animations), the subscription detective, asking your ledger in plain language, the regret simulator, small circles for family and friends, and light games like a personality quiz and a decision wheel.

## Where It Stands

It's a 0.5.1 preview that still changes every day, and the contest submission is due December 5. The receipt comment is still template-based, with the interface for a model-written one already in place. Shop mode is still an experiment. The AI's boundaries are moving too: on November 14 I removed an old principle, "people make every choice". I hadn't actually set it, and it also blocked things like meal ideas and workout plans. Investment conclusions and medical judgments stay off limits, and it never places an order.

If you take three things from this post, take these: have AI question your idea before you build; give each model its own job and cap how many run in parallel; and every time you complain, write it into a skill or the verbatim log, once.

The APK and docs are on [GitHub](https://github.com/37chengshan/xiaopiao). Give it a try, and feel free to leave feedback in Issues.

## FAQ
### Why not let the strongest model do everything?
Different jobs need different strengths. Planning and UI need a strong model watching the whole picture. Jobs with clear boundaries, like building a backend from a spec or running tests, are cheaper to run in parallel on lighter models, and a small model is enough for search and research. A different model doing cross-review also catches blind spots the first model has about its own work.
### Don't parallel agents break each other's code?
The key is splitting lanes first. Each agent edits only files in its own lane, nobody touches shared files, each commits on its own worktree branch, and everything is merged at the end. Cap the number running in parallel too; I run 5 at most now.
### Does Daily Receipt upload my payment history?
Notification text, statements and images are parsed on the phone. Cloud sync uses only structured fields. Receipts shared to a circle carry only category totals, with no merchant names or line items. You can also keep a ledger without signing in.
### Do I need to buy a receipt printer?
No. The receipt is an on-screen animation; printing, stamping and tearing all happen in the app.
