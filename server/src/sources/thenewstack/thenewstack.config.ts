import { SourceConfig } from "../SourceConfig";

export class TheNewStackConfig extends SourceConfig {
  interval = 1;

  getUrl(): string {
    return "https://thenewstack.io/feed";
  }
}

export default new TheNewStackConfig();
