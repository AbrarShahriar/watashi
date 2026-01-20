import { Post, RedditPost } from "../../types";
import { CircuitBreaker } from "../CircuitBreaker";
import { Retry } from "../Retry";
import { SourceBase } from "../SourceBase";

type RedditRaw = {
  id: string;
  title: string;
  selftext: string;
  subreddit: string;
  author_fullname: string;
  created_utc: number;
  url: string;
  ups: number;
  downs: number;
  score: number;
};

export class RedditSource extends SourceBase {
  readonly id = "reddit";

  constructor(public config: { subreddits: string[] }) {
    super(config);
    this.config = config;
  }

  public async fetchSingle(subreddit: string): Promise<Post[]> {
    const res = await fetch(
      `https://www.reddit.com/r/${subreddit}/hot.json?raw_json=1&limit=5`,
    );

    if (!res.ok) {
      throw new Error(
        `${subreddit} failed - ${res.status} - ${res.statusText}`,
      );
    }

    const resData = await res.json();

    const rawPosts = resData.data.children.map(
      (entry: { data: RedditRaw[] }) => entry.data,
    );

    return this.parseContent(rawPosts);
  }

  public async fetchContent(): Promise<Post[]> {
    const posts: Post[] = [];

    for (const subreddit of this.config.subreddits) {
      const content = await this.withCircuitRetry(
        async () => await this.fetchSingle(subreddit),
        subreddit,
      );
      posts.push(...content);
    }

    return posts;
  }

  parseContent(rawData: RedditRaw[]): RedditPost[] {
    return rawData.map((post: RedditRaw) => ({
      id: post.id,
      url: post.url,
      title: post.title,
      description: post.selftext,
      source: post.subreddit,
      author: post.author_fullname,
      createdAt: post.created_utc * 1000,
      metadata: {
        score: post.score,
        ups: post.ups,
        downs: -post.downs,
      },
    }));
  }

  async healthCheck(): Promise<boolean> {
    return await new Promise((resolve) => true);
  }
}
