// 新闻页构建期静态渲染（SSR 快照），跑在 Node（Astro frontmatter）。
// 纯函数来自 ./news-shared.js（与浏览器端同源，见该文件头注释）。
//
// 双语：默认英文。内容（标题/摘要/解读）输出 .lang-en / .lang-zh 双 span，
// 由全局 CSS 按 html[data-lang] 显隐；chrome 文案英文默认 + data-i18n。
// 注意 snapUpdated() 返回的是 HTML 片段，调用方必须用 set:html（不能 {var} 直接插值）。

import { esc, slugFor, articlePath, dateParts, illusFor, catLabel } from './news-shared.js';

/** 文章站内链接：linkArt(catId, slug) 由调用方传入（已套 withBase）。 */
export { slugFor, articlePath };

/** 双语片段：<span class="lang-en">en</span><span class="lang-zh">zh</span> */
function langSpans(en, zh) {
  return '<span class="lang-en">' + esc(en) + '</span><span class="lang-zh">' + esc(zh) + '</span>';
}

/** 构建期"数据更新于"文本（北京时间；浏览器端 JS 加载后会刷新为相对时间）。
 *  返回双语 HTML（Updated Oct 2, Fri, 18:59 / 数据更新于 10月2日 周五 18:59），调用方用 set:html。 */
export function snapUpdated(iso) {
  if (!iso) return '';
  var d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  try {
    var zhFmt = new Intl.DateTimeFormat('zh-CN', {
      timeZone: 'Asia/Shanghai',
      month: 'numeric', day: 'numeric', weekday: 'short',
      hour: 'numeric', minute: '2-digit', hour12: false,
    });
    var enFmt = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Shanghai',
      month: 'short', day: 'numeric', weekday: 'short',
      hour: 'numeric', minute: '2-digit', hour12: false,
    });
    var get = function (parts, t) {
      for (var i = 0; i < parts.length; i++) if (parts[i].type === t) return parts[i].value;
      return '';
    };
    var zp = zhFmt.formatToParts(d);
    var ep = enFmt.formatToParts(d);
    var zh = '数据更新于 ' + get(zp, 'month') + '月' + get(zp, 'day') + '日' +
      ' ' + get(zp, 'weekday') + ' ' + get(zp, 'hour') + ':' + get(zp, 'minute');
    var en = 'Updated ' + get(ep, 'month') + ' ' + get(ep, 'day') + ', ' +
      get(ep, 'weekday') + ' ' + get(ep, 'hour') + ':' + get(ep, 'minute');
    return '<span class="lang-en">' + esc(en) + '</span><span class="lang-zh">' + esc(zh) + '</span>';
  } catch (e) {
    return '';
  }
}

/* ---------- 卡片（静态版：绝对时间，无"几小时前"，JS 刷新后会补上） ---------- */
function staticDateLine(pub, src, lang) {
  var p = pub ? dateParts(pub, lang) : null;
  if (!p) {
    return '<div class="date-line"><span class="src">' + esc(src || '') + '</span></div>';
  }
  return (
    '<div class="date-line">' +
    '<span class="date-badge">' + esc(p.date) + '</span>' +
    '<span class="week">' + esc(p.week) + ' · ' + esc(p.hm) + '</span>' +
    '<span class="src">' + esc(src || '') + '</span>' +
    '</div>'
  );
}

/** 卡片正文双语：EN=英文标题+英文摘要；ZH=中文标题+中文摘要+中文解读。 */
function cardBody(it, tag) {
  var zhTitle = it.zh_title || it.title || '';
  var enTitle = it.title || '';
  var zhSum = it.zh_summary || '';
  var enSum = it.summary || '';
  var take = it.zh_take
    ? '<div class="take"><b>解读</b>' + esc(it.zh_take) + '</div>'
    : '';
  return (
    '<div class="card-body">' +
    '<div class="lang-en">' +
    '<' + tag + '>' + esc(enTitle) + '</' + tag + '>' +
    staticDateLine(it.published, it.source, 'en') +
    (enSum ? '<p>' + esc(enSum) + '</p>' : '') +
    '</div>' +
    '<div class="lang-zh">' +
    '<' + tag + '>' + esc(zhTitle) + '</' + tag + '>' +
    staticDateLine(it.published, it.source, 'zh') +
    (zhSum ? '<p>' + esc(zhSum) + '</p>' : '') +
    take +
    '</div>' +
    '</div>'
  );
}

function artHref(linkArt, catId, it) {
  return linkArt(catId, slugFor(it.link || it.title));
}

export function featCard(catId, it, pal, linkArt) {
  var art = it.image
    ? '<div class="illus"><img loading="lazy" src="' + esc(it.image) + '" alt=""/></div>'
    : '<div class="illus">' + illusFor(it.link || it.title, pal, false) + '</div>';
  return (
    '<a class="feat" href="' + esc(artHref(linkArt, catId, it)) + '">' +
    art + cardBody(it, 'h2') + '</a>'
  );
}

var SPANS = ['sp7', 'sp5', 'sp5', 'sp7', 'wide', 'sp4', 'sp8', 'sp8', 'sp4', 'sp6', 'sp6'];

function bentoCard(catId, it, cls, pal, linkArt) {
  if (cls === 'wide') {
    return (
      '<a class="news-card wide" href="' + esc(artHref(linkArt, catId, it)) + '">' +
      '<div class="illus">' + illusFor(it.link || it.title, pal, false) + '</div>' +
      cardBody(it, 'h3') + '</a>'
    );
  }
  return (
    '<a class="news-card ' + cls + '" href="' + esc(artHref(linkArt, catId, it)) + '">' +
    '<div class="illus">' + illusFor(it.link || it.title, pal, false) + '</div>' +
    cardBody(it, 'h3') + '</a>'
  );
}

function dayDiv(iso) {
  var zen = dateParts(iso, 'en'), zzh = dateParts(iso, 'zh') || dateParts(iso);
  var en = zen ? zen.date + ' ' + zen.week : '';
  var zh = zzh ? zzh.date + ' ' + zzh.week : '';
  return '<div class="day-div"><span><span class="lang-en">' + esc(en) + '</span>' +
    '<span class="lang-zh">' + esc(zh) + '</span></span></div>';
}

/** 板块页静态 HTML：{ feat, grid }，无数据时返回空字符串。 */
export function staticCategory(catId, items, pal, linkArt) {
  if (!items || !items.length) return { feat: '', grid: '' };
  var feat = featCard(catId, items[0], pal, linkArt);
  var html = '';
  var first = dateParts(items[0].published);
  var lastDay = first ? first.key : '';
  for (var i = 1; i < items.length; i++) {
    var p = dateParts(items[i].published);
    var dk = p ? p.key : '';
    if (dk && dk !== lastDay) {
      html += dayDiv(items[i].published);
      lastDay = dk;
    }
    var sp = SPANS[(i - 1) % SPANS.length];
    var cls = sp + (sp === 'wide' ? '' : i % 2 === 0 ? ' off' : '');
    html += bentoCard(catId, items[i], cls, pal, linkArt);
  }
  return { feat: feat, grid: html };
}

/** 条数双语：12 stories / 12 条（hub 卡片用）。 */
export function countHtml(n) {
  return '<span class="lang-en">' + n + ' stories</span><span class="lang-zh">' + n + ' 条</span>';
}

/** 条数双语：12 stories / 共 12 条（板块页计数用）。 */
export function totalHtml(n) {
  return '<span class="lang-en">' + n + ' stories</span><span class="lang-zh">共 ' + n + ' 条</span>';
}

/** 入口页静态 HTML：六张板块卡片（带小插图，头条可点进文章页）。 */
export function staticHub(cats, data, linkArt) {
  var categories = (data && data.categories) || [];
  var html = '';
  for (var ix = 0; ix < cats.length; ix++) {
    var meta = cats[ix];
    var c = null;
    for (var k = 0; k < categories.length; k++) {
      if (categories[k].id === meta.id) {
        c = categories[k];
        break;
      }
    }
    var items = (c && c.items) || [];
    var tops = '';
    for (var t = 0; t < Math.min(3, items.length); t++) {
      var it = items[t];
      tops += '<li><a href="' + esc(linkArt(meta.id, slugFor(it.link || it.title))) + '">' +
        langSpans(it.title || '', it.zh_title || it.title || '') + '</a></li>';
    }
    var n = ix + 1;
    var L = catLabel(meta.id) || { en: meta.label, zh: meta.label, descEn: meta.desc, descZh: meta.desc };
    html +=
      '<div class="hub-card" data-href="' + esc(meta.href) + '">' +
      '<div class="hub-ix">' + (n < 10 ? '0' : '') + n + '</div>' +
      '<div class="hub-main">' +
      '<div class="hub-title"><a href="' + esc(meta.href) + '">' + langSpans(L.en, L.zh) + '</a>' +
      '<span class="count">' + countHtml(items.length) + '</span></div>' +
      '<div class="hub-desc">' + langSpans(L.descEn, L.descZh) + '</div>' +
      (tops ? '<ul class="hub-tops">' + tops + '</ul>' : '') +
      '</div>' +
      '<div class="hub-illus" aria-hidden="true">' + illusFor('hub-' + meta.id, meta.pal, false) + '</div>' +
      '<a class="hub-arrow" aria-hidden="true" href="' + esc(meta.href) + '" tabindex="-1">→</a>' +
      '</div>';
  }
  return html;
}

/** 板块页 ItemList 结构化数据。labelEn 可选（默认英文名拼 "Xxx News Digest"）。 */
export function itemListSchema(label, items, labelEn) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: labelEn ? labelEn + ' News Digest' : label + '新闻速览',
    itemListElement: (items || []).map(function (it, i) {
      return {
        '@type': 'ListItem',
        position: i + 1,
        name: it.title || it.zh_title,
        url: it.link,
      };
    }),
  };
}

/* ---------- 文章页 chrome 双语 helper（供 news/[category]/[slug].astro 用） ---------- */

/** 文章页解读块：EN 模式也保留，配英文小标签 Editor's take。 */
export function takeHtml(take) {
  if (!take) return '';
  return '<div class="take"><b><span class="lang-en">Editor\'s take</span><span class="lang-zh">解读</span></b>' +
    esc(take) + '</div>';
}

/** "阅读原文"按钮：英文默认 + data-i18n。 */
export function readOriginHtml(href) {
  return '<a class="read-origin" href="' + esc(href) + '" target="_blank" rel="noreferrer noopener">' +
    '<span data-i18n="news.read_origin">Read original</span> <span aria-hidden="true">→</span></a>';
}

/**
 * 文章页前后篇导航双语。
 * o: { prevHref, prevEn, prevZh, catHref, catEn, catZh, nextHref, nextEn, nextZh }
 */
export function artNavHtml(o) {
  var prev = o.prevHref
    ? '<a href="' + esc(o.prevHref) + '">← ' + langSpans(o.prevEn || '', o.prevZh || o.prevEn || '') + '</a>'
    : '<span />';
  var next = o.nextHref
    ? '<a href="' + esc(o.nextHref) + '">' + langSpans(o.nextEn || '', o.nextZh || o.nextEn || '') + ' →</a>'
    : '<span />';
  return '<nav class="cat-nav art-nav" aria-label="Article navigation" data-i18n-aria-label="news.article_nav_label">' +
    prev +
    '<a href="' + esc(o.catHref) + '"><span data-i18n="news.back_to">Back to</span> ' +
    langSpans(o.catEn || '', o.catZh || o.catEn || '') + '</a>' +
    next + '</nav>';
}

/** 板块页底部板块导航双语（← 上一板块 / 全部板块 / 下一板块 →）。 */
export function catNavHtml(prevHref, prevId, hubHref, nextHref, nextId) {
  var pl = catLabel(prevId) || {};
  var nl = catLabel(nextId) || {};
  return '<nav class="cat-nav" aria-label="Section navigation" data-i18n-aria-label="news.section_nav_label">' +
    '<a href="' + esc(prevHref) + '">← ' + langSpans(pl.en || '', pl.zh || '') + '</a>' +
    '<a href="' + esc(hubHref) + '"><span data-i18n="news.all_sections">All sections</span></a>' +
    '<a href="' + esc(nextHref) + '">' + langSpans(nl.en || '', nl.zh || '') + ' →</a>' +
    '</nav>';
}
