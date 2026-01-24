import { FeedData, FeedItem } from "@/lib/types";
import { calculatePerformanceScore } from "@/lib/utils";
import "server-only";

export async function getFeedData() {
  try {
    const res = await fetch(`${process.env.BACKEND_URL}/feed`, {
      next: {
        revalidate: 3600,
      },
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });

    if (!res.ok) return [];

    const data = await res.json();

    return normalizeFeedData(data);
  } catch (error) {
    return [];
  }
}

// Normalize feed data from API response to unified FeedItem array
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

  data.posts?.hackernews?.forEach((hn) => {
    items.push({
      id: hn.id,
      title: hn.title,
      url: hn.url,
      description: hn.description || "",
      source: hn.source,
      score: calculatePerformanceScore(hn.metadata, hn.createdAt),
      createdAt: hn.createdAt,
      author: hn.author,
      media: null,
    });
  });

  data.posts?.reddit?.forEach((reddit) => {
    items.push({
      id: reddit.id,
      title: reddit.title,
      url: reddit.url.startsWith("http")
        ? reddit.url
        : `https://reddit.com${reddit.url}`,
      description: reddit.description || "",
      source: `r/${reddit.source}`,
      createdAt: reddit.createdAt,
      author: reddit.author,
      score: calculatePerformanceScore(reddit.metadata, reddit.createdAt),
      media: reddit.media,
    });
  });

  data.posts?.x?.forEach((xPost) => {
    items.push({
      id: xPost.id,
      title: xPost.title,
      url: xPost.url,
      description: xPost.description,
      source: "X",
      createdAt: xPost.createdAt,
      author: xPost.author,
      score: calculatePerformanceScore(xPost.metadata, xPost.createdAt),
      media: null,
    });
  });

  return items;
}
