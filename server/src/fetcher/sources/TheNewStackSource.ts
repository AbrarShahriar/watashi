import { Rss } from "feedsmith/dist/feeds/rss/common/types.cjs";
import { Post } from "../../types";
import { SourceBase } from "../SourceBase";
import { parseRssFeed } from "feedsmith";
import { parse as parseDom } from "node-html-parser";

type TNSRaw = Rss.Feed<string>;

export class TheNewStackSource extends SourceBase {
  readonly id = "thenewstack";

  constructor(public config?: unknown) {
    super(config);
    this.config = config;
  }

  async fetchFeed() {
    const res = await fetch("https://thenewstack.io/feed");
    const data = await res.text();
    return this.parseContent(data);
  }

  async fetchContent(topic?: string): Promise<Post[]> {
    return await this.withCircuitRetry(
      async () => await this.fetchFeed(),
      "HN - hot",
    );
  }

  parseContent(rawData: string): Post[] {
    const rssFeed = parseRssFeed(rawData);
    const parsed: Post[] = [];
    if (rssFeed && rssFeed.items) {
      rssFeed.items.forEach((item) => {
        const root = parseDom(item.description!);
        const media =
          root.querySelector(".webfeedsFeaturedVisual")?.getAttribute("src") ||
          null;
        const description = root.querySelector("p")?.textContent + "..." || "";
        parsed.push({
          id: item.guid?.value!,
          title: item.title!,
          description,
          author: item.dc?.creator!,
          url: item.link!,
          createdAt: item.pubDate!,
          source: "The New Stack",
          media: media,
          metadata: {},
          score: this.calculatePerformanceScore({}, item.pubDate!),
        });
      });
    }
    return parsed;
  }

  public calculatePerformanceScore(
    metadata: Record<string, unknown>,
    createdAt: string | number,
  ): number {
    const now = Date.now();
    const itemDate = new Date(createdAt).getTime();
    const hoursSincePost = (now - itemDate) / (1000 * 60 * 60);
    let n = hoursSincePost;
    let recency = 100;
    for (let i = 0; i < n; i++) {
      recency -= Math.random() * n;
    }
    return recency;
  }

  async healthCheck(): Promise<boolean> {
    return await new Promise((resolve) => true);
  }
}
