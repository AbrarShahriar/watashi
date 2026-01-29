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
import devtoConfig, { DevtoConfig } from "./devto.config";
import { DevtoRaw } from "./devto.types";

export class DevtoSource extends SourceBase {
  readonly id = "devto";

  constructor(public config: DevtoConfig = devtoConfig) {
    super(config);
  }

  async fetchTop() {
    const res = await fetch(this.config.getUrl({}));
    const data = await res.json();
    return this.parseContent(data);
  }

  async run(): Promise<Post[]> {
    return await this.withCircuitRetry(
      async () => await this.fetchTop(),
      this.id,
    );
  }

  parseContent(rawData: DevtoRaw[]): Post[] {
    return rawData.map((article) => ({
      id: String(article.id),
      title: article.title,
      description: article.description || "",
      source: "Dev.to",
      author: article.user.name,
      createdAt: article.published_timestamp,
      url: article.url,
      score: this.calculatePerformanceScore(article),
      media: article.cover_image || null,
    }));
  }

  public calculatePerformanceScore(post: DevtoRaw): number {
    let e,
      r,
      q,
      c,
      K = 125;

    const age = hoursSince(post.published_timestamp);

    e = logSaturationNormalizer(
      1.5 * post.positive_reactions_count + 2 * post.comments_count,
      K,
    );
    r = timeDecay(age, 48, "age");
    q = post.public_reactions_count > 10 ? 0.2 : 0.1;
    c = age < 6 ? 0.3 : 0.15;

    let wE = 1.5,
      wR = 2,
      wQ = 1.5,
      wC = 1.5,
      W = wE + wR + wQ + wC;

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
