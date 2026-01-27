import { CheerioAPI } from "cheerio";
import sanitizeHtml from "sanitize-html";
import fs from "fs/promises";
import { Post } from "./types";

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

export async function directoryExists(path: string) {
  try {
    await fs.access(path, fs.constants.F_OK);
    return true;
  } catch (error) {
    return false;
  }
}

export function paginate(
  data: Record<string, Post[]>,
  payload: { page: number; limit: number },
): Record<string, Post[]> {
  const startIndex = (payload.page - 1) * payload.limit;
  const keys = Object.keys(data);

  const paginatedData: Record<string, Post[]> = {};

  keys.forEach((key) => {
    paginatedData[key] = data[key].slice(
      startIndex,
      startIndex + payload.limit,
    );
  });

  return paginatedData;
}
