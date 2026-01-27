interface ISourceConfig {
  getUrl(opts: unknown): string;
}

export abstract class SourceConfig implements ISourceConfig {
  abstract getUrl(opts: unknown): string;
}
