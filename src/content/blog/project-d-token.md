---
title: "d-token：给 AI 编码 Agent 装一块本地上下文控制面"
description: "记录 d-token 的想法、架构和实测。为什么要在 Agent 和模型服务商之间插一层本地服务，Tauri 2 + Rust 怎么做路由、回执和配置安全，以及一次真实请求省下 33,705 token 的前后。"
date: "2026.09.17"
readTime: "8 分钟阅读"
tag: "工具链"
category: "AI"
tags: ["AI Coding", "Tauri", "Rust", "Token 优化", "本地工具"]
tagFilters:
  "AI Coding": "ai"
  "Tauri": "full-stack"
  "Rust": "full-stack"
  "Token 优化": "ai"
  "本地工具": "full-stack"
image: "illu-d-token.webp"
imageAlt: "本地 Token 控制面插画"
imageWidth: 1536
imageHeight: 922
badge: "Project"
sideNote: "d-token · Tauri 2 ·<br/>Rust · Context · Receipt"
caption: "<b>Local control plane visual.</b>(CityGenius, MMXXVI)"
authorMeta: "大学生 · 全栈开发者 · 本地工具实践者"
featured: false
related:
  - date: "2026.08.30"
    title: "多 Agent 编排：用 agent-mcp 把任务拆开跑"
    desc: "从 spawn 到收敛，记录一次多 Agent 协作实验。"
    tag: "Agent · 编排"
    slug: "project-agent-mcp"
  - date: "2026.05.15"
    title: "用 Vibe Coding 三天搞定一个全栈 AI 应用"
    desc: "从想法到上线，记录 scholar-ai 的开发过程。"
    tag: "Vibe Coding · AI"
    slug: "vibe-coding-3-days"
  - date: "2026.05.21"
    title: "从桌面应用到 Claude Skill"
    desc: "把设计系统应用拆成可复用的 Skill 逻辑。"
    tag: "Claude Code · Skill"
    slug: "open-design-to-skill"
---

上个月我对账单的时候愣了一下：AI 编码的花费又涨了一截，但我几乎说不清多出来的钱花在哪。翻会话记录，更难受——问题其实就摆在眼前：Agent 会把同一个文件、同一段工具日志、同一批 search 结果，在一次任务里反复塞进上下文。你知道它在重复，但你拿不出证据。

## 问题

一开始我以为写几个脚本就能解决：压缩重复日志、过滤大文件、把上游地址固定住。真做下去发现脚本只能修单点。

配置改坏了没人知道。请求被静默切到另一个服务商，测试结果对不上，你还在怀疑是不是自己 prompt 写坏了。「省了多少」只能靠感觉——感觉这个东西，在账单面前一文不值。

三个很基本的问题始终答不上来：这些 token 花在了哪个请求？真正走的是哪个 Provider？我做的「优化」到底有没有生效？

账单只给你一个总额。Agent 日志要么太吵，要么根本没记路由。服务商 dashboard 有自己的统计口径，和本地看到的对不上。你夹在中间，两边都说不清。

我试过在 prompt 里写「请不要重复粘贴文件」，也试过换更省的模型。前者管不住工具调用，后者只是把单价压低了，冗余还在。真正缺的不是聪明的 Agent，是一块能看见请求的控制面。

所以有了 d-token 的想法：**在 Agent 和模型服务商之间，放一层跑在本机的控制面**。不是再包一层聊天 UI，而是让每个请求在离开本机前被看见、被压缩、被路由，并留下证据。

<div class="info-card">
<div class="ic-title">项目概览</div>
<ul>
<li><strong>项目名：</strong>d-token</li>
<li><strong>技术栈：</strong>Tauri 2 / Rust / React</li>
<li><strong>定位：</strong>面向 AI 编码 Agent 的本地上下文控制面</li>
<li><strong>当前版本：</strong>0.2.0-beta.1（未签名预发布）</li>
<li><strong>GitHub：</strong><a href="https://github.com/37chengshan/d-token" target="_blank" rel="noreferrer noopener">37chengshan/d-token</a></li>
</ul>
</div>

## 为什么本地

把压缩和路由放到云端看起来更省事，省得自己维护桌面应用。但有几件事我没法接受。

第一是源码和完整 prompt 要先离开本机，才能被「优化」。第二是出了问题只能等服务商 dashboard 更新，中间那段黑盒时间帮不上忙。第三是配置变更没法精确回滚——你改坏了，只能干等或者重装。

d-token 选择本地优先：设置、诊断、请求元数据和回退记录都留在本机。普通日志不主动保存完整 prompt、完整 response、源码正文或 API key。模型服务商仍然会收到你主动发出的请求，这一点产品里也没有回避。

另一条硬约束是**显式路由**。每个请求都走明确路径到你配置的上游，绝不静默切换服务商。

听起来偏执。但静默 fallback 是最让人崩溃的一种故障：你以为在测 A，其实流量走了 B。测试红了，你对着 A 的配置查了半天，B 甚至都没出现在日志里。

<figure class="illu">
  <img src="/citygenius-blog/assets/illu-d-token.webp" alt="插图" width="1536" height="922" loading="lazy" />
</figure>

## 实现

架构上我尽量收敛：**Rust runtime 拥有路由、压缩、配置事务和运行事实**；Tauri 2 提供本地桥接和桌面窗口；前端（React）只消费结果、负责交互，不根据页面状态自行推断「已连接」。

这个分工是被坑出来的。早期有一版前端自己根据「配置文件里写着某个 provider」就显示已连接，结果服务根本没起来。后来规则变死：状态只认 runtime 给的事实，前端不发明真相。

<figure class="illu method">
  <img src="/citygenius-blog/assets/diagram-d-token.webp" alt="方法论示意" width="1536" height="922" loading="lazy" />
  <figcaption>结构示意</figcaption>
</figure>

请求链路大致是：

```text
Agent 请求
  → loopback 协议入口（Chat / Responses / Anthropic Messages）
  → 路由决策（Provider / 模型 / 协议 / endpoint）
  → 上下文压缩与校验
  → 转发上游，采集用量
  → 写入 Optimization Receipt 与事件账本
  → 桌面端概览 / 分析 / Doctor 展示同一事实
```

三件在实现里反复较真的事。

**路由必须可解释。** 每个请求只有一个路由决策。未知模型保持明确默认行为，不猜凭据、不换 Provider。cc-switch 这类外部配置源只读跟随，d-token 不写它们的数据库——别人家的配置坏了，不该算在我头上。

**每次请求一张回执。** 来源 Agent、实际路由、做了哪些变换、本地与 Provider 各自的 token、是否可恢复——都绑在同一条 request 上。没有证据就不显示节省。这条写进了产品规则，省得自己骗自己。

**配置安全比功能炫更重要。** 改 Agent 配置的流程固定为：预览 → 脱敏 Diff → 备份 → 验证 → 可回退。失败时精确回滚原始字节。某个 Agent 配置失败，只回退它自己，不连坐已经成功的项。凭据进系统凭据库，配置里只存引用。

桌面端用 Tauri 2，是因为要管服务生命周期、系统凭据库和文件事务这些浏览器做不了的事。核心逻辑放 Rust workspace 里拆成 proxy、router、compress、event-ledger、config、doctor 等 crate，避免前后端各写一套真相。

状态语义也钉死了。`detected` 只表示发现了文件或进程；`configured` 表示配置里写着，但没证明真实流量；`connected` 必须至少有一条真实请求经过；`verified` 要有当前有效证据。这四个词以前在 UI 里混着用过，现在谁都不许越级显示。

## 实测

目前能公开核对的一条数据是：**单次真实路由请求物理减少 33,705 token**（实测，2026-08-04）。

这只是单点证据，不是长期均值，也不等于账单上的最终数字。本地估算、上游用量和账单本来就应该分开记——把它们混成一个「节省率」，迟早会把自己骗进去。

但它确认了一件事：压缩路径不是空转的。冗余确实可以被拿掉，而任务含义还在。

真实模型验收用的是 OpenCode 免费 MiMo，把同一条请求上的路由、压缩和脱敏事件对上账。HTTP 429、只完成路由、仅有本地测试，都不能写成「真实压缩通过」。这条标准一开始写得很严，后来发现它挡掉了好几次自我感动——有一次本地测试全绿，上了真实链路才发现压缩器在某个 codec 上直接 passthrough，「节省」全是空的。

## 还没做完

写这篇的时候项目是 `0.2.0-beta.1`，公开未签名预发布，不是已签名安装包。对着路线图和 PRD 看，缺口仍然很多：

- **上下文连续性**（跨 Agent Context Relay、Session Cache）还在规划，跨 Agent 复用同项目上下文的证据链没闭环；
- **Headroom 能力矩阵**要求逐项具备真实请求、错误路径和回滚证据，目前只有安全子集在生产路径上；
- **视觉压缩**默认停在 shadow/metadata 边界，没有确切模型能力、质量、成本和恢复证据前，不会开启真实内容替换；
- **签名与双平台**：macOS Developer ID / notarization 和 Windows Authenticode 都是发布前的 MUST，现在还只是本机候选。

更底层的教训是：在 AI 编码工具链里做中间层，**诚实比功能表重要**。`detected` 不能显示成 `connected`，`configured` 不能冒充 `verified`，本地测试通过也不能写成「真实压缩通过」。

这些规则一开始觉得繁琐，后来发现正是它们让「省了 token」这句话站得住。

d-token 还在路上。如果你也在被 Agent 的上下文开销困扰，欢迎来看看仓库，提 issue 或者直接骂架构都行。
