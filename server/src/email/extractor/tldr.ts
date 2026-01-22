import { load } from "cheerio";
import { clean, sanitize } from "../../util.js";
import { Post } from "../../types";

export default function tldrExtractor(html: string): Post[] {
  const $ = load(sanitize(html));
  clean($);
  const posts: Post[] = [];

  const titles = $(`div > span > a`)
    .toArray()
    .map((el) => $(el).text().trim())
    .filter((el) => !el.includes("Sponsor") && !el.includes("Sign"));

  const links = $(`div > span > a`)
    .toArray()
    .filter((el) => {
      const curEl = $(el).text();
      return !curEl.includes("Sponsor") && !curEl.includes("Sign");
    })
    .map((el) => {
      const curElHref = $(el).attr("href") || "";
      return decodeURIComponent(
        curElHref.slice(40, curElHref?.length).split("/")[0],
      );
    });

  const descriptions = $(`div > span > a`)
    .toArray()
    .filter((el) => {
      const curEl = $(el).text();
      return !curEl.includes("Sponsor") && !curEl.includes("Sign");
    })
    .map((el) => $(el).next().next().next().text().trim().split("\n").join());

  console.log(titles.length, descriptions.length, links.length);

  for (let i = 0; i < titles.length; i++) {
    posts.push({
      title: titles[i],
      description: descriptions[i],
      url: links[i],
      source: "TLDR",
      author: "TLDR",
      createdAt: Date.now().toString(),
      metadata: { score: 100 },
      id: Math.random().toString(),
      media: null,
    });
  }

  return posts;
}
