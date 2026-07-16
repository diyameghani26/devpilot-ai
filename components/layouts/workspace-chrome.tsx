"use client";

import { usePathname } from "next/navigation";

import { WorkspaceNavigation } from "@/components/layouts/workspace-navigation";

export function WorkspaceChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isRepositoryTool = pathname.startsWith("/repositories/");

  if (!isRepositoryTool) return children;

  return <><WorkspaceNavigation /><div className="lg:pl-[4.5rem]">{children}</div></>;
}
