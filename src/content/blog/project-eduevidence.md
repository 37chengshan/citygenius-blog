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
image: "diagram-eduevidence.webp"
imageAlt: "证据研究引擎插画"
imageWidth: 1536
imageHeight: 1024
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

## 想法：AI 不是缺搜索，是缺<em>证据纪律</em>

我经常拿大模型问这类问题：「大一 C 语言课，到底该不该允许学生用 AI 编程助手？」

模型通常不会卡住。它会搜几篇文章，总结正反观点，然后给一个听起来很稳的建议。问题在于：任务完成更快，不等于真正学会编程；短期作业分数上去，不等于一周后还能独立写出来。教育研究里这类坑太多了，而通用 Agent 几乎默认会把「任务表现」当成「学习效果」。

EduEvidence 的起点就一句话：我不想再让模型自由发挥研究结论。我想把「从决策问题到有边界的证据答案」这条路径，做成一条**可以审、可以质疑、可以复现**的工作流。

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

## 实现路径：先定契约，再谈 Agent

<figure class="illu method">
  <img src="/citygenius-blog/assets/diagram-eduevidence.webp" alt="证据检索与 Evidence Graph" width="1536" height="1024" loading="lazy" />
  <figcaption>检索片段只是线索，证据必须可追溯。</figcaption>
</figure>

一开始我也想「让多个 Agent 分工调研」。后来发现方向反了——多 Agent 只是执行方式，真正难的是**中间产物长什么样、什么算合格**。

所以实现顺序是：

1. **把流程写死成协议。** 不是「请认真做研究」，而是固定九步，每步有输入输出。角色协议写在 `skill/agents/` 里，能力边界也写清楚。
2. **每步产物进 JSON Schema。** `schemas/` 里是硬契约；`validate_schema.py` 校验不通过就停，不通过就别往下走。frame、evidence、verdict、intervention、evaluation 各有各的 schema。
3. **确定性逻辑交给脚本，判断交给模型。** 打分、证据矩阵、Confidence、引用审计、报告渲染都在 `scripts/` / `visualization/`；模型负责检索解释和角色判断，但不能直接编一个高置信结论。
4. **领域用注册表约束。** `domains/` 里教育域和政策域各自声明 frame schema、outcome 分类和方法学清单。未知 domain 或未知 token 直接 fail closed。
5. **最后才包成 Skill。** `SKILL.md` 是入口，宿主 Agent 读到教学决策类问题时装载它。单 Agent 可以顺序跑完九步；Agent MCP（多 Agent）只是增强层，不是前提。

这个顺序的好处很实在：你换模型、换宿主、甚至关掉多 Agent，方法论本身还在。

## 九阶段协议和 Evidence Graph 怎么落地

九阶段可以粗分成「研究」和「行动」两段：

```text
Frame → Retrieve → Extract → Challenge → Audit → Adjudicate
→ Applicability → Intervene → Evaluate
```

- **Frame**：先把问题框住（学习者 / 干预 / 对照 / 结果指标 / 场景）。教育域和政策域各有一套 frame schema。
- **Retrieve / Extract**：不只找支持证据，还独立找反方、null 结果。检索片段只是 locator，不是证据本身。
- **Challenge / Audit**：Skeptic 固定反证检查 + Method Reviewer 方法学清单。这里专门盯「任务表现 ≠ 学习」。
- **Adjudicate**：Evidence Tribunal 做裁决，输出支持 / 不确定 / 冲突的 claim，以及冲突来自样本、测量还是设计。
- **Applicability / Intervene / Evaluate**：不停在「研究显示……」，必须接到适用范围、最小可行试点和评价计划。

结果也不是「允许 / 禁止」，而是四态：**ADOPT / PILOT / REJECT / INSUFFICIENT EVIDENCE**。

Evidence Graph 是另一条主线。长期 Project 有版本化、不可变的图修订；`result.json` 和 HTML 报告只是投影，不是事实源。你可以在 Studio 里从来源追到 finding、再到 claim。这样改结论时，不会静默改历史。

公开主 demo 就是那个 C 语言课问题：证据里任务完成率和正确率确实上升，但一周保持测试差异不显著，且无护栏使用有独立考试受损的记录。所以结论停在 **PILOT**——不是因为流程跑不完，而是证据本身只支撑到这里。

Outcome Separation 在这里特别关键。教育域把结果拆成学习、任务、过程、风险四类 token：Retention 和 Transfer 归学习，Completion Time 和 Assignment Score 归任务，AI Dependency 归风险。裁决时如果主结果是学习类，却只有任务类证据，Confidence 就会被规则压住，而不是让模型自己「感觉良好」。

## 教训：工程诚实比「看起来很强」重要

踩过最大的几个坑：

- **Schema 必须 fail closed。** 未注册的 outcome token 直接拒绝，而不是默默归成「学习效果」。模型产物最容易在这里偷懒：长文本写进本该是枚举的字段，snippet 冒充证据条目。
- **Gate 要真拦人。** Pre-Verdict Gate 会拦下「自由文本冒充枚举」「snippet 当证据」这类违规。没有门禁的流程只是表演。有一次全流程跑下来，gate 一口气拦了七八处角色产物契约问题——这才证明门禁有用。
- **Benchmark 别吹。** 模拟结果只能证明评测框架能跑，不能证明模型效果。我宁可写清楚「第一轮实测刚启动、覆盖有限、指标还是启发式」，也不做超额宣称。
- **渲染报告 ≠ 跑完全流程。** 有一份漂亮的 HTML，不代表九阶段都被真实执行过。`data_origin` 这类元数据必须说实话：人工整理的 pack 和真实检索跑出来的 pack 要分开标。
- **检索片段不是证据。** 学术检索返回的一段摘要只能当 locator，必须展开、校验、通过质量门之后，才能进入抽取。这条写进了机器规则，不靠自觉。

写 EduEvidence 的过程，其实是在给自己的研究习惯上锁：先框问题，再找反证，再划 Can Claim / Cannot Claim 的边界，最后才谈落地。它不会让你变成更好的研究者，但能让一条证据链在被人质疑时站得住。

如果你也常让 AI 做文献综述或方案选型，不妨把它当一条流水线来搭：先定产物契约，再让 Agent 在契约里干活。工具可以换，契约和边界不该丢。
