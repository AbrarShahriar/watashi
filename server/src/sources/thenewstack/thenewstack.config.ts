import { SourceConfig } from "../SourceConfig";

export class TheNewStackConfig extends SourceConfig {
  getUrl(): string {
    return "https://thenewstack.io/feed";
  }
}

export default new TheNewStackConfig();
