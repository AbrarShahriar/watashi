import { cache } from "./external/cache";
import { logger } from "./external/logger";
import { triggerClientCacheRevalidation } from "./external/revalidateClient";
import { SourceBase } from "./fetcher/SourceBase";
import { Post } from "./types";

export class Aggregator {
  public isRunning: boolean = false;
  private sources: SourceBase[] = [];

  constructor() {}

  addSource(source: SourceBase) {
    this.sources.push(source);
  }

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

    try {
      logger.info(`Caching results`);
      await cache.set(posts);
      logger.info(`Caching successful`);
    } catch (error) {
      logger.error(`Caching failed: ${error}`);
    } finally {
      await this.triggerRevalidate();
    }
    return posts;
  }

  async triggerRevalidate() {
    await triggerClientCacheRevalidation();
  }
}
