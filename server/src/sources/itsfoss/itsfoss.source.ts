import { parseRssFeed } from "feedsmith";
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
import itsfossConfig, { ItsfossConfig } from "./itsfoss.config";
import { ItsfossRaw } from "./itsfoss.types";

export class ItsfossSource extends SourceBase {
  id = "itsfoss";

  constructor(public config: ItsfossConfig = itsfossConfig) {
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
        parsed.push({
          id: item.guid?.value!,
          title: item.title!,
          description: item.description || "",
          source: "Its Foss",
          author: item.dc?.creator!,
          createdAt: item.pubDate!,
          url: item.link!,
          score: this.calculatePerformanceScore(item as ItsfossRaw),
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

  public calculatePerformanceScore(post: ItsfossRaw): number {
    let e, r, q, c;
    const age = hoursSince(post.pubDate!);
    e = post.title.length < 30 ? 0.1 : 0.05;
    r = timeDecay(age, 48, "age");
    q = post.description.length > 50 ? 0.1 : 0.05;
    c = age < 8 ? 0.15 : 0.1;

    let wE = 1.3,
      wR = 1.2,
      wQ = 1.1,
      wC = 1.2,
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
