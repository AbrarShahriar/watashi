import { SourceConfig } from "../SourceConfig";

export const Config = {};

export class RedditConfig extends SourceConfig {
  subreddits: string[] = [
    "ASCII",
    "ArtificialInteligence",
    "cscareerquestions",
    "csMajors",
    "indianstartups",
    "jobsearchhacks",
    "leetcode",
  ];

  getUrl(opts: {
    subreddit: string;
    category?: "hot" | "rising" | "best" | "new";
    limit?: number;
  }) {
    return `${process.env.REDDIT_URL!}?subreddit=${opts.subreddit}&category=${opts.category || "hot"}&limit=${opts.limit || 5}`;
  }
}

export default new RedditConfig();
