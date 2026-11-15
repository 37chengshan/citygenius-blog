import { getCollection } from 'astro:content';
import type { Lang } from '../i18n';

/** Posts for one language. English posts share ids (slugs) with the Chinese originals. */
export async function getPosts(lang: Lang) {
  return lang === 'en' ? getCollection('blogEn') : getCollection('blog');
}
