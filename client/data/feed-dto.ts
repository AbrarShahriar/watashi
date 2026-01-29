import { FeedData, FeedItem } from "@/lib/types";
import "server-only";

type FeedOptions = {
  page?: number;
  limit?: number;
  sort?: "top" | "new";
  order?: "asc" | "desc";
};

async function getData(opts?: FeedOptions): Promise<FeedData | null> {
  try {
    const res = await fetch(
      `${process.env.BACKEND_URL}/feed?page=${opts?.page || 1}&limit=${opts?.limit || process.env.ITEMS_PER_PAGE || 5}&order=${opts?.order || "desc"}&sort=${opts?.sort || "top"}`,
      {
        next: {
          tags: ["feed-data"],
        },
      },
    );

    if (!res.ok) return null;

    const data = await res.json();
    return data;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function getFeedData(opts?: FeedOptions): Promise<FeedItem[]> {
  const feedData = await getData(opts);

  if (!feedData) return [];

  if (feedData.posts && feedData.posts.length >= 0) {
    return feedData.posts.map((el) => ({ ...el, score: el.score * 100 }));
  }

  return [];
}

export async function getLastUpdateTime(): Promise<number> {
  const feedData = await getData();

  if (!feedData || !feedData.lastUpdated) return 0;

  return feedData.lastUpdated;
}
export async function getTotalPages(): Promise<number> {
  const feedData = await getData();

  if (!feedData || !feedData.pages) return 0;

  return feedData.pages;
}

export async function getSources(): Promise<string[]> {
  const feedData = await getData();

  if (!feedData || !feedData.sources) return [];

  return feedData.sources;
}
