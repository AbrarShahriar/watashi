import fs from "fs/promises";

class Cache {
  public filename: string;
  public data: unknown;

  constructor(filename?: string) {
    this.filename = filename || "feed.json";
    this.data = null;
  }

  async get() {
    let time: string | number = 0;
    try {
      time = await fs.readFile("./src/cache/timestamp.txt", {
        encoding: "utf-8",
      });
    } catch (error) {
      time = new Date().getTime();
    }

    if (this.data) return { data: this.data, lastUpdated: time };

    if (this.data == null) {
      try {
        let fileData = "{}";
        try {
          fileData = await fs.readFile(`./src/cache/${this.filename}`, {
            encoding: "utf-8",
          });
        } catch {
          await fs.writeFile(`./src/cache/${this.filename}`, fileData, {
            encoding: "utf-8",
          });
        }
        const data = JSON.parse(fileData);
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
      },
    );

    await fs.writeFile(
      "./src/cache/timestamp.txt",
      JSON.stringify(Date.now()),
      {
        encoding: "utf-8",
      },
    );
  }
}

// Initiate singleton cache
export const cache = new Cache();
