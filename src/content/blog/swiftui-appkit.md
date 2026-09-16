---
title: "SwiftUI 与 AppKit 的取舍"
description: "在开发 macOS 工具时遇到的坑和经验。SwiftUI 的便利与局限，什么时候该回归 AppKit，以及如何利用 Core ML 做本地推理。"
date: "2026.05.08"
readTime: "7 分钟阅读"
tag: "macOS"
category: "macOS"
tags: ["macOS", "Swift", "SwiftUI", "AppKit", "Core ML"]
tagFilters:
  "macOS": "macos"
  "Swift": "macos"
  "SwiftUI": "macos"
  "AppKit": "macos"
  "Core ML": "ai"
image: "lab-2.webp"
imageAlt: "SwiftUI AppKit article cover artwork"
imageWidth: 768
imageHeight: 1024
badge: "macOS"
sideNote: "SwiftUI · AppKit ·<br/>Toolbar · Layout · Core ML"
caption: "<b>Native workflow visual.</b>(CityGenius, MMXXVI)"
authorMeta: "大学生 · macOS 开发者 · 原生工具实践者"
featured: false
related:
  - date: "2026.05.15"
    title: "用 Vibe Coding 三天搞定一个全栈 AI 应用"
    desc: "从想法到上线，记录 scholar-ai 的开发过程。"
    tag: "Vibe Coding · 全栈"
    slug: "vibe-coding-3-days"
  - date: "2026.04.15"
    title: "本地 AI 模型实战"
    desc: "TFLite 图片处理、离线翻译模型和性能优化。"
    tag: "AI/ML · 移动端"
    slug: "local-ai-tflite"
---

## 为什么这个问题总会出现

做 macOS 工具时，SwiftUI 的第一印象总是非常好：写得快、预览直接、结构清晰。但只要开始碰窗口管理、菜单栏行为、复杂列表、快捷键、拖拽和精细滚动控制，AppKit 迟早会重新回到桌面上。

我现在的判断标准很简单：如果需求是典型的内容展示和基础交互，SwiftUI 足够高效；如果需求开始接近"桌面级生产力工具"的细节密度，就要尽早接受 AppKit 不是历史包袱，而是能力边界。

## 我现在的分层习惯

<div class="info-card">
<div class="ic-title">实践分层</div>
<ul>
<li><strong>SwiftUI：</strong>页面骨架、表单、状态驱动展示</li>
<li><strong>AppKit：</strong>窗口、菜单、输入焦点、复杂控件桥接</li>
<li><strong>共享层：</strong>数据模型、命令、文件系统、Core ML 推理</li>
</ul>
</div>

这样做的好处是不需要一开始就站队。SwiftUI 负责速度和表达力，AppKit 负责那些用户真正会感知到的"桌面原生细节"。

## 什么时候该果断回到 AppKit

- 你需要稳定的多窗口行为和生命周期控制
- 你要做复杂表格、侧边栏、命令菜单、快捷键体系
- 你在滚动、焦点、文本选择、拖拽、列表性能上开始频繁绕路

> 原生体验不是看起来像 macOS，而是用户在边角操作时不会察觉到"这是个壳"。
> 开发笔记

## 关于 Core ML

如果工具里要接本地推理，我会优先把模型调用和缓存策略放在独立服务层，不把推理逻辑直接塞进视图。这样无论前面是 SwiftUI 还是 AppKit，界面都只关心状态，而不是模型生命周期。

真正值得花时间优化的，不是"怎么把所有代码都写成 SwiftUI"，而是怎样让用户感觉它就是一款自然的 macOS 工具。
