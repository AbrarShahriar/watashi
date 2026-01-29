import { Rss } from "feedsmith/dist/feeds/rss/common/types.cjs";
import { Post } from "../../types";
import { SourceBase } from "../SourceBase";
import { parseRssFeed } from "feedsmith";
import { parse as parseDom } from "node-html-parser";
import thenewstackConfig, { TheNewStackConfig } from "./thenewstack.config";
import { TNSRaw } from "./thenewstack.types";
import {
  hoursSince,
  mulWeights,
  noise,
  timeDecay,
  vectorToScalar,
} from "../../util";

export class TheNewStackSource extends SourceBase {
  readonly id = "thenewstack";

  constructor(public config: TheNewStackConfig = thenewstackConfig) {
    super(config);
  }

  async fetchFeed() {
    const res = await fetch(this.config.getUrl());
    const data = await res.text();
    return this.parseContent(data);
  }

  async run(topic?: string): Promise<Post[]> {
    return await this.withCircuitRetry(
      async () => await this.fetchFeed(),
      "HN - hot",
    );
  }

  parseContent(rawData: string): Post[] {
    const rssFeed = parseRssFeed(rawData);
    const items = rssFeed.items || [];
    const parsed: Post[] = [];
    if (items) {
      items.forEach((item) => {
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
          score: this.calculatePerformanceScore(item as TNSRaw),
        });
      });
    }
    return parsed;
  }

  public calculatePerformanceScore(post: TNSRaw): number {
    let e, r, q, c;

    const age = hoursSince(post.pubDate!);
    e = post.title.length < 30 ? 0.1 : 0.05;
    r = timeDecay(age, 24, "age");
    q = post.description.length > 50 ? 0.1 : 0.05;
    c = age < 3 ? 0.1 : 0.05;

    let wE = 1.5,
      wR = 1.1,
      wQ = 1.05,
      wC = 1.25,
      W = wR + wE + wC + wQ;

    return (
      vectorToScalar(
        mulWeights([wE / W, wR / W, wQ / W, wC / W], [e, r, q, c]),
      ) + noise()
    );
  }

  async healthCheck(): Promise<boolean> {
    return await new Promise((resolve) => true);
  }
}
