import type { Metadata } from "next";

import { SecurityScannerPage } from "@/components/features/repositories/security-scanner-page";

export const metadata: Metadata = {
  title: "Security scanner",
  description: "Review security findings and remediation guidance in DevPilot AI.",
};

export default function Page() {
  return <SecurityScannerPage />;
}
