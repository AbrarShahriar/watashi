import type { Metadata } from "next";
import { IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import FeedHeader from "@/components/feed/FeedHeader";
import Script from "next/script";
import NextTopLoader from "nextjs-toploader";

const ibmPlex = IBM_Plex_Sans({
  variable: "--font-ibmplex-sans",
  subsets: ["latin"],
});

const ibmMono = IBM_Plex_Mono({
  variable: "--font-ibmplex-mono",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Watashi - Daily Dev Digest",
  description: "Meaningful Curated Content From Across The Web",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${ibmPlex.className} ${ibmMono.className} antialiased dark`}
      >
        <Script
          src="https://beamanalytics.b-cdn.net/beam.min.js"
          data-token={process.env.BEAM_ANALYTICS_TOKEN!}
          async
          strategy="beforeInteractive"
        ></Script>
        <NextTopLoader showSpinner={false} />
        <FeedHeader />
        {children}
      </body>
    </html>
  );
}
