// 抓新闻 → public/news.json。GitHub Actions（deploy.yml）在构建前跑，也可以手动：node scripts/fetch-news.mjs
//
// 数据源：AI 板块用 AIHOT 公开 API（aihot.news/api/v1/items，匿名只读）+ RSS；其余板块用 RSS。
// 中英双语：配置了 OpenAI 兼容接口（NEWS_LLM_API_KEY / NEWS_LLM_BASE_URL / NEWS_LLM_MODEL）时补中文标题、
// 摘要、解读和英文摘要；没配置就用原文兜底。翻译结果按 link 缓存在线上 news.json 里，不重复翻。
// 任何一步失败都保留旧文件、退出码 0，不影响部署。NEWS_AIHOT=0 可以关掉 AIHOT。
import { readFileSync, writeFileSync } from 'node:fs';

const OUT = 'public/news.json';
const LIVE = 'https://37chengshan.github.io/citygenius-blog/news.json';
const PER_CAT = 13; // 头条 + 12 张卡，三栏 / 两栏都能排满
const PER_SOURCE = 8;
const UA = 'Mozilla/5.0 (compatible; news-digest/1.0)';
const USE_AIHOT = process.env.NEWS_AIHOT !== '0';
const LLM = {
  key: process.env.NEWS_LLM_API_KEY,
  base: (process.env.NEWS_LLM_BASE_URL || '').replace(/\/+$/, ''),
  model: process.env.NEWS_LLM_MODEL,
};
const llmOn = !!(LLM.key && LLM.base && LLM.model);

const CATS = [
  { id: 'ai', label: 'AI 科技', aihot: true, feeds: [
    ['The Verge', 'https://www.theverge.com/rss/ai-artificial-intelligence/index.xml'],
    ['MIT Tech Review', 'https://www.technologyreview.com/feed/'],
    ['TechCrunch', 'https://techcrunch.com/category/artificial-intelligence/feed/'],
  ] },
  { id: 'world', label: '国际新闻', feeds: [
    ['Al Jazeera', 'https://www.aljazeera.com/xml/rss/all.xml'],
    ['BBC World', 'https://feeds.bbci.co.uk/news/world/rss.xml'],
  ] },
  { id: 'finance', label: '财经', feeds: [
    ['CNBC', 'https://www.cnbc.com/id/100003114/device/rss/rss.html'],
    ['BBC Business', 'https://feeds.bbci.co.uk/news/business/rss.xml'],
  ] },
  { id: 'sports', label: '体育', feeds: [
    ['BBC Sport', 'https://feeds.bbci.co.uk/sport/rss.xml'],
    ['ESPN', 'https://www.espn.com/espn/rss/news'],
  ] },
  { id: 'ent', label: '娱乐', feeds: [
    ['Variety', 'https://variety.com/feed/'],
    ['BBC 娱乐', 'https://feeds.bbci.co.uk/news/entertainment_and_arts/rss.xml'],
  ] },
  { id: 'valorant', label: '无畏契约', feeds: [
    ['Google News', 'https://news.google.com/rss/search?q=Valorant+VCT&hl=en-US&gl=US&ceid=US:en'],
  ] },
];

const CJK = /[㐀-鿿]/;

async function get(url, type) {
  const r = await fetch(url, { headers: { 'User-Agent': UA, Accept: type }, signal: AbortSignal.timeout(20000) });
  if (!r.ok) throw new Error(url + ' -> HTTP ' + r.status);
  return type.includes('json') ? r.json() : r.text();
}

/* ---------- RSS / Atom ---------- */
function decode(s) {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(+d))
    .replace(/&quot;/g, '"').replace(/&apos;|&#39;/g, "'").replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
}
function text(html) {
  return decode(decode(html).replace(/<[^>]+>/g, ' ')).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}
function tag(xml, name) {
  const m = xml.match(new RegExp('<' + name + '(?:\\s[^>]*)?>([\\s\\S]*?)</' + name + '>', 'i'));
  return m ? m[1] : '';
}
function attr(xml, re) {
  const m = xml.match(re);
  return m ? decode(m[1]) : '';
}
function clip(s, n) {
  return s.length > n ? s.slice(0, n).replace(/\s+\S*$/, '') + '…' : s;
}

function parseFeed(xml, sourceName) {
  const blocks = xml.match(/<item[\s>][\s\S]*?<\/item>/gi) || xml.match(/<entry[\s>][\s\S]*?<\/entry>/gi) || [];
  return blocks.map((b) => {
    let title = text(tag(b, 'title'));
    const link = text(tag(b, 'link')) ||
      attr(b, /<link[^>]*rel=["']alternate["'][^>]*href=["']([^"']+)/i) ||
      attr(b, /<link[^>]*href=["']([^"']+)/i);
    const date = text(tag(b, 'pubDate') || tag(b, 'published') || tag(b, 'updated') || tag(b, 'dc:date'));
    const body = tag(b, 'description') || tag(b, 'summary') || tag(b, 'content:encoded') || tag(b, 'content');
    let summary = clip(text(body), 280);
    let source = sourceName;
    if (sourceName === 'Google News') {
      const pub = text(tag(b, 'source'));
      if (pub) {
        source = pub;
        if (title.endsWith(' - ' + pub)) title = title.slice(0, -(pub.length + 3));
      }
      summary = ''; // Google News 的 description 只是标题链接列表
    }
    const image =
      attr(b, /<media:thumbnail[^>]*url=["']([^"']+)/i) ||
      attr(b, /<media:content[^>]*url=["']([^"']+\.(?:jpe?g|png|webp)[^"']*)/i) ||
      attr(b, /<media:content[^>]*medium=["']image["'][^>]*url=["']([^"']+)/i) ||
      attr(b, /<enclosure[^>]*url=["']([^"']+)["'][^>]*type=["']image/i) ||
      attr(decode(body), /<img[^>]*src=["'](https:[^"']+)/i);
    const d = new Date(date);
    return {
      title, link: link.trim(), source,
      published: isNaN(d) ? '' : d.toISOString(),
      summary, image: image.startsWith('https:') ? image : '',
    };
  }).filter((it) => it.title && /^https?:/.test(it.link));
}

/* ---------- AIHOT ---------- */
async function fetchAihot() {
  const j = await get('https://aihot.news/api/v1/items?mode=selected&window=7d&limit=30', 'application/json');
  return (j.items || []).map((x) => {
    const orig = x.originalTitle || '';
    return {
      title: orig || x.title,
      zh_title: x.title,
      en_title: orig && !CJK.test(orig) ? orig : '',
      link: (x.links && (x.links.original || x.links.aihot)) || '',
      aihot: (x.links && x.links.aihot) || '',
      source: 'AI HOT · ' + ((x.source && x.source.name) || 'AIHOT'),
      published: x.publishedAt || x.discoveredAt || '',
      summary: '',
      zh_summary: x.summary || '',
      image: '',
    };
  }).filter((it) => it.zh_title && it.link);
}

/* ---------- 合并 ---------- */
// 先按输入顺序去重（AIHOT 排在前面，同一篇优先留带中文的那条），再按时间排、限每个来源条数
function pick(items) {
  const seen = new Set();
  const perSrc = {};
  return items
    .filter((it) => {
      const k = it.link.replace(/[?#].*$/, '').replace(/\/$/, '');
      if (!it.published || seen.has(k)) return false;
      seen.add(k);
      return true;
    })
    .sort((a, b) => b.published.localeCompare(a.published))
    .filter((it) => {
      perSrc[it.source] = (perSrc[it.source] || 0) + 1;
      return perSrc[it.source] <= PER_SOURCE;
    })
    .slice(0, PER_CAT);
}

/* ---------- 配图：RSS 没给图的，取原文页的 og:image ---------- */
async function ogImage(url) {
  try {
    const r = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'text/html' }, signal: AbortSignal.timeout(12000) });
    if (!r.ok) return '';
    const html = (await r.text()).slice(0, 300000);
    const tagHtml = html.match(/<meta[^>]+(?:property|name)=["'](?:og:image|twitter:image)["'][^>]*>/i);
    const src = tagHtml ? attr(tagHtml[0], /content=["']([^"']+)/i) : '';
    return src.startsWith('https:') ? src : '';
  } catch {
    return '';
  }
}
async function fillImages(items) {
  const todo = items.filter((it) => !it.image && !it.link.includes('news.google.com'));
  for (let i = 0; i < todo.length; i += 6) {
    await Promise.all(todo.slice(i, i + 6).map(async (it) => { it.image = await ogImage(it.link); }));
  }
}

/* ---------- 翻译缓存 ---------- */
// 只有真正翻过的字段才算缓存（兜底时 zh_summary 等于英文原文，不算）。
// AIHOT 条目的中文每次以 AIHOT 最新返回为准（它会更正、撤回），不用缓存覆盖。
function cachedFields(c, fromAihot) {
  const out = {};
  if (!c) return out;
  if (!fromAihot) {
    if (c.zh_title && CJK.test(c.zh_title)) out.zh_title = c.zh_title;
    if (c.zh_summary && c.zh_summary !== c.summary) out.zh_summary = c.zh_summary;
  }
  if (c.zh_take) out.zh_take = c.zh_take;
  if (c.image) out.image = c.image;
  if (c.en_summary && c.en_summary !== c.summary && !CJK.test(c.en_summary)) {
    out.en_title = c.en_title; out.en_summary = c.en_summary;
  }
  return out;
}
// 只有标题没有摘要的条目（Google News）只翻标题，不让模型凭标题编摘要
function needs(it) {
  if (!it.summary && !it.zh_summary) return CJK.test(it.zh_title || '') ? [] : ['title'];
  const n = [];
  if (!it.zh_summary || it.zh_summary === it.summary) n.push('zh');
  if (!it.en_summary && !it.summary) n.push('en');
  if (!it.zh_take) n.push('take');
  return n;
}

/* ---------- LLM ---------- */
const PROMPT = [
  '你在给一个大学生的个人博客整理新闻卡片。输入是 JSON 数组，每条有 i、title、summary、source。',
  '为每条输出：',
  '- zh_title：中文标题，≤ 24 个字，说清发生了什么，不要标题党；',
  '- zh_summary：中文摘要，2 句，讲事实，口语自然；',
  '- zh_take：一句中文点评（≤ 40 字），说这件事为什么值得关注，不要「赋能」「闭环」「抓手」这类词；',
  '- en_title：英文标题（原文是英文就照抄）；',
  '- en_summary：英文摘要，1-2 句。',
  '只根据给出的内容写，不要编造数字和细节。summary 为空的条目只写 zh_title 和 en_title，其余字段留空字符串。',
  '只输出 JSON：{"items":[{"i":0,"zh_title":"","zh_summary":"","zh_take":"","en_title":"","en_summary":""}]}',
].join('\n');

async function llmBatch(list) {
  const r = await fetch(LLM.base + '/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + LLM.key },
    body: JSON.stringify({
      model: LLM.model,
      temperature: 0.3,
      messages: [
        { role: 'system', content: PROMPT },
        { role: 'user', content: JSON.stringify(list) },
      ],
    }),
    signal: AbortSignal.timeout(120000),
  });
  if (!r.ok) throw new Error('LLM HTTP ' + r.status);
  const j = await r.json();
  const raw = (j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content) || '';
  const m = raw.match(/\{[\s\S]*\}/);
  if (!m) throw new Error('LLM 没返回 JSON');
  return JSON.parse(m[0]).items || [];
}

async function enrich(items) {
  const todo = items.filter((it) => needs(it).length);
  for (let s = 0; s < todo.length; s += 8) {
    const chunk = todo.slice(s, s + 8);
    try {
      const out = await llmBatch(chunk.map((it, i) => ({
        i, title: it.en_title || it.title, summary: it.summary || it.zh_summary || '', source: it.source,
      })));
      for (const o of out) {
        const it = chunk[o.i];
        if (!it) continue;
        const need = needs(it);
        if (need.includes('title') && o.zh_title) it.zh_title = o.zh_title;
        if (need.includes('zh') && o.zh_summary) {
          if (!CJK.test(it.zh_title || '')) it.zh_title = o.zh_title || it.zh_title;
          it.zh_summary = o.zh_summary;
        }
        if (need.includes('take') && o.zh_take) it.zh_take = o.zh_take;
        if (need.includes('en') && o.en_summary) {
          it.en_summary = o.en_summary;
          if (!it.en_title && o.en_title) it.en_title = o.en_title;
        }
      }
    } catch (e) {
      console.warn('[news] LLM 失败，这批用原文兜底：' + e.message);
    }
  }
}

/* ---------- main ---------- */
function count(snap) {
  return ((snap && snap.categories) || []).reduce((n, c) => n + ((c.items && c.items.length) || 0), 0);
}
function readJson(path) {
  try { return JSON.parse(readFileSync(path, 'utf8')); } catch { return null; }
}

async function main() {
  const local = readJson(OUT);
  const live = await get(LIVE + '?t=' + Date.now(), 'application/json').catch(() => null);
  console.log('[news] 缓存：本地 ' + count(local) + ' 条，线上 ' + count(live) + ' 条');
  const prevCats = {};
  const cache = new Map();
  for (const snap of [local, live]) {
    for (const c of (snap && snap.categories) || []) {
      if (c.items && c.items.length) prevCats[c.id] = c.items;
      for (const it of c.items || []) cache.set(it.link, it);
    }
  }

  const categories = [];
  let fresh = 0;
  for (const cat of CATS) {
    const jobs = cat.feeds.map(([name, url]) =>
      get(url, 'application/rss+xml, application/atom+xml, application/xml, text/xml').then((xml) => parseFeed(xml, name)));
    if (cat.aihot && USE_AIHOT) jobs.unshift(fetchAihot());
    const results = await Promise.allSettled(jobs);
    results.filter((r) => r.status === 'rejected').forEach((r) => console.warn('[news] ' + cat.id + ': ' + r.reason.message));
    let items = pick(results.flatMap((r) => (r.status === 'fulfilled' ? r.value : [])));
    if (items.length < 3) {
      console.warn('[news] ' + cat.id + ' 只拿到 ' + items.length + ' 条，沿用上一版');
      categories.push({ id: cat.id, label: cat.label, items: prevCats[cat.id] || [] });
      continue;
    }
    fresh++;
    items = items.map((it) => {
      const c = cachedFields(cache.get(it.link), !!it.aihot);
      return { ...it, ...c, image: it.image || c.image || '' };
    });
    await fillImages(items);
    if (llmOn) await enrich(items);
    categories.push({
      id: cat.id,
      label: cat.label,
      items: items.map((it) => ({
        title: it.title,
        zh_title: it.zh_title || it.title,
        en_title: it.en_title || it.title,
        link: it.link,
        source: it.source,
        published: it.published,
        summary: it.summary,
        zh_summary: it.zh_summary || it.summary,
        en_summary: it.en_summary || it.summary || it.zh_summary || '',
        zh_take: it.zh_take || '',
        image: it.image || '',
        ...(it.aihot ? { aihot: it.aihot } : {}),
      })),
    });
  }

  if (!fresh || categories.some((c) => !c.items.length)) {
    // 仓库里的 news.json 是旧快照；线上那份更新，就用线上的，别把网站退回旧数据
    if (live && count(live)) writeFileSync(OUT, JSON.stringify(live));
    console.warn('[news] 没有可用的新数据，沿用' + (live ? '线上' : '仓库') + '的 news.json');
    return;
  }
  writeFileSync(OUT, JSON.stringify({ generated_at: new Date().toISOString(), categories }));
  console.log('[news] 写入 ' + OUT + '：' + categories.map((c) => c.id + ' ' + c.items.length).join(' / ') +
    (llmOn ? '' : '（未配置 LLM，新条目用原文）'));
}

main().catch((e) => console.warn('[news] 出错，保留旧文件：' + e.message));
