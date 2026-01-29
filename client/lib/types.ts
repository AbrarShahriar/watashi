export type Post = {
  id: string;
  title: string;
  description: string;
  source: string;
  author: string;
  createdAt: string | number;
  url: string;
  score: number;
  media: string | null;
};

export type FeedData = {
  emails?: unknown[];
  posts?: FeedItem[];
  sources?: string[];
  lastUpdated?: number;
  pages: number;
};

export type FeedItem = Omit<Post, "metadata"> & { score: number };
export type FeedFilterSortCriteria = "top" | "new";
