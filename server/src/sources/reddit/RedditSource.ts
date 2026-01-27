import { Post } from "../../types";
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
        let media = null;

        if (post.is_gallery && post.media_metadata) {
          const imageIds = Object.keys(post.media_metadata);
          media = post.media_metadata[imageIds[0]].s.u || null;
        } else if (post.preview) {
          media = post.preview.images[0].source.url || null;
        }

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
          score: this.calculatePerformanceScore(
            { score: post.score, ups: post.ups, downs: -post.downs },
            post.created_utc * 1000,
          ),
          metadata: { score: post.score, ups: post.ups, downs: -post.downs },
          media,
        });
      });

    return posts;
  }

  async healthCheck(): Promise<boolean> {
    return await new Promise((resolve) => true);
  }
}
