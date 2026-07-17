import { RepositoryWorkspacePage } from "@/components/features/repositories/repository-workspace-page";

export default async function Page({ params }: { params: Promise<{ repositoryId: string }> }) {
  const { repositoryId } = await params;

  return <RepositoryWorkspacePage repositoryId={repositoryId} />;
}
