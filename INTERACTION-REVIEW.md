# CityGenius Astro 重构 - 性能与交互逻辑审查报告

**审查日期:** 2026-05-21
**审查范围:** `/Users/cc/codex/site-build/index.html` (原始) vs `/Users/cc/codex/citygenius-blog/dist/` (Astro 输出)

---

## 1. JavaScript 交互逻辑

### 1.1 Scroll Reveal - PASS

| 检查项 | 原始 | Astro | 一致 |
|--------|------|-------|------|
| IntersectionObserver threshold | 0.12 | 0.12 | YES |
| rootMargin | `0px 0px -8% 0px` | `0px 0px -8% 0px` | YES |
| data-reveal 属性处理 | 设置 `data-revealed="true"` | 相同 | YES |
| prefers-reduced-motion 降级 | 立即 revealAllPending() | 相同 | YES |
| 1600ms 超时兜底 | `setTimeout(revealAllPending, 1600)` | 相同 | YES |
| unobserve 已揭示元素 | 是 | 是 | YES |

**结论:** Scroll Reveal 逻辑完全一致，Astro 输出为压缩版本但行为相同。

### 1.2 Headroom 导航 - PASS

| 检查项 | 原始 | Astro | 一致 |
|--------|------|-------|------|
| SHOW_TOP | 100 | 100 (r=100) | YES |
| DELTA | 6 | 6 (i=6) | YES |
| 滚动方向检测 | `y - lastY` | `s - n` (压缩变量名) | YES |
| is-hidden class 切换 | 向下滚动 > DELTA 时添加，向上滚动 < -DELTA 时移除 | 相同 | YES |
| passive scroll listener | 是 | 是 | YES |
| 顶部区域始终可见 | `y <= SHOW_TOP` 时移除 is-hidden | 相同 | YES |

**结论:** Headroom 导航逻辑完全一致。

### 1.3 文章过滤 - WARN

| 检查项 | 原始 | Astro | 一致 |
|--------|------|-------|------|
| pill 按钮点击过滤 | 支持 | 支持 | YES |
| data-category 属性处理 | split(/\s+/) + indexOf | 相同 | YES |
| URL 参数同步 | `?category=xxx#articles` | 相同 | YES |
| 卡片点击跳转 | 通过 .arrow-mark[href] | 相同 | YES |
| 键盘 Enter/Space 支持 | 支持 | 支持 | YES |
| aria-pressed 更新 | 支持 | 支持 | YES |
| 计数环更新 | 支持 | 支持 | YES |
| **syncDetailLinks** | **有 - 更新文章链接的 fromCategory 参数** | **缺失** | **NO** |
| **data-default-count** | **有 - 用于恢复默认计数** | **缺失** | **NO** |

**问题详情:**

1. **syncDetailLinks 缺失 (WARN):** 原始版本在过滤时会同步更新页面上所有文章详情链接，添加 `fromCategory` 参数以便文章页可以知道用户从哪个分类跳转过来。Astro 版本完全移除了这个功能。虽然不影响核心过滤功能，但丢失了导航上下文。

2. **data-default-count 缺失 (INFO):** 原始版本在 lab 卡片上有 `data-default-count` 属性记录默认分类，Astro 版本移除了此属性。由于 Astro 版本的过滤逻辑不依赖此属性，功能不受影响。

3. **data-category 值重复 (WARN):** 原始版本使用去重后的分类值 (`data-category='ai full-stack'`)，Astro 版本使用 tagFilters 对象的所有值 (`data-category="full-stack ai full-stack full-stack full-stack ai"`)。过滤功能仍然正常工作（因为使用 indexOf 检查），但语义上不正确。

---

## 2. 文章页交互 - PASS (with BUG)

### 2.1 页面标题 - FAIL

**问题:** 文章页 `<title>` 标签中的 HTML 实体被转义。

- **原始:** `<title>用 Vibe Coding 三天搞定一个全栈 AI 应用 — CityGenius Blog</title>`
- **Astro:** `<title>用 &lt;em&gt;Vibe Coding&lt;/em&gt; 三天搞定一个全栈 AI 应用 — CityGenius Blog</title>`

**原因:** Markdown frontmatter 中的 title 字段包含 `<em>` 标签用于斜体显示，但 Astro 在生成 `<title>` 标签时没有剥离 HTML 标签，而是将其转义为实体。

**影响:** 浏览器标签页显示 `用 <em>Vibe Coding</em> 三天搞定一个全栈 AI 应用` 而不是 `用 Vibe Coding 三天搞定一个全栈 AI 应用`。SEO 和社交媒体分享时标题显示异常。

### 2.2 其他文章页交互 - PASS

| 检查项 | 状态 | 详情 |
|--------|------|------|
| 返回首页链接 | PASS | `href="/"` 指向首页 |
| 标签过滤链接 | PASS | `href="/?category=full-stack#articles"` 格式正确 |
| 相关文章链接 | PASS | `/article/swiftui-appkit`, `/article/local-ai-tflite` 路径正确 |
| 导航链接 | PASS | `/#top`, `/#about`, `/#projects`, `/#articles`, `/#contact` 格式正确 |
| Scroll Reveal 脚本 | PASS | 与首页相同的压缩脚本 |
| Headroom 脚本 | PASS | 与首页相同的压缩脚本 |

---

## 3. 首页文章跳转 - PASS

| 卡片 | 原始链接 | Astro 链接 | 状态 |
|------|----------|------------|------|
| Vibe Coding 3 Days | `article.html` | `/article/vibe-coding-3-days` | PASS |
| SwiftUI AppKit | `articles/swiftui-appkit.html` | `/article/swiftui-appkit` | PASS |
| Android File Conversion | `articles/android-file-conversion.html` | `/article/android-file-conversion` | PASS |
| Local AI TFLite | `articles/local-ai-tflite.html` | `/article/local-ai-tflite` | PASS |
| Dev Log | `articles/dev-log.html` | `/article/dev-log` | PASS |

**结论:** 所有 `.arrow-mark` 链接正确指向 Astro 风格的文章路径 (`/article/slug`)。

---

## 4. 性能检查 - PASS (with NOTES)

### 4.1 文件大小对比

| 文件 | 大小 |
|------|------|
| 原始 index.html (内联所有 CSS+JS) | 81,369 bytes |
| Astro index.html | 35,804 bytes |
| Astro article index.html | 14,175 bytes |
| `_slug_.CUMk3jGZ.css` (共享) | 12,967 bytes |
| `_slug_.BVE_iieD.css` (文章页) | 10,950 bytes |
| `index.CVsKgvtv.css` (首页) | 30,204 bytes |

**分析:**
- 原始版本将所有 CSS 内联在 HTML 中 (81KB 单文件)
- Astro 版本将 CSS 拆分为独立文件，支持浏览器缓存
- 首页总传输: ~35KB HTML + ~43KB CSS = ~78KB (首次加载)
- 文章页总传输: ~14KB HTML + ~24KB CSS = ~38KB (首次加载)
- CSS 文件可被浏览器缓存，后续页面加载更快

### 4.2 CSS 重复检查 - PASS

- 首页: 内联 `<style>` (页面特有样式) + `index.CVsKgvtv.css` + `_slug_.CUMk3jGZ.css`
- 文章页: `_slug_.BVE_iieD.css` + `_slug_.CUMk3jGZ.css`
- 共享 CSS (`_slug_.CUMk3jGZ.css`) 仅加载一次，无不必要的重复

### 4.3 图片加载属性 - PASS

| 图片类型 | loading | fetchpriority | 正确性 |
|----------|---------|---------------|--------|
| Hero 图片 (首屏) | 无 (默认 eager) | `high` | PASS |
| 其他图片 | `lazy` | 无 | PASS |

### 4.4 未使用的资源 - WARN

- `dist/assets/` 目录包含 22 个 `.png` 文件 (总计约 50MB)，这些是源文件而非生产产物
- HTML 中未引用任何 `.png` 文件，仅使用 `.webp` 格式
- 建议在构建配置中排除 `.png` 源文件，减少部署包大小

---

## 5. SEO - PASS (with BUG)

### 5.1 Sitemap - PASS

- `sitemap-index.xml` 正确生成
- `sitemap-0.xml` 包含所有 6 个页面:
  - `https://citygenius.top/`
  - `https://citygenius.top/article/android-file-conversion/`
  - `https://citygenius.top/article/dev-log/`
  - `https://citygenius.top/article/local-ai-tflite/`
  - `https://citygenius.top/article/swiftui-appkit/`
  - `https://citygenius.top/article/vibe-coding-3-days/`

### 5.2 Title 和 Meta Description - FAIL (文章页标题 bug)

| 页面 | title | description | 状态 |
|------|-------|-------------|------|
| 首页 | `CityGenius Blog — 一个大学生的 Vibe Coding 实验室` | 正确 | PASS |
| 文章页 | `用 &lt;em&gt;Vibe Coding&lt;/em&gt; 三天搞定一个全栈 AI 应用` | 正确 | **FAIL** |

### 5.3 Canonical URL - N/A

原始版本和 Astro 版本均未设置 canonical URL。这不是回归问题，但建议后续添加。

### 5.4 OG / Twitter Cards - N/A

原始版本和 Astro 版本均未设置 OG 或 Twitter Card 元标签。这不是回归问题，但建议后续添加。

---

## 总评

| 维度 | 评级 | 说明 |
|------|------|------|
| JavaScript 交互逻辑 | **WARN** | 核心逻辑一致，但 syncDetailLinks 功能缺失 |
| 文章页交互 | **FAIL** | title 标签 HTML 实体被转义 |
| 首页文章跳转 | **PASS** | 所有链接正确指向 Astro 风格路径 |
| 性能 | **PASS** | CSS 拆分策略合理，图片加载属性正确 |
| SEO | **FAIL** | 文章页标题 bug 影响 SEO 和社交分享 |

### 必须修复的问题

1. **[BLOCKER] 文章页标题 HTML 实体转义:** `<title>` 标签中的 `<em>` 被转义为 `&lt;em&gt;`，需要在生成 title 时剥离 HTML 标签。

### 建议修复的问题

2. **[WARN] syncDetailLinks 功能缺失:** 原有的文章链接 fromCategory 参数同步功能被移除，建议恢复或确认是否为有意简化。

3. **[WARN] data-category 值重复:** tagFilters 的所有值被直接 join，导致分类字符串包含重复值。建议在模板中使用 `[...new Set(values)].join(' ')` 去重。

4. **[INFO] dist 中包含 .png 源文件:** 22 个未使用的 .png 文件增加了部署包大小，建议在构建配置中排除。

---

_审查完成: 2026-05-21_
