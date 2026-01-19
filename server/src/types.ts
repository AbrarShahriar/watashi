export type Post = {
  id: string;
  title: string;
  description: string;
  source: string;
  author: string;
  createdAt: string | number;
  url: string;
  metadata: Record<string, any>;
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

export type FormattedSecondaryDataType = {
  subredditResults: Post[];
  hnResults: Post[];
  xPostsResults: Post[];
};
