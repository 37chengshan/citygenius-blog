---
title: "用 <em>Vibe Coding</em> 三天搞定一个全栈 AI 应用"
description: "从想法到上线，记录 scholar-ai 的开发过程。如何利用 AI 辅助编码，快速搭建 FastAPI 后端和 React 前端，以及 RAG 检索增强生成的实际落地经验。"
date: "2026.05.15"
readTime: "8 分钟阅读"
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
authorMeta: "大学生 · 全栈开发者 · Vibe Coding 爱好者"
featured: true
related:
  - date: "2026.05.08"
    title: "macOS 原生开发心得：SwiftUI 与 AppKit 的取舍"
    desc: "在开发 macOS 工具时遇到的坑和经验。SwiftUI 的便利与局限，什么时候该回归 AppKit。"
    tag: "macOS · Swift"
    slug: "swiftui-appkit"
  - date: "2026.04.15"
    title: "本地 AI 模型实战：图片去水印与多语言翻译"
    desc: "探索在移动端运行本地 AI 模型的可能性。TFLite 图片处理、离线翻译模型的集成。"
    tag: "AI/ML · 移动端"
    slug: "local-ai-tflite"
---

## 什么是 <em>Vibe Coding</em>

Vibe Coding 这个概念来自 Andrej Karpathy，核心理念是：你不需要逐行手写每一行代码，而是通过描述你的意图，让 AI 帮你生成大部分实现。你的角色从"写代码的人"变成了"指挥代码的人"。

这听起来像是偷懒，但实际上它要求更高层次的能力 — 你需要清晰地理解自己要构建什么，能够判断 AI 生成的代码质量，并且知道什么时候该手动干预。对我来说，这是一种全新的编程体验。

> "There's a new kind of coding I call 'vibe coding', where you fully give in to the vibes, embrace exponentials, and forget that the code even exists."
> — Andrej Karpathy

## 项目背景：<em>Scholar AI</em>

Scholar AI 是一个学术研究辅助工具。作为一个经常需要阅读论文、整理文献的大学生，我深知这个过程有多痛苦。我想要一个工具，能帮我快速检索相关论文、自动生成摘要、甚至支持多语言翻译。

这个想法在我脑子里酝酿了很久，但传统的开发方式意味着至少需要一两周的时间。直到我开始尝试 Vibe Coding — 三天后，一个可用的 MVP 就上线了。

<div class="info-card">
<div class="ic-title">项目概览</div>
<ul>
<li><strong>项目名：</strong>Scholar AI</li>
<li><strong>技术栈：</strong>Python / FastAPI / React / PostgreSQL / ChromaDB</li>
<li><strong>核心功能：</strong>论文检索 · 智能摘要 · 多语言翻译 · RAG 问答</li>
<li><strong>开发周期：</strong>3 天（MVP）</li>
<li><strong>GitHub：</strong><a href="https://github.com/37chengshan/scholar-ai" target="_blank" rel="noreferrer noopener">37chengshan/scholar-ai</a></li>
</ul>
</div>

## Day 1：后端 <em>从零搭建</em>

第一天的目标很明确：搭建一个能跑起来的后端。我用 Claude 作为主要的编码助手，通过描述需求来生成代码。

<div class="step-list">
<div class="step-item">
<span class="step-num">01</span>
<div>
<h4>定义 API 接口</h4>
<p>先用自然语言描述需要哪些接口，让 AI 生成 OpenAPI spec，再基于 spec 生成 FastAPI 路由代码。这一步花了大约 30 分钟。</p>
</div>
</div>
<div class="step-item">
<span class="step-num">02</span>
<div>
<h4>数据库设计</h4>
<p>描述数据模型的关联关系，让 AI 生成 SQLAlchemy 模型和 Alembic 迁移脚本。遇到一些类型映射问题，手动调整了几个字段。</p>
</div>
</div>
<div class="step-item">
<span class="step-num">03</span>
<div>
<h4>RAG 管道搭建</h4>
<p>这是最有趣的部分。描述了检索增强生成的流程：文档分块 → 向量化 → 检索 → 生成。AI 帮我搭好了 ChromaDB 集成和 OpenAI API 调用的骨架。</p>
</div>
</div>
</div>

## Day 2：前端 <em>快速成型</em>

第二天转向前端。我选择 React + TypeScript，配合 shadcn/ui 组件库。Vibe Coding 在前端开发中的效率提升更加明显 — 描述一个页面的布局和交互，AI 几乎能一次性生成可用的组件代码。

关键心得：**不要试图一次描述整个页面**。拆成小组件，逐个描述，效果好得多。比如"一个搜索框，带自动补全，下拉显示论文标题和作者"比"做一个搜索页面"得到的结果精准得多。

<div class="pull-quote">
<p>Vibe Coding 不是让你不动脑，而是让你把精力花在更重要的地方 — 产品思考和用户体验。</p>
<cite>个人体会</cite>
</div>

## Day 3：集成 <em>与打磨</em>

第三天做集成和细节打磨。前后端联调、错误处理、加载状态、响应式布局 — 这些"脏活"反而是 Vibe Coding 效率最高的地方。描述一个问题，AI 给出修复方案，你验证，继续。

几个踩过的坑：

- **CORS 配置**：AI 生成的 CORS 中间件配置有时会漏掉特定的 header，需要手动补充
- **流式响应**：SSE (Server-Sent Events) 的实现细节比较多，AI 第一次生成的代码有 bug，但描述清楚错误后修复很快
- **向量数据库性能**：ChromaDB 的默认配置在数据量大时会变慢，需要手动调优索引参数

## 总结与<em>反思</em>

三天完成一个全栈 AI 应用的 MVP，这在以前是不可想象的。Vibe Coding 真正改变了我的开发节奏 — 从"写代码"变成了"描述需求、验证输出、迭代优化"的循环。

但它也有局限。对于复杂的业务逻辑、性能关键路径、以及需要深度理解底层原理的场景，手写代码仍然不可替代。Vibe Coding 最适合的是**快速原型**和**标准化功能**的实现。

我的建议：把 Vibe Coding 当作你的"编码副驾驶"，而不是"自动驾驶"。保持对代码的理解和控制，才能真正发挥它的威力。
