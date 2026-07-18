import type { Metadata } from "next";

import { ArchitectureExplorerPage } from "@/components/features/repositories/architecture-explorer-page";

export const metadata: Metadata = {
  title: "Architecture explorer",
  description: "Explore the structure, dependencies, and architecture of the selected repository.",
};

export default async function Page({ params }: { params: Promise<{ repositoryId: string }> }) {
  const { repositoryId } = await params;
  return <ArchitectureExplorerPage repositoryId={repositoryId} />;
}
