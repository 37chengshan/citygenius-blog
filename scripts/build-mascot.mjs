// Pixel cat mascot generator. Run: node scripts/build-mascot.mjs
// Outputs public/mascot/cat.png — a 1x sprite atlas (3 rows: body / face / prop, 26x21 cells).
// Scale it with CSS `image-rendering: pixelated` at integer multiples only.
import { writeFileSync, mkdirSync } from 'node:fs';
import { deflateSync } from 'node:zlib';

const GW = 26, GH = 21;
const PAL = { o:'#4A2E35', H:'#F0B5C8', h:'#D98BA6', i:'#F49AB3', l:'#FBE6EC', K:'#2A2326', Y:'#F7C744', y:'#D9961C', W:'#FFFFFF', E:'#2B2226', B:'#F48C9C', M:'#8E3A50', T:'#F27E95', b:'#8EC5F2', Z:'#6B5A60' };

const inEll = (x, y, cx, cy, rx, ry) => ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1;
const inTri = (px, py, [ax, ay], [bx, by], [cx, cy]) => {
  const s = (x1, y1, x2, y2, x3, y3) => (x1 - x3) * (y2 - y3) - (x2 - x3) * (y1 - y3);
  const d1 = s(px, py, ax, ay, bx, by), d2 = s(px, py, bx, by, cx, cy), d3 = s(px, py, cx, cy, ax, ay);
  return !((d1 < 0 || d2 < 0 || d3 < 0) && (d1 > 0 || d2 > 0 || d3 > 0));
};
const blank = () => Array.from({ length: GH }, () => Array(GW).fill('.'));
const P = (g, y, x, s) => [...s].forEach((c, i) => { if (c !== '_') g[y][x + i] = c; });

function body(tail) {
  const g = blank();
  const paint = (fn, c) => { for (let y = 0; y < GH; y++) for (let x = 0; x < GW; x++) if (fn(x + 0.5, y + 0.5, x, y)) g[y][x] = c; };
  const tails = [
    [[19,17],[20,17],[21,16],[22,15],[22,14],[22,13],[21,12],[21,11]],
    [[19,17],[20,17],[21,16],[22,16],[23,15],[23,14],[24,13],[24,12]],
    [[19,17],[20,17],[21,17],[22,16],[22,15],[21,14],[20,13],[20,12]],
  ];
  tails[tail].forEach(([x, y], i) => { g[y][x] = i % 2 ? 'h' : 'H'; g[y][x + 1] = i % 2 ? 'H' : 'h'; });
  paint((x, y) => inEll(x, y, 12, 17.4, 7.4, 4.4) && y < 20.6, 'H');
  paint((x, y) => inEll(x, y, 12, 10, 9.6, 6.4), 'H');
  const eL = [[2.6,7.5],[4.4,0.6],[10,4.2]], eR = eL.map(([x, y]) => [24 - x, y]);
  paint((x, y) => inTri(x, y, ...eL) || inTri(x, y, ...eR), 'H');
  const iL = [[4.4,5.6],[5,2.6],[8.2,4.8]], iR = iL.map(([x, y]) => [24 - x, y]);
  paint((x, y) => inTri(x, y, ...iL) || inTri(x, y, ...iR), 'i');
  for (const [x, y] of [[17,4],[18,4],[17,5],[16,6],[17,6]]) g[y][x] = 'Y';
  g[5][18] = 'y';
  paint((x, y) => inEll(x, y, 12, 12.4, 4.4, 2.2), 'l');
  paint((x, y, ix, iy) => iy === 15 && g[iy][ix] !== '.' && x > 6.5 && x < 17.5, 'K');
  g[15][11] = 'Y'; g[15][12] = 'Y'; g[16][11] = 'y'; g[16][12] = 'y';
  paint((x, y) => inEll(x, y, 12, 19, 3.6, 2.6) && y > 16.5, 'l');
  for (const x of [7, 8, 15, 16]) g[20][x] = 'W';
  for (const [x, y] of [[4,9],[20,10],[5,17],[19,8]]) if (g[y][x] === 'H') g[y][x] = 'i';
  // outline
  const o = g.map(r => r.slice());
  for (let y = 0; y < GH; y++) for (let x = 0; x < GW; x++) {
    if (g[y][x] !== '.') continue;
    if ([[1,0],[-1,0],[0,1],[0,-1]].some(([dx, dy]) => { const v = g[y + dy]?.[x + dx]; return v && v !== '.'; })) o[y][x] = 'o';
  }
  return o;
}

const eyes = (g, L, R = L, y = 8) => { L.forEach((r, i) => P(g, y + i, 8, r)); R.forEach((r, i) => P(g, y + i, 14, r)); };
const blush = (g, s = 'BB') => { P(g, 11, 4, s); P(g, 11, 18, s); };
const omega = g => { P(g, 11, 10, 'M__M'); P(g, 12, 11, 'MM'); };
const grin = g => { P(g, 11, 10, 'MMMM'); P(g, 12, 11, 'TT'); };
const OPEN = ['WE', 'EE', 'EE'];
const ARC = ['___', 'E_E', '_E_'];   // closed, smiling
const UP = ['_E_', 'E_E', '___'];    // ^ ^

export const FACES = {
  idle:      g => { eyes(g, OPEN); omega(g); blush(g); },
  blink:     g => { eyes(g, ['__', '__', 'EE']); omega(g); blush(g); },
  content:   g => { ARC.forEach((r, i) => { P(g, 8 + i, 7, r); P(g, 8 + i, 14, r); }); omega(g); blush(g); },
  happy:     g => { UP.forEach((r, i) => { P(g, 8 + i, 7, r); P(g, 8 + i, 14, r); }); grin(g); blush(g); },
  sleepy:    g => { P(g, 10, 7, 'EEE'); P(g, 10, 14, 'EEE'); P(g, 12, 11, 'MM'); blush(g); },
  surprised: g => { eyes(g, ['WE', 'EE', 'EE', 'EE'], undefined, 7); P(g, 12, 11, 'MM'); P(g, 13, 11, 'MM'); blush(g, 'B_'); },
  think:     g => { eyes(g, ['EW', 'EE'], ['EW', 'EE'], 8); omega(g); blush(g); },
  wink:      g => { ARC.forEach((r, i) => P(g, 8 + i, 7, r)); OPEN.forEach((r, i) => P(g, 8 + i, 14, r)); omega(g); P(g, 13, 11, 'TT'); blush(g); },
  cheer:     g => { ['E__', '_EE', 'E__'].forEach((r, i) => P(g, 8 + i, 7, r)); ['__E', 'EE_', '__E'].forEach((r, i) => P(g, 8 + i, 14, r)); grin(g); blush(g); },
  love:      g => { ['T_T', 'TTT', '_T_'].forEach((r, i) => { P(g, 8 + i, 7, r); P(g, 8 + i, 14, r); }); grin(g); blush(g); },
  star:      g => { ['_Y_', 'YWY', '_Y_'].forEach((r, i) => { P(g, 8 + i, 7, r); P(g, 8 + i, 14, r); }); grin(g); blush(g); },
  sad:       g => { eyes(g, ['WE', 'EE', 'bb']); P(g, 12, 11, 'MM'); blush(g); },
  shy:       g => { ['E__', '_EE', 'E__'].forEach((r, i) => P(g, 8 + i, 7, r)); ['__E', 'EE_', '__E'].forEach((r, i) => P(g, 8 + i, 14, r)); P(g, 12, 11, 'MM'); blush(g, 'BBB'); },
};

export const PROPS = {
  none:    () => {},
  wave1:   g => ['_oo_', 'oWWo', 'oHHo', 'oHHo', '_oHo'].forEach((r, i) => P(g, 10 + i, 0, r)),
  wave2:   g => ['oo__', 'oWWo', 'oHHo', '_oHHo', '__oHo'].forEach((r, i) => P(g, 10 + i, 0, r)),
  zzz1:    g => { ['ZZZZ', '__Z_', '_Z__', 'ZZZZ'].forEach((r, i) => P(g, 5 + i, 20, r)); },
  zzz2:    g => { ['ZZZZ', '__Z_', '_Z__', 'ZZZZ'].forEach((r, i) => P(g, 5 + i, 20, r)); ['ZZZ', '__Z', '_Z_', 'ZZZ'].forEach((r, i) => P(g, 0 + i, 23, r)); },
  heart:   g => ['_TT_TT', 'TTTTTT', '_TTTT_', '__TT__'].forEach((r, i) => P(g, i, 19, r)),
  sweat:   g => ['_o_', 'obo', 'obo', '_o_'].forEach((r, i) => P(g, 4 + i, 20, r)),
  bang:    g => ['Y', 'Y', 'Y', '_', 'Y'].forEach((r, i) => P(g, i, 22, r)),
  ques:    g => ['_YY_', 'Y__Y', '__Y_', '____', '__Y_'].forEach((r, i) => P(g, i, 20, r)),
  note:    g => ['__ZZ', '__Z_', '__Z_', 'ZZZ_', 'ZZ__'].forEach((r, i) => P(g, i, 21, r)),
  sparkle: g => { ['_Y_', 'YWY', '_Y_'].forEach((r, i) => P(g, i, 21, r)); P(g, 4, 24, 'Y'); },
};

const rows = [[0, 1, 2].map(body), Object.values(FACES).map(f => { const g = blank(); f(g); return g; }), Object.values(PROPS).map(f => { const g = blank(); f(g); return g; })];
const cols = Math.max(...rows.map(r => r.length));
const W = cols * GW, H = rows.length * GH;
const px = Buffer.alloc((W * 4 + 1) * H);
rows.forEach((frames, ry) => frames.forEach((g, cx) => {
  for (let y = 0; y < GH; y++) for (let x = 0; x < GW; x++) {
    const c = g[y][x];
    if (c === '.') continue;
    const hex = PAL[c], o = (ry * GH + y) * (W * 4 + 1) + 1 + (cx * GW + x) * 4;
    px[o] = parseInt(hex.slice(1, 3), 16); px[o + 1] = parseInt(hex.slice(3, 5), 16); px[o + 2] = parseInt(hex.slice(5, 7), 16); px[o + 3] = 255;
  }
}));
const crcTable = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
const crc = buf => { let c = 0xffffffff; for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
const chunk = (type, data) => { const len = Buffer.alloc(4); len.writeUInt32BE(data.length); const td = Buffer.concat([Buffer.from(type), data]); const c = Buffer.alloc(4); c.writeUInt32BE(crc(td)); return Buffer.concat([len, td, c]); };
const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(W, 0); ihdr.writeUInt32BE(H, 4); ihdr[8] = 8; ihdr[9] = 6;
const png = Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(px, { level: 9 })), chunk('IEND', Buffer.alloc(0))]);
mkdirSync('public/mascot', { recursive: true });
writeFileSync('public/mascot/cat.png', png);
writeFileSync('src/data/mascot.json', JSON.stringify({ cell: [GW, GH], atlas: [W, H], faces: Object.keys(FACES), props: Object.keys(PROPS) }, null, 2) + '\n');
console.log('cat.png', W + 'x' + H, png.length + 'B');
