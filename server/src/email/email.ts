import fs from "fs/promises";
import rundownExtractor from "./extractor/rundown.js";
import gmailClient from "../external/gmailclient.js";
import tldrExtractor from "./extractor/tldr.js";
import { gmail_v1 } from "googleapis";
import { EmailType, ExtractorType } from "../types.js";

export class EmailHandler {
  private _extractors: Record<string, Function> = {};

  public static Allowed: string[] = [];
  private lastHistoryId: string;
  private gmailClient: gmail_v1.Gmail | null;

  constructor() {
    this.registerExtractors({
      email: "news@daily.therundown.ai",
      evoke: rundownExtractor,
    });
    this.registerExtractors({
      email: "dan@tldrnewsletter.com",
      evoke: tldrExtractor,
    });

    this.lastHistoryId = "0";
    try {
      this.gmailClient = gmailClient();
    } catch (error) {
      console.log("Failed to initialize gmail client");
      this.gmailClient = null;
    }
  }

  async getEmailsAfterDate(date?: Date | string): Promise<EmailType[]> {
    let d = date;
    if (!d) {
      const a = new Date();
      a.setDate(a.getDate() - 1);
      d = `${a.getFullYear()}/${a.getMonth() + 1}/${a.getDate()}`;
    }

    try {
      const gmail = this.gmailClient;

      const res = await gmail?.users.messages.list({
        userId: "watashifido@gmail.com",
        q: `after:${d}`,
      });

      const emailsToLoad: Promise<EmailType | null>[] = [];
      const emails: EmailType[] = [];

      if (res && res.data.messages?.length && res.data.messages?.length > 0) {
        res.data.messages?.forEach(
          (message) =>
            message &&
            message.id &&
            emailsToLoad.push(this.getEmailData(message.id)),
        );

        const emailResults = await Promise.allSettled([...emailsToLoad]);

        const successful = emailResults
          .filter((r) => r.status === "fulfilled")
          .map((r) => r.value);

        if (successful.length > 0) {
          successful
            .filter(
              (email) => email && EmailHandler.Allowed.includes(email.from),
            )
            .forEach((email: EmailType | null) => {
              email &&
                emails.push({
                  id: email.id,
                  subject: email.subject,
                  from: email.from,
                  historyId: email.historyId,
                  receivedAt: email.date || "",
                  posts: this.getPostsFromEmail(email),
                });
            });

          await this.saveEmails(emails);
        }
      }

      return emails;
    } catch (error) {
      console.log("Failed to get emails after data", d);
      return [];
    }
  }

  async loadPrevMails(): Promise<EmailType[]> {
    return await this.getEmailsAfterDate();
  }

  async getUpdatedHistoryRecords(historyId: string) {
    const gmail = this.gmailClient;

    const res = await gmail?.users.history.list({
      userId: "watashifido@gmail.com",
      startHistoryId: historyId,
    });

    return (res && res.data.history) || [];
  }

  async getEmailData(emailId: string): Promise<EmailType | null> {
    if (!this.gmailClient) return null;

    const { data } = await this.gmailClient.users.messages.get({
      userId: "me",
      id: emailId,
      format: "full",
    });

    if (!data || !data.payload || !data.payload.headers) return null;

    const headers = data.payload.headers;
    const historyId = data.historyId as string;
    const subject = headers.find((h) => h.name === "Subject")?.value as string;
    const from = headers.find((h) => h.name === "From")?.value as string;
    const date = headers.find((h) => h.name === "Date")?.value as string;

    // Find HTML and text body
    let html = "";
    let text = "";
    const parts = data.payload.parts || [];

    for (const p of parts) {
      if (p.mimeType === "text/plain" && p.body?.data) {
        text = Buffer.from(p.body.data, "base64").toString();
        break;
      }
    }

    for (const p of parts) {
      if (p.mimeType === "text/html" && p.body?.data) {
        html = Buffer.from(p.body.data, "base64").toString();
        break;
      }
    }

    let emailFrom = from;
    const formattedFrom = from?.match(
      /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi,
    );

    if (formattedFrom && formattedFrom?.length && formattedFrom.length > 0) {
      emailFrom = formattedFrom[0];
    }

    return {
      id: emailId,
      subject,
      from: emailFrom,
      date,
      html,
      text,
      historyId,
    };
  }

  async loadLastHistoryId() {
    this.lastHistoryId = await fs.readFile("./src/email/historyid.txt", {
      encoding: "utf-8",
    });
  }

  async setLastHistoryId(newHistoryId: string) {
    await fs.writeFile("./src/email/historyid.txt", newHistoryId, {
      encoding: "utf-8",
    });
    this.lastHistoryId = newHistoryId;
  }

  async saveEmails(emails: unknown[]) {
    const prevEmails = await fs.readFile("./src/email/emails.json", {
      encoding: "utf-8",
    });
    const prevEmailsData = JSON.parse(prevEmails);
    let newEmailsData = [];

    console.log(prevEmailsData.length);

    if (prevEmailsData.length > 0) {
      newEmailsData = prevEmailsData.concat(
        emails.filter(
          (email) =>
            !prevEmailsData.some(
              (prevEmail: any) => prevEmail.id === (email as any).id,
            ),
        ),
      );
    } else {
      newEmailsData = emails;
    }

    console.log(newEmailsData.length);

    await fs.writeFile(
      "./src/email/emails.json",
      JSON.stringify(newEmailsData),
      {
        encoding: "utf-8",
      },
    );
  }

  async getEmailsFromFile() {
    try {
      const res = await fs.readFile("./src/email/emails.json", {
        encoding: "utf-8",
      });
      return JSON.parse(res);
    } catch (error) {
      return [];
    }
  }

  async getLastHistoryId() {
    await this.loadLastHistoryId();
    return this.lastHistoryId;
  }

  registerExtractors(extractor: ExtractorType) {
    this._extractors[extractor.email] = extractor.evoke;
    EmailHandler.Allowed.push(extractor.email);
  }

  getPostsFromEmail(emailObj: EmailType) {
    const sourceEmail = emailObj.from;

    if (sourceEmail) {
      const extractor = this._extractors[sourceEmail];

      if (extractor) {
        return extractor(emailObj.html);
      } else {
        console.log("No extractor for: " + sourceEmail);
      }
    } else {
      console.log("Invalid email id passed: " + emailObj.from);
    }
  }
}
