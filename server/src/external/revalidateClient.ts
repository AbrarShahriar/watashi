import { logger } from "../infra/logger";

export async function triggerClientCacheRevalidation() {
  try {
    const response = await fetch(`${process.env.CORS_ORIGIN}/api/revalidate`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.REVALIDATION_SECRET}`,
      },
    });

    logger.info("Revalidation Successful: " + response.status);
  } catch (error) {
    logger.error("Revalidation Failed: " + error);
  }
}
