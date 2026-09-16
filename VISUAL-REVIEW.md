# Visual Fidelity Review Report

**Date:** 2026-05-21
**Reviewer:** Visual Fidelity Audit Agent
**Original:** `/Users/cc/codex/site-build/index.html` + `/Users/cc/codex/site-build/article.html`
**Refactored:** `/Users/cc/codex/citygenius-blog/dist/index.html` + `/Users/cc/codex/citygenius-blog/dist/article/vibe-coding-3-days/index.html`

---

## 1. CSS Variables and Design Tokens

### Rating: WARN

**1.1 `:root` Variables**

All color tokens are identical between the original and refactored versions:

| Token | Original | Refactored | Match |
|-------|----------|------------|-------|
| --paper | #efe7d2 | #efe7d2 | PASS |
| --ink | #15140f | #15140f | PASS |
| --coral | #ed6f5c | #ed6f5c | PASS |
| --mustard | #e9b94a | #e9b94a | PASS |
| --olive | #6e7448 | #6e7448 | PASS |
| --bone | #f7f1de | #f7f1de | PASS |
| --shadow | 0 30px 60px -30px rgba(21,20,15,0.18) | identical | PASS |

**1.2 Font Stacks -- DIVERGENCE**

The `--serif` variable differs:

- **Original index.html:** `'Playfair Display', 'Times New Roman', serif`
- **Original article.html:** `'Playfair Display', 'Noto Serif SC', 'Times New Roman', serif`
- **Refactored index.html:** `'Playfair Display', 'Noto Serif SC', 'Times New Roman', serif` (in shared CSS `_slug_.CUMk3jGZ.css`)
- **Refactored article.html:** identical to refactored index (same shared CSS)

The refactored version adds `Noto Serif SC` to the `--serif` stack on the index page. This is a **beneficial improvement** for Chinese character rendering in serif-styled headings (`.display em`, `.roman`, blockquotes). However, this represents a divergence from the original index page's `--serif` definition.

**1.3 Font Loading**

Both versions load the same Google Fonts via `<link>` tags:
- Inter Tight (400-900)
- Inter (300-600)
- Playfair Display (400-700, italic)
- JetBrains Mono (400-500)

The article pages additionally load `Noto Serif SC` in both versions. PASS.

The shared CSS (`_slug_.CUMk3jGZ.css`) also has a duplicate `@import` for the same fonts. This causes a double font request but has no visual impact.

---

## 2. Key Component Styles

### Rating: WARN

**2.1 `.topbar`** -- PASS

All styles match: padding, border, font-size (10.5px), letter-spacing (0.18em), pulse animation (2.4s ease-in-out infinite). The `@keyframes pulse` definition is identical.

**2.2 `.nav`** -- WARN

Original `.nav` transition:
```css
transition: transform 360ms cubic-bezier(0.22, 0.61, 0.36, 1),
  box-shadow 220ms ease,
  border-color 220ms ease;
```

Refactored `.nav` transition:
```css
transition: transform 360ms cubic-bezier(.22,.61,.36,1),
  box-shadow 220ms ease,
  border-color 220ms ease;
```

The values are identical (whitespace-only difference). PASS.

Original `.nav.is-hidden` includes `box-shadow: none`. Refactored also includes `box-shadow: none`. PASS.

**2.3 `.hero`** -- WARN

- Grid columns, gap, min-height: identical PASS
- `.hero h1` font-size clamp: identical PASS
- `.hero::before` pseudo-element (center vertical line): Present in original with `display: none`. **Missing in refactored CSS.** Since it was hidden, this has zero visual impact. PASS (no visual change).

**2.4 `.labs-grid`** -- FAIL (content ordering)

The CSS for `.labs-grid` (5-column grid, 22px gap) is identical. However, the **article card ordering** differs in HTML:

| Position | Original | Refactored |
|----------|----------|------------|
| 1 | lab-1 (Vibe Coding) | lab-1 (Vibe Coding) |
| 2 | lab-2 (SwiftUI) | lab-4 (Local AI) |
| 3 | lab-3 (Android) | lab-3 (Android) |
| 4 | lab-4 (Local AI) | lab-2 (SwiftUI) |
| 5 | lab-5 (Dev Log) | lab-5 (Dev Log) |

Cards 2-4 are reordered. This is a **visible layout change**.

Additionally, the `data-category` attributes have been expanded with redundant duplicates in the refactored version:
- Original lab-1: `data-category='ai full-stack'`
- Refactored lab-1: `data-category='full-stack ai full-stack full-stack full-stack ai'`

This will not affect filtering (the JS uses `indexOf`), but is unnecessary bloat.

**2.5 `.article-header`** -- FAIL (content differences)

The article page has several visible content differences:
- The h1 dot (`.dot`) is missing in the refactored version
- The `.tag` meta field is empty (no "Vibe Coding" text)
- The lab-1 title has `<em>` rendered as literal text: `用 <em>Vibe Coding</em> 三天搞定一个全栈 AI 应用`

**2.6 `.prose`** -- PASS

All prose styles (font-size 17px, line-height 1.72, heading sizes, blockquote, code, list styles) are identical between original and refactored article CSS.

**2.7 `footer`** -- WARN

The `foot-grid` template columns:
- Original article inline style: `grid-template-columns: 2fr 1fr 1fr 1fr` (4 columns)
- Refactored shared CSS: `grid-template-columns: 2fr 1fr 1fr 1fr 1fr` (5 columns)

Since the refactored article page uses the shared CSS (5 columns) instead of an inline override, the footer grid will render with 5 columns. Both have only 4 child elements, so the visual difference is that the grid has more space distributed.

The `.foot-cta` element (present in original article footer) is missing in the refactored version. CSS for `.foot-cta` exists in the original article inline styles but not in the refactored CSS.

**2.8 `.work`** -- PASS

All `.work` styles match: dark background (#15140f), border-radius (32px), margin (0 64px), padding (110px 64px), noise texture overlay, grid columns (1fr 1.05fr 0.85fr), card rotations (-1.2deg, 2.4deg).

**2.9 `.nav-cta`** -- WARN

- Original index: `::after { content: '★'; color: var(--mustard); font-size: 11px; }`
- Original article: `::after { content: '→'; font-size: 13px; }`
- Refactored shared CSS: `::after { content: "★"; color: var(--mustard); font-size: 11px; }`

The refactored article page inherits the shared CSS star icon instead of the arrow icon. This is a visual difference on the article page.

**2.10 `.status-dot`** -- PASS

The `.status-dot` and its `::after` pseudo-element (coral dot) are present in the refactored shared CSS. The element exists in both pages' HTML.

---

## 3. Animations and Transitions

### Rating: PASS

**3.1 `[data-reveal]` scroll animation** -- PASS

Both versions use identical CSS:
```css
opacity: 0; translate: 0 28px;
transition: opacity 900ms cubic-bezier(0.22, 1, 0.36, 1) var(--reveal-delay, 0ms),
  translate 900ms cubic-bezier(0.22, 1, 0.36, 1) var(--reveal-delay, 0ms);
```

All reveal variants (`left`, `right`, `scale`, `rise-lg`) are identical. Stagger delays for `.cards`, `.labs-grid`, `.method-grid`, `.hero-copy` are all preserved with identical values.

**3.2 `.marquee-track` animation** -- PASS

Both versions: `animation: marquee-x 52s linear infinite`, reverse row `64s`. The `@keyframes marquee-x` (translateX 0 to -50%) is identical. Mask gradient on `.wire-row` is identical.

**3.3 `.nav.is-hidden` transition** -- PASS

The headroom-style hide/show behavior is preserved. JS logic is functionally identical (SHOW_TOP=100, DELTA=6).

**3.4 Hover animations** -- PASS

All hover transitions match: `.card:hover translateY(-3px)`, `.lab:hover translateY(-3px)`, `.work-card:hover` (rotation + translateY), `.partner:hover translateY(-2px)`.

**3.5 `prefers-reduced-motion`** -- PASS

Both versions properly disable all animations and transitions for reduced-motion preference.

---

## 4. Responsive Breakpoints

### Rating: PASS

All breakpoints are present in the refactored shared CSS:

| Breakpoint | Styles | Status |
|------------|--------|--------|
| 1280px | container padding 44px, side-rail hidden | PASS |
| 1200px | topbar .mid hidden | PASS |
| 1180px | nav gap 18px, brand-meta hidden, nav-links gap 28px | PASS |
| 1080px | container 32px, hero h1 clamp, labs-grid 5col/14px, partners 3col, foot-grid 3col | PASS |
| 880px | container 24px, single-column grids, nav-links/brand-meta/nav-cta hidden, work margin 12px | PASS |
| 560px | container 16px, hero h1 38px, labs-grid 1col, cards 1col, section 80px | PASS |

The article-specific responsive styles in `_slug_.BVE_iieD.css` also match the original article's breakpoints.

---

## 5. Font Loading

### Rating: PASS

- Google Fonts preconnect: present in both versions
- Font families loaded: Inter Tight, Inter, Playfair Display, JetBrains Mono (both pages)
- Noto Serif SC: loaded on article pages in both versions
- Font display: swap (both versions)

---

## 6. Images

### Rating: PASS

**6.1 Image paths**

Original uses relative paths (`assets/hero.webp`). Refactored uses absolute paths (`/assets/hero.webp`). All image files exist in `/Users/cc/codex/citygenius-blog/dist/assets/`.

**6.2 Image dimensions**

All `width` and `height` attributes match between versions. All use `loading="lazy"` except hero images which use `fetchpriority="high"`.

---

## 7. JavaScript Behavior

### Rating: WARN

**7.1 Scroll reveal observer** -- PASS

Both versions use IntersectionObserver with identical settings (threshold: 0.12, rootMargin: '0px 0px -8% 0px'). Fallback timeout (1600ms) is identical.

**7.2 Headroom nav** -- PASS

Both versions implement identical scroll-direction-based hide/show with SHOW_TOP=100 and DELTA=6.

**7.3 Article filter** -- WARN

The refactored index page's filter JS removes the `syncDetailLinks` function and `buildArticleHref` logic that existed in the original. The original added `?fromCategory=xxx` to article links; the refactored version does not. This affects the article page's back-link behavior (the `fromCategory` query parameter won't be set).

**7.4 Sandbox shim** -- INFO

The original includes a `data-od-sandbox-shim` script for localStorage/sessionStorage polyfill and safe link handling. This is absent in the refactored version. This was an artifact of the original build tool and is not needed for production.

---

## Summary of Issues

### CRITICAL (must fix)

1. **Article h1 title renders `<em>` as literal text.** The refactored article page's title shows `用 <em>Vibe Coding</em> 三天搞定一个全栈 AI 应用` instead of rendering the emphasis element. The scoped CSS selector `em[data-astro-cid-zm77yjld]` will not match a text node. **Fix:** Ensure the CMS/template properly parses HTML in article titles.

2. **Article card ordering differs.** The labs-grid shows cards in a different order (lab-4 moved to position 2, lab-2 moved to position 4). This is a visible layout change. **Fix:** Verify the content source defines the intended display order.

### IMPORTANT (should fix)

3. **Article `.tag` meta field is empty.** The refactored article header shows an empty `.tag` span where the original shows "Vibe Coding". **Fix:** Populate the tag field from article metadata.

4. **Article h1 `.dot` missing.** The original article h1 ends with `<span class='dot'>.</span>` (coral period). The refactored version omits it. **Fix:** Add the dot span to match the original visual.

5. **`.nav-cta::after` shows star icon on article page.** The original article page shows an arrow (`→`), but the refactored version inherits the shared CSS star (`★`). **Fix:** Add article-specific override or differentiate the nav-cta styling per page.

6. **Footer `foot-grid` template columns differ.** The refactored shared CSS uses 5 columns while the original article uses 4. The `.foot-cta` element is also missing. **Fix:** Ensure the article page footer matches the original structure.

7. **Article description text expanded.** The lab-1 card description adds "以及 RAG 检索增强生成的实际落地经验" which was not in the original. **Fix:** Verify content source matches the original text.

### SUGGESTIONS (nice to have)

8. **`data-category` attributes contain redundant duplicates.** e.g., `full-stack ai full-stack full-stack full-stack ai` instead of `ai full-stack`. Clean up for maintainability.

9. **Lab card 5 "Notes" label changed to "Process".** Minor label difference in the num-row.

10. **Duplicate `@import` for Google Fonts.** The shared CSS has an `@import` that duplicates the `<link>` tag. Remove one to avoid double requests.

11. **`.hero::before` pseudo-element missing.** Was `display: none` in the original, so no visual impact. Can be omitted.

---

## Overall Rating: WARN

The CSS design system (tokens, typography, spacing, colors, animations, responsive breakpoints) is faithfully preserved. The visual regressions are concentrated in the **article page content layer** -- empty tag field, missing dot, literal HTML in title, and card ordering changes on the index page. These are content/template issues rather than CSS/styling issues. The core design system integrity is maintained.
