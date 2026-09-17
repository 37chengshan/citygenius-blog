---
title: "ompweb：不重写 Agent，只给 omp 一个<em>本地工作台</em>"
description: "核心是 Local-first：直接读 ~/.omp/agent/sessions，OMP 仍是唯一权威。会话树、PTY、MCP 管理、Git worktree——把终端扩成工作区。"
date: "2026.09.17"
readTime: "11 分钟阅读"
tag: "ompweb"
category: "AI"
tags: ["ompweb", "oh-my-pi", "Local-first", "Next.js", "Electron"]
tagFilters:
  "ompweb": "ai"
  "oh-my-pi": "ai"
  "Local-first": "ai"
  "Next.js": "full-stack"
  "Electron": "full-stack"
image: "illu-ompweb.webp"
imageAlt: "ompweb 本地工作台"
imageWidth: 1536
imageHeight: 922
badge: "ompweb"
sideNote: "ompweb · Local-first ·<br/>sessions · PTY · MCP"
caption: "<b>Workbench for omp.</b>(CityGenius, MMXXVI)"
authorMeta: "大学生 · 全栈开发者 · AI 工具链探索者"
featured: false
related:
  - date: "2026.09.17"
    title: "agent-mcp：把各种 Agent CLI 收进一个工作池"
    desc: "控制面统一派发，CLI 按任务匹配。"
    tag: "Agent MCP · AI"
    slug: "project-agent-mcp"
  - date: "2026.09.17"
    title: "d-token：上下文离开本机之前"
    desc: "本地压缩与显式路由。"
    tag: "d-token · Rust"
    slug: "project-d-token"
  - date: "2026.09.17"
    title: "eduevidence：没有证据，就不设计新研究"
    desc: "九阶段协议与 Evidence Graph。"
    tag: "EduEvidence · Skill"
    slug: "project-eduevidence"
---

终端里的 omp 其实「够用」。会话、工具调用、权限确认，都能在黑底白字里完成。

但不够「好用」。

想回看昨天的会话，只能 `ls` 一堆 JSONL。想同时开三个分支对比，只能开三个终端窗口。想看 MCP 有没有挂上，翻配置文件。想切 Git worktree，再开一个 pane。

我不是想换掉 omp。我是想要一张**桌子**：把已经存在的会话、终端、文件、MCP 状态摊开看。

## 核心思想

ompweb 的定位写在 README 第一页：**oh-my-pi 的现代化、高性能、本地优先的 Web 工作区与原生桌面应用**。

关键设计只有一条——

**不重写 Agent，只读它的会话文件。**

```
~/.omp/agent/sessions/   ← 唯一会话权威
        ↓ 浏览 / 分支 / 归档（窄写）
     ompweb (Next.js / Electron)
        ↓ live 执行
  omp --mode rpc-ui  ← OMP 仍是 runtime
```

本地会话用 Node 直接扫 JSONL；**live 工作走 `omp --mode rpc-ui`**（stdio 上的 NDJSON）。OMP SDK 在 Bun 侧，Node 服务刻意不 import，避免把运行时搞混。

一句话：**OMP 写会话，ompweb 展示和编排；权威不在 UI。**

<figure class="illu method">
  <img src="/citygenius-blog/assets/real-ompweb-arch.webp" alt="ompweb 架构" width="1400" height="920" loading="lazy" />
  <figcaption>真实架构图：Web / 桌面共用工作区，底下仍是本地 OMP。</figcaption>
</figure>

## 问题：终端 Agent 的天花板

终端有三个天花板：

1. **历史不可视** —— 会话在文件里，不在眼前
2. **多开无结构** —— 分支、对比、回滚靠人肉窗口管理
3. **生态不可见** —— MCP、技能、Git 状态散落各处

如果重写一个 Agent，你就分裂了生态。ompweb 选择站在 omp 旁边，而不是对面。

## 做法：一套代码，Web 和桌面

技术栈是 **Next.js 16 + Electron 44**，Node ≥ 22.19。

- **Web**：`npx @37chengshan/ompweb@latest` 即开，监听 `127.0.0.1:30177`
- **桌面**：Electron 壳，托盘常驻、Dock 状态、独立窗口生命周期
- **远端可控**：`--password`、`--hostname`、`--no-open`，适合服务器后台

后面又加了一层 Rust `ompweb-host` 守护进程：Git / PTY / 会话扫描 / 设置 / supervisor，走有界 NDJSON（UDS / Named Pipe）。

<figure class="illu method">
  <img src="/citygenius-blog/assets/real-ompweb-ui.webp" alt="ompweb 界面" width="1400" height="875" loading="lazy" />
  <figcaption>浅色界面：会话树 + 对话 + 侧栏，从终端长成工作区。</figcaption>
</figure>

功能面按「工作台」而不是「聊天窗」来铺：

- 会话树导航与分支
- 实时多 Agent 协同
- 交互式 Web PTY
- 可视化 MCP / Skill 管理
- 代码与富媒体预览
- Git 多 worktree 切换

## 踩坑

**写路径要故意窄。** 会话权威在 OMP；ompweb 只保留 rename / archive / delete / branch-parent 这类低风险操作。什么都想写，就会和 live 进程打架。

**SDK 边界要守住。** OMP SDK 是 Bun-only，Node/Next 服务不能图省事直接 import。活儿必须走 `omp --mode rpc-ui`。

**架构会变厚。** 加 host daemon 之后调试面变大——UI、Next、host、omp 四层。这是 local-first 的代价，文档和默认安全（loopback / 密码）必须跟上。

## 现状

可 `npx` 一键体验，也有 Releases 安装包（mac / Windows / Linux）。MIT 许可，上游脉络来自 pi-web / oh-my-pi 生态。

它没有发明新 Agent，只是把已经存在的 omp 会话，放到了一张你真的能用的桌子上。

```bash
npx @37chengshan/ompweb@latest
```

主仓库：[37chengshan/ompweb](https://github.com/37chengshan/ompweb)。
