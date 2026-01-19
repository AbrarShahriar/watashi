export type NewsletterPost = {
  title: string;
  link: string;
  desc: string;
};

export type Email = {
  id: string;
  subject: string;
  from: string;
  historyId: string;
  receivedAt: string;
  posts: NewsletterPost[];
};

export type HNResult = {
  title: string;
  description: string;
  source: string;
  author: string;
  createdAt: string;
  url: string;
  performance: {
    numOfComments: number;
    points: number;
  };
};

export type SubredditResult = {
  title: string;
  description: string;
  source: string;
  author: string;
  createdAt: number;
  url: string;
  performance: {
    ups: number;
    downs: number;
    score: number;
  };
};

export type XPost = {
  title: string;
  description: string;
  source: string;
  author: string;
  createdAt: string;
  url: string;
  performance?: {
    likes?: number;
    retweets?: number;
  };
};

export type FeedItem = {
  title: string;
  link: string;
  desc: string;
  source: string;
  performanceScore: number;
  createdAt: string;
  author?: string;
  metadata?: {
    points?: number;
    numOfComments?: number;
    ups?: number;
    score?: number;
    emailSubject?: string;
    emailFrom?: string;
  };
};
