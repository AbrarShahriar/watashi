// circuit-breaker.ts
export class CircuitBreaker {
  private failures = 0;
  private lastFailureTime: number | null = null;
  private state: "CLOSED" | "OPEN" | "HALF_OPEN" = "CLOSED";
  private nextAttemptTime: number = 0;

  constructor(
    private threshold: number = 5,
    private resetTimeout: number = 30000, // 30 seconds
    private halfOpenTimeout: number = 10000, // 10 seconds
  ) {}

  reset() {
    this.state = "CLOSED";
    this.failures = 0;
    this.nextAttemptTime = 0;
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === "OPEN") {
      if (Date.now() < this.nextAttemptTime) {
        throw new Error(
          `Circuit breaker is OPEN for ${this.nextAttemptTime - Date.now()}ms`,
        );
      }
      this.state = "HALF_OPEN";
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failures = 0;
    if (this.state === "HALF_OPEN") {
      this.state = "CLOSED";
    }
  }

  private onFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.failures >= this.threshold && this.state !== "OPEN") {
      this.trip();
    } else if (this.state === "HALF_OPEN") {
      this.trip();
    }
  }

  private trip(): void {
    this.state = "OPEN";
    this.nextAttemptTime = Date.now() + this.resetTimeout;

    // Schedule transition to HALF_OPEN
    setTimeout(() => {
      if (this.state === "OPEN") {
        this.state = "HALF_OPEN";
        this.nextAttemptTime = Date.now() + this.halfOpenTimeout;
      }
    }, this.resetTimeout);
  }

  isOpen(): boolean {
    if (this.state === "OPEN" && Date.now() > this.nextAttemptTime) {
      this.state = "HALF_OPEN";
      return false;
    }
    return this.state === "OPEN";
  }

  getStatus() {
    return {
      state: this.state,
      failures: this.failures,
      lastFailureTime: this.lastFailureTime,
      nextAttemptTime: this.nextAttemptTime,
    };
  }
}
