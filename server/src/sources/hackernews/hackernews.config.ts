import { SourceConfig } from "../SourceConfig";

export class HackerNewsConfig extends SourceConfig {
  interval = 1;

  getUrl({ tags = "front_page" }: { tags?: string }): string {
    return `https://hn.algolia.com/api/v1/search?tags=${tags}`;
  }
}

export default new HackerNewsConfig();
