import { BugDetectionPage } from "@/components/features/repositories/bug-detection-page";

export default async function Page({ params }: { params: Promise<{ repositoryId: string }> }) {
  const { repositoryId } = await params;
  return <BugDetectionPage repositoryId={repositoryId} />;
}
