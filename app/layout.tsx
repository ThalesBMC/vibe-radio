import React from "react";
import { Inter } from "next/font/google";
import QueryProvider from "@/providers/QueryProvider";
import "./globals.css";
import "@/styles/mapStyles.css";
import { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Vibe Radio - Explore Radio Stations Worldwide",
  description:
    "Discover radio stations from around the world with interactive map visualization. Listen to global broadcasts in real-time.",
  keywords: [
    "radio",
    "stations",
    "worldwide",
    "map",
    "music",
    "broadcast",
    "streaming",
  ],
  authors: [{ name: "Vibe Radio Team" }],
  creator: "Vibe Radio",
  publisher: "Vibe Radio",
  openGraph: {
    type: "website",
    url: "https://viberadio.live",
    title: "Vibe Radio - Explore Radio Stations Worldwide",
    description:
      "Discover radio stations from around the world with interactive map visualization. Listen to global broadcasts in real-time.",
    siteName: "Vibe Radio",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Vibe Radio Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Vibe Radio - Explore Radio Stations Worldwide",
    description:
      "Discover radio stations from around the world with interactive map visualization.",
    images: ["/og.png"],
    creator: "@viberadio",
  },
  applicationName: "Vibe Radio",
  metadataBase: new URL("https://viberadio.live"),
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/favicon/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon/favicon.ico", sizes: "any" },
      { url: "/favicon/favicon-96x96.png", sizes: "96x96", type: "image/png" },
    ],
    apple: [
      { url: "/favicon/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon/favicon.ico",
    other: [
      {
        rel: "mask-icon",
        url: "/favicon/favicon.svg",
        color: "#ffffff",
      },
    ],
  },
  manifest: "/favicon/manifest.json",
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Ensure Leaflet styles are loaded */}
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
        {/* Favicon */}
        <link rel="icon" href="/favicon/favicon.ico" sizes="any" />
        <link
          rel="icon"
          href="/favicon/favicon-96x96.png"
          sizes="96x96"
          type="image/png"
        />

        <link rel="manifest" href="/favicon/manifest.json" />
        <meta name="theme-color" content="#ffffff" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="Vibe Radio" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className={inter.className}>
        <QueryProvider>{children}</QueryProvider>
        <Analytics />
      </body>
    </html>
  );
}
