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
imageAlt: "项目主视觉插画"
imageWidth: 1536
imageHeight: 922
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

## 一个很烦的<em>晚上</em>

上周三，我在拆一个跨文件重构。任务拆成五份，三个终端同时开：Claude 写公共类型，Codex 改调用方，omp 跑依赖扫描。

四十分钟后，我在备忘录里记谁跑完了。左边 Claude 卡在权限确认，中间 Codex 输出刷得看不清，右边 omp 早就跑完，但没人告诉我。我想插话把范围收窄一点，只能切过去敲 Ctrl-C，再重开一个会话。token 花了多少，事后对账。那天晚上收工时，三个会话里有两个已经废了，上下文全丢。

这种事不是第一次。我平时就会同时用好几个 Agent CLI。有的读代码快，有的推理深，有的便宜。问题是它们互不相通。我变成了调度器，一边盯终端，一边在备忘录里记谁跑完了。

那天晚上我就在想：这不该由人来做。

人不该当调度器。人应该负责拆任务、判断结果、决定下一步。盯输出、杀进程、记备忘录，这些事机器做得比人稳。

想法很简单：**把任意 Agent CLI 收成一个工作池**。主 Agent 只做拆解和汇合。派发、等待、插话、超时、续接，都交给一层基础设施。我不锁死单一模型，也不想替各家 CLI 重写 agent loop。我要的只是统一入口。

这就是 <em>agent-mcp</em>。

## 问题

麻烦不在「多开几个 Agent」，而在「不可控地多开」。

同一个任务，我在一个 CLI 里开会话，在另一个 CLI 里再开一个。上下文各记各的。想中途叫停，只能去终端杀进程。跑挂了，session 得重开。槽位满了没有排队，超时了没有兜底，token 预算超了没有降档。谁在跑、跑哪了、烧了多少，全靠我自己盯。

更麻烦的是各家 CLI 差得离谱。

有的吐 JSONL，有的只吐纯文本。usage 字段名完全不同。resume 有的支持有的不支持。权限参数五花八门。上层如果自己拼这些差异，每接一家就要写一堆特判。我一开始还以为只要统一「起一个子进程」就够了，后来发现真正难的是把事件流、用量统计、会话 id 这三样归一化。命令行参数、工作目录、环境变量、超时语义，每家也都有自己的习惯。

还有一个很实际的教训：不要默认什么都拆。我早期版本遇到小事也 spawn 一堆子 Agent，结果协调开销比任务本身还大。多开几个 Agent 很容易，可控地多开很难。多 Agent 有时只是把混乱放大。

所以我要的只有三件事：统一入口、可中断、可续接。能不能多快好省，是之后的事。先把这三个底线守住。

## 做法

agent-mcp 自己不跑模型。它不是又一个 Agent。

边界写得很死：思考、工具调用、模型推理，都在各 CLI 原生 runtime 里。agent-mcp 管编排、调度、托管、观测。我不想再造一个 agent loop，也不想和各家 CLI 抢「谁更聪明」。各家 CLI 继续迭代它们自己的推理和工具调用，我只负责把它们接到同一个池子里。

对外它是一组 MCP 工具。当前版本 <em>v4.0.0a1</em>，一共 34 个，589 个单测通过。任何支持 MCP 的宿主都能挂上。常用的几件：

- `estimate_complexity`：本地判 S/M/L，零 token，不 spawn
- `spawn_agent`：派发子 Agent，指定 CLI / 模型 / 超时，马上拿回 agent_id
- `wait_agent`：短阻塞等终止态，默认 25 秒，上限 600 秒，返回摘要
- `steer_agent`：中途插话，终止当前 run，在同一节点接着跑
- `followup_task`：合并挂起消息，触发下一 turn
- `orchestrate_task`：有依赖的任务图，无依赖并行，有依赖按序

<figure class="illu method">
  <img src="/citygenius-blog/assets/diagram-agent-mcp.webp" alt="agent-mcp 控制面结构示意：主 Agent 通过 MCP 派发，daemon 统一调度多个 CLI" width="1536" height="922" loading="lazy" />
  <figcaption>控制面结构：主 Agent 只拆任务和汇合，daemon 管排队、超时和续接</figcaption>
</figure>

底层是一个 daemon 控制面。Run 是唯一执行单位。槽位满了自动排队。`timeout_seconds` 给 1 到 1800 秒，到时终止整棵进程树，标记 incomplete / timeout，session 还能 resume。`token_budget` 超了可以降档 model 重跑。session_id 是所有权边界，跨会话碰不到彼此。

我把 MCP 层做得很薄。`mcp_server.py` 只负责工具注册、host 识别、会话隔离，以及 daemon 没起时的原子拉起。真正干活的是后面的 daemon 和适配器。这样宿主换一个，薄层几乎不用动。

适配器层把 11 款内置 CLI（claude / grok / opencode / omp / atomcode / codex / kimi / copilot / pi / zcode / cline）的事件流、usage、session 归一化。不在列表里的，写一份 `custom-clis/*.json` 也能接，不用改代码。安装脚本目前能注册 21 种 host。

复杂度分级门是我后来补的。`estimate_complexity` 在本地直接算，不花 token，也不 spawn。判成 S 就主 Agent 自己做，够大才进编排。默认直接做，按需才拆。这道门看起来小，但挡住了我早期最大的浪费。

再往上还有记忆银行、策略引擎、Web 控制台。`memory_store` / `memory_recall` 跨会话存取，默认召回 5 条。预算和审批策略在 spawn / steer / orchestrate 入口前拦一道，DENY 直接短路。控制台三栏：会话文件夹、对话树、Agent 详情，SSE 实时推。

随安装还分发了一份编排 Skill。里面有六步工作流，也有 10 个内置 Agent 预设：planner、architect、tdd-guide、code-reviewer、security-reviewer 等。任务简报要求写清目标、范围、边界、输出契约和卡住时的升级条件。这些不是装饰，是让子 Agent 交回来的东西能被主 Agent 直接用。

编排闭环其实很短：

```text
复杂度分级门 → 派发(Run) → 监控(wait) → 验证回投 → 容错(超时/resume/降档)
```

每一环都不新奇，串起来才省事。

## 踩坑

第一个打击是适配层。我以为各家 CLI 都有类似的 headless 模式，事件流也长得差不多。不是。

有家只吐纯文本，usage 要从日志里抠。有家 JSONL 的 event type 和文档对不上。resume 参数有的叫 `--resume`，有的叫 `--continue`，有的根本没有。permission_mode 映射过去，有的 CLI 会静默忽略，跑着跑着弹出交互确认，子进程就挂在那了。我花了差不多一周，才把前几家的事件流摸顺。

第二个坑是「可控」比「多开」难得多。

子任务跑飞了怎么办？槽位满了怎么排队？中途发现方向错了怎么插话？主 Agent 等结果时不能空转，也不能傻轮询把上下文撑爆。`wait_agent` 现在是短阻塞，返回摘要加存活证据 hint；skill 里还给了本地等待脚本，一次跑到终态，省 MCP 往返。

验证回投也是后来才补的。`verify_command` 加 `max_fix_attempts`，daemon 自己跑验证，失败就同 session 回投修复，只把最终结果交回主 Agent。早期没有这层时，主 Agent 会拿着半截结果继续往下拆，越拆越歪。有一次前端构建失败，子 Agent 交回来一句「已完成」，主 Agent 就开始写集成测试，白烧了两轮 token。

第三个教训就是不要默认拆。这事我自己踩过：改个 README 也走 orchestrator 一轮，协调开销比任务大。后来把 `estimate_complexity` 写成硬门槛，不判级不 spawn。

还有一类坑是 token。子 Agent 摘要太长，主 Agent 上下文很快被撑爆。我现在默认用 `summary_chars` 裁剪回传体积，`context_mode` 也尽量选 compact。读密集的探索类任务再加 `cache_ttl`，TTL 内重复查询是零 token。这些参数一开始我都嫌烦，用过几次被撑爆之后才老实。

还有调试成本。控制面做厚之后，出问题要同时看主 Agent、daemon 日志、子进程三头。这对个人项目偏重，我还在砍。

## 现在能干什么

写完之后，工作流变了。

以前是我自己盯终端。现在是我拆完，派出去，循环 wait，汇合。

一次典型跨文件重构：先 `estimate_complexity`，判成 L；再用 `orchestrate_task` 声明依赖 — 先改公共类型，再改调用方，最后 review。无依赖的扫描并行跑。每个子任务可以指定不同 CLI：读密集的丢给快的，深推理的丢给强的。不是「所有任务用同一个 CLI」，而是任务特征决定底座。

等待也有讲究。以前我会轮询 list_agents，现在基本只用 wait_agent 短阻塞，再加 skill 里的本地等待脚本跑到终态。轮询不仅费往返，还会把主 Agent 的上下文灌满无用状态。

中途发现范围写大了，`steer_agent` 直接插话收窄。跑挂了，超时兜住，session 还能 resume。要续上下文就 `followup_task`，挂起消息会合并进新 turn。

<figure class="illu">
  <img src="/citygenius-blog/assets/illu-agent-mcp.webp" alt="多个 Agent CLI 被收进同一个工作池" width="1536" height="922" loading="lazy" />
</figure>

另一类用法是长任务。Goal 会持续续播，Schedule 到点触发，同 tick 至多一个 Run。我用它盯过一次依赖升级：白天每隔一小时拉一次 CI 结果，失败就带日志回投，成功就把结论写进记忆银行。以前这种事要挂个脚本加邮件提醒，现在是一个 Schedule 加一条 memory。

跨厂商审查也有用。orchestrate_task 可以给某个子任务指定不同的 review CLI，同厂商会被拒。我一般让便宜快的底座先扫，再让另一家强底座做审查。简单场景够用，复杂合并还要再试。

适配器扩展也比想象中省事。有一款 CLI 不在内置列表里，我照着 `docs/custom-cli.md` 写了一份 JSON 配置，指定了命令模板和事件解析规则，没改核心代码就能 spawn。真正的成本在「搞清楚那家 CLI 到底吐什么」，不在接入层。

这套东西我每天都在用。589 个单测撑着日常改。DAG 编排、策略引擎、控制台都已能跑。它没有让我「多快好省」，但把我从盯终端里解放出来了。省下来的时间，大多又回到了拆任务和看结果上，这本来就是人该做的事。

如果你也在多个 CLI 之间来回切，可以先跑：

```bash
curl -fsSL https://raw.githubusercontent.com/37chengshan/agent-mcp/main/install.sh | bash
```

管道会直接跑远程脚本，先看一眼 `install.sh` 更稳妥。不想用一键脚本，`git clone` 加 `install.py --host all` 也行。装完 `python3 start_agent_mcp.py --open` 能打开监控页。

## 还差什么

项目还是 <em>alpha</em>，版本 v4.0.0a1。有些地方我必须说清楚。

它现在能撑住我自己的日常，但还没到能丢给同学就跑的程度。文档有，示例有，真正缺的是「第一次装完就能跑通一个像样任务」的顺滑路径。

适配器实测率还不均匀。内置 11 款能用，新接的一些 CLI 事件解析还没逐个校准，矩阵里仍有待验证项。Prime Agent 适配器按能力契约接上了，真实冒烟还没跑完。

沙箱目前主要是「统一策略意图翻译到各 CLI 自己的参数」，不是真隔离。SANDBOX_MAP 还没接到执行链，当前生效的是各适配器的 PERMISSION_FLAGS。容器沙箱要设 `AGENT_MCP_SANDBOX_IMAGE` 才启用，属于实验状态。

跨厂商审查和 worktree 在简单场景可用，复杂合并场景还要再踩。控制台三栏对单人项目也偏重。

调试体验也没到能推荐给同学的程度。出问题时日志分散在 daemon、子进程和主 Agent 三处，排查路径还不统一。我会先把这个补齐，再谈加功能。

另外，MCP 协议本身还在演进。我目前对齐了 MCP 2026-07-28 的规范，同时兼容 2025-11-25 和 2025-03-26 的客户端。协议一变，适配就要跟着动，这部分我会持续盯。

下一步优先三件：补适配器实测、把策略真正拦在执行点、简化上手路径。

主仓库在 [37chengshan/agent-mcp](https://github.com/37chengshan/agent-mcp)。欢迎提 issue，也欢迎直接骂。
