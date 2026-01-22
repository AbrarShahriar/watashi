export type Post = {
  id: string;
  title: string;
  description: string;
  source: string;
  author: string;
  createdAt: string | number;
  url: string;
  metadata: Record<string, unknown>;
  media: string | null;
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

export type EmailType = {
  id: string;
  subject: string;
  from: string;
  date?: string;
  html?: string;
  text?: string;
  historyId: string;
  receivedAt?: string;
  posts?: Post[];
};

export type ExtractorType = {
  email: string;
  evoke: (html: string) => Post[];
};
