"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { Activity, Bot, Bug, ChevronLeft, ChevronRight, FolderGit2, LayoutDashboard, Menu, Network, Plus, ScanSearch, ShieldCheck, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { cn } from "@/lib/utils";

const navigation = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/repositories/upload", label: "Add repository", icon: Plus },
  { href: "/repositories/analysis", label: "Repository analysis", icon: Activity },
  { href: "/repositories/architecture", label: "Architecture explorer", icon: Network },
  { href: "/repositories/bugs", label: "Bug detection", icon: Bug },
  { href: "/repositories/code-review", label: "AI code review", icon: ScanSearch },
  { href: "/repositories/security", label: "Security scanner", icon: ShieldCheck },
] as const;

function Brand({ compact = false }: { compact?: boolean }) {
  return <Link href="/dashboard" className="flex items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><span className="grid size-8 place-items-center rounded-[10px] bg-primary text-primary-foreground shadow-sm"><Bot className="size-[18px]" strokeWidth={2.2} /></span>{!compact ? <span className="whitespace-nowrap font-semibold tracking-[-0.03em]">DevPilot AI</span> : null}</Link>;
}

function NavigationLinks({ expanded, onNavigate }: { expanded: boolean; onNavigate?: () => void }) {
  const pathname = usePathname();
  const params = useParams<{ repositoryId?: string }>();
  return <nav className="space-y-1" aria-label="Workspace navigation">{navigation.map(({ href, label, icon: Icon }) => {
    const destination = href === "/repositories/architecture" && params.repositoryId ? `/repositories/${params.repositoryId}/architecture` : href;
    const active = pathname === destination;
    return <Link key={href} href={destination} onClick={onNavigate} title={!expanded ? label : undefined} className={cn("flex h-10 items-center gap-3 rounded-lg text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", expanded ? "px-3" : "justify-center px-2", active ? "bg-secondary font-medium text-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground")}><Icon className="size-4 shrink-0" /><span className={cn("truncate", !expanded && "sr-only")}>{label}</span></Link>;
  })}</nav>;
}

export function WorkspaceNavigation() {
  const [expanded, setExpanded] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  React.useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setMobileOpen(false); };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);

  return <>
    <aside className={cn("fixed inset-y-0 left-0 z-30 hidden border-r border-border bg-background/95 p-3 shadow-xl shadow-black/5 backdrop-blur-xl transition-[width] duration-300 lg:flex lg:flex-col", expanded ? "w-64" : "w-[4.5rem]")}>
      <div className={cn("flex h-10 items-center", expanded ? "justify-between" : "justify-center")}><Brand compact={!expanded} />{expanded ? <button type="button" onClick={() => setExpanded(false)} className="grid size-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground" aria-label="Collapse sidebar"><ChevronLeft className="size-4" /></button> : null}</div>
      <div className="mt-8"><NavigationLinks expanded={expanded} /></div>
      <button type="button" onClick={() => setExpanded(true)} className={cn("mt-auto flex h-9 items-center justify-center gap-2 rounded-lg text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground", expanded && "hidden")} aria-label="Expand sidebar"><ChevronRight className="size-4" /></button>
      {expanded ? <div className="mt-auto rounded-xl border border-border bg-surface p-3"><div className="flex items-center gap-2"><span className="grid size-7 place-items-center rounded-lg bg-secondary"><FolderGit2 className="size-3.5" /></span><p className="text-xs font-medium">DevPilot workspace</p></div><p className="mt-2 text-xs leading-5 text-muted-foreground">Repository tools ready to explore.</p></div> : null}
    </aside>
    <button type="button" onClick={() => setMobileOpen(true)} className="fixed bottom-5 right-5 z-30 grid size-11 place-items-center rounded-xl border border-border bg-card text-foreground shadow-lg lg:hidden" aria-label="Open workspace navigation" aria-expanded={mobileOpen}><Menu className="size-5" /></button>
    <AnimatePresence>{mobileOpen ? <><motion.button type="button" aria-label="Close workspace navigation" className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileOpen(false)} /><motion.aside className="fixed inset-y-0 left-0 z-50 flex w-[min(20rem,calc(100vw-3rem))] flex-col border-r border-border bg-background p-4 shadow-2xl lg:hidden" initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ type: "spring", damping: 28, stiffness: 300 }}><div className="flex h-10 items-center justify-between"><Brand /><button type="button" onClick={() => setMobileOpen(false)} className="grid size-9 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground" aria-label="Close workspace navigation"><X className="size-4" /></button></div><div className="mt-8"><NavigationLinks expanded onNavigate={() => setMobileOpen(false)} /></div></motion.aside></> : null}</AnimatePresence>
  </>;
}
