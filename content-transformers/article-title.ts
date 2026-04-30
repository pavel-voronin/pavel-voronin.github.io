import { defineTransformer } from "@nuxt/content";

type MinimarkNode = string | MinimarkElement;
type MinimarkElement = [
  tag: string,
  props: Record<string, unknown>,
  ...children: MinimarkNode[],
];

type MinimarkBody = {
  type?: string;
  value?: MinimarkNode[];
  [key: string]: unknown;
};

type ArticleTitleSource = "frontmatter" | "h1" | "missing";

type ArticleContent = {
  id?: string;
  title?: string;
  body?: MinimarkBody;
  articleValid?: boolean;
  articleWarnings?: string[];
  articleTitleSource?: ArticleTitleSource;
  [key: string]: unknown;
};

const isElementNode = (node: MinimarkNode): node is MinimarkElement => {
  return Array.isArray(node) && typeof node[0] === "string";
};

const getNodeTag = (node: MinimarkNode) => {
  return isElementNode(node) ? node[0] : null;
};

const getNodeChildren = (node: MinimarkElement): MinimarkNode[] => {
  return node.slice(2);
};

const getNodeText = (node: MinimarkNode): string => {
  if (typeof node === "string") {
    return node;
  }

  if (!isElementNode(node)) {
    return "";
  }

  return getNodeChildren(node).map(getNodeText).join("");
};

const codeDelimiterFor = (value: string) => {
  let delimiter = "`";

  while (value.includes(delimiter)) {
    delimiter += "`";
  }

  return delimiter;
};

const getNodeTitleMarkdown = (node: MinimarkNode): string => {
  if (typeof node === "string") {
    return node;
  }

  if (!isElementNode(node)) {
    return "";
  }

  const value = getNodeChildren(node).map(getNodeTitleMarkdown).join("");

  if (getNodeTag(node) !== "code") {
    return value;
  }

  const delimiter = codeDelimiterFor(value);
  return `${delimiter}${value}${delimiter}`;
};

const countHeadings = (nodes: MinimarkNode[], tagName: string): number => {
  return nodes.reduce((count, node) => {
    if (!isElementNode(node)) {
      return count;
    }

    const childCount = countHeadings(getNodeChildren(node), tagName);
    return count + (getNodeTag(node) === tagName ? 1 : 0) + childCount;
  }, 0);
};

const firstMeaningfulTopLevelIndex = (nodes: MinimarkNode[]) => {
  return nodes.findIndex((node) => {
    if (typeof node === "string") {
      return node.trim().length > 0;
    }

    return isElementNode(node);
  });
};

const isPrivateMarkdownFile = (id: string | undefined) => {
  if (!id) {
    return false;
  }

  return id
    .replace(/^[^:]+:/, "")
    .split("/")
    .some((segment) => segment.startsWith("_"));
};

const hasDifferentTitle = (left: string, right: string) => {
  return left.trim() !== right.trim();
};

const warn = (id: string | undefined, warnings: string[]) => {
  if (warnings.length === 0) {
    return;
  }

  const label = id ?? "unknown content file";
  console.warn(`[article-title] ${label}: ${warnings.join(" ")}`);
};

export default defineTransformer({
  name: "article-title",
  extensions: [".md", ".mdc"],
  transform(content: ArticleContent) {
    if (isPrivateMarkdownFile(content.id)) {
      return content;
    }

    const bodyValue = content.body?.value;
    if (!Array.isArray(bodyValue)) {
      return content;
    }

    const warnings: string[] = [];
    const h1Count = countHeadings(bodyValue, "h1");
    const firstBlockIndex = firstMeaningfulTopLevelIndex(bodyValue);
    const firstBlock = firstBlockIndex >= 0 ? bodyValue[firstBlockIndex] : null;
    const firstBlockIsH1 = Boolean(firstBlock && getNodeTag(firstBlock) === "h1");
    const h1Title = firstBlockIsH1 && firstBlock ? getNodeTitleMarkdown(firstBlock).trim() : "";
    const h1PlainTitle = firstBlockIsH1 && firstBlock ? getNodeText(firstBlock).trim() : "";
    const currentTitle = typeof content.title === "string" ? content.title.trim() : "";
    let articleValid = true;
    let articleTitleSource: ArticleTitleSource = currentTitle ? "frontmatter" : "missing";
    let normalizedTitle = currentTitle;

    if (h1Count > 1) {
      articleValid = false;
      warnings.push("Markdown contains more than one H1 heading.");
    }

    if (h1Count === 1 && !firstBlockIsH1) {
      articleValid = false;
      warnings.push("The only H1 heading must be the first content block.");
    }

    if (firstBlockIsH1) {
      articleTitleSource = "h1";

      if (!h1Title) {
        articleValid = false;
        warnings.push("The first H1 heading is empty.");
      }
      else {
        normalizedTitle = h1Title;

        if (
          h1Count === 1
          && currentTitle
          && hasDifferentTitle(currentTitle, h1Title)
          && hasDifferentTitle(currentTitle, h1PlainTitle)
        ) {
          warnings.push("Front matter title differs from H1; H1 is used.");
        }
      }
    }
    else if (!currentTitle) {
      articleValid = false;
      warnings.push("Article must define a front matter title or a first-block H1.");
    }

    warn(content.id, warnings);

    if (!articleValid) {
      return {
        ...content,
        title: normalizedTitle,
        articleValid: false,
        articleWarnings: warnings,
        articleTitleSource,
      };
    }

    if (!firstBlockIsH1) {
      return {
        ...content,
        title: normalizedTitle,
        articleValid: true,
        articleWarnings: warnings.length > 0 ? warnings : undefined,
        articleTitleSource,
      };
    }

    return {
      ...content,
      title: normalizedTitle,
      body: {
        ...content.body,
        value: bodyValue.filter((_, index) => index !== firstBlockIndex),
      },
      articleValid: true,
      articleWarnings: warnings.length > 0 ? warnings : undefined,
      articleTitleSource,
    };
  },
});
