import { HackerNewsSource } from "../sources/hackernews/HackerNewsSource";
import { RedditSource } from "../sources/reddit/RedditSource";
import { TheNewStackSource } from "../sources/thenewstack/TheNewStackSource";
import { XSource } from "../sources/x/XSource";
import { Aggregator } from "./Aggregator";

export default function registerSources(agr: Aggregator) {
  agr.registerSource(new RedditSource());
  agr.registerSource(new HackerNewsSource());
  agr.registerSource(new TheNewStackSource());
  agr.registerSource(new XSource());
}
