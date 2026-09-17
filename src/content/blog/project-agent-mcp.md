---
title: "agent-mcp：把各种 Agent CLI 收进一个<em>工作池</em>"
description: "记录我写 agent-mcp 的过程。主 Agent 只做拆解和汇合，spawn / wait / steer 把执行交给子 Agent，底层是一个可派发、可监控、可续接的控制面。目前还是 alpha。"
date: "2026.09.17"
readTime: "8 分钟阅读"
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
imageAlt: "多 Agent 编排控制面插画"
imageWidth: 1536
imageHeight: 1024
badge: "Agent MCP"
sideNote: "agent-mcp · Control Plane ·<br/>spawn · wait · steer"
caption: "<b>Agent work pool.</b>(CityGenius, MMXXVI)"
authorMeta: "大学生 · 全栈开发者 · AI 工具链探索者"
featured: false
related:
  - date: "2026.05.28"
    title: "把 Agent Skill 当成可复用教案来写"
    desc: "把工作流写成 Skill，少解释一遍是一遍。"
    tag: "Agent Skill · AI"
    slug: "agent-skill-as-lesson-plan"
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

## 起因：一个很烦的<em>日常</em>

我平时会同时用好几个 Agent CLI。有的读代码快，有的推理深，有的便宜。问题是它们互不相通。

同一个任务，我在 Claude 里开一个会话，在另一个 CLI 里再开一个。上下文各记各的。想中途叫停一个，只能去终端里杀进程。跑挂了，session 得重开。token 花了多少，只能事后对账。

有一天我在拆一个稍大的重构：拆成四五个子任务，两三个 CLI 同时跑。结果我自己变成了调度器 — 一边盯终端输出，一边在备忘录里记谁跑完了。那天晚上我就想：这不该由人来做。

想法很简单：**把任意 Agent CLI 收成一个工作池**。主 Agent 只负责拆任务和汇总结果。派发、等待、插话、超时、续接，都交给一层基础设施。我不要求大家用同一个模型，也不想替各家 CLI 重写 agent loop。我要的只是统一入口。

这就是 <em>agent-mcp</em>。

<figure class="illu left">
  <img src="/citygenius-blog/assets/illu-agent-mcp.webp" alt="多 Agent 编排控制面示意" width="1536" height="1024" loading="lazy" />
  <figcaption>把多个 CLI 收成一个可调度的工作池。</figcaption>
</figure>

## 踩坑：原来 CLI 差这么多

动手之后，第一个打击是适配层。

我以为各家 CLI 都有类似的 headless 模式，事件流也长得差不多。不是。有的吐 JSONL，有的只吐纯文本，有的 usage 字段名完全不同。resume 有的支持有的不支持。权限参数更是五花八门。

第二个坑是「多开几个 Agent」很容易，「可控地多开」很难。

子任务跑飞了怎么办？槽位满了怎么排队？中途发现方向错了怎么插话？主 Agent 等结果时不能空转，也不能傻轮询把上下文撑爆。这些事如果不管，多 Agent 只是把混乱放大。

还有一个很实际的教训：**不要默认什么都拆**。我早期版本遇到小事也 spawn 一堆子 Agent，结果协调开销比任务本身还大。后来加了复杂度分级门 — 本地判 S/M/L，小任务直接做，够大才进编排。

## 实现：控制面，不是再造一个 Agent

agent-mcp 自己不跑模型。它不是又一个 Agent。

边界写得很死：思考、工具调用、模型推理，都在各 CLI 原生 runtime 里。agent-mcp 管的是编排、调度、托管、观测。

对外它是一组 MCP 工具。任何支持 MCP 的宿主都能挂上。常用的几件：

- `estimate_complexity`：本地判级，零 token，不 spawn
- `spawn_agent`：派发子 Agent，指定 CLI / 模型 / 超时，马上拿回 agent_id
- `wait_agent`：短阻塞等终止态，返回摘要
- `steer_agent`：中途插话，终止当前 run，在同一节点接着跑
- `followup_task`：合并挂起消息，触发下一 turn
- `orchestrate_task`：有依赖的任务图，无依赖并行，有依赖按序

底层是一个 daemon 控制面。Run 是唯一执行单位。槽位满了自动排队。任务超时会终止整棵进程树。token 预算超了可以降档重跑。session_id 是所有权边界，跨会话碰不到彼此。

适配器层把 11 款内置 CLI（claude / grok / opencode / omp / codex / kimi / copilot 等）的事件流、usage、session 归一化。不在列表里的 CLI，写一份 JSON 配置也能接，不用改代码。

再往上还有记忆银行、策略引擎、Web 控制台。记忆跨会话存取；预算和审批策略在派发入口前拦一道；控制台能看对话树和 token 花在哪。

## 现在能干什么

写完之后，我的工作流变了。

以前是「我自己盯」。现在是「我拆完，派出去，循环 wait，汇合」。

比如一次跨文件重构：我先 `estimate_complexity`，判成 L，再用 `orchestrate_task` 声明依赖 — 先改公共类型，再改调用方，最后 review。无依赖的扫描任务并行跑。每个子任务可以指定不同 CLI：读密集的丢给快的，深推理的丢给强的。

中途发现范围写大了，`steer_agent` 直接插话收窄。跑挂了，超时兜住，session 还能 resume。

这套东西现在每天我都在用。单测 500 多个，能撑住日常。DAG 编排、策略引擎、控制台也都已经能跑。它没有让我「多快好省」，但确实把我从盯终端这件事里解放出来了。

## 还差什么

项目还是 <em>alpha</em>（v4.0.0a1）。有些地方我必须说清楚。

适配器的实测率还不均匀。内置的几款能用，新接的一些 CLI 事件解析还没逐个校准过，矩阵里仍有待验证项。沙箱目前主要是「统一策略翻译到各 CLI 自己的参数」，不是真隔离；映射层还没完全接到执行链上。跨厂商审查和 worktree 模式在简单场景可用，复杂合并场景还要再踩。

另外，控制面做厚了，调试成本也上去了。出问题时要同时看主 Agent、daemon 日志、子进程。这对个人项目来说偏重，我会继续砍。

下一步打算优先补适配器实测、把策略真正拦在执行点上，再简化上手路径。

如果你也在多个 Agent CLI 之间来回切，可以试试：

```bash
curl -fsSL https://raw.githubusercontent.com/37chengshan/agent-mcp/main/install.sh | bash
```

主仓库在 [37chengshan/agent-mcp](https://github.com/37chengshan/agent-mcp)。欢迎提 issue，也欢迎直接骂。
