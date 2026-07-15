import type { Metadata } from "next";

import { BugDetectionPage } from "@/components/features/repositories/bug-detection-page";

export const metadata: Metadata = {
  title: "Bug detection",
  description: "Review detected issues and suggested fixes in DevPilot AI.",
};

export default function Page() {
  return <BugDetectionPage />;
}
