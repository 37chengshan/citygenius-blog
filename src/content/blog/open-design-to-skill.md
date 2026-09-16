---
title: "从桌面应用到 Claude Skill：如何提炼设计系统的可复用逻辑"
description: "以 Open Design 为例，讲解如何将一个包含 149 个设计系统、110 个模板、11 套工艺规范的应用，拆解为一个结构清晰的 Claude Code Skill。核心思路：三轴组合、六段拼装、顾问式交互。"
date: "2026.05.21"
readTime: "10 分钟阅读"
tag: "Claude Code"
category: "AI"
tags: ["Claude Code", "Skill", "设计系统", "Prompt Engineering", "Open Design"]
tagFilters:
  "Claude Code": "ai"
  "Skill": "ai"
  "设计系统": "design"
  "Prompt Engineering": "ai"
  "Open Design": "design"
image: "lab-5.webp"
imageAlt: "Open Design to Claude Skill article cover"
imageWidth: 904
imageHeight: 1740
badge: "Claude Code"
sideNote: "Open Design · Skill ·<br/>Design System · Prompt"
caption: "<b>Design system distillation.</b>(CityGenius, MMXXVI)"
authorMeta: "大学生 · 全栈开发者 · AI 工具链探索者"
featured: false
related:
  - date: "2026.05.15"
    title: "用 Vibe Coding 三天搞定一个全栈 AI 应用"
    desc: "从想法到上线，记录 scholar-ai 的开发过程。"
    tag: "Vibe Coding · AI"
    slug: "vibe-coding-3-days"
  - date: "2026.05.08"
    title: "SwiftUI 与 AppKit 的取舍"
    desc: "桌面原生工具里的边界判断。"
    tag: "macOS · Swift"
    slug: "swiftui-appkit"
---

## 一个应用装了 149 套<em>设计语言</em>

Open Design 是一个 macOS 桌面应用，做的事情很直接：你告诉它要做什么类型的页面，它帮你组合出一个品牌一致的 HTML 产物。它的内部有三个仓库 — 149 个品牌设计系统、110 个页面模板、11 套通用工艺规范。每次生成，就是从这三个轴各取一个，拼装成最终输出。

问题是：这套逻辑能不能搬到 Claude Code 里，变成一个 Skill？

答案是可以，而且效果出奇地好。但过程不是简单地"把功能搬过来"，而是要重新理解它的设计模式，然后用 Claude 的原生能力重新表达。

## 先搞清楚它的<em>三轴架构</em>

Open Design 的核心是一个三轴组合系统：

<div class="info-card">
<div class="ic-title">三轴组合</div>
<ul>
<li><strong>设计系统（外观）</strong> — 149 个品牌的视觉语言，每个品牌一个 DESIGN.md，定义色彩、排版、组件、布局等 9 个维度</li>
<li><strong>模板（形态）</strong> — 110 个页面类型，从 SaaS 落地页到仪表盘到幻灯片，每个模板一个 SKILL.md</li>
<li><strong>工艺规范（质量）</strong> — 11 套通用规则：排版、配色、反 AI 味、状态覆盖、无障碍等</li>
</ul>
</div>

这三个轴的关系很清晰：设计系统决定"用什么 token"，工艺规范决定"怎么用这些 token"，模板决定"输出什么形态"。冲突时品牌优先，工艺补充品牌没覆盖的部分。

这个架构本身就是一种设计模式 — **关注点分离**。品牌视觉和通用质量约束解耦，模板形态和具体内容解耦。理解了这一点，才能正确地把它转化为 Skill。

## 提炼的第一步：<em>识别核心模式</em>

在动手写 Skill 之前，我花了大量时间阅读 Open Design 的源码。不是为了逐行复制，而是为了找到它的核心设计模式。

### 模式一：六段拼装

Open Design 的 daemon 用 `composeSystemPrompt()` 构建系统提示词，把六个部分按顺序拼接：

```text
1. Identity & Workflow — 定义 agent 角色和工作流
2. Active Design System — 当前品牌的 DESIGN.md 全文
3. Active Craft References — 当前模板需要的工艺规范
4. Active Template Skill — 当前模板的 SKILL.md 工作流
5. Project Metadata — 模式、平台、场景等元信息
6. Output Contract — HTML 输出格式约定
```

这个模式的关键在于：**每个部分独立、可替换、有明确职责**。在 Claude Skill 中，不需要真的拼成一个字符串 — agent 通过 Read 工具分别读取这些文件，效果等价。

### 模式二：顾问式交互

Open Design 不是一个"选菜单"式的工具。它的交互流程是：

```text
方向 → 5 个深入问题 → 智能推荐 → 确认 → 构建
```

5 个问题覆盖：内容、受众、视觉风格、品牌偏好、规模。然后用一个匹配算法对模板和设计系统评分，推荐 Top 3 组合。

这个模式的价值在于：**它把选择权交给用户，但用算法缩小选择范围**。在 Skill 中，这个流程用 `AskUserQuestion` 工具原生实现。

### 模式三：Token 预览硬门控

在构建之前，Open Design 会展示一个 Token 预览：背景色、强调色、字体。用户必须明确说"开始"才执行生成。

这是一个 **HARD-GATE** 模式 — 用确认步骤防止浪费 token。在 Claude Skill 中，这个逻辑用条件判断实现。

## Skill 的<em>实际结构</em>

把这三个模式落地为 Claude Skill，最终结构如下：

```yaml
---
name: open-design
description: |
  Use when the user wants to generate brand-consistent web artifacts
  using Open Design's three-axis composition system.
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Grep
  - Glob
  - AskUserQuestion
---
```

Frontmatter 定义了 Skill 的元信息和可用工具。`allowed-tools` 很关键 — 它限制了 Skill 能调用的能力边界。

正文分为几个核心部分：

**1. Identity** — 定义 agent 角色为"设计顾问"，不是菜单选择器。

**2. Resource Map** — 指向应用内的资源路径：

```text
OD = /Applications/Open Design.app/Contents/Resources/open-design
$OD/design-systems/<brand>/DESIGN.md
$OD/design-templates/<template>/SKILL.md
$OD/craft/<name>.md
```

**3. Arguments** — 定义不同输入模式：

| 输入 | 模式 | 行为 |
|------|------|------|
| 空 | 顾问 | 完整 5 阶段咨询 |
| `brand template` | 直接 | 跳过问答 |
| `--browse term` | 浏览 | 搜索资源 |
| `--compare b1 b2` | 对比 | 比较两个设计系统 |

**4. Workflow** — 5 个阶段的详细流程，每个阶段用 `AskUserQuestion` 实现交互。

**5. Matching Algorithm** — 模板和设计系统的评分公式，用关键词、场景、风格、规模四个维度加权。

**6. Output Contract** — HTML 必须自包含，用 `<artifact>` 标签包裹。

## 匹配算法的<em>转化</em>

Open Design 的匹配算法是一个有趣的设计。它把用户的 5 个回答转化为模板和设计系统的评分：

```text
模板评分 = 3×关键词匹配 + 2×场景匹配 + 2×风格匹配 + 2×规模匹配 + 1×featured
设计系统评分 = 3×风格匹配 + 3×品牌匹配 + 2×色调匹配
```

在 Skill 中，这个算法不需要写代码 — 它被表达为一个**匹配索引表**。agent 读取用户的回答，对照索引表打分，然后推荐 Top 3。

这种"用表格表达算法"的方式，是 Claude Skill 的一个独特优势。传统的代码实现需要几十行逻辑，而在 Skill 中，一个结构化的表格就够了。

## 工艺规范的<em>复用</em>

11 套工艺规范是 Open Design 最有价值的部分之一。它们不是针对某个品牌或模板的，而是通用的设计质量约束：

<div class="info-card">
<div class="ic-title">关键工艺规范</div>
<ul>
<li><strong>typography</strong> — 字号比例 1.2/1.25，行高 1.0-1.6，ALL CAPS tracking ≥0.06em，行长 50-75ch</li>
<li><strong>color</strong> — 4 层调色板（中性色 70-90%，强调色 5-10%，语义色 0-5%，效果色 &lt;1%），每屏最多 2 个强调色</li>
<li><strong>anti-ai-slop</strong> — 7 个必须避免的"罪过"：默认靛蓝、双色渐变、emoji 做图标、伪造数据等</li>
<li><strong>state-coverage</strong> — 5 个必需状态：Loading / Empty / Error / Populated / Edge</li>
</ul>
</div>

这些规范被模板的 frontmatter 引用（`od.craft.requires`），agent 在生成时同时应用品牌 token 和工艺约束。

在 Skill 中，这个模式通过"读取 + 应用"实现 — agent 先读取模板需要的 craft 文件，然后在生成时同时遵循品牌和工艺两套规则。

## 实际效果和局限

把 Open Design 转化为 Claude Skill 后，效果：

**能做到的：**
- 完整的顾问式交互流程
- 智能推荐 Top 3 方案
- 品牌一致的 HTML 输出
- 工艺规范的自动应用
- Browse 和 Compare 模式

**做不到的：**
- 设备框架的像素级渲染（需要应用内的 frame 资源）
- 社区宠物等装饰性功能
- 实时预览（需要应用的 preview pane）
- 部分模板的复杂动画效果

核心功能完全可用，但"应用体验"层面的东西无法完全迁移。这恰恰说明了一个原则：**Skill 提炼的是逻辑和模式，不是界面和体验**。

## 提炼设计模式的<em>通用方法</em>

从 Open Design 这个案例中，可以总结出提炼设计模式为 Skill 的通用方法：

**第一步：识别核心架构**
不要急着写代码。先花时间理解应用的核心架构 — 它由哪几个独立部分组成？各部分之间是什么关系？

**第二步：找到设计模式**
每个架构决策背后都有一个设计模式。关注点分离、顾问式交互、硬门控 — 这些模式比具体实现更有价值。

**第三步：用 Claude 原生能力表达**
Skill 不是代码的翻译，而是逻辑的重新表达。用 `AskUserQuestion` 替代 UI 交互，用表格替代算法，用 Read 替代文件加载。

**第四步：定义边界**
明确 Skill 能做什么、不能做什么。不要试图复制整个应用 — 提炼最有价值的部分就够了。

**第五步：测试和迭代**
实际使用 Skill，发现问题就调整。匹配算法可能需要多次调优，交互流程可能需要简化。

## 写在最后

Open Design 的三轴架构 — 设计系统 × 模板 × 工艺规范 — 本身就是一个优雅的设计模式。把它转化为 Claude Skill 的过程，本质上是在回答一个问题：**哪些逻辑值得被提炼为可复用的 agent 能力？**

答案不是"所有功能"，而是"核心设计模式"。六段拼装、顾问式交互、Token 预览硬门控 — 这些模式的价值超越了具体的应用实现。

如果你也有一个复杂的应用想转化为 Skill，建议从识别它的核心设计模式开始。代码可以重写，但设计模式是真正的资产。
