import type { Metadata } from "next";

import { RepositoryUploadPage } from "@/components/features/repositories/repository-upload-page";

export const metadata: Metadata = {
  title: "Upload repository",
  description: "Add a repository to your DevPilot AI workspace.",
};

export default function Page() {
  return <RepositoryUploadPage />;
}
