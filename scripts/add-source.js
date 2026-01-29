const fs = require("fs");
const path = require("path");

const sourceName = process.argv[2];

if (!sourceName) {
  console.error("❌ Please provide a source name");
  console.log("Usage: npm run add-source <source-name>");
  process.exit(1);
}

const root = path.join(process.cwd(), "server");
const sourceDir = path.join(root, "src", "sources", sourceName);
const registryFile = path.join(root, "src", "aggregator", "registry.ts");

if (fs.existsSync(sourceDir)) {
  console.error("❌ Source already exists");
  process.exit(1);
}

fs.mkdirSync(sourceDir, { recursive: true });

const mainName = sourceName.charAt(0).toUpperCase() + sourceName.slice(1);

const className = mainName + "Source";

// ---------- file templates ----------

const sourceFile = `
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
import ${sourceName}Config, { ${mainName}Config } from "./${sourceName}.config";
import { ${mainName}Raw } from "./${sourceName}.types";

export class ${className} extends SourceBase {
  id = "${sourceName}";

  constructor(public config: ${mainName}Config = ${sourceName}Config) {
      super(config);
  }

   async operation() {
    const res = await fetch(this.config.getUrl({}));
    const data = await res.json();
    return this.parseContent(data);
  }

  async run(): Promise<Post[]> {
      return await this.withCircuitRetry(
        async () => await this.operation(),
        this.id,
      );
  }

  parseContent(rawData: ${mainName}Raw[]): Post[] {
      return rawData.map((entry) => ({
        id: entry.id,
        title: entry.title,
        description: entry.description || "",
        source: "${sourceName}",
        author: entry.name,
        createdAt: entry.createdAt,
        url: entry.url,
        score: this.calculatePerformanceScore(entry),
        media: entry.media || null,
      }));
  }

  public calculatePerformanceScore(post: ${mainName}Raw): number {
      let e,
        r,
        q,
        c,
        K = 125;
  
      const age = hoursSince(post.createdAt);
  
      e = logSaturationNormalizer(
        1.5 * post.m1 + 2 * post.m2,
        K,
      );
      r = timeDecay(age, 48, "age");
      q = post.m3 > 10 ? 0.2 : 0.1;
      c = age < 6 ? 0.3 : 0.15;
  
      let wE = 1.5,
        wR = 2,
        wQ = 1.5,
        wC = 1.5,
        W = wE + wR + wQ + wC;
  
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
`;

const configFile = `
import { SourceConfig } from "../SourceConfig";

export class ${mainName}Config extends SourceConfig {
  getUrl({
  }: {
  }): string {
    return "";
  }
}

export default new ${mainName}Config();
`;

const typesFile = `
export type ${mainName}Raw = {
  
};

`;

// ---------- write files ----------

fs.writeFileSync(path.join(sourceDir, `${sourceName}.source.ts`), sourceFile);
fs.writeFileSync(path.join(sourceDir, `${sourceName}.config.ts`), configFile);
fs.writeFileSync(path.join(sourceDir, `${sourceName}.types.ts`), typesFile);

console.log("✅ Source files created");
console.log(`🎉 Source '${sourceName}' added successfully`);
