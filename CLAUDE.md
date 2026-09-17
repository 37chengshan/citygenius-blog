# CityGenius Blog — Agent Rules

## Voice & copy (MANDATORY)

- User-facing strings (headings, ledes, side notes, empty states, CTAs) are **reader copy**, not design notes.
- **Never** ship internal/meta language: 「只负责展示」「先把结构讲清楚」「再让你筛」「这一页现在只按排版」「不跟着参考图」「负责做杂志式版面」「本版本已替换」「下一步会扩展」.
- No changelog, TODO, or agent-instruction text in `.astro` UI or blog body.
- Prefer short natural Chinese. Student voice. No AI-marketing slogans (赋能 / 闭环 / 抓手 / 超能力).
- If a section needs explanation, write it as product voice a stranger understands; otherwise delete the sentence and show the content.

## Article typography

- Paragraphs: generous spacing (`margin-bottom ≈ 1.5–1.7em`), `text-align: justify`, `line-height ≈ 1.85` for CJK.
- Side illustrations: `figure.illu` float right; `figure.illu.left` float left; un-float on narrow screens.
- Assets under `public/assets/`, prefer `.webp`. Prefix URLs with `/citygenius-blog/` (Pages project base).

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
