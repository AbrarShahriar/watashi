import { FeedData, FeedItem } from "@/lib/types";
import "server-only";

export async function getFeedData() {
  try {
    const res = await getData();

    if (!res.ok) return [];

    const data = await res.json();

    return normalizeFeedData(data);
  } catch (error) {
    return [];
  }
}

async function getData() {
  return await fetch(`${process.env.BACKEND_URL}/feed`, {
    next: {
      revalidate: 3600,
    },
    headers: {
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
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
        score: currentItem.score,
        createdAt: currentItem.createdAt,
        author: currentItem.author,
        media: currentItem.media,
      });
    }
  }

  return items;
}
