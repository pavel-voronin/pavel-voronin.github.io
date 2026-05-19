/// <reference types="node" />
import { readdirSync } from "node:fs";
import { extname, relative, resolve, sep } from "node:path";
import tailwindcss from "@tailwindcss/vite";

const CONTENT_DIRECTORY = resolve(process.cwd(), "content");
const ARTICLE_TITLE_TRANSFORMER = resolve(
  process.cwd(),
  "content-transformers/article-title.ts",
);
const CONTENT_PRERENDER_ROUTE_PATHS = getContentMarkdownFiles(
  CONTENT_DIRECTORY,
).map((file) => {
  const relativePath = relative(CONTENT_DIRECTORY, file);
  return toContentRoutePath(relativePath);
});
const FEED_CACHE_TIME_SECONDS = 60 * 15;
const FEED_ROUTES = [
  {
    key: "rss-feed",
    path: "/rss.xml",
    type: "rss2",
    mimeType: "application/rss+xml",
    title: "Pavel Voronin RSS Feed",
  },
  {
    key: "atom-feed",
    path: "/atom.xml",
    type: "atom1",
    mimeType: "application/atom+xml",
    title: "Pavel Voronin Atom Feed",
  },
  {
    key: "json-feed",
    path: "/feed.json",
    type: "json1",
    mimeType: "application/feed+json",
    title: "Pavel Voronin JSON Feed",
  },
] as const;

function getContentVueFiles(rootDir: string): string[] {
  const stack = [rootDir];
  const files: string[] = [];

  while (stack.length > 0) {
    const currentDirectory = stack.pop();
    if (!currentDirectory) {
      continue;
    }

    const entries = readdirSync(currentDirectory, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = `${currentDirectory}/${entry.name}`;

      if (entry.isDirectory()) {
        stack.push(fullPath);
        continue;
      }

      if (entry.isFile() && extname(entry.name) === ".vue") {
        files.push(fullPath);
      }
    }
  }

  return files;
}

function getContentMarkdownFiles(rootDir: string): string[] {
  const stack = [rootDir];
  const files: string[] = [];

  while (stack.length > 0) {
    const currentDirectory = stack.pop();
    if (!currentDirectory) {
      continue;
    }

    const entries = readdirSync(currentDirectory, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = `${currentDirectory}/${entry.name}`;

      if (entry.isDirectory()) {
        stack.push(fullPath);
        continue;
      }

      if (!entry.isFile()) {
        continue;
      }

      if (
        !entry.name.startsWith("_") &&
        (extname(entry.name) === ".md" || extname(entry.name) === ".mdc")
      ) {
        files.push(fullPath);
      }
    }
  }

  return files;
}

function convertSegmentToRoute(segment: string): string {
  const optionalMatch = segment.match(/^\[\[(.+)\]\]$/);
  if (optionalMatch) {
    return `:${optionalMatch[1]}?`;
  }

  const catchAllMatch = segment.match(/^\[\.\.\.(.+)\]$/);
  if (catchAllMatch) {
    return `:${catchAllMatch[1]}(.*)*`;
  }

  const dynamicMatch = segment.match(/^\[(.+)\]$/);
  if (dynamicMatch) {
    return `:${dynamicMatch[1]}`;
  }

  return segment;
}

function toContentRoutePath(contentRelativePath: string): string {
  const normalizedPath = contentRelativePath.replaceAll(sep, "/");
  const withoutExtension = normalizedPath.replace(/\.(md|mdc|vue)$/, "");
  const rawSegments = withoutExtension.split("/");
  const lastIndex = rawSegments.length - 1;

  const segments = rawSegments
    .filter((segment, index) => !(segment === "index" && index === lastIndex))
    .map(convertSegmentToRoute);

  if (segments.length === 0) {
    return "/";
  }

  return `/${segments.join("/")}`;
}

function toRouteName(contentRelativePath: string): string {
  const normalizedPath = contentRelativePath
    .replaceAll(sep, "/")
    .replace(/\.vue$/, "")
    .replace(/\/index$/, "")
    .replace(/[^\w/[\].-]/g, "")
    .replace(/\//g, "-");

  return normalizedPath.length > 0
    ? `content-${normalizedPath}`
    : "content-index";
}

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    head: {
      htmlAttrs: {
        lang: "en",
      },
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { name: "robots", content: "index, follow" },
      ],
      link: [
        {
          key: "site-favicon",
          rel: "icon",
          type: "image/svg+xml",
          href: "/favicon.svg",
        },
        ...FEED_ROUTES.map((feedRoute) => {
          return {
            key: feedRoute.key,
            rel: "alternate",
            type: feedRoute.mimeType,
            title: feedRoute.title,
            href: feedRoute.path,
          };
        }),
      ],
    },
  },
  runtimeConfig: {
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
    },
  },
  modules: ["@nuxt/content", "@nuxt/icon", "nuxt-module-feed"],
  icon: {
    provider: process.env.NODE_ENV === "development" ? "iconify" : "none",
    customCollections: [
      {
        prefix: "local",
        dir: "./app/assets/icons",
      },
    ],
    clientBundle: {
      scan: true,
      includeCustomCollections: true,
    },
  },
  content: {
    build: {
      transformers: [ARTICLE_TITLE_TRANSFORMER],
      markdown: {
        toc: {
          depth: 4,
          searchDepth: 4,
        },
        highlight: {
          theme: {
            default: "material-theme",
          },
          langs: [
            "bash",
            "css",
            "diff",
            "html",
            "js",
            "javascript",
            "json",
            "md",
            "mdc",
            "shell",
            "ts",
            "vue",
            "yaml",
          ],
        },
      },
    },
  },
  feed: {
    sources: FEED_ROUTES.map((feedRoute) => {
      return {
        path: feedRoute.path,
        type: feedRoute.type,
        cacheTime: FEED_CACHE_TIME_SECONDS,
      };
    }),
  },
  css: ["~/assets/css/main.css"],
  nitro: {
    prerender: {
      routes: [
        ...CONTENT_PRERENDER_ROUTE_PATHS,
        ...FEED_ROUTES.map(feedRoute => feedRoute.path),
      ],
    },
  },
  vite: {
    optimizeDeps: {
      exclude: ["@embedos/debian-bullseye-busybox-runtime"],
    },
    plugins: [tailwindcss() as any],
  },
  hooks: {
    "pages:extend"(pages) {
      const contentVueFiles = getContentVueFiles(CONTENT_DIRECTORY);
      const existingPaths = new Set(pages.map((page) => page.path));

      for (const file of contentVueFiles) {
        const relativePath = relative(CONTENT_DIRECTORY, file);
        const path = toContentRoutePath(relativePath);

        if (existingPaths.has(path)) {
          continue;
        }

        existingPaths.add(path);
        pages.push({
          name: toRouteName(relativePath),
          path,
          file,
        });
      }
    },
  },
  devtools: { enabled: true },
  compatibilityDate: "2024-04-03",
});
