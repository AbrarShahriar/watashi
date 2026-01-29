import { parseRssFeed } from "feedsmith";
import { parse as parseDom } from "node-html-parser";
import { Post } from "../../types";
import {
  hoursSince,
  logSaturationNormalizer,
  mulWeights,
  noise,
  timeDecay,
  vectorToScalar,
} from "../../util";
import { SourceBase } from "../SourceBase";
import linkedinblogConfig, { LinkedinblogConfig } from "./linkedinblog.config";
import { LinkedinblogRaw } from "./linkedinblog.types";

export class LinkedinblogSource extends SourceBase {
  id = "linkedinblog";

  constructor(public config: LinkedinblogConfig = linkedinblogConfig) {
    super(config);
  }

  async fetchRss() {
    const res = await fetch(this.config.getUrl({}));
    const data = await res.text();
    return this.parseContent(data);
  }

  async run(): Promise<Post[]> {
    return await this.withCircuitRetry(
      async () => await this.fetchRss(),
      this.id,
    );
  }

  parseContent(rawData: string): Post[] {
    const rssFeed = parseRssFeed(rawData, { maxItems: this.config.maxItems });
    const items = rssFeed.items || [];
    const parsed: Post[] = [];

    if (items) {
      items.forEach((item) => {
        const root = parseDom(item.description || "");
        const description = root.querySelector("p");

        parsed.push({
          id: item.guid?.value!,
          title: item.title || "",
          description: description?.textContent || "",
          source: "Linkedin Blog",
          author: item.dc?.creator!,
          createdAt: item.pubDate!,
          url: item.link!,
          score: this.calculatePerformanceScore(item as LinkedinblogRaw),
          media:
            (item.media?.thumbnails &&
              item.media?.thumbnails.length > 0 &&
              item.media?.thumbnails[0].url) ||
            null,
        });
      });
    }

    return parsed;
  }

  public calculatePerformanceScore(post: LinkedinblogRaw): number {
    let e, r, q, c;

    const age = hoursSince(post.pubDate!);
    e = post.title.length < 35 ? 0.15 : 0.75;
    r = timeDecay(age, 72, "age");
    q = post.description.length > 40 ? 0.05 : 0.1;
    c = age < 8 ? 0.1 : 0.05;

    let wE = 1.2,
      wR = 1,
      wQ = 1.05,
      wC = 1.05,
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
