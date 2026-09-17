---
title: "eduevidence：没有证据，就不设计新<em>研究</em>"
description: "核心是证据纪律：检索片段只是定位器，不是证据。九阶段协议 + 不可变 Evidence Graph，输出 ADOPT / PILOT / REJECT / 证据不足。"
date: "2026.09.17"
readTime: "12 分钟阅读"
tag: "EduEvidence"
category: "AI"
tags: ["EduEvidence", "Skill", "Evidence", "教育", "研究方法"]
tagFilters:
  "EduEvidence": "ai"
  "Skill": "ai"
  "Evidence": "ai"
  "教育": "ai"
  "研究方法": "ai"
image: "illu-eduevidence.webp"
imageAlt: "EduEvidence 研究引擎"
imageWidth: 1536
imageHeight: 922
badge: "EduEvidence"
sideNote: "EduEvidence · Research Engine ·<br/>nine-stage · graph · ADOPT"
caption: "<b>From question to decision.</b>(CityGenius, MMXXVI)"
authorMeta: "大学生 · 全栈开发者 · AI 工具链探索者"
featured: false
related:
  - date: "2026.09.17"
    title: "agent-mcp：把各种 Agent CLI 收进一个工作池"
    desc: "控制面统一派发与容错。"
    tag: "Agent MCP · AI"
    slug: "project-agent-mcp"
  - date: "2026.05.28"
    title: "把 Agent Skill 当成可复用教案来写"
    desc: "工作流写成 Skill，少解释一遍是一遍。"
    tag: "Agent Skill · AI"
    slug: "agent-skill-as-lesson-plan"
  - date: "2026.05.21"
    title: "从桌面应用到 Claude Skill"
    desc: "把复杂应用能力压缩成可复用 Skill。"
    tag: "Claude Code · Skill"
    slug: "open-design-to-skill"
---

有人问：要不要给学生上 AI 编程助手？

让模型直接答，它会给你一段听起来很顺的话：提效、个性化、未来已来。翻文献又是另一回事——CHI 2023 有 1.15× / 1.8× 的对照，也有「一周后无显著差距」；PNAS 2025 在无监督考试里测到 −17%。

**AI 不缺搜索，缺的是证据纪律。**

EduEvidence 要做的，是把「决策问题」变成「有证据支撑、可试点、可评估」的答案，而不是一段更长的摘要。

README 的产品句是：**From Research Questions to Evidence-Based Decisions.**

交付形态是 **AI Agent Skill**；Skill 里面跑的是 **EduEvidence Research Engine**——持久、可审计，把决策问题压成证据接地的回答。

三条冻结原则：

1. **检索片段只是定位器，不是证据。**  
   OpenAlex / Semantic Scholar / Sciverse 给你的是线索；要成为证据，必须进入可追溯的引用链。

2. **没有证据接地的 Knowledge Gap，就不允许设计新研究。**  
   冻结科学规则：study design 必须显式引用已接地的 Gap ID。

3. **`result.json` / HTML / Markdown 是投影，不是事实库。**  
   真正的事实层是 **Evidence Graph** 的版本化、不可变 revision。

输出也不是「允许 / 禁止」二值，而是四态：

**ADOPT / PILOT / REJECT / INSUFFICIENT EVIDENCE**，外加可执行的干预与评估计划。

<figure class="illu method">
  <img src="/citygenius-blog/assets/real-edu-workflow.svg" alt="EduEvidence 研究工作流" width="1400" height="800" loading="lazy" />
  <figcaption>完整研究周期：从问题框定到证据接地的决策更新。</figcaption>
</figure>

## 问题

教育决策有三个坑：

- **引用像真的**：年份、期刊、结论都对得上，细节却经不起核对
- **把相关当因果**：「用了分数提高」往往只是选择偏差
- **跳过适用边界**：对谁有效、在什么条件下失效，常常被抹掉

CHI 2023 和 PNAS 2025 这类真实研究提醒我们：AI 辅助编码在短任务上可能提效，在迁移与无监督场景也可能拖后腿。没有边界条件的「全面提效」是不可用的决策输入。

## 方法

引擎把完整研究周期拆开：

- **Research Core**：框定问题 → 检索 → 证据分级 → Gap → 综合
- **Decision Extension**：方案 → 试点设计 → 评估 → 更新决策

三条公开工作流：

| 工作流 | 回答什么 |
|--------|----------|
| Evidence Review | 现有证据支持什么、不能支持什么 |
| Decision & Pilot | 怎么试点、怎么验证 |
| Evaluate & Update | 新数据如何改写决策 |

多域靠**契约**而不是复制引擎：`education` 与 `policy` 各自声明 frame schema、outcome taxonomy、方法清单；未知 token **fail closed**。

<figure class="illu method">
  <img src="/citygenius-blog/assets/real-edu-graph.webp" alt="Evidence Graph 与 Studio" width="1400" height="952" loading="lazy" />
  <figcaption>Evidence Graph 与报告库；图 revision 不可变，报告为投影。</figcaption>
</figure>

## 做法

安装后，Claude Code / Cursor / Codex / OMP 等宿主可以在「教学决策」类问题上自动加载 Skill。

```bash
npm install -g eduevidence
eduevidence skill --host claude
```

Native Core **只依赖 Python 标准库**，不需要 Agent MCP，也不需要 daemon。这是刻意的：研究引擎不该绑死在某一个编排框架上。

检索通道分零配置（OpenAlex / Semantic Scholar / CrossRef…）与密钥通道（Sciverse 等）。Sciverse 用来拿引用级定位；再进 Graph 做结构化。

## 结果

- **Benchmark 仿真 ≠ 实证。** `benchmarks/results/` 只是模拟 harness；第一轮实证是 B2 vs B3（10 题 × 3 重复），不能写成「全面碾压」。
- **四态比二值难卖，但更有用。** 「证据不足」是合法结论，不是失败。
- **投影可变，事实层不可变。** 报告可以重排；Graph revision 一旦落地就不该被悄悄改写。

当前 **6.2.0**。Landing / Research Studio / Deep Research 对比页都可以直接打开。示例报告：

```bash
open examples/ai-coding-assistant-evidence/EduEvidence_Report.html
```

它不会替你做教育决策。它只保证：在你说「上」或「不上」之前，证据从哪来、Gap 是什么、试点怎么验——写清楚。

主仓库：[37chengshan/eduevidence](https://github.com/37chengshan/eduevidence)。
