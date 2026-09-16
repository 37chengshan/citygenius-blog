import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.string(),
    readTime: z.string(),
    tag: z.string(),
    category: z.string(),
    tags: z.array(z.string()),
    tagFilters: z.record(z.string()),
    image: z.string(),
    imageAlt: z.string(),
    imageWidth: z.number(),
    imageHeight: z.number(),
    badge: z.string(),
    sideNote: z.string(),
    caption: z.string(),
    authorMeta: z.string(),
    featured: z.boolean().default(false),
    related: z.array(z.object({
      date: z.string(),
      title: z.string(),
      desc: z.string(),
      tag: z.string(),
      slug: z.string(),
    })),
  }),
});

export const collections = { blog };
