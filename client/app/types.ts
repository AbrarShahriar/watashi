export type Post = {
  id: string;
  title: string;
  description: string;
  source: string;
  author: string;
  createdAt: string | number;
  url: string;
  metadata: Record<string, unknown>;
};

export type RedditPost = Post & {
  metadata: { ups: number; downs: number; score: number };
};

export type HNPost = Post & {
  metadata: { numOfComments: number; points: number };
};

export type XPost = Post & {
  metadata: { numOfComments: number };
};

export type FeedData = {
  emails: unknown[];
  posts?: {
    reddit: RedditPost[];
    hackernews: HNPost[];
    x: XPost[];
  };
};

export type FeedItem = Omit<Post, "metadata"> & { score: number };
