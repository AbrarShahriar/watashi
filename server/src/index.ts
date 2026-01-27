import express, { Request } from "express";
import { config } from "dotenv";
import compression from "compression";
import * as bodyParser from "body-parser";
import gmailClient from "./external/gmailclient";
import { EmailHandler } from "./email/email";
import { gmail_v1 } from "googleapis";
import { EmailType } from "./types";
import { cache } from "./storage/cache";
import cors from "cors";
import { paginate } from "./util";
import { logger } from "./infra/logger";
import aggregator from "./aggregator/index";

// Inject env variables
config();

// Initiate singleton email handler
const emailHandler = new EmailHandler();

// Setup express app
const app = express();

// Express middlewares
app.use(compression());
app.use(bodyParser.json());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN!,
  }),
);

// Default route
app.get("/", async (req, res) => {
  logger.info("Health check hit");
  res.status(200).send("OK");
});

// Feed Route
app.get(
  "/feed",
  async (req: Request<{}, {}, {}, { page: string; limit: string }>, res) => {
    let posts = await cache.get();
    // let emails = await emailHandler.getEmailsFromFile();
    // if (!emails) emails = [];

    const lastUpdated = await aggregator.lastRun();

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const total = posts
      ? Object.keys(posts).reduce((total, key) => total + posts[key].length, 0)
      : 0;

    const paginatedData = posts ? paginate(posts, { page, limit }) : posts;

    let sourcesWithData = 0;
    posts &&
      Object.keys(posts).forEach((key) => {
        if (posts[key].length > 0) sourcesWithData++;
      });

    const feed = {
      posts: paginatedData,
      lastUpdated,
      total,
      pages: Math.ceil(1 + total / (sourcesWithData * limit)),
    };

    res.status(200).json(feed);
  },
);

// Fetch route for cron job
app.get("/all", (req, res) => {
  if (aggregator.isRunning) {
    logger.info("Aggregation already running");
    return res.status(202).json({ message: "Aggregation already running" });
  }

  aggregator.isRunning = true;

  logger.info("Aggregation started");
  aggregator.run().catch((err) => logger.error(err));

  res.status(202).json({ message: "Aggregation started" });
});

// Webhook to get newsletter updates
app.post("/gmail/push", async (req, res) => {
  try {
    const msg = req.body.message;

    let data = Buffer.from(msg.data, "base64").toString();
    data = JSON.parse(data);

    // Extract history ID from GCP
    const historyId = await emailHandler.getLastHistoryId();
    console.log("Using History ID: ", historyId);

    // Get the updated history records, contains the new emails' id
    const updatedHistoryRecords =
      await emailHandler.getUpdatedHistoryRecords(historyId);

    const emailsToLoad = [];

    // Extract the email ids and fetch their data
    for (let i = 0; i < updatedHistoryRecords.length; i++) {
      if (
        updatedHistoryRecords &&
        updatedHistoryRecords[i] &&
        updatedHistoryRecords[i].messagesAdded
      ) {
        for (
          let j = 0;
          j <
          (
            updatedHistoryRecords[i]
              .messagesAdded as gmail_v1.Schema$HistoryMessageAdded[]
          ).length;
          j++
        ) {
          const message = (
            updatedHistoryRecords[i]
              .messagesAdded as gmail_v1.Schema$HistoryMessageAdded[]
          )[j].message;
          if (message && message.id) {
            emailsToLoad.push(emailHandler.getEmailData(message.id));
          }
        }
      }
    }

    const emailResults = await Promise.allSettled([...emailsToLoad]);

    const successful = emailResults
      .filter((r) => r.status === "fulfilled")
      .map((r) => r.value);

    if (successful.length > 0) {
      const emails: EmailType[] = [];
      successful
        .filter(
          (email) =>
            email && email.from && EmailHandler.Allowed.includes(email.from),
        )
        .forEach((email: EmailType | null) => {
          if (email) {
            emails.push({
              id: email.id,
              subject: email.subject,
              from: email.from,
              historyId: email.historyId,
              receivedAt: email.date,
              posts: emailHandler.getPostsFromEmail(email),
            });
            console.log(email.subject, email.from, email.historyId, email.text);
          }
        });

      // Update the last history ID
      const latestHistoryId = successful[successful.length - 1] as EmailType;
      await emailHandler.setLastHistoryId(latestHistoryId.historyId as string);
      await emailHandler.saveEmails(emails);
    }

    res.status(200).send("OK");
  } catch (err) {
    console.error("Error:", err);
    res.status(500).send("Error");
  }
});

// Renew Google PubSub Watch
app.get("/watch-renew", async (req, res) => {
  const gClient = gmailClient();

  try {
    const response = await gClient.users.watch({
      userId: "me",
      requestBody: {
        topicName: "projects/watashi-fido/topics/gmail-update",
        labelIds: ["INBOX"],
        labelFilterAction: "include",
      },
    });
    const { historyId, expiration } = response.data;
    historyId && (await emailHandler.setLastHistoryId(historyId));

    res
      .status(200)
      .json({ historyId, expiration: new Date(Number(expiration)) });
  } catch (e) {
    console.error("Watch error", e);
    res.status(500).send("Failed to renew watch");
  }
});

// Start server
app.listen(5000, async (err) => {
  if (err) logger.error(err);
  logger.info("Server started at 5000");
  // await emailHandler.loadPrevMails();
});
