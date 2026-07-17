import type { Metadata } from "next";

import { ReadmeGeneratorPage } from "@/components/features/repositories/readme-generator-page";

export const metadata: Metadata = {
  title: "README generator",
  description: "Generate structured README documentation from your repository in DevPilot AI.",
};

export default function Page() {
  return <ReadmeGeneratorPage />;
}