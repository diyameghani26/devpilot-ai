import type { Metadata } from "next";

import { ArchitectureExplorerPage } from "@/components/features/repositories/architecture-explorer-page";

export const metadata: Metadata = {
  title: "Architecture explorer",
  description: "Explore the structure, dependencies, and architecture of a DevPilot AI repository.",
};

export default function Page() {
  return <ArchitectureExplorerPage />;
}
