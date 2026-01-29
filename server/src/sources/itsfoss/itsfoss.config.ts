import { SourceConfig } from "../SourceConfig";

export class ItsfossConfig extends SourceConfig {
  getUrl({}: {}): string {
    return "https://itsfoss.com/rss";
  }

  maxItems = 5;
}

export default new ItsfossConfig();
