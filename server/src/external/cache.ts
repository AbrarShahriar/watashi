import fs from "fs/promises";

export default class Cache {
  public filename: string;
  public data: unknown;

  constructor(filename?: string) {
    this.filename = filename || "feed.json";
    this.data = null;
  }

  async get() {
    const time = await fs.readFile("./src/cache/timestamp.txt", {
      encoding: "utf-8",
    });

    if (this.data) return { data: this.data, lastUpdated: time };

    if (this.data == null) {
      try {
        const file = await fs.readFile(`./src/cache/${this.filename}`, {
          encoding: "utf-8",
        });
        const data = JSON.parse(file);
        this.data = data;
      } catch (error) {
        this.data = null;
      } finally {
        return { data: this.data, lastUpdated: time };
      }
    }
  }

  async set(data: unknown) {
    this.data = data;

    await fs.writeFile(
      `./src/cache/${this.filename}`,
      JSON.stringify(this.data),
      {
        encoding: "utf-8",
      }
    );

    await fs.writeFile(
      "./src/cache/timestamp.txt",
      JSON.stringify(Date.now()),
      {
        encoding: "utf-8",
      }
    );
  }
}
