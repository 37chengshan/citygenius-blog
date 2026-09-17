---
title: "EduEvidence：把教学决策问题做成一条可追溯的证据流水线"
description: "从「AI 总爱拍脑袋给教学建议」出发，记录 EduEvidence 的想法、实现路径，以及九阶段协议和 Evidence Graph 如何落地。它是一个 Agent Skill 与研究工作流引擎，不是同行评审级研究工具。"
date: "2026.09.17"
readTime: "9 分钟阅读"
tag: "Agent Skill"
category: "AI"
tags: ["Agent Skill", "研究工作流", "教育决策", "Evidence Graph", "Python"]
tagFilters:
  "Agent Skill": "ai"
  "研究工作流": "ai"
  "教育决策": "ai"
  "Evidence Graph": "ai"
  "Python": "full-stack"
image: "illu-eduevidence.webp"
imageAlt: "证据研究引擎插画"
imageWidth: 1536
imageHeight: 922
badge: "Project"
sideNote: "EduEvidence · Skill ·<br/>Nine-Stage · Evidence Graph"
caption: "<b>Evidence research engine.</b>(CityGenius, MMXXVI)"
authorMeta: "大学生 · 全栈开发者 · 研究工具链折腾者"
featured: false
related:
  - date: "2026.05.15"
    title: "用 Vibe Coding 三天搞定一个全栈 AI 应用"
    desc: "从想法到上线，记录 scholar-ai 的开发过程。"
    tag: "Vibe Coding · AI"
    slug: "vibe-coding-3-days"
  - date: "2026.05.21"
    title: "从桌面应用到 Claude Skill：如何提炼设计系统的可复用逻辑"
    desc: "以 Open Design 为例，把复杂应用提炼成结构清晰的 Skill。"
    tag: "Claude Code · Skill"
    slug: "open-design-to-skill"
  - date: "2026.06.10"
    title: "Agent MCP：多 Agent 协作的可控执行"
    desc: "从单 Agent 到受控多 Agent 的工程取舍。"
    tag: "Agent · MCP"
    slug: "project-agent-mcp"
---

上周我又拿大模型问了一遍：「大一 C 语言课，到底该不该允许学生用 AI 编程助手？」

它没卡住。搜了几篇，总结正反观点，最后给了一条听起来很稳的建议：允许，但要写规范。语气像已经替你想清楚了。

我不太信。CHI 2023 那组实验里，用 AI 助手后任务完成率大约 1.15 倍、正确率大约 1.8 倍，一周后的保持测试却没有显著差异。PNAS 2025 更直接——无护栏使用时，独立考试成绩大约 −17%。任务做完了，不等于学会了。

通用 Agent 几乎默认把「任务表现」当成「学习效果」。这不是搜索不够勤，是缺一套证据纪律。

<figure class="illu">
  <img src="/citygenius-blog/assets/illu-eduevidence.webp" alt="插图" width="1536" height="922" loading="lazy" />
</figure>

## 问题：AI 不缺搜索，缺可审的证据链

教育决策类问题有个共同难点：结论很容易写满，证据却往往只撑得住一半。

「允许用 AI」——对谁？哪门课？看哪个结果指标？一周后还能独立写出来吗？没有 AI 时会不会更差？这些不问清楚，建议就只是文案。

我想做的事很简单：把「从决策问题到有边界答案」做成一条**可以审、可以质疑、可以复现**的工作流。中间产物、合格标准、失败条件都写死。

先说清楚它是什么，免得误会：

<div class="info-card">
<div class="ic-title">项目定位（别当论文工厂）</div>
<ul>
<li><strong>形态：</strong>一个 <strong>AI Agent Skill</strong> + 内部的 EduEvidence Research Engine</li>
<li><strong>职责：</strong>把研究工作流工程化：检索、抽取、反证、方法学审查、裁决、试点设计</li>
<li><strong>不是：</strong>同行评审工具，也不是自动替老师做最终决定的系统</li>
<li><strong>技术：</strong>Python 3.10+，Native Core 只依赖标准库；可 npm 装进 Claude Code / Cursor / Codex 等宿主</li>
<li><strong>仓库：</strong><a href="https://github.com/37chengshan/eduevidence" target="_blank" rel="noreferrer noopener">37chengshan/eduevidence</a> · <a href="https://37chengshan.github.io/eduevidence/" target="_blank" rel="noreferrer noopener">在线介绍页</a></li>
</ul>
</div>

## 方法：先定契约，再谈 Agent

<figure class="illu method">
  <img src="/citygenius-blog/assets/diagram-eduevidence.webp" alt="方法论示意" width="1536" height="922" loading="lazy" />
  <figcaption>结构示意：九阶段协议与 Evidence Graph</figcaption>
</figure>

一开始我也想「让多个 Agent 分工调研」。后来发现方向反了——多 Agent 只是执行方式，真正难的是**中间产物长什么样、什么算合格**。

实现顺序大致是：

1. **把流程写成协议。** 固定九阶段（nine-stage），每步有输入输出。角色协议在 `skill/agents/`，能力边界写清楚。
2. **每步产物进 JSON Schema。** `schemas/` 是硬契约；校验不过就停。frame、evidence、verdict、intervention、evaluation 各有各的 schema。
3. **确定性逻辑交给脚本，判断交给模型。** 打分、证据矩阵、Confidence、引用审计、报告渲染在 `scripts/` / `visualization/`；模型不能直接编一个高置信结论。
4. **领域用注册表约束。** `domains/` 里教育域和政策域各自声明 frame schema、outcome taxonomy 和方法学清单。未知 domain 或未知 token 直接 fail closed。
5. **最后才包成 Skill。** `SKILL.md` 是入口。单 Agent 可以顺序跑完九步；Agent MCP 只是增强层，不是前提。

九阶段可以粗分成「研究」和「行动」两段：

```text
Frame → Retrieve → Extract → Challenge → Audit → Adjudicate
→ Applicability → Intervene → Evaluate
```

- **Frame**：先把问题框住——学习者 / 干预 / 对照 / 结果指标 / 场景。
- **Retrieve / Extract**：不只找支持证据，还独立找反方、null 结果。检索片段只是 locator，不是证据本身。
- **Challenge / Audit**：Skeptic 固定反证检查 + Method Reviewer 方法学清单。专门盯「任务表现 ≠ 学习」。
- **Adjudicate**：Evidence Tribunal 裁决，输出支持 / 不确定 / 冲突的 claim，以及冲突来自样本、测量还是设计。
- **Applicability / Intervene / Evaluate**：不停在「研究显示……」，必须接到适用范围、最小可行试点和评价计划。

结果也不是「允许 / 禁止」，而是四态：**ADOPT / PILOT / REJECT / INSUFFICIENT EVIDENCE**。

Evidence Graph 是另一条主线。长期 Project 有版本化、不可变的图修订；`result.json` 和 HTML 只是投影，不是事实源。可以在 Studio 里从来源追到 finding、再到 claim。改结论时，不会静默改历史。

还有一条后来我觉得特别硬的规则：**no design without gap**。任何新研究设计，必须引用显式、有证据奠基的 Knowledge Gap ID。不许「感觉该做一个实验」就直接开题。

Outcome Separation 也写进了规则。教育域把结果拆成学习、任务、过程、风险四类 token：Retention 和 Transfer 归学习，Completion Time 和 Assignment Score 归任务，AI Dependency 归风险。主结果是学习类、证据却只有任务类时，Confidence 会被规则压住，而不是让模型自己「感觉良好」。

## 落地：主 demo 停在 PILOT，不是因为流程没跑完

公开主 demo 就是那个 C 语言课问题。

证据里任务完成率和正确率确实上升；一周保持测试差异不显著；无护栏使用有独立考试受损的记录。所以结论停在 **PILOT**——不是因为流程跑不完，而是证据本身只支撑到这里。干预是四阶段小规模试点：先打独立基础，再「解释而不是代写」，再结构化协作，最后做迁移检查。评价区分无 AI 基线、后测、期末保持和无 AI 迁移任务。

另外两个公开例子更能说明边界。企业客服走政策域，直接证据和间接证据分开标，监督式试点还没真跑。间隔提取练习是第一个用 Sciverse 通道跑出来的包，`data_origin` 是 `real_run_sciverse`，结论是 **ADOPT**——Retention 和 Transfer 都有直接、方向一致的证据。ADOPT 路径可达，只是不能靠嘴说。

工程上最后装成一个可安装的 Skill：

```bash
npm install -g eduevidence
eduevidence skill --host claude
```

本地还能起 Research Studio：从 source 追到 finding、claim。报告有中英双语和五套主题，数字要和 `result.json` 对得上，对不上就 `REPORT_INVALID`，不发布。

Benchmark 只能说诚实的部分：`benchmarks/results/` 是确定性模拟，只证明评测框架能跑。第一轮 B2 vs B3 实测刚启动，10 道题 × 3 次重复，指标还是启发式。跑完并审完之前，我不做「显著更强」这种宣称。

## 教训：工程诚实比「看起来很强」重要

踩过最大的几个坑：

- **Schema 必须 fail closed。** 未注册的 outcome token 直接拒绝，而不是默默归成「学习效果」。模型最容易在这里偷懒：长文本写进枚举字段，snippet 冒充证据条目。
- **Gate 要真拦人。** Pre-Verdict Gate 会拦下「自由文本冒充枚举」「snippet 当证据」。没有门禁的流程只是表演。有一次跑完，gate 一口气拦了七八处契约问题——这才证明门禁有用。
- **检索片段不是证据。** 摘要只能当 locator，必须展开、校验、过质量门之后才能进入抽取。这条写进了机器规则，不靠自觉。
- **渲染报告 ≠ 跑完全流程。** 漂亮 HTML 不代表九阶段都被真实执行过。`data_origin` 必须说实话：人工整理的 pack 和真实检索跑出来的 pack 要分开标。
- **不要默认多 Agent。** Platform Native 单 Agent 顺序跑完九步就够用。Agent MCP 是增强，不是门面。

写 EduEvidence 的过程，其实是在给自己的研究习惯上锁：先框问题，再找反证，再划 Can Claim / Cannot Claim 的边界，最后才谈落地。它不会让你自动变成更好的研究者，但能让一条证据链在被人质疑时站得住。

## 现状：能跑，边界也写在脸上

当前版本大约 6.2.0，多域注册表已经有教育和政策。三条公开工作流是 Evidence Review、Decision & Pilot、Evaluate & Update。Native Core 保持标准库依赖。

它现在能做的事，可以概括成六问：证据支持什么、不能支持什么、冲突从哪来、对谁在什么条件下适用、怎样低风险试点、实施后怎么验证。

不能做的事也要写清楚：它不替老师或学校做最终决定；高风险评估、纪律处分、个体心理判断、重大教育机会分配，都不该交给它自动拍板。检索失败时宁可 `TOOL_FAILURE`，也不编造来源。

下一步优先两块：把经验 benchmark 做实——完整 30 题、B3 vs B4、方差和金标独立评分；再把 **PILOT → 真实数据 → 再裁决** 这条竖向回路跑通，把试点结果回注进证据图，再产出更新后的决策。

如果你也常让 AI 做文献综述或方案选型，不妨把它当一条流水线来搭：先定产物契约，再让 Agent 在契约里干活。工具可以换，契约和边界不该丢。
