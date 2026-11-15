---
title: "Claude + GPT + DeepSeek Teamed Up and Made Me 10x Faster"
description: "Since starting university I wanted to keep a budget and never stuck with it. An Alipay contest finally got me to build an app that logs spending on its own, with five models. How 37chengshan-harness splits work by strengths and keeps context lean, and how the app reads notifications, stores data, gets tested and protects privacy."
date: "2026.11.14"
readTime: "15 min read"
tag: "Daily Receipt"
category: "AI"
tags: ["Daily Receipt", "AI Dev Workflow", "Multi-agent", "Agent Skill", "Android"]
tagFilters:
  "Daily Receipt": "ai"
  "AI Dev Workflow": "ai"
  "Multi-agent": "ai"
  "Agent Skill": "ai"
  "Android": "android"
image: "project-xiaopiao-cover-girls.webp"
imageAlt: "Anime-style personifications of Claude, GPT and DeepSeek peeking over the bottom edge, under the words \"the three of us together are unbeatable\""
imageWidth: 1672
imageHeight: 940
badge: "Daily Receipt"
sideNote: "Opus · Fable · DeepSeek ·<br/>Haiku · GPT-6.1 · Orca"
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
Daily Receipt is an Android bookkeeping app I built. It reads Alipay and WeChat Pay notifications to log each payment, and at night it prints your day as a receipt. Half of this post is the product, half is how it got built. I call the whole setup 37chengshan-harness. Opus 5.5 plans, writes the frontend and dispatches work; DeepSeek v4.1 Flash handles the backend, chores and knowledge bases; Haiku does search and keeps context lean; GPT-6.1-sol in Codex cross-reviews and generates images; Fable 5.2 is called in when I'm stuck. Claude and GPT are both on entry-level plans, so budget is a constraint to trade off against, but the split follows strengths. Three weeks: 497 commits and 911 unit tests in the dev repo. The whole setup is open source.
</div>

Ever since I started university, I've wanted to keep track of my spending. I never stuck with it for more than a few days: every purchase meant opening an app, picking a category and typing an amount, and once things got busy I forgot. I kept thinking how nice it would be if an app just recorded everything for me. I never had the time, or the push, to actually build it.

At the end of last month the push arrived. I saw Alipay's "Emergent Agent Award (智能体涌现奖) Season 1," which has a track called "Life Helper" and a wish pool. I organized and cleaned the wish-pool data: 812 requests after deduplication, and the largest group, 149 of them, was about spending and bookkeeping. The most-supported single wish was "catch the auto-renewals that quietly take my money," with 298 votes. Plenty of people wanted the same thing I did. So I started building the app from zero.

It's called Daily Receipt: a native Android app, plus a web version and a Node service I run myself. Money goes out, a line gets logged; at night your day prints as a receipt with line items, a total, and one comment that doesn't lecture. I built all three by myself, with one entry-level plan each for Claude and GPT. I call the whole way of working 37chengshan-harness, the engineering layer around the models that handles roles, context, tools and gates. The configuration is published as a repo; the link is at the end.

## Problem

On the product side, there are plenty of bookkeeping apps already, and the hard part is sticking with one. I'm proof of that. And when AI meets money, the biggest fear is that it casually makes up a number.

On the development side, I hit three things within two days. Features the AI wrote were correct, but the UI was ugly; looking at it on my phone, my words were "the buttons and stuff look really bad." In a new session, settled decisions got reverted, and a sample receipt I had deleted came back. With too many agents running at once, they kept changing each other's code and nothing got finished.

Budget pressed the whole time. Entry-level plans meter usage in time windows, a strong model like Opus can burn through a window fast, and then you wait. Three clients' worth of code meant every Opus token had to count.

## Approach

### Question the Idea First

Before writing code, I used a skill called grilling to have the AI interrogate me: who the user is, app or web, how entries get in, whether data may leave the phone. Two rounds produced 11 decisions, D1 to D11, written into `docs/SPEC.md`. Anything I didn't answer and left at the suggested default was marked "assumption," open to reversal.

The spec is the project's single source of truth. Every later requirement change records its reason there, and any fresh session reads it and knows what to do now, and why.

This is also the cheapest step in budget terms. Settling requirements in conversation costs a few rounds of Q&A. Starting before they're settled costs rewrites of whole chunks of code.

### Give Each Model Its Own Job

<figure class="illu method">
  <img src="/citygenius-blog/assets/project-xiaopiao-harness.webp" alt="Architecture of 37chengshan-harness" width="1800" height="1439" loading="lazy" />
  <figcaption>The structure of 37chengshan-harness. On the left, me and the Opus 5.5 main session, which only plans, writes the frontend and dispatches: search goes to Haiku subagents; backend and chores go through Orca to DeepSeek in omp, omp work is committed on separate branches and merged into main only after review. Codex gives a second opinion and makes images; Fable 5.2 appears only when I am stuck. Bottom left is the context every model shares: AGENTS.md, the spec, skills, and Figma variables named after Tokens.kt.</figcaption>
</figure>

The split rests on two questions: what is this model best at, and does this job need to be kept apart from others? Planning and UI need someone watching the whole picture, the model that writes code shouldn't be the one reviewing it, and search that reads a lot but concludes little shouldn't crowd the main session.

- **Opus 5.5** plans, writes the frontend and dispatches. It breaks down tasks, writes specs, writes the app's UI mainline, and sends out everything that can be split off. It is credited on 180 commits in the dev repo, from the first day to the last.
- **DeepSeek v4.1 Flash** (running in omp) handles the backend, chores and knowledge bases. This work has clear boundaries and a lot of volume, and it goes well from a written spec: backend endpoints, bulk code, and collecting and organizing knowledge-base material all go to it. Opus writes the spec in detail, DeepSeek implements it, Opus polishes. It is credited on 70-plus commits.
- **Haiku** does search and research, and its real job is protecting the main session's context window. Walking the repo, tracing call chains, finding open-source implementations: these read many files and leave few conclusions, and letting Opus do them means reading logs with the most expensive tokens. Haiku reads, then returns a short JSON: findings, file locations, gaps.
- **GPT-6.1-sol in Codex** cross-reviews and generates images. A model from another company spots Claude's blind spots, and it made the photos on the landing page.
- **Fable 5.2** is the advisor, used at three moments only: before an architecture locks in, when the same error shows up a second time, and before a risky task is declared done.

The budget is a trade-off on top of this split. Entry-level windows are tight, so a few rules follow: Opus's budget goes only to planning, frontend and merging; high-volume work goes to DeepSeek first, since it is unmetered; file reading goes to Haiku and stays out of the main session.

The subagents' limits live in their frontmatter, which is more reliable than a verbal agreement. `search` and `grep` get read-only tools; `audit` adds Bash but runs in plan mode and only reviews committed code in an isolated worktree. All of them declare `disallowedTools: advisor`, so a cheap model can't quietly call the expensive advisor in the background, and `omitClaudeMd: true` keeps them from loading the main session's long rulebook, saving a little more on every call.

DeepSeek's work goes through Orca, a multi-agent orchestration tool. The main session opens a round with `run-create`, gives each worker a self-contained brief with `worker-start`, then waits with `check --wait`; nobody has to babysit. In one round, three omp workers ran in parallel. Two did English localization for the settings and stats pages, changing 2 and 4 files, and both were merged after review. The third worked on a settings transition, stalled for 21 minutes, and I stopped it, keeping one useful file. After a worker delivers, I keep its session and hand it the next task instead of starting fresh, which saves the tokens it would spend re-reading the repo.

The split wasn't planned up front. On day one I used "lanes": several Sonnet agents built the first version in parallel. capture owned data and notification parsing, receipt owned themes and the receipt page, insights owned stats and badges, merchant owned the shop edition and mini games. Each agent could edit only files in its lane and committed on its own worktree branch, with no push and no merge. The machine had 16 GB of RAM shared by four agents, Gradle builds queued for a lock, and the rules banned starting an emulator.

On day two I had the main session only coordinate and sent all implementation to workers. It broke that night; my words were "the agents keep changing things back and forth and can't finish anything." I stopped everything: the app mainline went back to Opus, and parallel workers were capped at 5.

My takeaway: parallelism suits work with clear boundaries, like building a backend from a spec, scaffolding lanes, or running tests. The app mainline, where one change touches everything, is steadier with one model writing it end to end, and cheaper too, because rework is what burns budget fastest.

### Write Down What I Said

The split stopped agents from breaking each other's work, but not from forgetting what I wanted. On day two of device testing, I caught myself repeating things, like "why is there a sample receipt again, this is just mock data" and "didn't I say this clearly already."

So I added a "verbatim log" to the dev repo. Every product and design instruction I give is recorded in order, word for word, typos and slang included, each one numbered, with a note on where it landed. One rule: when two conflict, the later one wins. Design docs cite the number and never paraphrase, so nothing drifts as it gets passed along. The changes in the model split above are all in that file too.

Anthropic calls this context engineering: a model's attention is finite, and every line in context should earn its place. My version is to put everything that must be remembered into files and read them when needed. All three tools share one `AGENTS.md`, so Claude, Codex and omp read identical rules. Skills live in one folder, symlinked into each tool. When a session runs long, a hook steps in once it has auto-compacted and climbed back to about 380k tokens: the session writes a handoff document, and a fresh session picks up from it instead of relying on the model's memory.

Getting AI to write code isn't hard. Getting it to remember what I said is.

### Build a Dedicated UI Skill

For the ugly-UI problem, I had the AI take apart other apps, then wrote what it learned into our own UI skill, `app-ui-design`, so I wouldn't have to complain every time. Any model working on UI reads it first.

Its core is a fixed order: structure → hierarchy → spacing → type → color → detail → motion. Later steps can't fix earlier mistakes. AI-made UI looks bad almost always because it skips ahead: color first, hierarchy through font size alone, every button solid. So the skill has a concrete rule: at most one solid primary button per screen; secondary actions get an outline or a light fill; tertiary actions are plain text.

The material comes from the 20 principles of Refactoring UI, Emil Kowalski's design-engineering skills (MIT licensed), Apple's fluid-interfaces talk, Material 3 and the iOS guidelines, all rewritten in our own words. There's also a teardown note. For another app's "usage receipt," we pulled 50 frames from a 25-second screen recording at 2 frames per second and measured them frame by frame: only 4 font sizes, paper "feeding" down from the top of the screen, and a print sound of 7 ratchet clicks. Daily Receipt's print animation follows the same approach.

The skill's structure respects the budget too. `SKILL.md` holds only the principles and quick-reference tables. Motion recipes, Compose patterns and teardown notes sit in `references/` and get read only when needed, a pattern called progressive disclosure. A model writing a screen pays tokens only for the pages it uses.

Figma keeps design and code aligned. I built a design system in Figma whose variables and components use Android code syntax matching `XpColors`, `XpSpace` and `XpRadius` in the code, one to one with `Tokens.kt`. Design changes start with the Figma variable, then sync to code. Code is the final authority, and screens may not hard-code colors or spacing.

The skill also requires stress-testing screens with worst-case data (very long names, empty lists, many records, failed loads), and building several variants of key components side by side. Each time I complain about something on the device, it goes into the skill once, and every model follows it from then on.

### How One Feature Gets Done

<figure class="illu method">
  <img src="/citygenius-blog/assets/project-xiaopiao-loop.webp" alt="How one Daily Receipt feature goes from idea to merge" width="1800" height="1510" loading="lazy" />
  <figcaption>How one feature goes from idea to merge. Requests and complaints go into the verbatim log first, and settled ones into the spec. Opus writes a spec slice for the parts that can be split off and dispatches it through Orca to an omp worker, while writing the UI mainline itself with colors and spacing from same-named Figma variables. Finished work goes through tests and review, then device QA at two screen widths and 1.3x font, and finally I merge. Problems found in QA go back into the skill.</figcaption>
</figure>

Put together, one feature moves through the repo like this. I raise a request or complaint on the phone; it goes into the verbatim log first, and once settled, into the spec. Opus reads the spec, writes the parts that can be split off as a spec slice, and dispatches it through Orca to an omp worker, which implements it on a separate branch. Opus writes the UI mainline itself, reading the UI skill first and taking colors and spacing from same-named Figma variables. Finished work goes through tests and review: unit tests run after queuing for the Gradle lock, then Codex or the audit subagent looks for problems. Then device QA: screenshots at both 360dp and 411dp widths and at 1.3x font, with every main screen walked through; passing the build and unit tests alone doesn't count as done. Finally, I merge. Problems found in QA go back into the skill, and every model follows them from then on.

While writing this post, I read Anthropic's engineering posts on harnesses side by side with my setup, and a lot of it lines up. The context engineering post says a subagent may spend tens of thousands of tokens exploring but returns "only a condensed, distilled summary of its work," often 1,000 to 2,000 tokens. The post on long-running apps notes that agents "reliably skew positive when grading their own work," so review and acceptance belong to a different role; giving cross-review to another company's model and making device QA its own step points the same way. The same post has a line I agree with: every component in a harness encodes an assumption about what the model can't do on its own. Retest them as models improve, and delete what no longer pays.

### How Notifications Get Read

<figure class="illu method">
  <img src="/citygenius-blog/assets/project-xiaopiao-arch-en.webp" alt="System architecture of Daily Receipt" width="1600" height="847" loading="lazy" />
  <figcaption>System architecture of Daily Receipt. The Android app parses payment notifications on the phone; raw data inside the security group never leaves the device, and only structured fields reach the cloud. The web version uses the same API. In the cloud, the agent runtime opens the knowledge books a question needs, calls the model, and every number in the answer must pass a "has a source" check.</figcaption>
</figure>

Automatic logging relies on Android's `NotificationListenerService`. Once you grant access in system settings, `PaymentListenerService` listens only to the Alipay and WeChat packages and ignores every other app. When a notification arrives, it first records that the channel is still alive, skips group summaries, takes the title and the longest body text, and hands them to the parser on the phone. It recognizes payments, password-free charges, buy-now-pay-later, auto-renewals, incoming payments and refunds. Red packets and transfers that show no amount are logged as "amount pending"; a Huabei bill reminder becomes a "bill due" entry and doesn't count as spending. Amounts are always stored as integer cents to avoid floating-point error.

Chinese Android ROMs have a trap here. After a reinstall or a battery-saver freeze, the listener often disconnects silently, and the app has no idea. So a disconnect schedules an automatic repair, and the setup screen shows when the last notification arrived and from which app. Payment apps also tend to post the same payment twice, first a bare "spent" and then a "payment successful" with the merchant, so notifications with the same amount and direction within 2 minutes are logged once.

### Where the Data Lives

The ledger, the notification log and the nightly letters live in a Room database on the phone (SQLite underneath); toggles and preferences live in DataStore. Every payment notification read is saved verbatim to a `capture_log` table along with what happened to it: recorded, duplicate skipped, ignored, amount pending, or not recognized. The table keeps only the latest 200 rows, prunes the rest, and is never uploaded. In the app, "Data & Privacy → Notification log" shows how each notification was handled.

The app turns off system backup (`allowBackup="false"`), so the local database doesn't get copied elsewhere by a system backup. After sign-in, sync pushes only structured ledger fields; edited rows are flagged for push, and deleted rows leave a tombstone so the cloud deletes them too. Nightly letters written by the server are stored locally once pulled, so you can read them offline.

### Testing, and How Feedback Comes Back

The parser is the easiest thing to get wrong, so it's the most tested. `PaymentNotificationParserTest` holds a corpus of notifications, each stating the amount and type it should produce, or that it should be ignored; deduplication, merchant categories and amount rules have their own test sets. The repo has 911 `@Test` cases in total, run after queuing for the Gradle lock.

Unit tests aren't enough; real notifications have to go through the whole pipeline. So I wrote a tiny test app called notifake that is installed only on the emulator. It posts fake notifications under spoofed Alipay and WeChat package names, and its 11 samples are the same ones the parser tests use, so whatever the tests say gets recognized really shows up on screen. It can also be triggered with a single adb command, so an agent can run it without waiting for me to tap the phone. Only after all that comes device QA.

The real world always has more notifications than the corpus. Any "not recognized" entry in the notification log can be sent with "Report to the developer": the exact payload is shown, you can edit it, and nothing is sent until you tap send. It lands in the server's `feedback` table with kind `capture_miss`. I pull these with a read-only script, copy the text word for word into the parser tests as regression cases, then fix the rules, and track status in a ledger. Of the reports so far, an Alipay "11.90 yuan password-free/auto charge" wasn't recognized at first and got a new rule; WeChat's "yesterday's bookkeeping report" and an Alipay "red packet about to expire" turned out to be marketing and are now ignored; a Huabei bill reminder also went unrecognized before and is now a bill-due entry.

### How Privacy Is Kept

Payment notifications are private, so the data rules sit at the top of `AGENTS.md`, and all three model vendors follow them.

- Notification text, statements and images are parsed on the phone; the cloud gets structured fields only.
- Notification text never leaves the phone on its own. The only exit is the report above, where you see and can edit what is sent.
- Logs record only the rule id and amount, never the notification body.
- Life data such as meals, workouts and weight stays on the phone by default; syncing it to your account is a separate opt-in you can turn off anytime.
- Data contribution is off by default, separately authorized and revocable; merchants see only aggregates, and cells with fewer than 20 samples are hidden.
- Receipts shared to a circle carry only category totals, with no merchant names or line items.
- Model keys live only on the server; the server's security logs record no IP or account, requests are rate-limited per IP, and passwords are stored with scrypt.

You can keep a ledger without signing in.

### Voice and Asking the Ledger

Voice input had a pitfall. The system `SpeechRecognizer` never called back on my vivo phone, so the UI stayed on "listening" forever. I switched to on-device sherpa-onnx, a 25 MB Chinese model that transcribes as you speak, plus a bookkeeping hotword list. "Thirty-five fifty" becomes 35.5 before it reaches the ledger, and both the recording and the model stay on the phone.

When you ask about your ledger, the AI isn't allowed to do the math itself. The server-side agent fetches data through read-only tools, such as querying entries, filtering by category or comparing with the same period last week, then writes the answer from the results, streamed to the UI over SSE. Before an answer goes out, a grounding check makes sure no number appears without a source. The model started as commandcode's free tier; production now runs on DeepSeek v4.1 Flash with the free model as fallback.

### Other Skills and Tools

- **Orca**: dispatch omp workers, supervise parallel tasks, collect results.
- **Figma**: the design system's variables and components, named after `Tokens.kt`.
- **ego-browser**: every web task, from opening the web version to screenshots and interaction tests.
- **android-remote-control**: an MCP server that lets an agent operate my real phone.
- **animate**: for motion, its order decides whether to animate, which curve, and how to interrupt.
- **archify**: architecture diagrams; every diagram in this post came from it.
- **hooks**: rules that must hold every time, like context handoff, are hooks, not prompts.

## Results

<figure class="illu method">
  <img src="/citygenius-blog/assets/project-xiaopiao-screens.webp" alt="Device screenshots of four Daily Receipt screens" width="1600" height="900" loading="lazy" />
  <figcaption>Android device screenshots, left to right: the ledger home, the monthly report with an AI summary, the receipt workbench (paper, ink and layout are all adjustable), and the decision wheel. Screenshots use a sample ledger, not real user data.</figcaption>
</figure>

Over three weeks, the dev repo's main branch got 497 commits. The Android app has 381 Kotlin source files, and unit tests span 103 files with 911 `@Test` cases. In commit credits, Opus 5.5 appears 180 times, Sonnet 84 (mostly in the first two days, when work ran in lanes), and DeepSeek in omp 70-plus. All of it was built on two entry-level subscriptions plus one unmetered model.

The v0.5.0 APK is on GitHub and installs on Android 8.0 and up. Working features include the daily receipt (printing, stamping and tear-off animations), the subscription detective, asking your ledger in plain language, a regret simulator, small circles with family and friends, and mini games like a personality quiz and a decision wheel.

## Where It Stands

It's a 0.5.1 preview, still iterating daily. The receipt comment is still template-generated; the hook for a language model is ready. The "shop edition" is still exploratory. The AI's boundaries are also being tuned. I recently removed an old principle, "every choice is made by the person." I hadn't set it, and it was blocking suggestions like meal combinations and workout plans. Investment conclusions and medical judgments remain off-limits, and it will never place an order for you.

The full 37chengshan-harness setup is on GitHub at [37chengshan/agent-harness](https://github.com/37chengshan/agent-harness): the shared `AGENTS.md`, four Haiku subagents, the `app-ui-design` skill, the Orca dispatch workflow, templates for the spec and the verbatim log, and the sources for both diagrams in this post. Following Anthropic's advice, the repo also includes two extra templates: a `features.json` feature list in which workers may only flip pass or fail, and a Stop hook that won't let a session finish until the tests pass.

If you take three things from this post, take these. Split work by strengths, keep writing and reviewing apart, keep search out of the main session, and treat the budget as a trade-off on top. Put whatever must be remembered into files instead of hoping the model remembers. Every time you complain, write it into a skill or the verbatim log, once.

Daily Receipt's APK and notes are on [GitHub](https://github.com/37chengshan/xiaopiao). Try it, and feel free to file suggestions in Issues.

## FAQ
### Why not let the strongest model do everything?
It doesn't need to. Different jobs need different strengths. Planning and UI need a strong model watching the whole picture. Jobs with clear boundaries, like building a backend from a spec or organizing a knowledge base, suit a model that is good at high-volume code, running in parallel, and a small model is enough for search and research. Writing and reviewing should be separate too: a model from another company catches the first model's blind spots. A tight budget only makes this split pay off more.
### Is an entry-level subscription really enough?
Only if the main session stays out of chores. Opus's budget goes to planning, frontend and merging; reading files goes to Haiku, bulk code to DeepSeek. Rework costs the most, so question requirements and write the spec first.
### Don't parallel agents break each other's code?
The key is splitting lanes first. Each agent edits only files in its own lane, nobody touches shared files, each commits on its own worktree branch, and everything is merged after review. Cap the number running in parallel too; I run 5 at most now.
### Does Daily Receipt upload my payment history?
Not the raw text. Notification text, statements and images are parsed on the phone, raw notifications are kept only as the latest 200 on the device, and cloud sync uses only structured fields. Receipts shared to a circle carry only category totals, with no merchant names or line items. You can also keep a ledger without signing in.
### Do I need to buy a receipt printer?
No. The receipt is an on-screen animation; printing, stamping and tearing all happen in the app.
