# CityGenius Blog — Agent Rules

## Voice & copy (MANDATORY)

- User-facing strings (headings, ledes, side notes, empty states, CTAs) are **reader copy**, not design notes.
- **Never** ship internal/meta language: 「只负责展示」「先把结构讲清楚」「再让你筛」「这一页现在只按排版」「不跟着参考图」「负责做杂志式版面」「本版本已替换」「下一步会扩展」.
- No changelog, TODO, or agent-instruction text in `.astro` UI or blog body.
- Prefer short natural Chinese. Student voice. No AI-marketing slogans (赋能 / 闭环 / 抓手 / 超能力).
- If a section needs explanation, write it as product voice a stranger understands; otherwise delete the sentence and show the content.

## Article structure (MANDATORY)

- Max **4 section titles** (`##`), short nouns only: 问题 / 做法 / 结果 / 现状. No colon subtitles (禁止「问题：xxx」).
- Fold lessons/pitfalls into body prose; do not invent 踩坑/核心思想/还差什么 headers.
- **figcaption** is reader-facing scientific description of the image (like OpenAI). Forbidden: 「真实编排图」「官方示意」「从终端长成工作区」这种编辑部/交接腔.
- Opening: 2–3 concrete paragraphs, no section header before 问题.
- Body measure: left-aligned, ~17.5px, line-height ~1.88, paragraph margin ~1.35–1.65em.
- h2: sans 800 / 32px, clearly distinct from body.
- At least 2 body figures + hero cover. Prefer real architecture assets from the project repo.
- Body figures are **full reading-column width** (same as text). No tiny floats. class="illu method"


## Frontmatter

Must match `src/content.config.ts` (title, description, date, readTime, tag, category, tags, tagFilters, image, imageAlt, imageWidth, imageHeight, badge, sideNote, caption, authorMeta, featured, related).

## Build / deploy

- Build: `npm run build` in repo root.
- Deploy: push `main` → GitHub Actions → `https://37chengshan.github.io/citygenius-blog/`.
- Network on this machine: unset broken proxy for git/gh (`env -u HTTPS_PROXY -u HTTP_PROXY -u ALL_PROXY`); remote is HTTPS + `gh auth git-credential`.

## Do not

- Do not add page-top walls of meta text “explaining the layout”.
- Do not invent peer-review claims for research tools.
- Do not commit without `npm run build` passing.
