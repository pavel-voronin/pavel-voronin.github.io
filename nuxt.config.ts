/// <reference types="node" />
import { readdirSync } from "node:fs";
import { extname, relative, resolve, sep } from "node:path";
import tailwindcss from "@tailwindcss/vite";

const CONTENT_DIRECTORY = resolve(process.cwd(), "content");

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

function toRoutePath(contentRelativePath: string): string {
  const normalizedPath = contentRelativePath.replaceAll(sep, "/");
  const withoutExtension = normalizedPath.replace(/\.vue$/, "");
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
      title: "Pavel Voronin",
      htmlAttrs: {
        lang: "en",
      },
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { name: "description", content: "vibe coding the reality" },
        { name: "robots", content: "index, follow" },
        { property: "og:type", content: "website" },
        { property: "og:site_name", content: "Pavel Voronin" },
        { property: "og:title", content: "Pavel Voronin" },
        { property: "og:description", content: "vibe coding the reality" },
        { property: "og:image", content: "/favicon.ico" },
        { name: "twitter:card", content: "summary" },
        { name: "twitter:title", content: "Pavel Voronin" },
        { name: "twitter:description", content: "vibe coding the reality" },
        { name: "twitter:image", content: "/favicon.ico" },
      ],
      link: [{ key: "site-favicon", rel: "icon", type: "image/svg+xml", href: "/favicon.svg" }],
    },
  },
  modules: ["@nuxt/content", "@nuxt/icon"],
  content: {
    build: {
      markdown: {
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
  css: ["~/assets/css/main.css"],
  vite: {
    plugins: [tailwindcss() as any],
  },
  hooks: {
    "pages:extend"(pages) {
      const contentVueFiles = getContentVueFiles(CONTENT_DIRECTORY);
      const existingPaths = new Set(pages.map((page) => page.path));

      for (const file of contentVueFiles) {
        const relativePath = relative(CONTENT_DIRECTORY, file);
        const path = toRoutePath(relativePath);

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
