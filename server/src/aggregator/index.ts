import { Aggregator } from "./Aggregator";
import registerSources from "./registry";

const aggregator = new Aggregator();
registerSources(aggregator);

export default aggregator;
