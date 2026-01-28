import { SourceConfig } from "../SourceConfig";

export class DevtoConfig extends SourceConfig {
  getUrl({
    itemsPerPage = 10,
    age = 7,
  }: {
    itemsPerPage?: number;
    age?: number;
  }): string {
    return `https://dev.to/api/articles?per_page=${itemsPerPage}&top=${age}`;
  }
}

export default new DevtoConfig();
