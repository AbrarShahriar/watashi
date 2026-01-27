import winston from "winston";
import { logger } from "../infra/logger";
import { Post } from "../types";
import { CircuitBreaker } from "../infra/CircuitBreaker";
import { Retry } from "../infra/Retry";

export interface ISourceBase {
  readonly id: string;

  /**
   * Fetch content from this source
   * @param topic Optional topic to filter content
   * @returns Promise with array of content items
   */
  run(topic?: string): Promise<Post[]>;

  /**
   * Check if the source is healthy/available
   * @returns Promise with boolean health status
   */
  healthCheck(): Promise<boolean>;

  /**
   * Check if the source is healthy/available
   * @returns Promise with boolean health status
   */
  parseContent(rawData: unknown[], metadata?: unknown): Post[];
}

export abstract class SourceBase implements ISourceBase {
  id!: string;
  public circuitBreaker: CircuitBreaker;
  public retry: Retry;
  public logger: winston.Logger;

  constructor(config?: unknown) {
    this.circuitBreaker = new CircuitBreaker(1, 30000, 10000);
    this.retry = new Retry(1, 1000, 10000);
    this.logger = logger;
  }

  async withCircuitRetry<T>(operation: () => Promise<T>, label?: string) {
    try {
      this.circuitBreaker.reset();
      return await this.circuitBreaker.execute(async () => {
        return await this.retry.withRetry(operation, label || this.id);
      });
    } catch (error) {
      logger.error(`❌ Failed to fetch from ${label || this.id}:`, error);
      return [];
    }
  }

  public calculatePerformanceScore(
    metadata: Record<string, unknown>,
    createdAt: string | number,
  ): number {
    const now = Date.now();
    const itemDate = new Date(createdAt).getTime();
    const hoursSincePost = (now - itemDate) / (1000 * 60 * 60);
    let recency = hoursSincePost % 24;

    const keys = Object.keys(metadata);
    let sum = 0;
    let factor = 1;
    for (const key of keys) {
      sum += parseInt(metadata[key] as string) * factor;
      factor -= 0.25;
    }

    if (hoursSincePost > 48) {
      recency *= -1;
    }
    return Math.min(100, (sum % 100) + recency);
  }

  public abstract run(topic?: string): Promise<Post[]>;
  public abstract parseContent(rawData: unknown, metadata?: unknown): Post[];
  public abstract healthCheck(): Promise<boolean>;
}
