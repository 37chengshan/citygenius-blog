import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// GitHub Pages project site: https://37chengshan.github.io/citygenius-blog/
// Cloudflare Pages: https://citygenius-blog.pages.dev/ (build with CF_PAGES=1)
// Switch `site`/`base` if a custom domain (citygenius.top) is pointed at Pages later.
const isCF = process.env.CF_PAGES === '1';

export default defineConfig({
  site: isCF ? 'https://citygenius-blog.pages.dev' : 'https://37chengshan.github.io',
  base: isCF ? '/' : '/citygenius-blog',
  output: 'static',
  integrations: [
    sitemap(),
  ],
  image: {
    service: { entrypoint: 'astro/assets/services/sharp' },
  },
});
