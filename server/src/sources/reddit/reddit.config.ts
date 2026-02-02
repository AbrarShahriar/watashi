import { SourceConfig } from "../SourceConfig";

export const Config = {};

export class RedditConfig extends SourceConfig {
  interval = 1;

  subreddits: string[] = [
    "buildinpublic",
    "cscareerquestions",
    "csMajors",
    "indianstartups",
    "jobsearchhacks",
    "indiehackers",
    "micro_saas",
    "SideProject",
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
