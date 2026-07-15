export const siteConfig = {
  name: "DevPilot AI",
  description:
    "An AI-powered developer assistant for understanding, reviewing, and securing complex codebases.",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "https://devpilot.ai",
  locale: "en_US",
} as const;
