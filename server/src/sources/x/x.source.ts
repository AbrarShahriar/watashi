import { Post } from "../../types";
import {
  hoursSince,
  logSaturationNormalizer,
  mulWeights,
  noise,
  timeDecay,
  vectorToScalar,
} from "../../util";
import { SourceBase } from "../SourceBase";
import xConfig, { XConfig } from "./x.config";
import { XUser, XAuth, XRaw, XRawItem } from "./x.types";

export class XSource extends SourceBase {
  readonly id = "x";

  constructor(public config: XConfig = xConfig) {
    super(config);
  }

  async fetchSingle(user: XUser) {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    const queryDate =
      date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();

    const query = `"${user.displayname}" inurl:${user.username}  after:${queryDate} intitle:"${user.displayname}"`;

    const response = await fetch(this.config.getUrl({ query }));

    const data: XRaw = await response.json();

    if (!data.items || data.items.length == 0) {
      return [];
    }

    const d: XRawItem[][] = data.items.map(
      (item: { pagemap: { socialmediaposting: XRawItem[] } }) =>
        item.pagemap.socialmediaposting,
    );

    return this.parseContent(d, { user });
  }

  async run(): Promise<Post[]> {
    const posts: Post[] = [];

    for (const user of this.config.profiles) {
      const content = await this.withCircuitRetry(
        async () => await this.fetchSingle(user),
        user.username,
      );

      posts.push(...content);
    }

    return posts;
  }

  parseContent(rawData: XRawItem[][], metadata: { user: XUser }): Post[] {
    const parsedPostsMap = new Map<string, Post>();

    for (let i = 0; i < rawData.length; i++) {
      for (let j = 0; j < rawData[i].length; j++) {
        const currentItem = rawData[i][j];

        if (currentItem && currentItem.url && currentItem.url.includes) {
          const userFound = currentItem.url.includes(metadata.user.username);
          const positionFound = currentItem.position;
          const isbasedon = currentItem.isbasedon;
          const datepublishedFound = currentItem.datepublished;

          if (userFound && positionFound && datepublishedFound && !isbasedon) {
            if (!parsedPostsMap.has(currentItem.identifier)) {
              parsedPostsMap.set(currentItem.identifier, {
                id: currentItem.identifier,
                author: metadata.user.username,
                createdAt: currentItem.datepublished,
                url: currentItem.url,
                source: `X - ${metadata.user.displayname}`,
                description: currentItem.articlebody || "",
                title:
                  currentItem.headline ||
                  `Post by ${metadata.user.displayname}`,

                score: this.calculatePerformanceScore(currentItem),
                media: null,
              });
            }
          }
        }
      }
    }

    return Array.from(parsedPostsMap.values());
  }

  public calculatePerformanceScore(post: XRawItem): number {
    let e,
      r,
      q,
      c,
      K = 250;
    const age = hoursSince(post.datepublished);
    e = logSaturationNormalizer(2 * parseInt(post.commentcount), K);
    r = timeDecay(age, 24, "age");
    q = 0;
    if (post.headline) q += 0.2;
    if (post.articlebody.length > 30) q += 0.15;
    c = age < 8 ? 0.1 : 0.05;

    let wE = 1.25,
      wR = 1.1,
      wQ = 1.2,
      wC = 1.25,
      W = wE + wR + wC + wQ;

    return (
      vectorToScalar(
        mulWeights([wE / W, wR / W, wQ / W, wC / W], [e, r, q, c]),
      ) + noise()
    );
  }

  async healthCheck(): Promise<boolean> {
    return await new Promise((resolve) => true);
  }
}
