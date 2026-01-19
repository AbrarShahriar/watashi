import { FeedData, NormalizedFeedItem, SourceType } from "../types/feed";

const HOURS_24 = 24 * 60 * 60 * 1000;

export function normalizeFeedData(data: FeedData): NormalizedFeedItem[] {
  const items: NormalizedFeedItem[] = [];
  const now = new Date();

  // Process newsletters
  data.emails.forEach((email) => {
    const receivedAt = new Date(email.receivedAt);
    const isRecent = now.getTime() - receivedAt.getTime() < HOURS_24;

    email.posts.forEach((post, index) => {
      items.push({
        id: `${email.id}-${index}`,
        title: post.title,
        description: post.desc,
        url: post.link,
        source: "newsletter",
        sourceName: extractNewsletterName(email.from),
        author: email.from,
        createdAt: receivedAt,
        score: isRecent ? 1000 : 100, // High priority for recent newsletters
        isRecent,
        metadata: {},
      });
    });
  });

  // Process HN results
  data.external.hnResults.forEach((result, index) => {
    items.push({
      id: `hn-${index}`,
      title: result.title,
      description: result.description,
      url: result.url,
      source: "hn",
      sourceName: "Hacker News",
      author: result.author,
      createdAt: new Date(result.createdAt),
      score: result.performance.points,
      isRecent: false,
      metadata: {
        comments: result.performance.numOfComments,
        points: result.performance.points,
      },
    });
  });

  // Process Reddit results
  data.external.subredditResults.forEach((result, index) => {
    const createdAt =
      typeof result.createdAt === "number"
        ? new Date(result.createdAt)
        : new Date(result.createdAt);

    items.push({
      id: `reddit-${index}`,
      title: result.title,
      description: result.description,
      url: result.url,
      source: "reddit",
      sourceName: `r/${result.source}`,
      author: result.author,
      createdAt,
      score: result.performance.score,
      isRecent: false,
      metadata: {
        ups: result.performance.ups,
      },
    });
  });

  // Process X posts
  data.external.xPostsResults.forEach((result, index) => {
    items.push({
      id: `x-${index}`,
      title: result.title,
      description: result.description,
      url: result.url,
      source: "x",
      sourceName: "X",
      author: result.author,
      createdAt: new Date(result.createdAt),
      score:
        (result.performance?.likes || 0) +
        (result.performance?.retweets || 0) * 2,
      isRecent: false,
      metadata: {
        likes: result.performance?.likes,
        retweets: result.performance?.retweets,
      },
    });
  });

  return items;
}

export function sortFeedItems(
  items: NormalizedFeedItem[]
): NormalizedFeedItem[] {
  return [...items].sort((a, b) => {
    // Recent newsletters always come first
    if (a.isRecent && !b.isRecent) return -1;
    if (!a.isRecent && b.isRecent) return 1;

    // Among recent newsletters, sort by time (newest first)
    if (a.isRecent && b.isRecent) {
      return b.createdAt.getTime() - a.createdAt.getTime();
    }

    // For non-recent items, sort by performance score
    return b.score - a.score;
  });
}

export function filterBySource(
  items: NormalizedFeedItem[],
  source: SourceType
): NormalizedFeedItem[] {
  if (source === "all") return items;
  return items.filter((item) => item.source === source);
}

function extractNewsletterName(from: string): string {
  const match = from.match(/@([^.]+)/);
  if (match) {
    return match[1].charAt(0).toUpperCase() + match[1].slice(1);
  }
  return from.split("@")[0];
}

export function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 60) {
    return `${diffMins}m ago`;
  } else if (diffHours < 24) {
    return `${diffHours}h ago`;
  } else {
    return `${diffDays}d ago`;
  }
}

export function formatNumber(num: number): string {
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  }
  return num.toString();
}
