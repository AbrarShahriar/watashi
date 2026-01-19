import { gmail_v1, google } from "googleapis";

export default function gmailClient(): gmail_v1.Gmail {
  const oAuth2 = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URI
  );

  oAuth2.setCredentials({
    refresh_token: process.env.REFRESH_TOKEN,
  });

  return google.gmail({ version: "v1", auth: oAuth2 });
}
