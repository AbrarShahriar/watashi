interface ISourceConfig {
  /**
   * Interval (in hours) to fetch data
   * @default 1 hour
   * @readonly interval
   */
  readonly interval: number;

  /**
   * Returns the URL of the source
   * @param opts Optional arguments can be passed to modify return value
   * @returns URL of the source
   */
  getUrl(opts: unknown): string;
}

export abstract class SourceConfig implements ISourceConfig {
  readonly interval: number = 1;
  abstract getUrl(opts: unknown): string;
}
