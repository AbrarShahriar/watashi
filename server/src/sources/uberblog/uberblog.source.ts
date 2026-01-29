import { parseRssFeed } from "feedsmith";
import { Post } from "../../types";
import {
  hoursSince,
  mulWeights,
  noise,
  timeDecay,
  vectorToScalar,
} from "../../util";
import { SourceBase } from "../SourceBase";
import uberblogConfig, { UberblogConfig } from "./uberblog.config";
import { UberblogRaw } from "./uberblog.types";
import { parse as parseDom } from "node-html-parser";

export class UberblogSource extends SourceBase {
  id = "uberblog";

  constructor(public config: UberblogConfig = uberblogConfig) {
    super(config);
  }

  async fetchRss() {
    const res = await fetch(this.config.getUrl({}), {
      headers: this.config.headers(),
    });
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
          title: item.title!,
          description: description?.textContent || "",
          source: "Uber Blog",
          author: item.dc?.creator!,
          createdAt: item.pubDate!,
          url: item.link!,
          score: this.calculatePerformanceScore(item as UberblogRaw),
          media:
            (item.media?.contents &&
              item.media?.contents.length &&
              item.media?.contents.length > 0 &&
              item.media?.contents[0].url) ||
            null,
        });
      });
    }

    return parsed;
  }

  public calculatePerformanceScore(post: UberblogRaw): number {
    let e, r, q, c;
    const age = hoursSince(post.pubDate!);
    e = post.title.length < 30 ? 0.05 : 0.1;
    r = timeDecay(age, 72, "age");
    q = post.description.length > 30 ? 0.2 : 0.1;
    c = age < 24 ? 0.15 : 0.05;

    let wE = 1,
      wR = 1.2,
      wQ = 1.2,
      wC = 1.1,
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
