// 从 src/lib/news-shared.js 生成 public/news-shared.js（浏览器全局版）。
// 转换规则：去掉行首 `export `，末尾挂 window.NewsShared。
// 由 npm run build 的 prebuild 自动执行；也可手动跑：node scripts/gen-news-shared.js
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = readFileSync(join(root, 'src/lib/news-shared.js'), 'utf8');

const names = [...src.matchAll(/^export\s+(?:function|const|var)\s+([A-Za-z_$][\w$]*)/gm)].map((m) => m[1]);
if (!names.includes('illusFor') || !names.includes('slugFor')) {
  throw new Error('news-shared.js 缺少必要的导出（illusFor/slugFor），拒绝生成');
}
const body = src.replace(/^export\s+/gm, '');
const out = body + '\nwindow.NewsShared = { ' + names.join(', ') + ' };\n';

mkdirSync(join(root, 'public'), { recursive: true });
writeFileSync(join(root, 'public/news-shared.js'), out, 'utf8');
console.log('generated public/news-shared.js <- ' + names.join(', '));
