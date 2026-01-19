import { CheerioAPI } from "cheerio";
import sanitizeHtml from "sanitize-html";

export function truncate(str: string) {
  return str.slice(0, Math.ceil(str.length / 3)) + "...";
}

export function sanitize(html: string) {
  return sanitizeHtml(html, {
    allowedTags: false,
    allowedAttributes: false,
    exclusiveFilter: (frame) => {
      return (
        (frame.tag === "img" &&
          frame.attribs.width === "1" &&
          frame.attribs.height === "1") ||
        frame.attribs.src?.includes("open.gif") ||
        frame.attribs.src?.includes("tracking")
      );
    },
  });
}

export function clean(dom: CheerioAPI) {
  dom('*:contains("Presented by")').remove();
  dom('*:contains("Sponsored by")').remove();
  dom('*:contains("This post is sponsored")').remove();
}
