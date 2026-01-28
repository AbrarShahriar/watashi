import { DevtoSource } from "../sources/devto/devto.source";
import { HackerNewsSource } from "../sources/hackernews/hackernews.source";
import { RedditSource } from "../sources/reddit/reddit.source";
import { TheNewStackSource } from "../sources/thenewstack/thenewstack.source";
import { XSource } from "../sources/x/x.source";
import { Aggregator } from "./Aggregator";

export default function registerSources(agr: Aggregator) {
  agr.registerSource(new RedditSource());
  agr.registerSource(new HackerNewsSource());
  agr.registerSource(new TheNewStackSource());
  agr.registerSource(new XSource());
  agr.registerSource(new DevtoSource());
}
