import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { withBase } from '../lib/url';

function stripHtml(input: string) {
  return input.replace(/<[^>]+>/g, '');
}

function parseDate(input: string) {
  const match = /^(\d{4})\.(\d{2})\.(\d{2})$/.exec(input);
  if (!match) return new Date();
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

export async function GET(context) {
  const posts = (await getCollection('blog')).sort(
    (a, b) => parseDate(b.data.date).getTime() - parseDate(a.data.date).getTime()
  );

  const site = context.site ?? new URL('https://37chengshan.github.io');
  const siteWithBase = new URL(import.meta.env.BASE_URL, site);

  return rss({
    title: 'CityGenius Blog',
    description: '一个大学生的 Vibe Coding 实验室。记录全栈开发、AI 应用、移动端开发的实践与思考。',
    site: siteWithBase,
    items: posts.map((post) => ({
      title: stripHtml(post.data.title),
      description: post.data.description,
      pubDate: parseDate(post.data.date),
      // Absolute URL with project base path; do not rely on rss site join.
      link: new URL(withBase(`/article/${post.id}/`), site).href,
      categories: post.data.tags,
    })),
    customData: '<language>zh-CN</language>',
  });
}
