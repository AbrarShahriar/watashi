import { Post } from "../../types";
import { SourceBase } from "../SourceBase";

type HNRaw = {
  title: string;
  author: string;
  created_at: string;
  url: string;
  num_comments: number;
  points: number;
  objectID: string;
};

export class HackerNewsSource extends SourceBase {
  readonly id = "hackernews";

  constructor(public config?: { topics?: string[] }) {
    super(config);
    this.config = config;
  }

  async fetchHot() {
    const res = await fetch(
      "https://hn.algolia.com/api/v1/search?tags=front_page",
    );
    const data = await res.json();
    return this.parseContent(data.hits);
  }

  async fetchContent(topic?: string): Promise<Post[]> {
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
