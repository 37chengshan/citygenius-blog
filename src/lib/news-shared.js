// 新闻共享纯函数库：插图 36 种 + 工具函数。
//
// 单一源头：
//   - 服务端（Astro frontmatter / news-render.js）直接 `import` 本文件；
//   - 浏览器端用 `public/news-shared.js`，由 `scripts/gen-news-shared.js` 从本文件生成
//     （`npm run build` 的 prebuild 自动执行），挂为 `window.NewsShared`。
// 改这里只需要改一处，生成脚本会同步到浏览器端。

export function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** 由原文链接算稳定 slug（FNV-1a 32bit → 8 位 hex）。 */
export function slugFor(link) {
  var h = 0x811c9dc5;
  var s = String(link || '');
  for (var i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return ('0000000' + (h >>> 0).toString(16)).slice(-8);
}

/** 站内文章路径（调用方再套 withBase）。 */
export function articlePath(catId, slug) {
  return '/news/' + catId + '/' + slug + '/';
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

export function fullTime(iso) {
  try {
    return new Date(iso).toLocaleString('zh-CN', { hour12: false });
  } catch (e) {
    return iso || '';
  }
}

export function relTime(iso) {
  var d = dObj(iso);
  if (!d) return '';
  var diff = Date.now() - d.getTime();
  if (diff < 0) diff = 0;
  var m = Math.floor(diff / 60000);
  if (m < 1) return '刚刚';
  if (m < 60) return m + ' 分钟前';
  var h = Math.floor(m / 60);
  if (h < 24) return h + ' 小时前';
  var days = Math.floor(h / 24);
  if (days === 1) return '昨天';
  if (days === 2) return '前天';
  if (days < 30) return days + ' 天前';
  return Math.floor(days / 30) + ' 个月前';
}

/* ---------------- 插图：36 种不同构图 ---------------- */

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

function rg(R, a, b) {
  return a + R() * (b - a);
}
function fi(n) {
  return n.toFixed(1);
}
function star4(cx, cy, r, fill, op) {
  return (
    '<path d="M' + fi(cx) + ',' + fi(cy - r) +
    ' Q' + fi(cx) + ',' + fi(cy) + ' ' + fi(cx + r) + ',' + fi(cy) +
    ' Q' + fi(cx) + ',' + fi(cy) + ' ' + fi(cx) + ',' + fi(cy + r) +
    ' Q' + fi(cx) + ',' + fi(cy) + ' ' + fi(cx - r) + ',' + fi(cy) +
    ' Q' + fi(cx) + ',' + fi(cy) + ' ' + fi(cx) + ',' + fi(cy - r) +
    'Z" fill="' + fill + '" opacity="' + op + '"/>'
  );
}

/* 01 日出海浪 */
function d01(R, pal, W, H) {
  var s = '<circle cx="' + fi(rg(R, W * 0.62, W * 0.85)) + '" cy="' + fi(rg(R, H * 0.16, H * 0.34)) + '" r="' + fi(rg(R, 34, 58)) + '" fill="' + pal[1] + '"/>';
  for (var i = 0; i < 3; i++) {
    var y = H * 0.6 + i * 28, d = 'M-12,' + fi(y), x;
    for (x = 0; x <= W; x += 64) d += ' Q' + fi(x + 32) + ',' + fi(y + rg(R, -15, 15)) + ' ' + fi(x + 64) + ',' + fi(y);
    s += '<path d="' + d + '" fill="none" stroke="' + pal[3] + '" stroke-width="4" opacity="0.7" stroke-linecap="round"/>';
  }
  s += '<circle cx="' + fi(rg(R, 40, W * 0.4)) + '" cy="' + fi(rg(R, H * 0.2, H * 0.45)) + '" r="' + fi(rg(R, 7, 14)) + '" fill="' + pal[3] + '"/>';
  return s;
}
/* 02 同心靶环 */
function d02(R, pal, W, H) {
  var cx = rg(R, W * 0.35, W * 0.65), cy = rg(R, H * 0.3, H * 0.7), s = '', r;
  var cols = [pal[1], pal[2], pal[3], pal[1]];
  for (var i = 4; i >= 1; i--) {
    r = i * rg(R, 26, 34);
    s += '<circle cx="' + fi(cx) + '" cy="' + fi(cy) + '" r="' + fi(r) + '" fill="' + cols[i - 1] + '" opacity="' + (i === 4 ? 0.35 : 0.9) + '"/>';
  }
  s += star4(rg(R, 30, W - 30), rg(R, 24, H - 24), rg(R, 8, 14), pal[3], 0.8);
  return s;
}
/* 03 点阵斜杠 */
function d03(R, pal, W, H) {
  var s = '', r, c;
  for (r = 0; r < 4; r++) for (c = 0; c < 7; c++)
    s += '<circle cx="' + fi(30 + c * 52 + rg(R, -6, 6)) + '" cy="' + fi(30 + r * 52 + rg(R, -6, 6)) + '" r="' + fi(rg(R, 5, 9)) + '" fill="' + pal[3] + '" opacity="0.5"/>';
  s += '<rect x="-40" y="' + fi(H * 0.42) + '" width="' + fi(W + 80) + '" height="' + fi(rg(R, 26, 40)) + '" fill="' + pal[1] + '" transform="rotate(' + fi(rg(R, -14, -6)) + ' ' + fi(W / 2) + ' ' + fi(H / 2) + ')" opacity="0.92"/>';
  return s;
}
/* 04 山峦 */
function d04(R, pal, W, H) {
  var s = '<circle cx="' + fi(rg(R, W * 0.15, W * 0.35)) + '" cy="' + fi(rg(R, H * 0.18, H * 0.32)) + '" r="' + fi(rg(R, 22, 34)) + '" fill="' + pal[1] + '"/>';
  s += '<polygon points="0,' + fi(H) + ' ' + fi(W * 0.28) + ',' + fi(rg(R, H * 0.3, H * 0.45)) + ' ' + fi(W * 0.56) + ',' + fi(H) + '" fill="' + pal[2] + '"/>';
  s += '<polygon points="' + fi(W * 0.4) + ',' + fi(H) + ' ' + fi(W * 0.72) + ',' + fi(rg(R, H * 0.42, H * 0.55)) + ' ' + fi(W) + ',' + fi(H) + '" fill="' + pal[3] + '" opacity="0.85"/>';
  return s;
}
/* 05 拱门 */
function d05(R, pal, W, H) {
  var cx = rg(R, W * 0.35, W * 0.65), w = rg(R, 90, 130), top = rg(R, H * 0.18, H * 0.3);
  var s = '<path d="M' + fi(cx - w / 2) + ',' + fi(H) + ' L' + fi(cx - w / 2) + ',' + fi(top + w / 2) +
    ' A' + fi(w / 2) + ',' + fi(w / 2) + ' 0 0 1 ' + fi(cx + w / 2) + ',' + fi(top + w / 2) +
    ' L' + fi(cx + w / 2) + ',' + fi(H) + ' Z" fill="' + pal[1] + '"/>';
  s += '<circle cx="' + fi(rg(R, 40, W - 40)) + '" cy="' + fi(rg(R, 30, 70)) + '" r="' + fi(rg(R, 10, 18)) + '" fill="' + pal[3] + '"/>';
  for (var i = 0; i < 6; i++) s += '<circle cx="' + fi(rg(R, 20, W - 20)) + '" cy="' + fi(H - rg(R, 14, 40)) + '" r="4" fill="' + pal[3] + '" opacity="0.45"/>';
  return s;
}
/* 06 彩虹弧 */
function d06(R, pal, W, H) {
  var cx = rg(R, W * 0.3, W * 0.7), base = H * rg(R, 0.86, 0.98), s = '';
  var cols = [pal[1], pal[2], pal[3]];
  for (var i = 0; i < 3; i++) {
    var r = rg(R, 90, 120) - i * 30;
    s += '<path d="M' + fi(cx - r) + ',' + fi(base) + ' A' + fi(r) + ',' + fi(r) + ' 0 0 1 ' + fi(cx + r) + ',' + fi(base) + '" fill="none" stroke="' + cols[i] + '" stroke-width="' + fi(rg(R, 16, 24)) + '" opacity="0.85"/>';
  }
  s += star4(rg(R, 40, W - 40), rg(R, 30, 90), rg(R, 9, 15), pal[1], 0.9);
  return s;
}
/* 07 迷宫曲线 */
function d07(R, pal, W, H) {
  var s = '', k;
  var cols = [pal[1], pal[3], pal[2]];
  for (k = 0; k < 3; k++) {
    var y = H * (0.25 + k * 0.25), d = 'M-12,' + fi(y), x;
    for (x = 0; x <= W; x += 44) d += ' Q' + fi(x + 22) + ',' + fi(y + rg(R, -46, 46)) + ' ' + fi(x + 44) + ',' + fi(y + rg(R, -20, 20));
    s += '<path d="' + d + '" fill="none" stroke="' + cols[k] + '" stroke-width="' + fi(rg(R, 5, 9)) + '" stroke-linecap="round" opacity="0.8"/>';
  }
  return s;
}
/* 08 棋盘格 */
function d08(R, pal, W, H) {
  var s = '', r, c, n = 4, m = 6, cw = W / m, ch = H / n;
  for (r = 0; r < n; r++) for (c = 0; c < m; c++)
    if ((r + c) % 2 === 0) s += '<rect x="' + fi(c * cw) + '" y="' + fi(r * ch) + '" width="' + fi(cw) + '" height="' + fi(ch) + '" fill="' + pal[2] + '" opacity="0.7"/>';
  s += '<circle cx="' + fi(rg(R, W * 0.3, W * 0.7)) + '" cy="' + fi(rg(R, H * 0.3, H * 0.7)) + '" r="' + fi(rg(R, 44, 66)) + '" fill="' + pal[1] + '" opacity="0.92"/>';
  s += '<circle cx="' + fi(rg(R, W * 0.3, W * 0.7)) + '" cy="' + fi(rg(R, H * 0.3, H * 0.7)) + '" r="' + fi(rg(R, 12, 20)) + '" fill="' + pal[0] + '"/>';
  return s;
}
/* 09 月牙星空 */
function d09(R, pal, W, H) {
  var cx = rg(R, W * 0.6, W * 0.8), cy = rg(R, H * 0.25, H * 0.45), r = rg(R, 40, 58);
  var s = '<circle cx="' + fi(cx) + '" cy="' + fi(cy) + '" r="' + fi(r) + '" fill="' + pal[1] + '"/>';
  s += '<circle cx="' + fi(cx + r * 0.45) + '" cy="' + fi(cy - r * 0.25) + '" r="' + fi(r * 0.92) + '" fill="' + pal[0] + '"/>';
  for (var i = 0; i < 7; i++) s += star4(rg(R, 20, W - 20), rg(R, 20, H - 20), rg(R, 6, 12), pal[3], rg(R, 0.5, 0.9).toFixed(2));
  return s;
}
/* 10 三角与圆 */
function d10(R, pal, W, H) {
  var cx = rg(R, W * 0.35, W * 0.65);
  var s = '<polygon points="' + fi(cx) + ',' + fi(H * 0.16) + ' ' + fi(cx + 95) + ',' + fi(H * 0.86) + ' ' + fi(cx - 95) + ',' + fi(H * 0.86) +
    '" fill="none" stroke="' + pal[1] + '" stroke-width="10"/>';
  for (var i = 0; i < 3; i++)
    s += '<circle cx="' + fi(rg(R, 40, W - 40)) + '" cy="' + fi(rg(R, 40, H - 40)) + '" r="' + fi(rg(R, 10, 22)) + '" fill="' + (i % 2 ? pal[3] : pal[2]) + '"/>';
  return s;
}
/* 11 均衡器 */
function d11(R, pal, W, H) {
  var s = '', n = 6, bw = W / (n * 1.7);
  for (var i = 0; i < n; i++) {
    var h = rg(R, H * 0.2, H * 0.78), x = 24 + i * (bw * 1.7);
    s += '<rect x="' + fi(x) + '" y="' + fi(H - h) + '" width="' + fi(bw) + '" height="' + fi(h) + '" rx="' + fi(bw / 2) + '" fill="' + (i % 2 ? pal[1] : pal[3]) + '" opacity="' + (i % 2 ? 0.9 : 0.75) + '"/>';
  }
  return s;
}
/* 12 交叠圆 */
function d12(R, pal, W, H) {
  var s = '';
  var cols = [pal[1], pal[2], pal[3]];
  for (var i = 0; i < 3; i++)
    s += '<circle cx="' + fi(rg(R, W * 0.25, W * 0.75)) + '" cy="' + fi(rg(R, H * 0.25, H * 0.75)) + '" r="' + fi(rg(R, 52, 84)) + '" fill="' + cols[i] + '" opacity="0.55"/>';
  return s;
}
/* 13 旋涡 */
function d13(R, pal, W, H) {
  var cx = W / 2, cy = H / 2, s = '', a, rr;
  var d = 'M' + fi(cx) + ',' + fi(cy);
  for (a = 0; a < Math.PI * 5; a += 0.25) {
    rr = 6 + a * 11;
    d += ' L' + fi(cx + Math.cos(a + rg(R, 0, 0.4)) * rr) + ',' + fi(cy + Math.sin(a) * rr * 0.8);
  }
  s += '<path d="' + d + '" fill="none" stroke="' + pal[1] + '" stroke-width="9" stroke-linecap="round"/>';
  s += '<circle cx="' + fi(cx) + '" cy="' + fi(cy) + '" r="12" fill="' + pal[3] + '"/>';
  return s;
}
/* 14 彩纸 */
function d14(R, pal, W, H) {
  var s = '', cols = [pal[1], pal[2], pal[3]];
  for (var i = 0; i < 16; i++) {
    var x = rg(R, 10, W - 10), y = rg(R, 10, H - 10);
    s += '<rect x="' + fi(x) + '" y="' + fi(y) + '" width="' + fi(rg(R, 10, 26)) + '" height="' + fi(rg(R, 6, 14)) +
      '" fill="' + cols[i % 3] + '" transform="rotate(' + fi(rg(R, 0, 180)) + ' ' + fi(x) + ' ' + fi(y) + ')" opacity="0.85"/>';
  }
  return s;
}
/* 15 日食 */
function d15(R, pal, W, H) {
  var cx = rg(R, W * 0.35, W * 0.65), cy = rg(R, H * 0.35, H * 0.65), r = rg(R, 52, 74);
  var s = '<circle cx="' + fi(cx) + '" cy="' + fi(cy) + '" r="' + fi(r) + '" fill="none" stroke="' + pal[1] + '" stroke-width="14"/>';
  s += '<circle cx="' + fi(cx + r * 0.35) + '" cy="' + fi(cy - r * 0.2) + '" r="' + fi(r * 0.55) + '" fill="' + pal[3] + '"/>';
  for (var i = 0; i < 5; i++) s += '<circle cx="' + fi(rg(R, 20, W - 20)) + '" cy="' + fi(rg(R, 20, H - 20)) + '" r="5" fill="' + pal[2] + '"/>';
  return s;
}
/* 16 波浪带 */
function d16(R, pal, W, H) {
  var s = '', cols = [pal[1], pal[2], pal[3]];
  for (var i = 0; i < 3; i++) {
    var yb = H * 0.2 + i * H * 0.26, d = 'M-12,' + fi(yb) + ' ', x;
    for (x = 0; x <= W + 60; x += 60) d += 'Q' + fi(x + 30) + ',' + fi(yb + (i % 2 ? -34 : 34)) + ' ' + fi(x + 60) + ',' + fi(yb) + ' ';
    d += 'L' + fi(W + 12) + ',' + fi(yb + 44) + ' L-12,' + fi(yb + 44) + ' Z';
    s += '<path d="' + d + '" fill="' + cols[i] + '" opacity="0.8"/>';
  }
  return s;
}
/* 17 加号阵 */
function d17(R, pal, W, H) {
  var s = '';
  for (var r = 0; r < 3; r++) for (var c = 0; c < 5; c++) {
    var x = 44 + c * 72, y = 44 + r * 72, l = rg(R, 14, 24), w = rg(R, 6, 10);
    var col = (r + c) % 3 === 0 ? pal[1] : pal[3];
    s += '<rect x="' + fi(x - l / 2) + '" y="' + fi(y - w / 2) + '" width="' + fi(l) + '" height="' + fi(w) + '" fill="' + col + '" opacity="0.85"/>';
    s += '<rect x="' + fi(x - w / 2) + '" y="' + fi(y - l / 2) + '" width="' + fi(w) + '" height="' + fi(l) + '" fill="' + col + '" opacity="0.85"/>';
  }
  return s;
}
/* 18 菱形光芒 */
function d18(R, pal, W, H) {
  var cx = rg(R, W * 0.35, W * 0.65), cy = rg(R, H * 0.35, H * 0.65), rr = rg(R, 44, 62), s = '';
  for (var i = 0; i < 8; i++) {
    var a = (i / 8) * Math.PI * 2;
    s += '<line x1="' + fi(cx + Math.cos(a) * (rr + 14)) + '" y1="' + fi(cy + Math.sin(a) * (rr + 14)) +
      '" x2="' + fi(cx + Math.cos(a) * (rr + 44)) + '" y2="' + fi(cy + Math.sin(a) * (rr + 44)) +
      '" stroke="' + pal[3] + '" stroke-width="5" stroke-linecap="round"/>';
  }
  s += '<polygon points="' + fi(cx) + ',' + fi(cy - rr) + ' ' + fi(cx + rr) + ',' + fi(cy) + ' ' + fi(cx) + ',' + fi(cy + rr) + ' ' + fi(cx - rr) + ',' + fi(cy) + '" fill="' + pal[1] + '"/>';
  return s;
}
/* 19 台阶 */
function d19(R, pal, W, H) {
  var s = '', n = 5, sw = W / n;
  for (var i = 0; i < n; i++) {
    var h = H * 0.24 + i * H * 0.15;
    s += '<rect x="' + fi(i * sw + 8) + '" y="' + fi(H - h) + '" width="' + fi(sw - 16) + '" height="' + fi(h) + '" fill="' + (i % 2 ? pal[1] : pal[2]) + '" opacity="0.9"/>';
  }
  s += '<circle cx="' + fi(rg(R, W * 0.7, W * 0.9)) + '" cy="' + fi(rg(R, 30, 70)) + '" r="' + fi(rg(R, 12, 20)) + '" fill="' + pal[3] + '"/>';
  return s;
}
/* 20 花瓣 */
function d20(R, pal, W, H) {
  var cx = rg(R, W * 0.35, W * 0.65), cy = rg(R, H * 0.35, H * 0.65), s = '';
  for (var i = 0; i < 8; i++) {
    var a = (i / 8) * Math.PI * 2;
    s += '<ellipse cx="' + fi(cx + Math.cos(a) * 52) + '" cy="' + fi(cy + Math.sin(a) * 52) + '" rx="34" ry="20" fill="' + (i % 2 ? pal[1] : pal[2]) +
      '" transform="rotate(' + fi((a * 180) / Math.PI) + ' ' + fi(cx + Math.cos(a) * 52) + ' ' + fi(cy + Math.sin(a) * 52) + ')" opacity="0.85"/>';
  }
  s += '<circle cx="' + fi(cx) + '" cy="' + fi(cy) + '" r="20" fill="' + pal[3] + '"/>';
  return s;
}
/* 21 瞄准镜 */
function d21(R, pal, W, H) {
  var cx = rg(R, W * 0.35, W * 0.65), cy = rg(R, H * 0.35, H * 0.65), r = rg(R, 58, 80);
  var s = '<circle cx="' + fi(cx) + '" cy="' + fi(cy) + '" r="' + fi(r) + '" fill="none" stroke="' + pal[1] + '" stroke-width="10"/>';
  s += '<line x1="' + fi(cx - r - 22) + '" y1="' + fi(cy) + '" x2="' + fi(cx + r + 22) + '" y2="' + fi(cy) + '" stroke="' + pal[3] + '" stroke-width="5"/>';
  s += '<line x1="' + fi(cx) + '" y1="' + fi(cy - r - 22) + '" x2="' + fi(cx) + '" y2="' + fi(cy + r + 22) + '" stroke="' + pal[3] + '" stroke-width="5"/>';
  s += '<circle cx="' + fi(cx) + '" cy="' + fi(cy) + '" r="10" fill="' + pal[3] + '"/>';
  return s;
}
/* 22 滴落 */
function d22(R, pal, W, H) {
  var s = '<ellipse cx="' + fi(W / 2) + '" cy="' + fi(H * 0.3) + '" rx="' + fi(rg(R, 90, 120)) + '" ry="' + fi(rg(R, 40, 55)) + '" fill="' + pal[1] + '"/>';
  for (var i = 0; i < 3; i++) {
    var x = rg(R, W * 0.25, W * 0.75), len = rg(R, 40, 110);
    s += '<rect x="' + fi(x - 11) + '" y="' + fi(H * 0.3) + '" width="22" height="' + fi(len) + '" rx="11" fill="' + pal[1] + '"/>';
    s += '<circle cx="' + fi(x) + '" cy="' + fi(H * 0.3 + len) + '" r="11" fill="' + pal[1] + '"/>';
  }
  s += '<circle cx="' + fi(rg(R, 40, 90)) + '" cy="' + fi(rg(R, H * 0.6, H * 0.8)) + '" r="' + fi(rg(R, 12, 22)) + '" fill="' + pal[3] + '" opacity="0.8"/>';
  return s;
}
/* 23 纸飞机 */
function d23(R, pal, W, H) {
  var s = '';
  for (var i = 0; i < 3; i++) {
    var x = rg(R, 50, W - 90), y = rg(R, 40, H - 60), sc = rg(R, 0.7, 1.3), rot = rg(R, -30, 30);
    s += '<polygon points="0,-26 22,18 0,8 -22,18" fill="' + (i === 1 ? pal[1] : pal[3]) + '" opacity="0.9" transform="translate(' + fi(x) + ',' + fi(y) + ') rotate(' + fi(rot) + ') scale(' + fi(sc) + ')"/>';
  }
  var d = 'M-12,' + fi(H * 0.8) + ' ', x2;
  for (x2 = 0; x2 <= W; x2 += 70) d += 'Q' + fi(x2 + 35) + ',' + fi(H * 0.8 - 26) + ' ' + fi(x2 + 70) + ',' + fi(H * 0.8) + ' ';
  s += '<path d="' + d + '" fill="none" stroke="' + pal[2] + '" stroke-width="5" stroke-dasharray="2,12" stroke-linecap="round"/>';
  return s;
}
/* 24 黑胶 */
function d24(R, pal, W, H) {
  var cx = rg(R, W * 0.35, W * 0.65), cy = rg(R, H * 0.32, H * 0.68), r = rg(R, 62, 80), s = '';
  s += '<circle cx="' + fi(cx) + '" cy="' + fi(cy) + '" r="' + fi(r) + '" fill="' + pal[3] + '"/>';
  for (var i = 1; i <= 3; i++)
    s += '<circle cx="' + fi(cx) + '" cy="' + fi(cy) + '" r="' + fi((r * i) / 4) + '" fill="none" stroke="' + pal[0] + '" stroke-width="2" opacity="0.5"/>';
  s += '<circle cx="' + fi(cx) + '" cy="' + fi(cy) + '" r="16" fill="' + pal[1] + '"/>';
  s += '<rect x="' + fi(cx + r + 8) + '" y="' + fi(cy - r) + '" width="8" height="' + fi(r * 2) + '" rx="4" fill="' + pal[1] + '" transform="rotate(18 ' + fi(cx + r + 8) + ' ' + fi(cy) + ')"/>';
  return s;
}
/* 25 柱状 */
function d25(R, pal, W, H) {
  var s = '', n = 6, bw = (W - 60) / n;
  for (var i = 0; i < n; i++) {
    var h = rg(R, H * 0.18, H * 0.7), x = 30 + i * bw;
    s += '<rect x="' + fi(x + 4) + '" y="' + fi(H - 30 - h) + '" width="' + fi(bw - 8) + '" height="' + fi(h) + '" rx="6" fill="' + (i === n - 2 ? pal[1] : pal[3]) + '" opacity="' + (i === n - 2 ? 1 : 0.55) + '"/>';
  }
  s += '<line x1="20" y1="' + fi(H - 30) + '" x2="' + fi(W - 20) + '" y2="' + fi(H - 30) + '" stroke="' + pal[3] + '" stroke-width="4"/>';
  return s;
}
/* 26 嵌套方 */
function d26(R, pal, W, H) {
  var cx = rg(R, W * 0.35, W * 0.65), cy = rg(R, H * 0.35, H * 0.65), s = '';
  var cols = [pal[1], pal[2], pal[3]];
  for (var i = 0; i < 3; i++) {
    var sz = 150 - i * 44;
    s += '<rect x="' + fi(cx - sz / 2) + '" y="' + fi(cy - sz / 2) + '" width="' + fi(sz) + '" height="' + fi(sz) +
      '" fill="none" stroke="' + cols[i] + '" stroke-width="9" transform="rotate(' + fi(rg(R, 0, 40) + i * 15) + ' ' + fi(cx) + ' ' + fi(cy) + ')"/>';
  }
  return s;
}
/* 27 彗星 */
function d27(R, pal, W, H) {
  var cx = rg(R, W * 0.55, W * 0.85), cy = rg(R, H * 0.2, H * 0.45), s = '';
  for (var i = 0; i < 3; i++)
    s += '<line x1="' + fi(cx - 24 - i * 34) + '" y1="' + fi(cy + 16 + i * 22) + '" x2="' + fi(cx - 60 - i * 40) + '" y2="' + fi(cy + 30 + i * 30) +
      '" stroke="' + pal[1] + '" stroke-width="' + fi(10 - i * 2.5) + '" stroke-linecap="round" opacity="' + (0.85 - i * 0.25) + '"/>';
  s += '<circle cx="' + fi(cx) + '" cy="' + fi(cy) + '" r="' + fi(rg(R, 26, 36)) + '" fill="' + pal[3] + '"/>';
  s += '<circle cx="' + fi(cx - 8) + '" cy="' + fi(cy - 8) + '" r="8" fill="' + pal[0] + '" opacity="0.7"/>';
  for (var k = 0; k < 4; k++) s += star4(rg(R, 20, W - 20), rg(R, 20, H - 20), rg(R, 6, 10), pal[2], 0.9);
  return s;
}
/* 28 雨滴 */
function d28(R, pal, W, H) {
  var s = '';
  for (var i = 0; i < 9; i++) {
    var x = rg(R, 20, W - 20), y = rg(R, 20, H * 0.6);
    s += '<line x1="' + fi(x) + '" y1="' + fi(y) + '" x2="' + fi(x - 12) + '" y2="' + fi(y + 30) + '" stroke="' + pal[1] + '" stroke-width="6" stroke-linecap="round"/>';
  }
  s += '<ellipse cx="' + fi(W / 2) + '" cy="' + fi(H * 0.86) + '" rx="' + fi(rg(R, 90, 130)) + '" ry="18" fill="' + pal[2] + '" opacity="0.8"/>';
  s += '<ellipse cx="' + fi(W / 2) + '" cy="' + fi(H * 0.86) + '" rx="' + fi(rg(R, 40, 60)) + '" ry="9" fill="' + pal[1] + '" opacity="0.8"/>';
  return s;
}
/* 29 眼睛 */
function d29(R, pal, W, H) {
  var cx = rg(R, W * 0.35, W * 0.65), cy = rg(R, H * 0.4, H * 0.6), w = rg(R, 110, 150), h = rg(R, 46, 64);
  var s = '<path d="M' + fi(cx - w / 2) + ',' + fi(cy) + ' Q' + fi(cx) + ',' + fi(cy - h) + ' ' + fi(cx + w / 2) + ',' + fi(cy) +
    ' Q' + fi(cx) + ',' + fi(cy + h) + ' ' + fi(cx - w / 2) + ',' + fi(cy) + ' Z" fill="' + pal[0] + '" stroke="' + pal[3] + '" stroke-width="8"/>';
  s += '<circle cx="' + fi(cx) + '" cy="' + fi(cy) + '" r="' + fi(rg(R, 18, 26)) + '" fill="' + pal[1] + '"/>';
  s += '<circle cx="' + fi(cx + 7) + '" cy="' + fi(cy - 7) + '" r="6" fill="' + pal[0] + '"/>';
  return s;
}
/* 30 桥 */
function d30(R, pal, W, H) {
  var s = '<rect x="20" y="' + fi(H * 0.52) + '" width="' + fi(W - 40) + '" height="10" fill="' + pal[3] + '"/>';
  s += '<path d="M40,' + fi(H * 0.52) + ' Q' + fi(W / 2) + ',' + fi(H * 0.1) + ' ' + fi(W - 40) + ',' + fi(H * 0.52) + '" fill="none" stroke="' + pal[1] + '" stroke-width="10"/>';
  for (var i = 1; i < 6; i++) {
    var x = 40 + ((W - 80) * i) / 6;
    s += '<line x1="' + fi(x) + '" y1="' + fi(H * 0.52) + '" x2="' + fi(x) + '" y2="' + fi(H * 0.52 + 26) + '" stroke="' + pal[3] + '" stroke-width="5" opacity="0.6"/>';
  }
  for (var k = 0; k < 3; k++)
    s += '<line x1="' + fi(rg(R, 60, W - 60)) + '" y1="' + fi(H * 0.68 + k * 22) + '" x2="' + fi(rg(R, 60, W - 60)) + '" y2="' + fi(H * 0.68 + k * 22) + '" stroke="' + pal[2] + '" stroke-width="6" stroke-linecap="round"/>';
  return s;
}
/* 31 气泡 */
function d31(R, pal, W, H) {
  var s = '';
  for (var i = 0; i < 9; i++)
    s += '<circle cx="' + fi(rg(R, 24, W - 24)) + '" cy="' + fi(rg(R, 24, H - 24)) + '" r="' + fi(rg(R, 10, 38)) +
      '" fill="' + [pal[1], pal[2], pal[3]][i % 3] + '" opacity="' + rg(R, 0.3, 0.75).toFixed(2) + '"/>';
  return s;
}
/* 32 闪电 */
function d32(R, pal, W, H) {
  var cx = rg(R, W * 0.4, W * 0.6);
  var s = '<polygon points="' + fi(cx + 20) + ',20 ' + fi(cx - 34) + ',' + fi(H * 0.56) + ' ' + fi(cx - 2) + ',' + fi(cx - 2) + ',' + fi(H * 0.56) +
    ' ' + fi(cx - 20) + ',' + fi(H - 24) + ' ' + fi(cx + 34) + ',' + fi(H * 0.44) + ' ' + fi(cx + 2) + ',' + fi(H * 0.44) + '" fill="' + pal[1] + '"/>';
  s += '<ellipse cx="' + fi(cx - 90) + '" cy="' + fi(H * 0.3) + '" rx="46" ry="22" fill="' + pal[2] + '"/>';
  s += '<ellipse cx="' + fi(cx + 95) + '" cy="' + fi(H * 0.66) + '" rx="52" ry="24" fill="' + pal[2] + '"/>';
  return s;
}
/* 33 水磨石 */
function d33(R, pal, W, H) {
  var s = '', cols = [pal[1], pal[2], pal[3]];
  for (var i = 0; i < 11; i++) {
    var x = rg(R, 10, W - 30), y = rg(R, 10, H - 30), sz = rg(R, 12, 30), n = 3 + Math.floor(R() * 3), p = '', k;
    for (k = 0; k < n; k++) { var a = (k / n) * Math.PI * 2; p += fi(x + Math.cos(a) * sz) + ',' + fi(y + Math.sin(a) * sz) + ' '; }
    s += '<polygon points="' + p + '" fill="' + cols[i % 3] + '" opacity="0.8"/>';
  }
  return s;
}
/* 34 大地色 C 形 */
function d34(R, pal, W, H) {
  var cx = rg(R, W * 0.4, W * 0.6), cy = rg(R, H * 0.4, H * 0.6), r = rg(R, 60, 85);
  var s = '<path d="M' + fi(cx + r * 0.7) + ',' + fi(cy - r * 0.7) + ' A' + fi(r) + ',' + fi(r) + ' 0 1 0 ' + fi(cx + r * 0.7) + ',' + fi(cy + r * 0.7) +
    '" fill="none" stroke="' + pal[1] + '" stroke-width="26" stroke-linecap="round"/>';
  for (var i = 0; i < 5; i++) {
    var a = Math.PI * (0.65 + (i / 5) * 1.7);
    s += '<circle cx="' + fi(cx + Math.cos(a) * (r + 34)) + '" cy="' + fi(cy + Math.sin(a) * (r + 34)) + '" r="' + fi(rg(R, 6, 11)) + '" fill="' + pal[3] + '"/>';
  }
  return s;
}
/* 35 层叠山丘 */
function d35(R, pal, W, H) {
  var s = '', cols = [pal[2], pal[1], pal[3]];
  for (var i = 0; i < 3; i++) {
    var yb = H * (0.45 + i * 0.2);
    s += '<path d="M-12,' + fi(H + 12) + ' L-12,' + fi(yb) + ' Q' + fi(W * 0.3) + ',' + fi(yb - rg(R, 50, 90)) + ' ' + fi(W * 0.55) + ',' + fi(yb) +
      ' Q' + fi(W * 0.8) + ',' + fi(yb + rg(R, 20, 50)) + ' ' + fi(W + 12) + ',' + fi(yb - 20) + ' L' + fi(W + 12) + ',' + fi(H + 12) + ' Z" fill="' + cols[i] + '" opacity="0.85"/>';
  }
  return s;
}
/* 36 星爆 */
function d36(R, pal, W, H) {
  var cx = rg(R, W * 0.35, W * 0.65), cy = rg(R, H * 0.35, H * 0.65), s = '';
  for (var i = 0; i < 12; i++) {
    var a = (i / 12) * Math.PI * 2, len = rg(R, 46, 88), wdt = rg(R, 8, 15);
    var px = Math.cos(a + Math.PI / 2) * wdt, py = Math.sin(a + Math.PI / 2) * wdt;
    s += '<polygon points="' + fi(cx + px) + ',' + fi(cy + py) + ' ' + fi(cx - px) + ',' + fi(cy - py) + ' ' +
      fi(cx + Math.cos(a) * len) + ',' + fi(cy + Math.sin(a) * len) + '" fill="' + (i % 3 === 0 ? pal[1] : pal[3]) + '" opacity="0.85"/>';
  }
  s += '<circle cx="' + fi(cx) + '" cy="' + fi(cy) + '" r="18" fill="' + pal[1] + '"/>';
  return s;
}

var DESIGNS = [
  d01, d02, d03, d04, d05, d06, d07, d08, d09, d10,
  d11, d12, d13, d14, d15, d16, d17, d18, d19, d20,
  d21, d22, d23, d24, d25, d26, d27, d28, d29, d30,
  d31, d32, d33, d34, d35, d36,
];

export var ILLUS_COUNT = DESIGNS.length;

/** 按种子选一款插图并渲染为 SVG 字符串（同一种子永远同一款）。 */
export function illusFor(seed, pal, wide) {
  var R = mulberry32(xmur3(String(seed || 'news'))());
  var W = wide ? 760 : 400,
    H = wide ? 300 : 250;
  var idx = xmur3('illus:' + String(seed || 'news'))() % DESIGNS.length;
  var inner = DESIGNS[idx](R, pal, W, H);
  return (
    '<svg viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="插图">' +
    '<rect width="' + W + '" height="' + H + '" fill="' + pal[0] + '"/>' +
    inner +
    '</svg>'
  );
}
