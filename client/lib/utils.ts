import { FeedItem } from "@/lib/types";
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

export function formatURL(url: string): string {
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch (error) {
    return url;
  }
}

export function sortBy(
  data: FeedItem[],
  criteria?: "new" | "top",
  selectedSources?: string[],
) {
  let filtered = data;

  if (selectedSources && selectedSources.length > 0) {
    filtered = filtered.filter((item) => selectedSources.includes(item.source));
  }

  if (criteria == "top") {
    return [...filtered].sort((a, b) => {
      return b.score - a.score;
    });
  } else if (criteria == "new") {
    return [...filtered].sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }

  return filtered;
}
