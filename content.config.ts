import { z } from "zod";
import { defineContentConfig, defineCollection } from "@nuxt/content";

export default defineContentConfig({
  collections: {
    content: defineCollection({
      type: "page",
      source: {
        include: "**/*.md",
        exclude: ["_*.md"],
      },
      schema: z.object({
        "publish-to": z.enum(["blog", "topics", "all"]).optional(),
        description: z.string().optional(),
        date: z.string().optional(),
        date_updated: z.string().optional(),
        icon: z.string().optional(),
        image: z.string().optional(),
        language: z.string().optional(),
        translationKey: z.string().optional(),
        comments: z.boolean().optional(),
        topics: z.union([z.array(z.string()), z.string()]).optional(),
        titleLines: z.number().int().min(1).max(6).default(1).optional(),
        articleValid: z.boolean().optional(),
        articleWarnings: z.array(z.string()).optional(),
        articleTitleSource: z.enum(["frontmatter", "h1", "missing"]).optional(),
        readingTime: z.object({
          wordCount: z.number().int().min(0),
          minutes: z.number().int().min(1).optional(),
          fastMinutes: z.number().int().min(1).optional(),
        }).optional(),
      }),
    }),
    snippets: defineCollection({
      type: "page",
      source: {
        include: "**/_*.md",
      },
    }),
  },
});
