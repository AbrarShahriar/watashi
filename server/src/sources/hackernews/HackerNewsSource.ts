import { Post } from "../../types";
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
      metadata: {
        numOfComments: story.num_comments,
        points: story.points,
      },
      score: this.calculatePerformanceScore(
        {
          numOfComments: story.num_comments,
          points: story.points,
        },
        story.created_at,
      ),
      media: null,
    }));
  }

  async healthCheck(): Promise<boolean> {
    return await new Promise((resolve) => true);
  }
}
