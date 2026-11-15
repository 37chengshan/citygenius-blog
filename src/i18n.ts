import { withBase } from './lib/url';

export type Lang = 'zh' | 'en';
export const LANGS: Lang[] = ['zh', 'en'];

/** Site-absolute path for a language: zh is unprefixed, en lives under /en. */
export function localePath(lang: Lang, path: string): string {
  const clean = path.startsWith('/') ? path : '/' + path;
  return withBase(lang === 'en' ? '/en' + (clean === '/' ? '/' : clean) : clean);
}

/** Strip base + /en prefix so a URL can be re-localized. */
export function stripLocale(pathname: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  let p = pathname.startsWith(base) ? pathname.slice(base.length) : pathname;
  if (p === '/en' || p.startsWith('/en/')) p = p.slice(3) || '/';
  return p || '/';
}

export const ui = {
  zh: {
    htmlLang: 'zh-CN',
    ogLocale: 'zh_CN',
    brandMeta: ['个人博客', '大学生 · 开发者'],
    nav: { about: '关于', projects: '项目', articles: '文章', news: '新闻', contact: '联系' },
    langSwitch: 'English',
    langShort: 'EN',
    railLeft: 'Vibe Coding · 全栈开发 · AI 应用',
    railRight: 'CityGenius Blog — Vol. 01 · 2026',
    footAbout: '一个大学生的 Vibe Coding 小实验室。写全栈、AI 应用和手机 App 时做了什么、踩了什么坑，都记在这里。喜欢开源，欢迎来聊。',
    footNav: '导航', footHome: '首页', footProjects: '项目', footSocial: '社交',
    footMac: 'macOS 工具', footAndroid: 'Android 应用', footLatest: '最新文章',
    footLive: 'Vol. 01 · 还在更新',
    keysHint: '快捷键',
    keys: [['1', '关于'], ['2', '项目'], ['3', '文章'], ['4', '新闻'], ['5', '联系'], ['L', 'English'], ['D', '深浅色'], ['S', '搜索']],
    catLabel: '像素猫，戳戳它',
    ux: {
      theme: '切换深浅色', light: '浅色', dark: '深色', search: '搜索',
      palPh: '搜文章，或者输入一个命令…', palPosts: '文章', palGo: '跳转', palDo: '操作',
      palEmpty: '没找到，换个词试试', palHint: [['↑↓', '选择'], ['↵', '打开'], ['esc', '关闭']],
      copyPage: '复制本页链接', toggleLang: '切换到 English', linkCopied: '链接已复制',
      toLight: '换成浅色啦', toDark: '夜猫子模式 🌙', away: '喵？去哪儿了…',
      konami: '喵！你找到隐藏关卡了', meow: '喵～', poke: '别戳啦，要炸毛了', top: '回到顶部',
    },
    article: {
      back: '返回文章列表', tree: '目录', progress: '阅读进度', share: '分享', copyLink: '复制链接', copied: '已复制',
      related: '相关文章', top: '回到顶部', readTime: '阅读时长', minRead: '分钟阅读', author: '作者', published: '发布', category: '分类',
    },
  },
  en: {
    htmlLang: 'en',
    ogLocale: 'en_US',
    brandMeta: ['Personal blog', 'Student · Developer'],
    nav: { about: 'About', projects: 'Projects', articles: 'Articles', news: 'News', contact: 'Contact' },
    langSwitch: '中文',
    langShort: '中',
    railLeft: 'Vibe Coding · Full-stack · AI apps',
    railRight: 'CityGenius Blog — Vol. 01 · 2026',
    footAbout: "A student's vibe coding lab. Notes on full-stack work, AI apps and mobile development. Open-source fan, always happy to chat.",
    footNav: 'Navigate', footHome: 'Home', footProjects: 'Projects', footSocial: 'Social',
    footMac: 'macOS tools', footAndroid: 'Android apps', footLatest: 'Latest post',
    footLive: 'Vol. 01 · Still writing',
    keysHint: 'Shortcuts',
    keys: [['1', 'About'], ['2', 'Projects'], ['3', 'Articles'], ['4', 'News'], ['5', 'Contact'], ['L', '中文'], ['D', 'Theme'], ['S', 'Search']],
    catLabel: 'Pixel cat. Give it a poke',
    ux: {
      theme: 'Toggle theme', light: 'Light', dark: 'Dark', search: 'Search',
      palPh: 'Search posts or type a command…', palPosts: 'Posts', palGo: 'Go to', palDo: 'Actions',
      palEmpty: 'Nothing here. Try another word', palHint: [['↑↓', 'Move'], ['↵', 'Open'], ['esc', 'Close']],
      copyPage: 'Copy link to this page', toggleLang: 'Switch to 中文', linkCopied: 'Link copied',
      toLight: 'Lights on', toDark: 'Night owl mode 🌙', away: 'Meow? Where did you go…',
      konami: 'Meow! You found the secret level', meow: 'Meow~', poke: 'Okay okay, enough poking', top: 'Back to top',
    },
    article: {
      back: 'All articles', tree: 'Contents', progress: 'Progress', share: 'Share', copyLink: 'Copy link', copied: 'Copied',
      related: 'Related', top: 'Back to top', readTime: 'Reading time', minRead: 'min read', author: 'Author', published: 'Published', category: 'Category',
    },
  },
} as const;

export type UI = (typeof ui)[Lang];
