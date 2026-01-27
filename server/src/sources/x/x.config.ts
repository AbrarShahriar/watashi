import { SourceConfig } from "../SourceConfig";
import { XAuth, XUser } from "./x.types";

export class XConfig extends SourceConfig {
  auth: XAuth = {
    gSearchCx: process.env.GOOGLE_SEARCH_CX!,
    gSearchKey: process.env.GOOGLE_SEARCH_KEY!,
  };

  profiles: XUser[] = [
    {
      username: "florinpop1705",
      displayname: "Florin Pop",
    },
    {
      username: "catalinmpit",
      displayname: "Catalin",
    },
    {
      username: "flaviocopes",
      displayname: "flavio",
    },
  ];

  getUrl({ query }: { query: string }) {
    return `https://www.googleapis.com/customsearch/v1?key=${this.auth.gSearchKey}&cx=${this.auth.gSearchCx}&q=${query}&sort=date`;
  }
}

export default new XConfig();
