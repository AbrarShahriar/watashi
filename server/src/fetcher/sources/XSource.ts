import { Post, XPost } from "../../types";
import { SourceBase } from "../SourceBase";

type XUser = {
  username: string;
  displayname: string;
};

type XAuth = {
  gSearchKey: string;
  gSearchCx: string;
};

type XRaw = {
  identifier: string;
  commentcount: string;
  articlebody: string;
  datecreated: string;
  url: string;
  position: string;
  headline: string;
  datepublished: string;
  isbasedon: string;
};

export class XSource extends SourceBase {
  readonly id = "x";

  constructor(public config: { users: XUser[]; auth: XAuth }) {
    super(config);
    this.config = config;
  }

  async fetchSingle(user: XUser) {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    const queryDate =
      date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();

    const query = `"${user.displayname}" inurl:${user.username}  after:${queryDate} intitle:"${user.displayname}"`;

    const response = await fetch(
      `https://www.googleapis.com/customsearch/v1?key=${this.config.auth.gSearchKey}&cx=${this.config.auth.gSearchCx}&q=${query}&sort=date`,
    );

    const data = await response.json();

    if (!data.items || data.items.length == 0) {
      return [];
    }

    const d: XRaw[][] = data.items.map(
      (item: { pagemap: { socialmediaposting: XRaw[] } }) =>
        item.pagemap.socialmediaposting,
    );

    return this.parseContent(d, { user });
  }

  async fetchContent(): Promise<Post[]> {
    const posts: Post[] = [];

    for (const user of this.config.users) {
      const content = await this.withCircuitRetry(
        async () => await this.fetchSingle(user),
        user.username,
      );

      posts.push(...content);
    }

    return posts;
  }

  parseContent(rawData: XRaw[][], metadata: { user: XUser }): XPost[] {
    const parsedPosts: XPost[] = [];

    for (let i = 0; i < rawData.length; i++) {
      for (let j = 0; j < rawData[i].length; j++) {
        const currentItem = rawData[i][j];

        if (currentItem && currentItem.url && currentItem.url.includes) {
          const userFound = currentItem.url.includes(metadata.user.username);
          const positionFound = currentItem.position;
          const isbasedon = currentItem.isbasedon;
          const datepublishedFound = currentItem.datepublished;

          if (userFound && positionFound && datepublishedFound && !isbasedon) {
            const numOfComments = 10;
            parsedPosts.push({
              id: currentItem.identifier,
              author: metadata.user.username,
              createdAt: currentItem.datepublished,
              url: currentItem.url,
              source: `X - ${metadata.user.displayname}`,
              description: currentItem.articlebody || "",
              title:
                currentItem.headline || `Post by ${metadata.user.displayname}`,
              metadata: {
                numOfComments: parseInt(currentItem.commentcount),
              },
            });
          }
        }
      }
    }

    return parsedPosts;
  }

  async healthCheck(): Promise<boolean> {
    return await new Promise((resolve) => true);
  }
}
