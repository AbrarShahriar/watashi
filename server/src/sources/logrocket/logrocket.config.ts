import { SourceConfig } from "../SourceConfig";

export class LogrocketConfig extends SourceConfig {
  interval = 1;

  getUrl({}: {}): string {
    return "https://blog.logrocket.com/feed/";
  }
}

export default new LogrocketConfig();
