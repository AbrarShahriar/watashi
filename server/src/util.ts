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

export function hoursSince(createdAt: string | number) {
  const now = Date.now();
  const itemDate = new Date(createdAt).getTime();
  return (now - itemDate) / (1000 * 60 * 60);
}

export function logSaturationNormalizer(value: number, K: number) {
  return 1 - Math.exp(-value / K);
}

export function timeDecay(
  time: string | number,
  halfLife: number,
  given: "age" | "time" = "time",
) {
  return given == "age"
    ? Math.exp(-time / halfLife)
    : Math.exp(-hoursSince(time) / halfLife);
}

export function mulWeights(v1: number[], v2: number[]): number[] {
  if (v1.length != v2.length) throw Error("Uneven Dimensions");
  const res: number[] = Array.from({ length: v1.length });
  for (let i = 0; i < v1.length; i++) {
    res[i] = v1[i] * v2[i];
  }
  return res;
}

export function vectorToScalar(v: number[]): number {
  return v.reduce((total, val) => (total += val));
}

const calculate80thPercentile = (data: number[]) => {
  // 1. Sort the data in ascending order
  const sortedData = data.sort((a, b) => a - b);
  const n = sortedData.length;
  // P is the desired percentile (80), expressed as a decimal (0.8)
  const p = 0.8;

  // 2. Calculate the rank (index)
  // R = P * (n - 1) + 1, using the common linear interpolation method
  const rank = p * (n - 1) + 1;

  // 3. Check if the rank is a whole number
  if (Number.isInteger(rank)) {
    // If it is an integer, return the value at that exact index (adjusting for 0-based indexing)
    // The formula R value is 1-based, so subtract 1 for the 0-based array index
    return sortedData[rank - 1];
  } else {
    // 4. If it's not a whole number, interpolate
    // Get the integer part (floor) and fractional part (decimal) of the rank
    const lowerRank = Math.floor(rank);
    const upperRank = Math.ceil(rank);
    const fractionalPart = rank - lowerRank;

    // Get the values at the lower and upper ranks (0-based indexing)
    const lowerValue = sortedData[lowerRank - 1];
    const upperValue = sortedData[upperRank - 1];

    // Perform linear interpolation
    return lowerValue + (upperValue - lowerValue) * fractionalPart;
  }
};
