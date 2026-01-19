import fs from "fs/promises";
import { directoryExists } from "../util";

class Cache {
  private filename: string;
  private data: unknown;
  private path: string;

  constructor(filename?: string) {
    this.filename = filename || "feed.json";
    this.path = "cache";
    this.data = null;
  }

  async get() {
    let time: string | number = 0;
    try {
      time = await fs.readFile(`${this.path}/timestamp.txt`, {
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
      } finally {
        return { data: this.data, lastUpdated: time };
      }
    }
  }

  async set(data: unknown) {
    this.data = data;

    await this.createParentDirectoryIfNotFound();

    await fs.writeFile(
      `${this.path}/${this.filename}`,
      JSON.stringify(this.data),
      {
        encoding: "utf-8",
      },
    );

    await fs.writeFile(
      `${this.path}/timestamp.txt`,
      JSON.stringify(Date.now()),
      {
        encoding: "utf-8",
      },
    );
  }

  private async createParentDirectoryIfNotFound() {
    const folderExists = await directoryExists(`cache`);
    if (!folderExists) await fs.mkdir(this.path);
  }
}

// Initiate singleton cache
export const cache = new Cache();
