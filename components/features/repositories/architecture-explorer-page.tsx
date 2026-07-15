"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Bot,
  Boxes,
  Braces,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleDot,
  Code2,
  FileCode2,
  FileJson2,
  Folder,
  FolderOpen,
  GitBranch,
  Layers3,
  Network,
  Package,
  RefreshCw,
  Route,
  Search,
  Sparkles,
  Waypoints,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

type TreeItem = {
  id: string;
  name: string;
  type: "folder" | "file";
  detail: string;
  children?: TreeItem[];
};

const tree: TreeItem[] = [
  { id: "app", name: "app", type: "folder", detail: "App Router routes, layouts, and page composition.", children: [
    { id: "dashboard", name: "dashboard", type: "folder", detail: "Workspace overview route.", children: [{ id: "dashboard-page", name: "page.tsx", type: "file", detail: "Dashboard route entry." }] },
    { id: "repositories", name: "repositories", type: "folder", detail: "Repository upload and analysis flows.", children: [{ id: "analysis", name: "analysis", type: "folder", detail: "Repository analysis route.", children: [{ id: "analysis-page", name: "page.tsx", type: "file", detail: "Analysis route entry." }] }, { id: "upload", name: "upload", type: "folder", detail: "Repository intake route.", children: [{ id: "upload-page", name: "page.tsx", type: "file", detail: "Upload route entry." }] }] },
    { id: "layout", name: "layout.tsx", type: "file", detail: "Root layout and application providers." },
  ] },
  { id: "components", name: "components", type: "folder", detail: "Reusable interface primitives and feature modules.", children: [
    { id: "features", name: "features", type: "folder", detail: "Feature-level screens and composed experiences.", children: [{ id: "feature-analysis", name: "repositories", type: "folder", detail: "Repository-focused feature views." }] },
    { id: "ui", name: "ui", type: "folder", detail: "Shared buttons, cards, form controls, and feedback primitives.", children: [{ id: "button", name: "button.tsx", type: "file", detail: "Button variants and loading state." }, { id: "card", name: "card.tsx", type: "file", detail: "Composable card primitives." }] },
  ] },
  { id: "lib", name: "lib", type: "folder", detail: "Shared utilities and cross-cutting helpers.", children: [{ id: "utils", name: "utils.ts", type: "file", detail: "Class name composition helper." }] },
  { id: "public", name: "public", type: "folder", detail: "Static files served directly by Next.js." },
  { id: "package", name: "package.json", type: "file", detail: "Project scripts and dependency manifest." },
] as const;

const overview = [
  { label: "Architecture", value: "Feature-first", caption: "App Router + shared UI", icon: Layers3 },
  { label: "Framework", value: "Next.js 16", caption: "React 19 · TypeScript", icon: Route },
  { label: "Modules", value: "18", caption: "Across 6 core areas", icon: Boxes },
] as const;

const folderMap = [
  { name: "/app", role: "Presentation & routes", description: "Owns URL structure, layouts, metadata, and page-level composition.", links: ["components/features", "components/ui"], icon: Route, tone: "text-info bg-info/15" },
  { name: "/components", role: "Product interface", description: "Keeps reusable primitives separate from feature-specific screens.", links: ["lib", "app"], icon: Code2, tone: "text-success bg-success/15" },
  { name: "/lib", role: "Shared foundation", description: "Provides small utilities used consistently across the interface.", links: ["components", "app"], icon: Braces, tone: "text-warning bg-warning/15" },
] as const;

const dependencies = [
  { name: "next", version: "16.2.10", purpose: "App Router, rendering, and optimized builds", kind: "Framework" },
  { name: "react", version: "19.2.4", purpose: "Interactive user interface runtime", kind: "Core" },
  { name: "framer-motion", version: "12.42.2", purpose: "Interface transitions and motion", kind: "Interface" },
  { name: "lucide-react", version: "1.24.0", purpose: "Consistent icon system", kind: "Interface" },
  { name: "tailwindcss", version: "4", purpose: "Token-driven styling utilities", kind: "Styling" },
] as const;

function ExplorerSkeleton() {
  return <div className="mx-auto max-w-7xl animate-pulse space-y-6 px-5 py-9 sm:px-8 lg:py-12"><div className="h-5 w-44 rounded bg-muted" /><div className="h-11 w-80 rounded bg-muted" /><div className="grid gap-4 sm:grid-cols-3"><div className="h-28 rounded-xl bg-muted" /><div className="h-28 rounded-xl bg-muted" /><div className="h-28 rounded-xl bg-muted" /></div><div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_360px]"><div className="h-[510px] rounded-xl bg-muted" /><div className="h-[510px] rounded-xl bg-muted" /></div></div>;
}

function TreeNode({ item, depth, expanded, onToggle, selectedId, onSelect }: { item: TreeItem; depth: number; expanded: Set<string>; onToggle: (id: string) => void; selectedId: string | null; onSelect: (item: TreeItem) => void }) {
  const isFolder = item.type === "folder";
  const isExpanded = expanded.has(item.id);
  const Icon = isFolder ? (isExpanded ? FolderOpen : Folder) : item.name.endsWith("json") ? FileJson2 : FileCode2;

  return <div>
    <div className={cn("group flex items-center gap-1 rounded-lg pr-2 transition-colors", selectedId === item.id ? "bg-accent text-accent-foreground" : "hover:bg-muted/70")} style={{ paddingLeft: `${depth * 16 + 6}px` }}>
      {isFolder ? <button type="button" className="grid size-6 place-items-center rounded text-muted-foreground hover:text-foreground" aria-label={`${isExpanded ? "Collapse" : "Expand"} ${item.name}`} onClick={() => onToggle(item.id)}><ChevronRight className={cn("size-3.5 transition-transform", isExpanded && "rotate-90")} /></button> : <span className="w-6" />}
      <button type="button" onClick={() => onSelect(item)} className="flex min-w-0 flex-1 items-center gap-2 py-2 text-left"><Icon className={cn("size-4 shrink-0", isFolder ? "text-warning" : "text-muted-foreground")} /><span className="truncate font-mono text-xs">{item.name}</span></button>
    </div>
    <AnimatePresence initial={false}>{isFolder && isExpanded && item.children ? <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.18 }} className="overflow-hidden">{item.children.map((child) => <TreeNode key={child.id} item={child} depth={depth + 1} expanded={expanded} onToggle={onToggle} selectedId={selectedId} onSelect={onSelect} />)}</motion.div> : null}</AnimatePresence>
  </div>;
}

function Accordion({ title, description, icon: Icon, children, defaultOpen = false }: { title: string; description: string; icon: React.ElementType; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = React.useState(defaultOpen);
  return <div className="border-b border-border last:border-0"><button type="button" className="flex w-full items-center gap-3 px-5 py-4 text-left sm:px-6" onClick={() => setOpen((value) => !value)} aria-expanded={open}><span className="grid size-8 place-items-center rounded-lg bg-secondary"><Icon className="size-4 text-muted-foreground" /></span><span className="min-w-0 flex-1"><span className="block text-sm font-medium">{title}</span><span className="mt-0.5 block text-xs text-muted-foreground">{description}</span></span><ChevronDown className={cn("size-4 text-muted-foreground transition-transform", open && "rotate-180")} /></button><AnimatePresence initial={false}>{open ? <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="px-5 pb-5 sm:px-6">{children}</div></motion.div> : null}</AnimatePresence></div>;
}

export function ArchitectureExplorerPage() {
  const [expanded, setExpanded] = React.useState(() => new Set(["app", "repositories", "components", "ui"]));
  const [selected, setSelected] = React.useState<TreeItem | null>(tree[0]);
  const [query, setQuery] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  const refresh = () => { setIsLoading(true); window.setTimeout(() => setIsLoading(false), 800); };
  const toggle = (id: string) => setExpanded((current) => { const next = new Set(current); next.has(id) ? next.delete(id) : next.add(id); return next; });

  return <main className="min-h-screen bg-background">
    <header className="sticky top-0 z-20 border-b border-border bg-background/85 backdrop-blur-xl"><div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-5 sm:px-8"><Link href="/repositories/analysis" className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"><ArrowLeft className="size-4" />Analysis</Link><div className="flex items-center gap-2"><Button variant="ghost" size="sm" onClick={refresh} disabled={isLoading}><RefreshCw className={cn("size-3.5", isLoading && "animate-spin")} />Refresh</Button><Badge variant="success" className="hidden sm:inline-flex"><CheckCircle2 className="size-3" />Ready</Badge></div></div></header>
    <AnimatePresence mode="wait">{isLoading ? <motion.div key="skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><ExplorerSkeleton /></motion.div> : <motion.div key="explorer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mx-auto max-w-7xl px-5 py-9 sm:px-8 lg:py-12">
      <section className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between"><div><div className="flex flex-wrap items-center gap-2"><Badge variant="info"><Sparkles className="size-3" />Architecture Explorer</Badge><span className="text-xs text-muted-foreground">UI preview · Last analyzed just now</span></div><h1 className="mt-4 text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">See how your project fits together.</h1><p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">Explore the boundaries, framework signals, and relationships detected across <span className="font-mono text-sm text-foreground">devpilot-ai</span>.</p></div><div className="flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3"><GitBranch className="size-4 text-muted-foreground" /><div><p className="font-mono text-xs font-medium">main</p><p className="mt-0.5 text-[11px] text-muted-foreground">18 modules · 2.8k lines indexed</p></div></div></section>
      <section className="mt-8 grid gap-3 sm:grid-cols-3">{overview.map(({ label, value, caption, icon: Icon }, index) => <motion.div key={label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}><Card className="h-full"><CardContent className="p-5"><div className="flex items-start justify-between"><p className="text-sm text-muted-foreground">{label}</p><span className="grid size-8 place-items-center rounded-lg bg-secondary"><Icon className="size-4 text-muted-foreground" /></span></div><p className="mt-5 text-xl font-semibold tracking-[-0.035em]">{value}</p><p className="mt-1 text-xs text-muted-foreground">{caption}</p></CardContent></Card></motion.div>)}</section>
      <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.08fr)_360px]">
        <Card className="overflow-hidden"><CardHeader className="border-b border-border"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><CardTitle>Project map</CardTitle><CardDescription className="mt-1">Select an item to inspect its role and connections.</CardDescription></div><div className="relative w-full sm:w-52"><Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Filter structure" className="h-8 pl-8 text-xs" /></div></div></CardHeader><CardContent className="p-0"><div className="grid min-h-[450px] lg:grid-cols-[minmax(0,0.95fr)_minmax(250px,0.75fr)]"><div className="max-h-[450px] overflow-auto border-b border-border p-3 lg:border-b-0 lg:border-r">{tree.filter((item) => item.name.toLowerCase().includes(query.toLowerCase()) || !query).map((item) => <TreeNode key={item.id} item={item} depth={0} expanded={expanded} onToggle={toggle} selectedId={selected?.id ?? null} onSelect={setSelected} />)}{query && !tree.some((item) => item.name.toLowerCase().includes(query.toLowerCase())) ? <div className="flex min-h-52 flex-col items-center justify-center px-5 text-center"><Search className="size-5 text-muted-foreground" /><p className="mt-3 text-sm font-medium">No matching root items</p><p className="mt-1 text-xs text-muted-foreground">Try a folder name such as app or components.</p></div> : null}</div><div className="bg-muted/20 p-5">{selected ? <><div className="flex items-start justify-between gap-3"><span className="grid size-9 place-items-center rounded-lg bg-secondary">{selected.type === "folder" ? <FolderOpen className="size-4 text-warning" /> : <FileCode2 className="size-4 text-muted-foreground" />}</span><button type="button" className="grid size-7 place-items-center rounded text-muted-foreground hover:bg-muted hover:text-foreground" onClick={() => setSelected(null)} aria-label="Clear selection"><X className="size-3.5" /></button></div><p className="mt-5 font-mono text-sm font-medium">/{selected.name}</p><p className="mt-2 text-sm leading-6 text-muted-foreground">{selected.detail}</p><Separator className="my-5" /><p className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">Relationship</p><div className="mt-3 flex items-center gap-2 rounded-lg border border-border bg-card p-3"><Waypoints className="size-4 text-info" /><p className="text-xs leading-5 text-muted-foreground">{selected.type === "folder" ? "Composes child modules and participates in the feature-first boundary." : "Participates in its parent folder’s responsibility and route composition."}</p></div></> : <div className="flex h-full min-h-52 flex-col items-center justify-center text-center"><CircleDot className="size-6 text-muted-foreground" /><p className="mt-3 text-sm font-medium">Nothing selected</p><p className="mt-1 max-w-[220px] text-xs leading-5 text-muted-foreground">Choose a file or folder from the project map to see its architectural context.</p></div>}</div></div></CardContent></Card>
        <Card className="overflow-hidden"><CardHeader className="border-b border-border"><div className="flex items-center justify-between"><div><CardTitle>AI architecture brief</CardTitle><CardDescription className="mt-1">A high-level read of the current codebase.</CardDescription></div><Bot className="size-5 text-muted-foreground" /></div></CardHeader><CardContent className="p-0"><div className="m-5 rounded-xl border border-info/20 bg-info/10 p-4"><div className="flex gap-3"><Sparkles className="mt-0.5 size-4 shrink-0 text-info" /><p className="text-sm leading-6 text-muted-foreground">This is a clean App Router interface organized around user-facing features. Routes stay thin, feature screens own composition, and shared UI primitives protect consistency.</p></div></div><Accordion title="Why this architecture works" description="Clear boundaries with low ceremony" icon={CheckCircle2} defaultOpen><ul className="space-y-2 text-xs leading-5 text-muted-foreground"><li className="flex gap-2"><span className="mt-2 size-1 rounded-full bg-success" />Route entries delegate to focused feature components.</li><li className="flex gap-2"><span className="mt-2 size-1 rounded-full bg-success" />UI primitives centralize visual behavior and states.</li><li className="flex gap-2"><span className="mt-2 size-1 rounded-full bg-success" />Utilities are kept compact and cross-cutting.</li></ul></Accordion><Accordion title="Dependency direction" description="Pages → features → UI → utilities" icon={Network}><div className="rounded-lg border border-border bg-surface p-3 font-mono text-[11px] leading-6 text-muted-foreground"><span className="text-foreground">app/routes</span> <ChevronRight className="inline size-3" /> features <ChevronRight className="inline size-3" /> ui <ChevronRight className="inline size-3" /> lib</div></Accordion><Accordion title="Watch next" description="One maintainability opportunity" icon={Sparkles}><p className="text-xs leading-5 text-muted-foreground">As repository screens grow, consider grouping each screen’s local data and subcomponents beside its feature module. The current structure already supports that evolution.</p></Accordion></CardContent></Card>
      </section>
      <section className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.08fr)_minmax(300px,0.92fr)]"><Card><CardHeader><div className="flex items-center justify-between"><div><CardTitle>Folder relationships</CardTitle><CardDescription className="mt-1">Primary boundaries and the modules they coordinate.</CardDescription></div><Network className="size-4 text-muted-foreground" /></div></CardHeader><CardContent className="space-y-3">{folderMap.map(({ name, role, description, links, icon: Icon, tone }) => <div key={name} className="rounded-xl border border-border bg-surface p-4"><div className="flex gap-3"><span className={cn("grid size-9 shrink-0 place-items-center rounded-lg", tone)}><Icon className="size-4" /></span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="font-mono text-xs font-medium">{name}</p><Badge variant="neutral">{role}</Badge></div><p className="mt-2 text-xs leading-5 text-muted-foreground">{description}</p><div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground"><span>Connects to</span>{links.map((link) => <span key={link} className="rounded bg-secondary px-2 py-1 font-mono">/{link}</span>)}</div></div></div></div>)}</CardContent></Card><Card><CardHeader><div className="flex items-center justify-between"><div><CardTitle>Detected stack</CardTitle><CardDescription className="mt-1">Signals from source and configuration.</CardDescription></div><Package className="size-4 text-muted-foreground" /></div></CardHeader><CardContent className="space-y-4"><div className="flex flex-wrap gap-2"><Badge variant="success">Next.js App Router</Badge><Badge variant="neutral">TypeScript</Badge><Badge variant="neutral">React 19</Badge><Badge variant="neutral">Tailwind CSS</Badge><Badge variant="neutral">Framer Motion</Badge></div><Separator /><div className="rounded-lg border border-border bg-muted/25 p-4"><p className="text-xs font-medium">Detected pattern</p><p className="mt-2 text-xs leading-5 text-muted-foreground">Feature-first frontend with route-level composition and a shared component system.</p></div></CardContent></Card></section>
      <section className="mt-6"><Card className="overflow-hidden"><CardHeader className="border-b border-border"><div className="flex items-center justify-between"><div><CardTitle>Dependency overview</CardTitle><CardDescription className="mt-1">Key packages and the responsibility each one holds.</CardDescription></div><Package className="size-4 text-muted-foreground" /></div></CardHeader><CardContent className="p-0">{dependencies.map(({ name, version, purpose, kind }) => <div key={name} className="flex flex-col gap-2 border-b border-border px-5 py-4 last:border-0 sm:flex-row sm:items-center sm:gap-4 sm:px-6"><div className="flex min-w-[180px] items-center gap-3"><span className="grid size-8 place-items-center rounded-lg bg-secondary"><Package className="size-3.5 text-muted-foreground" /></span><span><span className="block font-mono text-xs font-medium">{name}</span><span className="mt-0.5 block font-mono text-[11px] text-muted-foreground">v{version}</span></span></div><p className="flex-1 text-xs leading-5 text-muted-foreground">{purpose}</p><Badge variant="neutral" className="w-fit">{kind}</Badge></div>)}</CardContent></Card></section>
    </motion.div>}</AnimatePresence>
  </main>;
}
