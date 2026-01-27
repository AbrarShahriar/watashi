import { triggerClientCacheRevalidation } from "../external/revalidateClient";
import { logger } from "../infra/logger";
import { SourceBase } from "../sources/SourceBase";
import { cache } from "../storage/cache";
import { Post } from "../types";

export class Aggregator {
  public isRunning: boolean = false;
  private sources: SourceBase[] = [];
  private successful: SourceBase[] = [];
  private failed: SourceBase[] = [];

  constructor() {}

  public getSources() {
    return this.sources;
  }

  public getSuccessfulSources() {
    return this.successful;
  }

  public getFailedSources() {
    return this.failed;
  }

  registerSource(source: SourceBase) {
    this.sources.push(source);
  }

  async run(): Promise<Record<string, Post[]>> {
    const posts: Record<string, Post[]> = {};

    for (const source of this.sources) {
      logger.info(`Starting Aggregation for source: ${source.id}`);
      try {
        const content = await source.run();
        logger.info(
          `✅ Successfully fetched ${content.length} items from ${source.id}`,
        );
        if (!posts[source.id]) {
          posts[source.id] = [];
        }
        posts[source.id].push(...content);
        this.successful.push(source);
      } catch (error) {
        logger.error(`❌ Failed to fetch from ${source.id}:`, error);
        this.failed.push(source);
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
      this.isRunning = false;
    }
    return posts;
  }

  async triggerRevalidate() {
    await triggerClientCacheRevalidation();
  }

  async lastRun() {
    try {
      const time = await cache.getLastCacheUpdate();
      return parseInt(time);
    } catch (error) {
      return 0;
    }
  }
}
