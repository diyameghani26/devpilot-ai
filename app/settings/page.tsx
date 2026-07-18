import type { Metadata } from "next";

import { SettingsPage } from "@/components/features/settings/settings-page";

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage your DevPilot AI workspace preferences.",
};

export default function Page() {
  return <SettingsPage />;
}
