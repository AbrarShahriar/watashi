import fs from "fs/promises";
import { directoryExists } from "../util";
import { Post } from "../types";

class Cache {
  private filename: string;
  private data: Record<string, Post[]> | null;
  private path: string;

  constructor(filename?: string) {
    this.filename = filename || "feed.json";
    this.path = "cache";
    this.data = null;
  }

  async get(): Promise<Record<string, Post[]> | null> {
    let time: string | number = 0;
    try {
      time = await fs.readFile(`${this.path}/timestamp.txt`, {
        encoding: "utf-8",
      });
    } catch (error) {
      time = new Date().getTime();
    }

    // Check in-memory cache
    if (this.data) return this.data;

    if (this.data == null) {
      try {
        let fileData = "{}";
        try {
          fileData = await fs.readFile(`${this.path}/${this.filename}`, {
            encoding: "utf-8",
          });
        } catch {
          await fs.writeFile(`${this.path}/${this.filename}`, fileData, {
            encoding: "utf-8",
          });
        }
        const data = JSON.parse(fileData);
        this.data = data;
      } catch (error) {
        this.data = null;
      }
    }

    return this.data;
  }

  async set(newData: Record<string, Post[]>) {
    this.data = newData;

    const prevDataRaw = await fs.readFile(`${this.path}/${this.filename}`, {
      encoding: "utf-8",
    });
    let prevData = JSON.parse(prevDataRaw);
    // Only run if prevData is not null
    if (prevData) {
      const sourceNames = Object.keys(newData);

      for (const sourceName of sourceNames) {
        // Fetch returned empty array, skip
        if (newData[sourceName].length == 0) continue;

        // Update only the successful fetch (non-empty) array to prevData
        prevData[sourceName] = newData[sourceName];
      }

      this.data = prevData;
    }

    await this.createParentDirectoryIfNotFound();

    await fs.writeFile(
      `${this.path}/${this.filename}`,
      JSON.stringify(this.data),
      {
        encoding: "utf-8",
      },
    );

    await this.setLastCacheUpdate();
  }

  private async createParentDirectoryIfNotFound() {
    const folderExists = await directoryExists(`cache`);
    if (!folderExists) await fs.mkdir(this.path);
  }

  public async getLastCacheUpdate() {
    const time = await fs.readFile(`${this.path}/timestamp.txt`, {
      encoding: "utf-8",
    });

    return time;
  }

  public async setLastCacheUpdate() {
    await fs.writeFile(
      `${this.path}/timestamp.txt`,
      JSON.stringify(Date.now()),
      {
        encoding: "utf-8",
      },
    );
  }
}

// Initiate singleton cache
export const cache = new Cache();
