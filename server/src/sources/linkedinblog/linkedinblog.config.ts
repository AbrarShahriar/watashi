import { SourceConfig } from "../SourceConfig";

export class LinkedinblogConfig extends SourceConfig {
  interval = 6;

  getUrl({}: {}): string {
    return "https://www.linkedin.com/blog.rss";
  }

  maxItems = 5;
}

export default new LinkedinblogConfig();
