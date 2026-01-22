import { load } from "cheerio";
import { clean, sanitize } from "../../util.js";
import { Post } from "../../types.js";

export default function rundownExtractor(html: string): Post[] {
  const $ = load(sanitize(html));
  clean($);

  const posts: Post[] = [];

  const titles = $(`tr`)
    .filter(function () {
      return $(this).text().trim() === "In today’s AI rundown:";
    })
    .next()
    .find("li")
    .toArray()
    .slice(0, 4)
    .map((el) => $(el).text().trim());

  const links = titles.map((title) =>
    $(`a`)
      .filter(function () {
        return $(this).text().trim() === title;
      })
      .first()
      .attr("href"),
  );

  const descriptions = titles.map((title) =>
    $(`a`)
      .filter(function () {
        return $(this).text().trim() === title;
      })
      .first()
      .closest("tr")
      .nextAll()
      .text()
      .replace(/^.*?The Rundown:\s*/gm, ""),
  );

  for (let i = 0; i < titles.length; i++) {
    posts.push({
      id: Math.random().toString(),
      title: titles[i],
      url: links[i] || "",
      description: descriptions[i],
      source: "RundownAI",
      author: "RundownAI",
      createdAt: Date.now().toString(),
      metadata: { score: 100 },
      media: null,
    });
  }

  return posts;
}
