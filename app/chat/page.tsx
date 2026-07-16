import type { Metadata } from "next";

import { ChatAssistantPage } from "@/components/features/chat/chat-assistant-page";

export const metadata: Metadata = {
  title: "Chat assistant",
  description: "Ask DevPilot AI about your repositories, architecture, and security findings.",
};

export default function Page() {
  return <ChatAssistantPage />;
}