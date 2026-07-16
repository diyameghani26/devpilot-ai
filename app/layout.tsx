import React from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { ThemeProvider } from "@/components/providers/theme-provider";
import { WorkspaceChrome } from "@/components/layouts/workspace-chrome";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://devpilot.ai"),
  title: {
    default: "DevPilot AI",
    template: "%s | DevPilot AI",
  },
  description:
    "An AI-powered developer assistant for understanding, reviewing, and securing complex codebases.",
  applicationName: "DevPilot AI",
  keywords: [
    "AI developer assistant",
    "code review",
    "repository analysis",
    "security analysis",
    "developer tools",
  ],
  authors: [{ name: "DevPilot AI" }],
  creator: "DevPilot AI",
  publisher: "DevPilot AI",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "DevPilot AI",
    title: "DevPilot AI",
    description:
      "An AI-powered developer assistant for understanding, reviewing, and securing complex codebases.",
  },
  twitter: {
    card: "summary_large_image",
    title: "DevPilot AI",
    description:
      "An AI-powered developer assistant for understanding, reviewing, and securing complex codebases.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background font-sans text-foreground">
        <ThemeProvider>
          <WorkspaceChrome>{children}</WorkspaceChrome>
        </ThemeProvider>
      </body>
    </html>
  );
}
