import { SourceConfig } from "../SourceConfig";

export class LogrocketConfig extends SourceConfig {
  getUrl({}: {}): string {
    return "https://blog.logrocket.com/feed/";
  }
}

export default new LogrocketConfig();
