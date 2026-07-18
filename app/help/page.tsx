import type { Metadata } from "next";

import { HelpPage } from "@/components/features/help/help-page";

export const metadata: Metadata = {
  title: "Help & Support",
  description: "Guidance and support for DevPilot AI.",
};

export default function Page() {
  return <HelpPage />;
}
