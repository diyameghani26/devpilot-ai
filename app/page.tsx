import type { Metadata } from "next";

import { HomePage } from "@/components/features/home/home-page";

export const metadata: Metadata = {
  title: "Your AI copilot for complex codebases",
  description:
    "DevPilot AI helps engineering teams understand architecture, review changes, detect risks, and ship with confidence.",
};

export default function Page() {
  return <HomePage />;
}
