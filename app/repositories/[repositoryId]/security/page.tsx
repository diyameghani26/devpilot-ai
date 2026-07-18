import { SecurityScannerPage } from "@/components/features/repositories/security-scanner-page";

export default async function Page({ params }: { params: Promise<{ repositoryId: string }> }) {
  const { repositoryId } = await params;
  return <SecurityScannerPage repositoryId={repositoryId} />;
}
