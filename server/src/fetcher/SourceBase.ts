import winston from "winston";
import { logger } from "../external/logger";
import { Post } from "../types";
import { CircuitBreaker } from "./CircuitBreaker";
import { Retry } from "./Retry";

export interface ISourceBase {
  readonly id: string;

  /**
   * Fetch content from this source
   * @param topic Optional topic to filter content
   * @returns Promise with array of content items
   */
  fetchContent(topic?: string): Promise<Post[]>;

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

  public abstract fetchContent(topic?: string): Promise<Post[]>;
  public abstract parseContent(rawData: unknown[], metadata?: unknown): Post[];
  public abstract healthCheck(): Promise<boolean>;
}
