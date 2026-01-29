import { DevtoSource } from "../sources/devto/devto.source";
import { HackerNewsSource } from "../sources/hackernews/hackernews.source";
import { ItsfossSource } from "../sources/itsfoss/itsfoss.source";
import { LinkedinblogSource } from "../sources/linkedinblog/linkedinblog.source";
import { LogrocketSource } from "../sources/logrocket/logrocket.source";
import { RedditSource } from "../sources/reddit/reddit.source";
import { TheNewStackSource } from "../sources/thenewstack/thenewstack.source";
import { UberblogSource } from "../sources/uberblog/uberblog.source";
import { XSource } from "../sources/x/x.source";
import { Aggregator } from "./Aggregator";

export default function registerSources(agr: Aggregator) {
  agr.registerSource(new RedditSource());
  agr.registerSource(new HackerNewsSource());
  agr.registerSource(new TheNewStackSource());
  agr.registerSource(new DevtoSource());
  agr.registerSource(new ItsfossSource());
  agr.registerSource(new UberblogSource());
  agr.registerSource(new LinkedinblogSource());
  agr.registerSource(new LogrocketSource());
  // agr.registerSource(new XSource());
}
