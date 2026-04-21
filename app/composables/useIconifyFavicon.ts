import { getIconData, iconToSVG } from "@iconify/utils";
import { icons as logosIcons } from "@iconify-json/logos";
import { icons as simpleIconsIcons } from "@iconify-json/simple-icons";
import { icons as streamlineUltimateColorIcons } from "@iconify-json/streamline-ultimate-color";

const iconCollections = {
  logos: logosIcons,
  "simple-icons": simpleIconsIcons,
  "streamline-ultimate-color": streamlineUltimateColorIcons,
} as const;

const escapeAttribute = (value: string) => {
  return value.replaceAll("&", "&amp;").replaceAll("\"", "&quot;");
};

const toSvgDataUri = (svgMarkup: string) => {
  return `data:image/svg+xml,${encodeURIComponent(svgMarkup)}`;
};

export const createIconifyFaviconHref = (iconName: string, fallbackHref = "/favicon.svg") => {
  const [collectionName, ...iconParts] = iconName.split(":");

  if (!collectionName || iconParts.length === 0) {
    return fallbackHref;
  }

  const collection = iconCollections[collectionName as keyof typeof iconCollections];
  if (!collection) {
    return fallbackHref;
  }

  const icon = iconParts.join(":");
  const iconData = getIconData(collection, icon);

  if (!iconData) {
    return fallbackHref;
  }

  const svg = iconToSVG(iconData);
  const attributes = Object.entries(svg.attributes)
    .map(([key, value]) => `${key}="${escapeAttribute(String(value))}"`)
    .join(" ");

  return toSvgDataUri(`<svg xmlns="http://www.w3.org/2000/svg" ${attributes}>${svg.body}</svg>`);
};
