import type { Metadata } from "next";

import { PerformanceInsightsPage } from "@/components/features/repositories/performance-insights-page";

export const metadata: Metadata = {
  title: "Performance insights",
  description: "Review bundle size, render performance, and AI optimization suggestions in DevPilot AI.",
};

export default function Page() {
  return <PerformanceInsightsPage />;
}