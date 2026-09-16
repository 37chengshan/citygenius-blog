---
title: "把 Agent Skill 当成<em>可复用教案</em>来写"
description: "学生做 AI 项目时最容易浪费时间的，不是模型不够强，而是每次都要重新解释同一套流程。把工作流写成 Agent Skill，就像把实验步骤写进可复用的教案。"
date: "2026.05.28"
readTime: "6 分钟阅读"
tag: "Agent Skill"
category: "AI"
tags: ["Agent Skill", "AI", "学习方法", "Prompt Engineering", "学生开发"]
tagFilters:
  "Agent Skill": "ai"
  "AI": "ai"
  "学习方法": "ai"
  "Prompt Engineering": "ai"
  "学生开发": "full-stack"
image: "lab-3.webp"
imageAlt: "Agent Skill as reusable lesson plan article cover"
imageWidth: 1254
imageHeight: 1254
badge: "Agent Skill"
sideNote: "Agent Skill · 教案 ·<br/>复用 · 约束 · 验收"
caption: "<b>Skill as curriculum.</b>(CityGenius, MMXXVI)"
authorMeta: "大学生 · 全栈开发者 · AI 工具链探索者"
featured: false
related:
  - date: "2026.05.21"
    title: "从桌面应用到 Claude Skill：如何提炼设计系统的可复用逻辑"
    desc: "把复杂应用能力压缩成 Skill 的完整拆解过程。"
    tag: "Claude Code · Skill"
    slug: "open-design-to-skill"
  - date: "2026.05.15"
    title: "用 Vibe Coding 三天搞定一个全栈 AI 应用"
    desc: "从想法到上线，记录 scholar-ai 的开发过程。"
    tag: "Vibe Coding · AI"
    slug: "vibe-coding-3-days"
---

## 你不是在写 Prompt，你是在写<em>教案</em>

学生做 AI 项目时，最常见的浪费不是算力，而是重复解释。每次开新会话，都要重新交代：项目背景、目录约定、禁止事项、验收标准、失败后怎么回退。Prompt 解决的是“这一次怎么答”，Skill 解决的是“这类任务以后怎么做”。

把 Agent Skill 想成一份可复用教案，你会立刻发现它至少要回答四件事：

1. **适用场景**：什么任务该触发它。
2. **步骤边界**：先做什么、后做什么、哪里必须停。
3. **质量标准**：什么样算完成，什么样必须重做。
4. **失败出口**：卡住时降级方案是什么。

## 从一次真实作业里<em>提炼</em> Skill

我最近把“写一篇技术笔记并发布到博客”抽成了 Skill。原始版本只有一句：

> 帮我写一篇关于某某技术的文章，风格像我之前的博客。

结果每次都在跑偏：有时像论文，有时像广告，有时直接漏掉 frontmatter。后来改成教案式描述，才稳定下来。

<div class="info-card">
<div class="ic-title">教案骨架</div>
<div class="ic-body">
先读 1–2 篇既有文章，对齐语气；再列 3 个论点，每个论点配一个具体例子；最后补 frontmatter、相关文章和发布检查。禁止空泛总结，禁止编造没有做过的事。
</div>
</div>

这一步的关键不是堆更多形容词，而是把**约束前置**。AI 越自由，输出越像互联网平均值；你越早给出边界，它越像你的项目。

## 学生项目最该沉淀的三类 Skill

不是所有流程都值得做成 Skill。对学生开发来说，优先沉淀这三类：

- **发布类**：写文章、更新 README、整理 release note。
- **工程类**：初始化项目、加 CI、跑构建、修常见配置错误。
- **研究类**：文献/竞品摘要、实验记录、失败复盘。

它们的共同点是：**步骤可重复，结果可检查**。如果一个任务每次目标都不一样，硬做成 Skill 反而会添乱。

## 用最小验收线<em>卡住质量</em>

Skill 里最容易被忽略的，是“完成”的定义。没有验收线，Agent 会自信地交出半成品。我的习惯是在末尾写死几条：

- 本地能 `npm run build` 通过。
- 内部链接在目标部署路径下可点。
- 文章 frontmatter 字段齐全。
- 不引入未要求的新依赖。

这听起来很朴素，但它把“感觉差不多了”换成了可执行检查。对学生项目尤其有用——你可能没有 code review 同伴，但你可以有 checklist。

## 下一步：把 Skill 写进仓库

Skill 不该躺在聊天记录里。放到仓库的 skills/ 或文档目录，和代码一起版本管理，才谈得上复用。你也可以在 Skill 开头写清适用模型、目录约定和禁止事项，让后来的自己（或队友）不必考古。

Vibe Coding 真正省时间的地方，不是让 AI 替你写完，而是把你已经想清楚的部分固化下来。Skill 就是这种固化的载体：像教案一样，教一次，用很多次。
