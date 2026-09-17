---
title: "d-token：上下文离开本机之前，先过一道<em>控制面</em>"
description: "核心不是省 token 的脚本，而是本地控制面：压缩冗余、显式路由、每请求一张回执、配置可回退。单次真实请求物理减少 33,705 token。"
date: "2026.09.17"
readTime: "11 分钟阅读"
tag: "d-token"
category: "AI"
tags: ["d-token", "Rust", "Tauri", "Token", "Local-first"]
tagFilters:
  "d-token": "ai"
  "Rust": "full-stack"
  "Tauri": "full-stack"
  "Token": "ai"
  "Local-first": "ai"
image: "illu-d-token.webp"
imageAlt: "d-token 本地控制面"
imageWidth: 1536
imageHeight: 922
badge: "d-token"
sideNote: "d-token · Local Control Plane ·<br/>compress · route · receipt"
caption: "<b>Context before it leaves.</b>(CityGenius, MMXXVI)"
authorMeta: "大学生 · 全栈开发者 · AI 工具链探索者"
featured: false
related:
  - date: "2026.09.17"
    title: "agent-mcp：把各种 Agent CLI 收进一个工作池"
    desc: "主 Agent 只拆解汇合，执行交给控制面。"
    tag: "Agent MCP · AI"
    slug: "project-agent-mcp"
  - date: "2026.09.17"
    title: "ompweb：给 omp 一个本地工作台"
    desc: "Local-first，读会话文件，不重写 Agent。"
    tag: "ompweb · Local-first"
    slug: "project-ompweb"
  - date: "2026.09.17"
    title: "eduevidence：没有证据，就不设计新研究"
    desc: "九阶段协议与 Evidence Graph。"
    tag: "EduEvidence · Skill"
    slug: "project-eduevidence"
---

打开账单，数字在涨，但说不清花在哪。

同一批文件，上一轮刚喂过模型，这一轮又原样重发。工具日志、搜索结果、重复的 README 片段……上下文像漏水的桶。所谓「优化」有没有用，没有回执可以对账。

d-token 要回答三个问题：

1. 这些 token 花在了哪里？
2. 哪个 Provider 真的处理了请求？
3. 压缩是否真的发生了，而不是「感觉更省了」？

## 核心思想

README 的定位很干脆：**面向 AI 编码 Agent 的本地上下文控制面**。

它运行在「你正在用的 Agent」和「你配置的模型服务商」之间。在上下文**离开本机之前**压缩冗余，保持路由**显式**，并让配置变更**可恢复**——而不是一堆脚本和猜测。

```
AI 编程 Agent
     ↓
   d-token   连接 · 优化 · 路由 · 观察
     ↓
 你配置的模型服务商
```

三条硬原则：

- **本地优先**：秘密不进普通日志；控制面跑在本机。
- **显式路由**：每个请求走明确路径，绝不静默切换服务商。
- **每请求一张回执**：来源 Agent、路由、变换、Local / Provider Token、恢复状态。

<figure class="illu method">
  <img src="/citygenius-blog/assets/real-d-token-hero.webp" alt="d-token 控制面" width="1400" height="787" loading="lazy" />
  <figcaption>官方示意：Agent → d-token → 你配置的上游。</figcaption>
</figure>

## 问题：账单在涨，对账靠猜

AI 编码 Agent 会一遍又一遍重发相同的文件、日志和工具输出。token 账单悄悄增长，但：

- 说不清哪个会话最烧钱
- 说不清「优化」是否生效
- 配置改坏了，回不去

这不是再写一个 prompt 工程技巧能解决的。需要一层**看得见、可回退**的基础设施。

## 为什么必须是本地

上下文里有源码路径、密钥边界、公司内部结构。压缩和路由如果放在第三方黑盒里，你就把「可见性」也交出去了。

d-token 把设置、诊断、请求元数据、回退记录都留在本机。普通日志不会主动保存完整 prompt、完整 response、源代码正文、API key。你选的服务商仍会收到你主动发出的请求——但中间多了一层你自己掌控的门。

<figure class="illu">
  <img src="/citygenius-blog/assets/scenario-context-funnel.webp" alt="上下文漏斗" width="1400" height="858" loading="lazy" />
  <figcaption>在离开本机之前，先压一刀，并留下回执。</figcaption>
</figure>

## 实现：Rust 拥有事实，Tauri 只做桥

桌面端是 **Tauri 2 + Rust core**。Rust 侧负责连接状态、路由决策、压缩管线、回执；前端只做展示与安全配置流程。

配置变更不是「保存即生效」，而是：**预览 → 脱敏 Diff → 备份 → 验证 → 回退**。出问题可以诊断、修复、恢复——README 管这叫「配置的医生」。

状态语义也刻意分开写：

- `detected` ≠ `configured` ≠ `connected` ≠ `verified`
- 测试通过 ≠ 「真实压缩通过」

更底层的教训是：在 AI 工具链里做中间层，**诚实比功能表重要**。

<figure class="illu method">
  <img src="/citygenius-blog/assets/real-d-token-routing.svg" alt="显式路由管线" width="1400" height="787" loading="lazy" />
  <figcaption>官方管线图：优化与路由都是显式步骤，可观察。</figcaption>
</figure>

## 实测：一次请求少了 33,705 token

README 记录的数字是：**单次真实路由请求物理减少 33,705 token**（实测，2026-08-04）。

这不是「平均省 30%」的营销话术，而是一次可复现的实测点。回执里能看到 Local Token 与 Provider Token 的对比——省了多少，写在纸上，不靠感觉。

<figure class="illu method">
  <img src="/citygenius-blog/assets/real-d-token-receipt.svg" alt="Optimization Receipt" width="1400" height="787" loading="lazy" />
  <figcaption>Optimization Receipt：每次请求一张单。</figcaption>
</figure>

## 还没做完的

当前 **`0.2.0-beta.1`**，公开未签名预发布（macOS ARM64 / Windows x64）。未签名构建可能触发系统安全警告——请核对仓库与哈希，不要绕过系统保护。

路线图上还有：

- v0.3：跨 Agent Context Relay、Session Cache、cc-switch 跟随 / 锁定 / 观察
- v0.4：多 Agent 适配、低风险自动修复、稳定签名

深度压缩、Headroom 类集成、完整签名分发，都还在路上。

```bash
git clone https://github.com/37chengshan/d-token.git
cd d-token/code/apps/desktop
npm ci
npm run tauri:dev
```

主仓库：[37chengshan/d-token](https://github.com/37chengshan/d-token)。
