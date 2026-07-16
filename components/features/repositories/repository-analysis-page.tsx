"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  Bot,
  Braces,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  Clock3,
  Code2,
  Download,
  FolderGit2,
  Gauge,
  GitBranch,
  Layers3,
  Lightbulb,
  Network,
  RefreshCw,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const technologies = ["TypeScript", "Next.js", "PostgreSQL", "Prisma", "Tailwind CSS", "Vitest"] as const;

const architectureNodes = [
  { name: "app", caption: "Routes & views", icon: Layers3, tone: "bg-info/15 text-info" },
  { name: "components", caption: "UI system", icon: Code2, tone: "bg-success/15 text-success" },
  { name: "services", caption: "Business logic", icon: Network, tone: "bg-warning/15 text-warning" },
  { name: "data", caption: "Persistence", icon: Braces, tone: "bg-secondary text-muted-foreground" },
] as const;

const recommendations = [
  { title: "Split the billing workflow into a focused module", detail: "The payment service currently coordinates validation, persistence, and event delivery in one flow.", impact: "High impact", icon: Layers3 },
  { title: "Add an integration test around invoice retries", detail: "The retry path has strong unit coverage but no cross-service test for an idempotent retry.", impact: "Medium impact", icon: ShieldCheck },
  { title: "Cache the active subscription lookup", detail: "This query appears in the request path for four routes and is a good candidate for short-lived caching.", impact: "Performance", icon: Zap },
] as const;

const performanceInsights = [
  { metric: "API response", value: "182ms", change: "18% faster", state: "good" },
  { metric: "Largest module", value: "684 LOC", change: "billing-service.ts", state: "attention" },
  { metric: "Test coverage", value: "94%", change: "Above workspace target", state: "good" },
] as const;

function ScoreRing({ value, label, tone = "foreground" }: { value: number; label: string; tone?: "foreground" | "warning" }) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeOffset = circumference - (value / 100) * circumference;
  return (
    <div className="flex items-center gap-4">
      <svg width="104" height="104" viewBox="0 0 104 104" className="shrink-0 -rotate-90" aria-label={`${label}: ${value} out of 100`} role="img">
        <circle cx="52" cy="52" r={radius} fill="none" stroke="currentColor" strokeWidth="8" className="text-muted" />
        <motion.circle cx="52" cy="52" r={radius} fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" className={tone === "warning" ? "text-warning" : "text-foreground"} initial={{ strokeDashoffset: circumference }} animate={{ strokeDashoffset: strokeOffset }} transition={{ duration: 0.8, ease: "easeOut" }} strokeDasharray={circumference} />
      </svg>
      <div><p className="text-3xl font-semibold tracking-[-0.05em]">{value}</p><p className="mt-0.5 text-sm text-muted-foreground">{label}</p></div>
    </div>
  );
}

function AnalysisSkeleton() {
  return <div className="mx-auto max-w-7xl animate-pulse space-y-6 px-5 py-10 sm:px-8"><div className="h-5 w-40 rounded bg-muted" /><div className="h-10 w-72 rounded bg-muted" /><div className="grid gap-4 lg:grid-cols-3"><div className="h-48 rounded-xl bg-muted lg:col-span-2" /><div className="h-48 rounded-xl bg-muted" /></div><div className="grid gap-4 lg:grid-cols-2"><div className="h-72 rounded-xl bg-muted" /><div className="h-72 rounded-xl bg-muted" /></div></div>;
}

export function RepositoryAnalysisPage() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [hasExported, setHasExported] = React.useState(false);

  const refresh = () => {
    setIsLoading(true);
    window.setTimeout(() => setIsLoading(false), 900);
  };

  return (
    <main className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b border-border bg-background/85 backdrop-blur-xl"><div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8"><Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"><ArrowLeft className="size-4" />Dashboard</Link><div className="flex items-center gap-2"><Button variant="ghost" size="sm" onClick={refresh} disabled={isLoading}><RefreshCw className={cn("size-3.5", isLoading && "animate-spin")} />Refresh</Button><Button size="sm" onClick={() => setHasExported(true)}><Download className="size-3.5" />{hasExported ? "Report prepared" : "Export report"}</Button></div></div></header>
      <AnimatePresence mode="wait">{isLoading ? <motion.div key="skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><AnalysisSkeleton /></motion.div> : <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mx-auto max-w-7xl px-5 py-9 sm:px-8 lg:py-12">
        <section className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between"><div><div className="flex flex-wrap items-center gap-2"><Badge variant="success"><CheckCircle2 className="size-3" />Analysis complete</Badge><span className="text-xs text-muted-foreground">Last updated just now</span></div><h1 className="mt-4 text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">demo/subscription-service</h1><p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">A modular subscription API that manages lifecycle state, invoices, and payment events for a demo product workspace.</p></div><div className="flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3"><GitBranch className="size-4 text-muted-foreground" /><div><p className="font-mono text-xs font-medium">main</p><p className="mt-0.5 text-[11px] text-muted-foreground">a71c4e2 · 2 hours ago</p></div></div></section>

        <section className="mt-8 grid gap-4 xl:grid-cols-[minmax(0,1fr)_330px]"><Card className="overflow-hidden"><CardHeader className="border-b border-border"><div className="flex items-center justify-between"><div><CardTitle>Repository overview</CardTitle><CardDescription className="mt-1">A concise snapshot of the scanned codebase.</CardDescription></div><FolderGit2 className="size-5 text-muted-foreground" /></div></CardHeader><CardContent className="grid gap-px bg-border p-0 sm:grid-cols-4">{[["142", "Files indexed"], ["18", "Source modules"], ["24.6k", "Lines of code"], ["4", "Primary domains"]].map(([value, label]) => <div key={label} className="bg-card p-5"><p className="text-2xl font-semibold tracking-[-0.04em]">{value}</p><p className="mt-1 text-xs text-muted-foreground">{label}</p></div>)}</CardContent></Card><Card><CardHeader><CardTitle>Detected technologies</CardTitle><CardDescription className="mt-1">Primary signals found in configuration and source.</CardDescription></CardHeader><CardContent className="flex flex-wrap gap-2">{technologies.map((tech) => <Badge key={tech} variant="neutral">{tech}</Badge>)}</CardContent></Card></section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(340px,0.9fr)]"><Card><CardHeader><div className="flex items-center justify-between"><div><CardTitle>Project structure</CardTitle><CardDescription className="mt-1">Main responsibilities and code boundaries.</CardDescription></div><Network className="size-4 text-muted-foreground" /></div></CardHeader><CardContent><div className="relative grid gap-3 sm:grid-cols-2"><div aria-hidden="true" className="absolute left-1/2 top-8 hidden h-[calc(100%-4rem)] w-px bg-border sm:block" />{architectureNodes.map(({ name, caption, icon: Icon, tone }, index) => <motion.div key={name} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.06 }} className="relative flex items-center gap-3 rounded-xl border border-border bg-surface p-4 transition-colors hover:bg-surface-raised"><span className={cn("grid size-9 place-items-center rounded-lg", tone)}><Icon className="size-4" /></span><div><p className="font-mono text-xs font-medium">/{name}</p><p className="mt-1 text-xs text-muted-foreground">{caption}</p></div></motion.div>)}</div><div className="mt-5 rounded-lg border border-border bg-muted/30 p-4"><p className="flex items-center gap-2 text-xs font-medium"><Layers3 className="size-3.5" />Architecture summary</p><p className="mt-2 text-sm leading-6 text-muted-foreground">The application follows a layered modular structure. Route handlers delegate to domain services, which isolate data access and emit events through a compact shared contract layer.</p></div></CardContent></Card>
          <Card><CardHeader><CardTitle>Code health</CardTitle><CardDescription className="mt-1">Maintainability signals across the current branch.</CardDescription></CardHeader><CardContent className="space-y-6"><ScoreRing value={91} label="Quality score" /><Separator /><ScoreRing value={34} label="Complexity score" tone="warning" /><div className="flex items-start gap-3 rounded-lg border border-warning/20 bg-warning/10 p-3"><CircleAlert className="mt-0.5 size-4 shrink-0 text-warning" /><p className="text-xs leading-5 text-muted-foreground">Complexity is concentrated in two billing workflows. Everything else is within the expected range.</p></div></CardContent></Card></section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]"><Card><CardHeader><div className="flex items-center justify-between"><div><CardTitle>AI recommendations</CardTitle><CardDescription className="mt-1">Suggested next steps, ordered by expected impact.</CardDescription></div><Bot className="size-4 text-muted-foreground" /></div></CardHeader><CardContent className="space-y-3">{recommendations.map(({ title, detail, impact, icon: Icon }, index) => <motion.article key={title} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.06 }} className="group rounded-xl border border-border bg-surface p-4 transition-colors hover:bg-surface-raised"><div className="flex gap-3"><span className="grid size-8 shrink-0 place-items-center rounded-lg bg-secondary"><Icon className="size-4" /></span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="text-sm font-medium">{title}</h3><Badge variant={impact === "High impact" ? "warning" : "neutral"}>{impact}</Badge></div><p className="mt-1.5 text-xs leading-5 text-muted-foreground">{detail}</p><button type="button" className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground">View context <ChevronRight className="size-3" /></button></div></div></motion.article>)}</CardContent></Card>
          <div className="space-y-6"><Card><CardHeader><div className="flex items-center justify-between"><div><CardTitle>Performance insights</CardTitle><CardDescription className="mt-1">Key runtime and delivery signals.</CardDescription></div><Gauge className="size-4 text-muted-foreground" /></div></CardHeader><CardContent className="space-y-4">{performanceInsights.map(({ metric, value, change, state }) => <div key={metric} className="flex items-center justify-between gap-3"><div><p className="text-sm font-medium">{metric}</p><p className="mt-1 text-xs text-muted-foreground">{change}</p></div><span className={cn("font-mono text-sm font-medium", state === "attention" ? "text-warning" : "text-foreground")}>{value}</span></div>)}</CardContent></Card><Card className="border-dashed bg-surface"><CardContent className="flex flex-col items-center px-5 py-8 text-center"><span className="grid size-10 place-items-center rounded-xl bg-secondary"><Lightbulb className="size-5 text-muted-foreground" /></span><p className="mt-4 text-sm font-medium">No additional insights</p><p className="mt-1 max-w-xs text-xs leading-5 text-muted-foreground">DevPilot found no more performance risks in this scan.</p></CardContent></Card></div>
        </section>

        <section className="mt-6 rounded-xl border border-border bg-surface p-4 sm:flex sm:items-center sm:justify-between sm:p-5"><div className="flex items-start gap-3"><span className="grid size-9 place-items-center rounded-lg bg-secondary"><Clock3 className="size-4" /></span><div><h2 className="text-sm font-medium">Analysis information</h2><p className="mt-1 text-xs leading-5 text-muted-foreground">Completed in 2m 18s · 142 files processed · Results shown are preview data only.</p></div></div><Button variant="ghost" size="sm" className="mt-3 sm:mt-0"><ArrowUpRight className="size-3.5" />Open repository</Button></section>
      </motion.div>}</AnimatePresence>
    </main>
  );
}
