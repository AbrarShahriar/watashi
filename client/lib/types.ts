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
  emails: unknown[];
  posts?: Record<string, Post[]>;
};

export type FeedItem = Omit<Post, "metadata"> & { score: number };
export type FeedFilterSortCriteria = "top" | "new";
