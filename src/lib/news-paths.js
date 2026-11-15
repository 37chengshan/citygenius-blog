import { readFileSync } from 'node:fs';
import { NEWS_CATS } from './news-cats.js';
import { slugFor } from './news-shared.js';

/** Static paths for news article pages, from the build-time snapshot in public/news.json. */
export function newsArticlePaths() {
  const snap = JSON.parse(readFileSync('public/news.json', 'utf-8'));
  const paths = [];
  const seen = new Set();
  for (const c of snap.categories || []) {
    const meta = NEWS_CATS.find((x) => x.id === c.id);
    if (!meta) continue;
    const items = c.items || [];
    items.forEach((it, i) => {
      let slug = slugFor(it.link || it.title);
      let n = 2;
      while (seen.has(c.id + '/' + slug)) slug = slugFor(it.link || it.title) + '-' + n++;
      seen.add(c.id + '/' + slug);
      const sib = (j) =>
        j >= 0 && j < items.length
          ? { slug: slugFor(items[j].link || items[j].title), en: items[j].en_title || items[j].title || '', zh: items[j].zh_title || items[j].title || '' }
          : null;
      paths.push({
        params: { category: c.id, slug },
        props: { item: it, meta, prev: sib(i - 1), next: sib(i + 1) },
      });
    });
  }
  return paths;
}
