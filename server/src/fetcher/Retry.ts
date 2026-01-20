import { logger } from "../external/logger";

export class Retry {
  constructor(
    private maxRetries: number = 3,
    private baseDelay: number = 1000,
    private maxDelay: number = 30000,
  ) {}

  async withRetry<T>(
    fn: () => Promise<T>,
    operationName: string = "operation",
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const a = await fn();

        return a;
      } catch (error) {
        lastError = error as Error;

        if (attempt === this.maxRetries) {
          break;
        }

        const delay = this.calculateDelay(attempt);
        logger.error(
          `${operationName} failed (attempt ${attempt + 1}/${this.maxRetries + 1}) --- ${error}, retrying in ${delay}ms`,
        );

        await this.delay(delay);
      }
    }

    logger.error(
      `${operationName} failed after ${this.maxRetries + 1} attempts: ${lastError!.message}`,
    );
    throw new Error(
      `${operationName} failed after ${this.maxRetries + 1} attempts: ${lastError!.message}`,
    );
  }

  private calculateDelay(attempt: number): number {
    const delay = Math.min(
      this.maxDelay,
      this.baseDelay * Math.pow(2, attempt),
    );
    return delay;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
