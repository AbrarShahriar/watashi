import { FeedData, FeedItem } from "@/app/types";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Calculate performance score for different content types
export function calculatePerformanceScore(
  metadata: Record<string, unknown>,
  createdAt: string | number,
): number {
  const now = Date.now();
  const itemDate = new Date(createdAt).getTime();
  const hoursSincePost = (now - itemDate) / (1000 * 60 * 60);
  let recency = hoursSincePost % 24;

  const keys = Object.keys(metadata);
  let sum = 0;
  let factor = 1;
  for (const key of keys) {
    sum += parseInt(metadata[key] as string) * factor;
    factor -= 0.25;
  }

  if (hoursSincePost > 48) {
    recency *= -1;
  }
  return Math.min(100, (sum % 100) + recency);
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
    });
  });

  // NEW SCHEMA: Process Reddit results from posts.reddit
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
    });
  });

  return items;
}

// Format relative time
export function formatRelativeTime(dateString: string | number): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return "Just now";
}
