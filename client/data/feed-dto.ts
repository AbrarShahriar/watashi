import { FeedData, FeedItem } from "@/lib/types";
import "server-only";

type Options = {
  page?: number;
  limit?: number;
};

export async function getFeedData(opts?: Options) {
  try {
    const res = await getData(opts);

    if (!res.ok) return [];

    const data = await res.json();

    return normalizeFeedData(data);
  } catch (error) {
    return [];
  }
}

async function getData(opts?: Options) {
  return await fetch(
    `${process.env.BACKEND_URL}/feed?page=${opts?.page || 1}&limit=${opts?.limit || process.env.ITEM_PER_PAGE || 5}`,
    {
      next: {
        tags: ["feed-data"],
      },
    },
  );
}

export async function getLastUpdateTime() {
  try {
    const res = await getData();

    if (!res.ok) return 0;

    const data = await res.json();

    return data.lastUpdated;
  } catch (error) {
    return 0;
  }
}
export async function getTotalPages() {
  try {
    const res = await getData();

    if (!res.ok) return 0;

    const data = await res.json();

    return data.pages;
  } catch (error) {
    return 0;
  }
}

export function normalizeFeedData(data: FeedData): FeedItem[] {
  const items: FeedItem[] = [];

  // Process newsletter emails
  // data.emails?.forEach((email) => {
  //   email.posts.forEach((post, index) => {
  //     const item: FeedItem = {
  //       id: `${email.id}-${index}`,
  //       title: post.title,
  //       link: post.link,
  //       desc: post.desc,
  //       source: "Newsletter",
  //       sourceType: "newsletter",
  //       performanceScore: 0,
  //       createdAt: email.receivedAt,
  //       metadata: {
  //         emailSubject: email.subject,
  //         emailFrom: email.from,
  //       },
  //     }
  //     item.performanceScore = calculatePerformanceScore(item.sourceType, item.metadata, item.createdAt)
  //     items.push(item)
  //   })
  // })

  const sources = Object.keys(data.posts!);

  for (const sourceName of sources) {
    const currentSource = data.posts![sourceName];
    for (const currentItem of currentSource) {
      items.push({
        id: currentItem.id,
        title: currentItem.title,
        url: currentItem.url,
        description: currentItem.description || "",
        source: currentItem.source,
        score: currentItem.score * 100,
        createdAt: currentItem.createdAt,
        author: currentItem.author,
        media: currentItem.media,
      });
    }
  }

  return items;
}
