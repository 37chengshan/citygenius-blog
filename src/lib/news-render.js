// 新闻页构建期静态渲染（SSR 快照）。
//
// 解决爬虫 / 无 JS 抓取看不到新闻内容的问题：构建时把 public/news.json 的快照
// 直接写进 HTML，浏览器端 JS 加载后仍会拉取 news.json 并刷新为最新数据。
//
// 注意：浏览器端内联脚本里有一份手写副本（Astro 不打包内联 <script> 里的 import，
// 实测会原样留下 bare import 导致整页空白），改卡片结构时两处必须同步，见 NEWS_WORKFLOW.md。
//
// 本模块只跑在 Node（Astro frontmatter），不依赖 DOM。

export function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

var WEEK = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

function dObj(iso) {
  var d = new Date(iso);
  return isNaN(d.getTime()) ? null : d;
}

export function dateParts(iso) {
  var d = dObj(iso);
  if (!d) return null;
  var m = d.getMinutes();
  return {
    date: d.getMonth() + 1 + '月' + d.getDate() + '日',
    week: WEEK[d.getDay()],
    hm: d.getHours() + ':' + (m < 10 ? '0' : '') + m,
    key: d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(),
  };
}

/* ---------- 生成式插画（与浏览器端同算法，保证首屏与刷新后视觉一致） ---------- */
function xmur3(str) {
  for (var i = 0, h = 1779033703 ^ str.length; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return function () {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return (h ^= h >>> 16) >>> 0;
  };
}

function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    var t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function blobPath(R, cx, cy, r) {
  var pts = [],
    n = 8,
    i,
    a,
    rr;
  for (i = 0; i < n; i++) {
    a = (i / n) * Math.PI * 2;
    rr = r * (0.7 + R() * 0.55);
    pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * 0.85]);
  }
  var d = 'M' + pts[0][0].toFixed(1) + ',' + pts[0][1].toFixed(1);
  for (i = 0; i < n; i++) {
    var p = pts[i],
      q = pts[(i + 1) % n];
    d +=
      ' Q' +
      p[0].toFixed(1) +
      ',' +
      p[1].toFixed(1) +
      ' ' +
      ((p[0] + q[0]) / 2).toFixed(1) +
      ',' +
      ((p[1] + q[1]) / 2).toFixed(1);
  }
  return d + 'Z';
}

export function makeIllus(seed, pal, wide) {
  var R = mulberry32(xmur3(String(seed || 'news'))());
  var W = wide ? 760 : 400,
    H = wide ? 300 : 250;
  var paper = pal[0],
    accent = pal[1],
    soft = pal[2],
    ink = pal[3];
  var s =
    '<svg viewBox="0 0 ' +
    W +
    ' ' +
    H +
    '" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="插图">';
  s += '<rect width="' + W + '" height="' + H + '" fill="' + paper + '"/>';
  s +=
    '<path d="' +
    blobPath(R, W * (0.15 + R() * 0.7), H * (0.2 + R() * 0.5), Math.min(W, H) * (0.16 + R() * 0.14)) +
    '" fill="' +
    soft +
    '" opacity="0.6"/>';
  s +=
    '<path d="' +
    blobPath(R, W * (0.3 + R() * 0.4), H * (0.35 + R() * 0.3), Math.min(W, H) * (0.3 + R() * 0.2)) +
    '" fill="' +
    accent +
    '" opacity="0.9"/>';
  var rx = W * (0.08 + R() * 0.75),
    ry = H * (0.12 + R() * 0.6),
    rr = 16 + R() * 44;
  s +=
    '<circle cx="' +
    rx.toFixed(0) +
    '" cy="' +
    ry.toFixed(0) +
    '" r="' +
    rr.toFixed(0) +
    '" fill="none" stroke="' +
    ink +
    '" stroke-width="' +
    (2.5 + R() * 3.5).toFixed(1) +
    '" opacity="0.75"/>';
  s +=
    '<circle cx="' +
    (W * (0.1 + R() * 0.8)).toFixed(0) +
    '" cy="' +
    (H * (0.1 + R() * 0.8)).toFixed(0) +
    '" r="' +
    (8 + R() * 16).toFixed(0) +
    '" fill="' +
    ink +
    '" opacity="0.85"/>';
  var y0 = H * (0.15 + R() * 0.7),
    dd = 'M-20,' + y0.toFixed(0),
    x;
  for (x = 0; x <= W; x += 48) {
    dd +=
      ' Q' +
      (x + 24).toFixed(0) +
      ',' +
      (y0 + (R() * 52 - 26)).toFixed(0) +
      ' ' +
      (x + 48).toFixed(0) +
      ',' +
      y0.toFixed(0);
  }
  s +=
    '<path d="' +
    dd +
    '" fill="none" stroke="' +
    accent +
    '" stroke-width="3.5" stroke-linecap="round" opacity="0.55"/>';
  var gx = W * (0.55 + R() * 0.3),
    gy = H * (0.1 + R() * 0.2),
    r2,
    c2;
  for (r2 = 0; r2 < 3; r2++) {
    for (c2 = 0; c2 < 4; c2++) {
      s +=
        '<circle cx="' +
        (gx + c2 * 16).toFixed(0) +
        '" cy="' +
        (gy + r2 * 16).toFixed(0) +
        '" r="3" fill="' +
        ink +
        '" opacity="0.45"/>';
    }
  }
  s += '</svg>';
  return s;
}

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
    '<span class="date-badge">' +
    esc(p.date) +
    '</span>' +
    '<span class="week">' +
    esc(p.week) +
    ' · ' +
    esc(p.hm) +
    '</span>' +
    '<span class="src">' +
    esc(src || '') +
    '</span>' +
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
    '<' +
    tag +
    '>' +
    esc(it.zh_title || it.title) +
    '</' +
    tag +
    '>' +
    enTitle +
    staticDateLine(it.published, it.source) +
    (zh ? '<p>' + esc(zh) + '</p>' : '') +
    take +
    enSum +
    '</div>'
  );
}

export function featCard(it, pal) {
  var art = it.image
    ? '<div class="illus"><img loading="lazy" src="' + esc(it.image) + '" alt=""/></div>'
    : '<div class="illus">' + makeIllus(it.link || it.title, pal, false) + '</div>';
  return (
    '<a class="feat" href="' +
    esc(it.link) +
    '" target="_blank" rel="noreferrer noopener">' +
    art +
    cardBody(it, 'h2') +
    '</a>'
  );
}

var SPANS = ['sp8', 'sp4', 'sp4', 'sp8', 'sp4', 'sp4', 'sp4', 'sp6', 'sp6', 'sp5', 'sp7'];

function bentoCard(it, cls, pal) {
  return (
    '<a class="news-card ' +
    cls +
    '" href="' +
    esc(it.link) +
    '" target="_blank" rel="noreferrer noopener">' +
    '<div class="illus">' +
    makeIllus(it.link || it.title, pal, false) +
    '</div>' +
    cardBody(it, 'h3') +
    '</a>'
  );
}

function dayDiv(p) {
  return '<div class="day-div"><span>' + esc(p.date) + ' ' + esc(p.week) + '</span></div>';
}

/** 板块页静态 HTML：{ feat, grid }，无数据时返回空字符串（前端显示"抓取中"）。 */
export function staticCategory(items, pal) {
  if (!items || !items.length) return { feat: '', grid: '' };
  var feat = featCard(items[0], pal);
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
    var cls = SPANS[(i - 1) % SPANS.length] + (i % 2 === 0 ? ' off' : '');
    html += bentoCard(items[i], cls, pal);
  }
  return { feat: feat, grid: html };
}

/** 入口页静态 HTML：六张板块卡片。 */
export function staticHub(cats, data) {
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
      tops += '<li>' + esc(items[t].zh_title || items[t].title) + '</li>';
    }
    var n = ix + 1;
    html +=
      '<a class="hub-card" href="' +
      esc(meta.href) +
      '">' +
      '<div class="hub-ix">' +
      (n < 10 ? '0' : '') +
      n +
      '</div>' +
      '<div class="hub-main">' +
      '<div class="hub-title">' +
      esc(meta.label) +
      '<span class="count">' +
      items.length +
      ' 条</span></div>' +
      '<div class="hub-desc">' +
      esc(meta.desc) +
      '</div>' +
      (tops ? '<ul class="hub-tops">' + tops + '</ul>' : '') +
      '</div>' +
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
