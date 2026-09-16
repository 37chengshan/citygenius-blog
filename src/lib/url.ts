/** Prefix a site-absolute path with Astro's configured `base` (GitHub Pages project site). */
export function withBase(path: string): string {
  if (!path.startsWith('/')) return path;
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return `${base}${path}`;
}

/** Public asset URL under /assets, with base prefix. */
export function assetUrl(name: string): string {
  return withBase(`/assets/${name.replace(/^\/+/, '')}`);
}
