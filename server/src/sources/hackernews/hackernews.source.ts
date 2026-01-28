import { Post } from "../../types";
import {
  hoursSince,
  logSaturationNormalizer,
  mulWeights,
  timeDecay,
  vectorToScalar,
} from "../../util";
import { SourceBase } from "../SourceBase";
import hackernewsConfig, { HackerNewsConfig } from "./hackernews.config";
import { HNRaw } from "./hackernews.types";

export class HackerNewsSource extends SourceBase {
  readonly id = "hackernews";

  constructor(public config: HackerNewsConfig = hackernewsConfig) {
    super(config);
  }

  async fetchHot() {
    const res = await fetch(this.config.getUrl({}));
    const data = await res.json();
    return this.parseContent(data.hits);
  }

  async run(): Promise<Post[]> {
    return await this.withCircuitRetry(
      async () => await this.fetchHot(),
      "HN - hot",
    );
  }

  parseContent(rawData: HNRaw[]): Post[] {
    return rawData.map((story) => ({
      id: story.objectID,
      title: story.title,
      description: "",
      source: "HN - Front Page",
      author: story.author,
      createdAt: story.created_at,
      url: story.url,

      score: this.calculatePerformanceScore(story),
      media: null,
    }));
  }

  public calculatePerformanceScore(post: HNRaw): number {
    let e,
      r,
      q,
      c,
      K = 50;

    e = logSaturationNormalizer(1.5 * post.points + 2 * post.num_comments, K);
    r = timeDecay(post.created_at, 48);
    q = 0.2;
    c = 0.3;

    let wE = 2,
      wR = 1.5,
      wQ = 1,
      wC = 1.5,
      W = wE + wR + wQ + wC;

    return vectorToScalar(
      mulWeights([wE / W, wR / W, wQ / W, wC / W], [e, r, q, c]),
    );
  }

  async healthCheck(): Promise<boolean> {
    return await new Promise((resolve) => true);
  }
}
