import { z } from "zod";
import { defineContentConfig, defineCollection } from "@nuxt/content";

export default defineContentConfig({
  collections: {
    content: defineCollection({
      type: "page",
      source: "**/*.md",
      schema: z.object({
        type: z.string().optional(),
        date: z.string().optional(),
        icon: z.string().optional(),
        comments: z.boolean().optional(),
        twitter: z.string().url().optional(),
        hackerNews: z.string().url().optional(),
        lobsters: z.string().url().optional(),
        reddit: z.string().url().optional(),
        linkedin: z.string().url().optional(),
        topics: z.union([z.array(z.string()), z.string()]).optional(),
        titleLines: z.number().int().min(1).max(6).default(1).optional(),
      }),
    }),
  },
});
