const BLOG_DESTINATIONS = new Set(["blog", "all"]);
const TOPIC_DESTINATIONS = new Set(["topics", "all"]);

type PublishDestination = "blog" | "topics" | "all";

type PublishableContent = {
  "publish-to"?: PublishDestination | null;
};

const normalizePublishDestination = (value: PublishableContent["publish-to"]) => {
  return typeof value === "string" ? value : null;
};

export const isPublishedToBlock = (entry: PublishableContent | null | undefined) => {
  const destination = normalizePublishDestination(entry?.["publish-to"]);
  return destination !== null && BLOG_DESTINATIONS.has(destination);
};

export const isPublishedToTopics = (entry: PublishableContent | null | undefined) => {
  const destination = normalizePublishDestination(entry?.["publish-to"]);
  return destination !== null && TOPIC_DESTINATIONS.has(destination);
};
