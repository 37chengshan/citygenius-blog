// 新闻页构建期静态渲染（SSR 快照），跑在 Node（Astro frontmatter）。
// 纯函数来自 ./news-shared.js（与浏览器端同源，见该文件头注释）。

import { esc, slugFor, articlePath, dateParts, illusFor } from './news-shared.js';

/** 文章站内链接：linkArt(catId, slug) 由调用方传入（已套 withBase）。 */
export { slugFor, articlePath };

/* ---------- 卡片（静态版：绝对时间，无"几小时前"，JS 刷新后会补上） ---------- */
function staticDateLine(pub, src) {
  if (!pub) {
    return '<div class="date-line"><span class="src">' + esc(src || '') + '</span></div>';
  }
  var p = dateParts(pub);
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

function cardBody(it, tag) {
  var enTitle =
    it.en_title && it.en_title !== (it.zh_title || it.title)
      ? '<div class="en-title">' + esc(it.en_title) + '</div>'
      : '';
  var take = it.zh_take ? '<div class="take"><b>解读</b>' + esc(it.zh_take) + '</div>' : '';
  var enSum = it.en_summary ? '<p class="en-sum">' + esc(it.en_summary) + '</p>' : '';
  var zh = it.zh_summary || it.summary || '';
  return (
    '<div class="card-body">' +
    '<' + tag + '>' + esc(it.zh_title || it.title) + '</' + tag + '>' +
    enTitle +
    staticDateLine(it.published, it.source) +
    (zh ? '<p>' + esc(zh) + '</p>' : '') +
    take +
    enSum +
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

function dayDiv(p) {
  return '<div class="day-div"><span>' + esc(p.date) + ' ' + esc(p.week) + '</span></div>';
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
      html += dayDiv(p);
      lastDay = dk;
    }
    var sp = SPANS[(i - 1) % SPANS.length];
    var cls = sp + (sp === 'wide' ? '' : i % 2 === 0 ? ' off' : '');
    html += bentoCard(catId, items[i], cls, pal, linkArt);
  }
  return { feat: feat, grid: html };
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
        esc(it.zh_title || it.title) + '</a></li>';
    }
    var n = ix + 1;
    html +=
      '<a class="hub-card" href="' + esc(meta.href) + '">' +
      '<div class="hub-ix">' + (n < 10 ? '0' : '') + n + '</div>' +
      '<div class="hub-main">' +
      '<div class="hub-title">' + esc(meta.label) + '<span class="count">' + items.length + ' 条</span></div>' +
      '<div class="hub-desc">' + esc(meta.desc) + '</div>' +
      (tops ? '<ul class="hub-tops">' + tops + '</ul>' : '') +
      '</div>' +
      '<div class="hub-illus" aria-hidden="true">' + illusFor('hub-' + meta.id, meta.pal, false) + '</div>' +
      '<div class="hub-arrow" aria-hidden="true">→</div>' +
      '</a>';
  }
  return html;
}

/** 板块页 ItemList 结构化数据。 */
export function itemListSchema(label, items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: label + '新闻速览',
    itemListElement: (items || []).map(function (it, i) {
      return {
        '@type': 'ListItem',
        position: i + 1,
        name: it.zh_title || it.title,
        url: it.link,
      };
    }),
  };
}
