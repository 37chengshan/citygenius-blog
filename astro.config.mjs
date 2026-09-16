import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// GitHub Pages project site: https://37chengshan.github.io/citygenius-blog/
// Switch `site`/`base` if a custom domain (citygenius.top) is pointed at Pages later.
export default defineConfig({
  site: 'https://37chengshan.github.io',
  base: '/citygenius-blog',
  output: 'static',
  integrations: [
    sitemap(),
  ],
  image: {
    service: { entrypoint: 'astro/assets/services/sharp' },
  },
});
