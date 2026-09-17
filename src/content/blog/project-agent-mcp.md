---
title: "agent-mcp：把各种 Agent CLI 收进一个<em>工作池</em>"
description: "核心不是多开 Agent，而是控制面：主 Agent 只拆解汇合，spawn / wait / steer / 超时 / 续接交给基础设施。CLI 按任务现场匹配——快的扫代码，强的做推理。"
date: "2026.09.17"
readTime: "12 分钟阅读"
tag: "Agent MCP"
category: "AI"
tags: ["Agent MCP", "AI", "多 Agent", "MCP", "Agent CLI"]
tagFilters:
  "Agent MCP": "ai"
  "AI": "ai"
  "多 Agent": "ai"
  "MCP": "ai"
  "Agent CLI": "ai"
image: "illu-agent-mcp.webp"
imageAlt: "多 Agent 编排控制面"
imageWidth: 1536
imageHeight: 922
badge: "Agent MCP"
sideNote: "agent-mcp · Control Plane ·<br/>spawn · wait · steer"
caption: "<b>Agent work pool.</b>(CityGenius, MMXXVI)"
authorMeta: "大学生 · 全栈开发者 · AI 工具链探索者"
featured: false
related:
  - date: "2026.09.17"
    title: "d-token：上下文离开本机之前"
    desc: "本地控制面压缩冗余、显式路由、每请求一张回执。"
    tag: "d-token · Rust"
    slug: "project-d-token"
  - date: "2026.09.17"
    title: "ompweb：给 omp 一个本地工作台"
    desc: "不重写 Agent，只读会话文件，把终端扩成工作区。"
    tag: "ompweb · Local-first"
    slug: "project-ompweb"
  - date: "2026.05.15"
    title: "用 Vibe Coding 三天搞定一个全栈 AI 应用"
    desc: "从需求描述到 MVP 上线。"
    tag: "Vibe Coding · AI"
    slug: "vibe-coding-3-days"
---

上周三，我在拆一个跨文件重构。任务拆成五份，三个终端同时开：Claude 写公共类型，Codex 改调用方，omp 跑依赖扫描。

四十分钟后，我在备忘录里记谁跑完了。左边 Claude 卡在权限确认，中间 Codex 输出刷得看不清，右边 omp 早就跑完，但没人告诉我。token 花了多少，事后对账。那天晚上收工时，三个会话里有两个已经废了，上下文全丢。

这不是「模型不够强」。这是**没有人做调度**。

agent-mcp 的 README 写得很清楚——核心不是「多开几个 Agent」，而是把任意 CLI 收成一个**可派发、可监控、可续接、可终止的工作池**。

主 Agent 只做两件事：**拆解**和**汇合**。

派发、等待、插话、超时、排队、续接、降档，全部交给控制面。模型推理仍发生在各家 CLI 原生 runtime 里；agent-mcp 不重写 agent loop，也不锁死单一模型。

另一个原则是：**按任务匹配底座**。

读密集探索丢给快底座（omp / pi / grok），深推理规划丢给强底座（claude）。成本与质量现场匹配，而不是「全家都用同一个模型」。

## 问题

多开几个终端很简单。难的是：


<figure class="illu method">
  <img src="/citygenius-blog/assets/chart-agent-mcp-scale.webp" alt="控制面规模" width="1400" height="820" loading="lazy" />
  <figcaption>公开规模指标：34 个 MCP 工具、589 个测试、11 款内置 CLI 适配。</figcaption>
</figure>

- 子任务跑飞了怎么办？
- 槽位满了怎么排队？
- 中途发现方向错了怎么插话？
- 主 Agent 等结果时不能空转，也不能傻轮询把上下文撑爆。
- 谁在跑、跑哪了、烧了多少，全靠人盯。

各家 CLI 还互不相通：有的吐 JSONL，有的只吐纯文本，usage 字段名完全不同，resume 有的支持有的不支持。如果不管这些差异，多 Agent 只会把混乱放大。

<figure class="illu method">
  <img src="/citygenius-blog/assets/fig-agent-mcp-flow.webp" alt="派发路径" width="1400" height="780" loading="lazy" />
  <figcaption>主 Agent 只做拆解与汇合；派发、等待与容错由控制面完成。</figcaption>
</figure>

## 做法

对外 agent-mcp 是一组 **MCP 工具**。任何支持 MCP 的宿主都能挂上。常用的几件：

- `estimate_complexity`：本地判 S/M/L，零 token，不 spawn——**默认直接做，按需才拆**
- `spawn_agent`：派发子 Agent，指定 CLI / 模型 / 超时，马上拿回 `agent_id`
- `wait_agent`：短阻塞等终止态，返回摘要
- `steer_agent`：中途插话，终止当前 run，在同一节点接着跑
- `followup_task`：合并挂起消息，触发下一 turn
- `orchestrate_task`：有依赖的任务图，无依赖并行，有依赖按序

底层是 daemon 控制面。**Run 是唯一执行单位**。槽位满了自动排队。任务超时会终止整棵进程树。token 预算超了可以降档重跑。`session_id` 是所有权边界。

适配器层内置 11 款 CLI（claude / grok / opencode / omp / codex / kimi / copilot 等）的事件流、usage、session 归一化。不在列表里的 CLI，写一份 JSON 配置也能接，不用改代码。

DeepSeek Harness 也做了原生接入：一行 `insert` patch，34 个工具以 `mcp__agentmcp__*` 全量注册；daemon 未起自动拉起，断线指数退避重连。

约束很实际。**不要默认什么都拆。** 我早期版本遇到小事也 spawn 一堆子 Agent，协调开销比任务本身还大。后来才有复杂度分级门。

**适配层比想象脏。** headless 模式、事件流、resume、权限参数，每家一套。归一化才是真正的工程量。

**控制面做厚了，调试会变重。** 出问题时要同时看主 Agent、daemon 日志、子进程。这对个人项目偏重，还在砍。

## 现状

写完之后，我的工作流变了：以前是「我自己盯」，现在是「拆完、派出去、循环 wait、汇合」。

一次跨文件重构：先 `estimate_complexity` 判成 L，再 `orchestrate_task` 声明依赖——先改公共类型，再改调用方，最后 review。无依赖的扫描并行跑。每个子任务可以指定不同 CLI。

中途范围写大了，`steer_agent` 收窄。跑挂了，超时兜住，session 还能 resume。

当前 **v4.0.0a1**：34 个 MCP 工具，589 个测试通过。它没有让我「多快好省」，但确实把我从盯终端里解放出来了。

局限仍在。
项目仍是 alpha。适配器实测率不均匀；沙箱目前主要是「统一策略翻译到各 CLI 自己的参数」，不是真隔离；跨厂商审查在复杂合并场景还要再踩。

下一步优先补适配器实测、把策略真正拦在执行点上，再简化上手路径。

```bash
curl -fsSL https://raw.githubusercontent.com/37chengshan/agent-mcp/main/install.sh | bash
```

主仓库：[37chengshan/agent-mcp](https://github.com/37chengshan/agent-mcp)。欢迎提 issue，也欢迎直接骂。
