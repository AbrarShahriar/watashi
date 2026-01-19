import { logger } from "./external/logger";
import { SourceBase } from "./fetcher/SourceBase";
import { Post } from "./types";

export class Aggregator {
  public isRunning: boolean = false;
  public sources: SourceBase[] = [];

  constructor() {}

  async fetchContent(): Promise<Record<string, Post[]>> {
    const posts: Record<string, Post[]> = {};

    for (const source of this.sources) {
      logger.info(`Starting Aggregation for source: ${source.id}`);
      try {
        const content = await source.fetchContent();
        logger.info(
          `✅ Successfully fetched ${content.length} items from ${source.id}`,
        );
        if (!posts[source.id]) {
          posts[source.id] = [];
        }
        posts[source.id].push(...content);
      } catch (error) {
        logger.error(`❌ Failed to fetch from ${source.id}:`, error);
      }
    }

    logger.info(`Aggregation finished`);
    return posts;
  }
}
