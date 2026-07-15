import type { Metadata } from "next";

import { RepositoryAnalysisPage } from "@/components/features/repositories/repository-analysis-page";

export const metadata: Metadata = {
  title: "Repository analysis",
  description: "DevPilot AI repository analysis overview.",
};

export default function Page() {
  return <RepositoryAnalysisPage />;
}
