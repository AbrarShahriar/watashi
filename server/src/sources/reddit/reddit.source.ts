import { Post } from "../../types";
import {
  hoursSince,
  logSaturationNormalizer,
  mulWeights,
  timeDecay,
  vectorToScalar,
} from "../../util";
import { SourceBase } from "../SourceBase";
import redditConfig, { Config, RedditConfig } from "./reddit.config";
import { RedditRaw } from "./reddit.types";

export class RedditSource extends SourceBase {
  readonly id = "reddit";

  constructor(public config: RedditConfig = redditConfig) {
    super(config);
  }

  public async fetchSingle(subreddit: string): Promise<Post[]> {
    const url = this.config.getUrl({ subreddit });
    const res = await fetch(url);

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

  public async run(): Promise<Post[]> {
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

  parseContent(rawData: RedditRaw[]): Post[] {
    const posts: Post[] = [];

    rawData
      .filter((entry) => entry.stickied == false)
      .forEach((post: RedditRaw) => {
        posts.push({
          id: post.id,
          url: post.url.startsWith("http")
            ? post.url
            : `https://reddit.com${post.url}`,
          title: post.title,
          description: post.selftext,
          source: `r/${post.subreddit}`,
          author: post.author_fullname,
          createdAt: post.created_utc * 1000,
          score: this.calculatePerformanceScore(post),
          media: this.getMedia(post),
        });
      });

    return posts;
  }

  public calculatePerformanceScore(post: RedditRaw) {
    let e,
      r,
      q,
      c,
      K = 100;
    const age = hoursSince(post.created_utc * 1000);
    e = logSaturationNormalizer(
      1.25 * post.ups + 2 * post.num_comments - 1.5 * post.downs,
      K,
    );
    r = timeDecay(age, 24, "age");
    q = 0;
    if (this.getMedia(post)) q += 0.15;
    if (post.selftext) q += 0.1;
    c = e == 0 && age < 6 ? 1 : 0;

    let wE = 2,
      wR = 1.5,
      wQ = 1,
      wC = 1.25,
      W = wE + wR + wQ + wC;
    return vectorToScalar(
      mulWeights([wE / W, wR / W, wQ / W, wC / W], [e, r, q, c]),
    );
  }

  private getMedia(post: RedditRaw): string | null {
    let media = null;

    if (post.is_gallery && post.media_metadata) {
      const imageIds = Object.keys(post.media_metadata);
      media = post.media_metadata[imageIds[0]].s.u || null;
    } else if (post.preview) {
      media = post.preview.images[0].source.url || null;
    }

    return media;
  }

  async healthCheck(): Promise<boolean> {
    return await new Promise((resolve) => true);
  }
}
