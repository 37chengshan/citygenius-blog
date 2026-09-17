---
title: "ompweb：给终端 Agent 做一个 Web 工作台"
description: "终端里的 coding agent 越用越顺，但会话一多就乱。记录 ompweb 的来龙去脉：怎么把 ~/.omp/agent/sessions/ 接到浏览器，Next.js、Electron、Session Tree、PTY 与 MCP 的取舍，以及踩过的坑。"
date: "2026.09.17"
readTime: "8 分钟阅读"
tag: "Agent 工具"
category: "AI"
tags: ["Agent", "Web UI", "Next.js", "Electron", "MCP", "PTY"]
tagFilters:
  "Agent": "ai"
  "Web UI": "full-stack"
  "Next.js": "full-stack"
  "Electron": "full-stack"
  "MCP": "ai"
  "PTY": "full-stack"
image: "illu-ompweb.webp"
imageAlt: "Agent Web 工作区插画"
imageWidth: 1536
imageHeight: 922
badge: "Project"
sideNote: "ompweb · oh-my-pi ·<br/>Next.js · Electron · PTY · MCP"
caption: "<b>Local-first agent workspace.</b>(CityGenius, MMXXVI)"
authorMeta: "大学生 · 全栈开发者 · Agent 工具折腾者"
featured: false
related:
  - date: "2026.09.10"
    title: "Agent-MCP：把多个 CLI Agent 收进一个控制面"
    desc: "从「派发 → 监控 → 续接 → 终止」的工作池出发，记录 agent-mcp 的调度模型与 MCP 接入方式。"
    tag: "Agent · MCP"
    slug: "project-agent-mcp"
  - date: "2026.08.28"
    title: "d-token：给 AI Coding Agent 做上下文控制面"
    desc: "路由、回执、按 Agent 授权，以及一次实测省下三万多 token 的过程。"
    tag: "Agent · 上下文"
    slug: "project-d-token"
  - date: "2026.05.15"
    title: "用 Vibe Coding 三天搞定一个全栈 AI 应用"
    desc: "从想法到上线，记录 scholar-ai 的开发过程。"
    tag: "Vibe Coding · 全栈"
    slug: "vibe-coding-3-days"
---

## 起点：终端 Agent 其实「够用」，但不够「好用」

我用 [oh-my-pi](https://github.com/can1357/oh-my-pi)（命令行里叫 `omp`）写代码已经有一阵子了。终端本身完全够跑任务：模型能调、工具能执行、会话也存在本地。真正难受的是另一件事——**信息都埋在滚动的文本里**。

开三个终端窗口对应三个项目是常态。想找上周某次「从这里继续」的分叉点，只能靠 `grep` 会话文件。子 Agent 在后台跑到哪一步、烧了多少 token，基本靠猜。PTY 一多，窗口布局本身就变成负担。

更具体一点：期末前我同时改一个课程大作业和两个 side project。主对话跑着重构，子 Agent 在扫依赖，Git worktree 又切到另一条分支。终端不是不能用，是我需要同时看见四件事的进度，而一个滚动缓冲区只能看见最后二十行。

终端 Agent 的瓶颈不在智能，在**可观察性和可导航性**。于是就有了 ompweb：一个本地优先的 Web / 桌面工作台，专门服务 omp，不另起炉灶再造一个 Agent 运行时。

<div class="info-card">
<div class="ic-title">项目概览</div>
<ul>
<li><strong>项目名：</strong>ompweb</li>
<li><strong>定位：</strong>oh-my-pi 的 Web UI 与原生桌面客户端</li>
<li><strong>技术栈：</strong>Next.js 16 / React 19 · Electron 44 · Node.js 22+ · Rust 原生宿主进程</li>
<li><strong>核心能力：</strong>Session Tree · Web PTY · 多 Agent 编排 · MCP / Skill 管理 · Git Worktree</li>
<li><strong>仓库：</strong><a href="https://github.com/37chengshan/ompweb" target="_blank" rel="noreferrer noopener">37chengshan/ompweb</a>（MIT）</li>
</ul>
</div>

## 关键决定：不重写 Agent，只读它的会话文件

ompweb 最重要的架构原则是一句话：**OMP 仍然是唯一权威**。会话、凭证、模型配置、插件，全部属于用户本机已安装的 `omp` 和 `~/.omp/agent/`。UI 不建第二套数据格式，也不碰 `agent.db` 里的鉴权数据。

这条边界不是洁癖。我自己就走过弯路：早期想给会话加「草稿层」，结果和正在写 JSONL 的活进程抢文件，分支一乱整条历史都不可信。后来规则变死——浏览走磁盘，执行走 RPC，写操作尽量窄。

具体接法很朴素：

1. **浏览**：用纯 Node 直接解析 `~/.omp/agent/sessions/` 下的 JSONL（以及 `archive/sessions/` 的 gzip 归档），从 entry 树里还原当前分支上下文。
2. **执行**：每个活跃会话对应一个 `omp --mode rpc-ui` 子进程，走 NDJSON over stdio。真正改会话状态的动作一律经 RPC，避免和正在写文件的活进程抢写。
3. **展示**：浏览器侧用 HTTP / SSE 收流式状态；会话读取走投影缓存，侧边栏、分支树、token 遥测都能实时跟上。

这里有个绕不开的技术约束：OMP 的 SDK 包是 Bun-only 的 TypeScript，直接 `import` 进 Node/Next 服务端会跑不起来。所以生产代码刻意**不依赖**这些包，只认 CLI 边界和磁盘上的公开格式。能做就做，做不了就先不做，而不是偷偷模拟一份。

顺带说明来源：这个 UI 不是从零长出来的。它源自 [agegr/pi-web](https://github.com/agegr/pi-web)（MIT），ompweb 作为面向 OMP 的下游继续维护——保留许可与署名，选择性吸收上游修复，但不会假设 Pi 专用的实现能原样 merge。

## 架构：Next.js 一套代码，Web 和桌面共用

对外有三种启动方式：`npx @37chengshan/ompweb@latest` 直接开浏览器（默认 `127.0.0.1:30177`）、Electron 打包成带托盘的桌面应用、或者克隆仓库 `npm run dev` 本地改。

<figure class="illu">
  <img src="/citygenius-blog/assets/illu-ompweb.webp" alt="插图" width="1536" height="922" loading="lazy" />
</figure>

<figure class="illu method">
  <img src="/citygenius-blog/assets/diagram-ompweb.webp" alt="方法论示意" width="1536" height="922" loading="lazy" />
  <figcaption>结构示意</figcaption>
</figure>

功能上我最在意四块：

- **Session Tree / 分支导航**：按项目根自动归组会话，能在历史 turn 点上「Continue from here」，也能把某条用户消息 fork 成独立会话文件，原对话不动。
- **Web PTY**：`node-pty` 分配真 shell（macOS/Linux 的 zsh/bash，Windows 的 cmd），ANSI 256 色、Tab 补全、光标键都能用。为了不让页面玩坏本机，做了 FIFO 按键队列、5 秒 AbortSignal 超时，全局最多 8 个并发会话，闲置 30 分钟自动回收。
- **多 Agent 与 Plan 看板**：输入框上方钉住 todo 网格，子 Agent 运行时有脉冲指示，能看当前工具调用、token、费用和重试；内置的 Agent-MCP 编排器支持十余种 CLI 与角色化 system prompt。
- **可视化 MCP / Skill Hub**：MCP 配置同时提供表单和 Raw JSON 两种编辑器，内置 Python stdio、NPX、Remote HTTP 等模板；Skill 扫描本地 `.omp/skills`，也能在线搜一键安装。

后来为了性能和资源边界，又加了一层 **Rust 原生宿主进程（ompweb-host）**：Git diff/status、PTY、会话扫描投影、配置代理、omp 进程监督都下沉过去，经 Unix Domain Socket / Named Pipe 走有界 NDJSON IPC。浏览器仍然是默认只绑 loopback，暴露到局域网要显式选择，远程访问则走 HMAC 挑战和密码门。

## 踩坑记录

- **不要和活进程抢写会话文件**。直接改 JSONL 很爽，直到某个会话正在被 `omp` 写入。现在的规则是：重命名/归档/删除这类窄写操作要么先停掉对应进程，要么走 RPC。
- **SSE 与真实状态要对账**。后台标签页很容易停留在「还在跑」的假状态。UI 必须用 RPC 状态去 reconcile 事件流，而不是只信推送。
- **文件 API 不能变成通用资源管理器**。路径必须 canonicalize，限制在已注册项目、有效 worktree 和会话引用目录内，专门挡 traversal 和 symlink 逃逸。
- **安全默认值要「无聊」**。默认 loopback、可选密码 + 签名 Cookie、不把浏览器请求直接变成宿主任意命令执行——这些听起来保守，但本地 Agent UI 出事就是本机沦陷。

## 现状

目前 ompweb 已经能在 Web 模式和 Electron 桌面端稳定使用：会话树、分支 fork、PTY、Git worktree 切换、富媒体预览（代码高亮 / KaTeX / Mermaid / PDF / DOCX）、主题工作室和中英日三语都在。质量侧有 450+ 单测，`npm run release:check` 串起 typecheck、lint、test 和 build。

日常我更多用 Web 模式：一条 `npx` 命令起来，浏览器标签就是工作台；需要托盘常驻和独立窗口时再切桌面端。

对我来说，这个项目真正验证的是一件事：**给终端 Agent 做界面，价值不在「把命令行包一层皮」，而在把本地已有的状态变成可导航、可分支、可观测的工作空间。** Agent 仍然是那个 Agent，我只是终于能看见它在干什么了。
