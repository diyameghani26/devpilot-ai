import type { Metadata } from "next";

import { CodeReviewPage } from "@/components/features/repositories/code-review-page";

export const metadata: Metadata = {
  title: "AI code review",
  description: "Review code quality, maintainability, and AI-powered suggestions in DevPilot AI.",
};

export default function Page() {
  return <CodeReviewPage />;
}