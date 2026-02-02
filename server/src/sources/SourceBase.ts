import winston from "winston";
import { logger } from "../infra/logger";
import { Post } from "../types";
import { CircuitBreaker } from "../infra/CircuitBreaker";
import { Retry } from "../infra/Retry";
import { SourceConfig } from "./SourceConfig";

export interface ISourceBase {
  /**
   * Unique identifier for each source
   * @readonly id
   */
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
  parseContent(rawData: unknown[], metadata?: unknown): Post[];

  /**
   * Calculate the score of each post
   * @param post Post of type unknown passed with all its properties
   * @returns number with score
   */
  calculatePerformanceScore(post: unknown): number;

  /**
   * Check if the source is healthy/available
   * @returns Promise with boolean health status
   */
  healthCheck(): Promise<boolean>;

  /**
   * Returns config object of the source
   * @returns Config object of the source or null
   */
  getConfig(): SourceConfig | null;
}

export abstract class SourceBase implements ISourceBase {
  readonly id!: string;

  public circuitBreaker: CircuitBreaker;
  public retry: Retry;
  public logger: winston.Logger;

  constructor(public config?: SourceConfig) {
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

  getConfig(): SourceConfig | null {
    return this.config || null;
  }

  public abstract calculatePerformanceScore(post: unknown): number;
  public abstract run(topic?: string): Promise<Post[]>;
  public abstract parseContent(rawData: unknown, metadata?: unknown): Post[];
  public abstract healthCheck(): Promise<boolean>;
}
