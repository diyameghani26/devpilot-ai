"use client";

import * as React from "react";
import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  Bot,
  CheckCircle2,
  CircleAlert,
  Clock3,
  Cpu,
  FileCode2,
  Filter,
  Gauge,
  GitBranch,
  Layers3,
  Lightbulb,
  Package,
  RefreshCw,
  Rocket,
  Search,
  Sparkles,
  Timer,
  TrendingDown,
  TrendingUp,
  X,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type ViewState = "idle" | "analyzing" | "ready";
type Severity = "Critical" | "Warning" | "Watch";
type VitalStatus = "good" | "attention";
type TrendMetric = "score" | "lcp" | "bundle";

type SlowComponent = {
  id: string;
  name: string;
  file: string;
  severity: Severity;
  avgRenderMs: number;
  renders: number;
  suggestion: string;
};

const coreVitals: { label: string; value: string; target: string; status: VitalStatus; icon: React.ElementType }[] = [
  { label: "Largest Contentful Paint", value: "1.8s", target: "Target < 2.5s", status: "good", icon: Rocket },
  { label: "Interaction to Next Paint", value: "142ms", target: "Target < 200ms", status: "good", icon: Zap },
  { label: "Cumulative Layout Shift", value: "0.06", target: "Target < 0.1", status: "good", icon: Layers3 },
  { label: "Total Blocking Time", value: "312ms", target: "Target < 200ms", status: "attention", icon: Timer },
];

const bundleChunks = [
  { name: "main.js", sizeKb: 186, gzipKb: 61, budgetKb: 70 },
  { name: "vendor.js", sizeKb: 342, gzipKb: 108, budgetKb: 95 },
  { name: "dashboard.js", sizeKb: 94, gzipKb: 31, budgetKb: 45 },
  { name: "chat.js", sizeKb: 76, gzipKb: 24, budgetKb: 40 },
] as const;

const trendWeeks = ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8"] as const;
const trendData: Record<TrendMetric, number[]> = {
  score: [64, 67, 69, 71, 74, 77, 79, 82],
  lcp: [2620, 2480, 2390, 2260, 2140, 2020, 1910, 1840],
  bundle: [512, 498, 476, 460, 452, 438, 428, 421],
};
const trendMeta: Record<TrendMetric, { label: string; unit: string; format: (value: number) => string; goodDirection: "up" | "down" }> = {
  score: { label: "Performance score", unit: "", format: (value) => `${Math.round(value)}`, goodDirection: "up" },
  lcp: { label: "Largest Contentful Paint", unit: "ms", format: (value) => `${Math.round(value)}ms`, goodDirection: "down" },
  bundle: { label: "Bundle size", unit: "KB", format: (value) => `${Math.round(value)} KB`, goodDirection: "down" },
};

const slowComponents: SlowComponent[] = [
  { id: "repo-tree", name: "<RepositoryFileTree />", file: "components/features/repositories/architecture-explorer-page.tsx", severity: "Critical", avgRenderMs: 48.2, renders: 214, suggestion: "Virtualize the file list so only visible rows mount. Currently every node renders even when collapsed." },
  { id: "chat-stream", name: "<ChatMessageStream />", file: "components/features/chat/chat-assistant-page.tsx", severity: "Critical", avgRenderMs: 41.6, renders: 356, suggestion: "Memoize message items and key by message id to avoid re-rendering the full stream on each token update." },
  { id: "bug-list", name: "<BugFindingsList />", file: "components/features/repositories/bug-detection-page.tsx", severity: "Warning", avgRenderMs: 27.4, renders: 168, suggestion: "Debounce the search filter input; every keystroke currently re-filters and re-renders the full findings list." },
  { id: "dependency-graph", name: "<DependencyGraph />", file: "components/features/repositories/architecture-explorer-page.tsx", severity: "Warning", avgRenderMs: 22.1, renders: 92, suggestion: "Hoist edge calculations out of render with useMemo; the graph layout is recomputed on unrelated state changes." },
  { id: "score-ring", name: "<AnalysisScoreRing />", file: "components/features/repositories/repository-analysis-page.tsx", severity: "Watch", avgRenderMs: 11.3, renders: 74, suggestion: "Low impact today, but the animation restarts on every parent re-render. Consider gating with layout=\"position\"." },
];

const optimizationSuggestions = [
  { title: "Code-split the vendor bundle", detail: "vendor.js is 13 KB over budget after gzip. Splitting chart and animation dependencies into a lazily-loaded chunk should recover most of the overage.", impact: "High impact", icon: Package },
  { title: "Virtualize long lists in the architecture explorer", detail: "The repository file tree renders every node up front. Windowing visible rows will cut its average render time significantly.", impact: "High impact", icon: Layers3 },
  { title: "Memoize chat message items", detail: "Streaming tokens currently re-render the entire message list. Keying and memoizing individual messages isolates updates to the active message.", impact: "Medium impact", icon: Bot },
  { title: "Defer non-critical scripts on first load", detail: "Total Blocking Time is above target during initial hydration. Deferring analytics and theming scripts should reduce main-thread contention.", impact: "Performance", icon: Cpu },
] as const;

const severityMeta: Record<Severity, { badge: "danger" | "warning" | "info"; dot: string; icon: React.ElementType }> = {
  Critical: { badge: "danger", dot: "bg-destructive", icon: AlertTriangle },
  Warning: { badge: "warning", dot: "bg-warning", icon: CircleAlert },
  Watch: { badge: "info", dot: "bg-info", icon: Clock3 },
};

function ScoreRing({ value, label = "Performance score" }: { value: number; label?: string }) {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  const tone = value >= 80 ? "text-success" : value >= 60 ? "text-warning" : "text-destructive";
  return (
    <div className="flex items-center gap-4">
      <svg width="112" height="112" viewBox="0 0 112 112" className="shrink-0 -rotate-90" role="img" aria-label={`${label}: ${value} out of 100`}>
        <circle cx="56" cy="56" r={radius} fill="none" stroke="currentColor" strokeWidth="9" className="text-muted" />
        <motion.circle cx="56" cy="56" r={radius} fill="none" stroke="currentColor" strokeWidth="9" strokeLinecap="round" className={tone} strokeDasharray={circumference} initial={{ strokeDashoffset: circumference }} animate={{ strokeDashoffset: offset }} transition={{ duration: 0.8, ease: "easeOut" }} />
      </svg>
      <div>
        <p className="text-3xl font-semibold tracking-[-0.05em]">{value}</p>
        <p className="mt-0.5 text-sm text-muted-foreground">{label}</p>
        <Badge variant={value >= 80 ? "success" : value >= 60 ? "warning" : "danger"} className="mt-2">{value >= 80 ? "Healthy" : value >= 60 ? "Needs attention" : "At risk"}</Badge>
      </div>
    </div>
  );
}

function BundleBars() {
  const largest = Math.max(...bundleChunks.map((chunk) => chunk.sizeKb));
  return (
    <div className="space-y-4">
      {bundleChunks.map((chunk, index) => {
        const overBudget = chunk.gzipKb > chunk.budgetKb;
        return (
          <div key={chunk.name}>
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono font-medium text-foreground">{chunk.name}</span>
              <span className={cn("font-mono", overBudget ? "text-warning" : "text-muted-foreground")}>{chunk.gzipKb} KB gzip · budget {chunk.budgetKb} KB</span>
            </div>
            <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-muted">
              <motion.div initial={{ width: 0 }} animate={{ width: `${(chunk.sizeKb / largest) * 100}%` }} transition={{ duration: 0.6, delay: index * 0.05, ease: "easeOut" }} className={cn("h-full rounded-full", overBudget ? "bg-warning" : "bg-success")} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TrendChart({ metric }: { metric: TrendMetric }) {
  const [hoverIndex, setHoverIndex] = React.useState<number | null>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const data = trendData[metric];
  const width = 560;
  const height = 200;
  const padding = 24;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((value, index) => {
    const x = padding + (index / (data.length - 1)) * (width - padding * 2);
    const y = height - padding - ((value - min) / range) * (height - padding * 2);
    return { x, y, value };
  });

  const linePath = points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

  const handleMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const bounds = containerRef.current?.getBoundingClientRect();
    if (!bounds) return;
    const relativeX = ((event.clientX - bounds.left) / bounds.width) * width;
    let closest = 0;
    let closestDistance = Infinity;
    points.forEach((point, index) => {
      const distance = Math.abs(point.x - relativeX);
      if (distance < closestDistance) { closestDistance = distance; closest = index; }
    });
    setHoverIndex(closest);
  };

  const first = data[0];
  const last = data[data.length - 1];
  const improved = trendMeta[metric].goodDirection === "up" ? last > first : last < first;
  const changePct = Math.abs(Math.round(((last - first) / first) * 100));

  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className={cn("inline-flex items-center gap-1 font-medium", improved ? "text-success" : "text-destructive")}>
            {improved ? <TrendingUp className="size-3.5" /> : <TrendingDown className="size-3.5" />}
            {changePct}%
          </span>
          over the last 8 weeks
        </div>
        <span className="font-mono text-xs text-muted-foreground">{hoverIndex !== null ? trendWeeks[hoverIndex] : trendWeeks[trendWeeks.length - 1]}</span>
      </div>
      <div ref={containerRef} onMouseMove={handleMove} onMouseLeave={() => setHoverIndex(null)} className="relative mt-3 cursor-crosshair">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full" preserveAspectRatio="none" role="img" aria-label={`${trendMeta[metric].label} trend over the last 8 weeks`}>
          <defs>
            <linearGradient id={`trend-fill-${metric}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="currentColor" stopOpacity="0.28" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[0.25, 0.5, 0.75].map((fraction) => <line key={fraction} x1={padding} x2={width - padding} y1={padding + fraction * (height - padding * 2)} y2={padding + fraction * (height - padding * 2)} stroke="currentColor" className="text-border" strokeWidth="1" />)}
          <motion.path d={areaPath} className="text-foreground" fill={`url(#trend-fill-${metric})`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} />
          <motion.path d={linePath} fill="none" className="text-foreground" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.8, ease: "easeOut" }} />
          {points.map((point, index) => <circle key={index} cx={point.x} cy={point.y} r={hoverIndex === index ? 5 : 3} className={hoverIndex === index ? "fill-foreground" : "fill-muted-foreground"} />)}
          {hoverIndex !== null ? <line x1={points[hoverIndex].x} x2={points[hoverIndex].x} y1={padding} y2={height - padding} stroke="currentColor" className="text-border" strokeWidth="1" strokeDasharray="3 3" /> : null}
        </svg>
        <AnimatePresence>
          {hoverIndex !== null ? (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{ left: `${(points[hoverIndex].x / width) * 100}%`, top: `${(points[hoverIndex].y / height) * 100}%` }}
              className="pointer-events-none absolute -translate-x-1/2 -translate-y-[calc(100%+10px)] whitespace-nowrap rounded-lg border border-border bg-popover px-2.5 py-1.5 text-xs font-medium text-popover-foreground shadow-lg"
            >
              {trendMeta[metric].format(data[hoverIndex])}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}

function PerformanceSkeleton() {
  return (
    <div className="mx-auto max-w-7xl animate-pulse space-y-6 px-5 py-9 sm:px-8 lg:py-12">
      <div className="h-5 w-40 rounded bg-muted" />
      <div className="h-11 w-96 rounded bg-muted" />
      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="h-44 rounded-xl bg-muted" />
        <div className="h-44 rounded-xl bg-muted" />
      </div>
      <div className="h-64 rounded-xl bg-muted" />
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="h-72 rounded-xl bg-muted" />
        <div className="h-72 rounded-xl bg-muted" />
      </div>
    </div>
  );
}

function EmptyAnalysisState({ onAnalyze }: { onAnalyze: () => void }) {
  return (
    <div className="mx-auto flex max-w-7xl flex-col items-center justify-center px-5 py-24 text-center sm:px-8">
      <span className="grid size-14 place-items-center rounded-2xl border border-border bg-card shadow-sm">
        <Gauge className="size-6 text-muted-foreground" />
      </span>
      <h1 className="mt-6 text-2xl font-semibold tracking-[-0.04em] sm:text-3xl">No performance report yet</h1>
      <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">Run a performance analysis to see your score, bundle breakdown, render metrics, and AI optimization suggestions for this repository.</p>
      <Button className="mt-7" onClick={onAnalyze}>
        <Zap className="size-4" />
        Run performance analysis
      </Button>
    </div>
  );
}

export function PerformanceInsightsPage() {
  const [view, setView] = React.useState<ViewState>("idle");
  const [metric, setMetric] = React.useState<TrendMetric>("score");
  const [query, setQuery] = React.useState("");
  const [severity, setSeverity] = React.useState<Severity | "All">("All");
  const [justRefreshed, setJustRefreshed] = React.useState(false);

  const runAnalysis = () => {
    setView("analyzing");
    window.setTimeout(() => setView("ready"), 900);
  };

  const refresh = () => {
    setJustRefreshed(false);
    setView("analyzing");
    window.setTimeout(() => {
      setView("ready");
      setJustRefreshed(true);
      window.setTimeout(() => setJustRefreshed(false), 2800);
    }, 900);
  };

  const visibleComponents = slowComponents.filter((component) => (severity === "All" || component.severity === severity) && `${component.name} ${component.file}`.toLowerCase().includes(query.toLowerCase()));

  return (
    <main className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b border-border bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-5 sm:px-8">
          <Link href="/repositories/analysis" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4" />
            Analysis
          </Link>
          {view === "ready" ? (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" disabled={(view as ViewState) === "analyzing"} onClick={refresh}>
                <RefreshCw className={cn("size-3.5", (view as ViewState) === "analyzing" && "animate-spin")} />
                Re-run analysis
              </Button>
              <AnimatePresence initial={false}>
                {justRefreshed ? (
                  <motion.span initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}>
                    <Badge variant="success"><CheckCircle2 className="size-3" />Analysis complete</Badge>
                  </motion.span>
                ) : (
                  <Badge variant="info" className="hidden sm:inline-flex"><Gauge className="size-3" />Performance insights</Badge>
                )}
              </AnimatePresence>
            </div>
          ) : null}
        </div>
      </header>

      <AnimatePresence mode="wait">
        {view === "idle" ? (
          <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <EmptyAnalysisState onAnalyze={runAnalysis} />
          </motion.div>
        ) : view === "analyzing" ? (
          <motion.div key="analyzing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <PerformanceSkeleton />
          </motion.div>
        ) : (
          <motion.div key="ready" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mx-auto max-w-7xl px-5 py-9 sm:px-8 lg:py-12">
            <section className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="success"><CheckCircle2 className="size-3" />Analysis complete</Badge>
                  <span className="text-xs text-muted-foreground">Last updated just now</span>
                </div>
                <h1 className="mt-4 text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">Ship it fast. Keep it fast.</h1>
                <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
                  DevPilot measured <span className="font-mono text-sm text-foreground">devpilot-ai</span> for bundle weight, render performance, and Core Web Vitals, and flagged the components worth optimizing next.
                </p>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3">
                <GitBranch className="size-4 text-muted-foreground" />
                <div>
                  <p className="font-mono text-xs font-medium">main</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">142 files · 5 routes profiled</p>
                </div>
              </div>
            </section>

            <section className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
              <Card>
                <CardHeader className="border-b border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Overall performance</CardTitle>
                      <CardDescription className="mt-1">Composite score across load, interactivity, and stability.</CardDescription>
                    </div>
                    <Gauge className="size-5 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                  <ScoreRing value={82} />
                  <div className="grid flex-1 grid-cols-3 gap-2">
                    <div className="rounded-lg border border-border bg-surface p-3">
                      <p className="text-xl font-semibold">421 KB</p>
                      <p className="mt-1 text-[11px] text-muted-foreground">Total gzip size</p>
                    </div>
                    <div className="rounded-lg border border-border bg-surface p-3">
                      <p className="text-xl font-semibold text-warning">2</p>
                      <p className="mt-1 text-[11px] text-muted-foreground">Slow components</p>
                    </div>
                    <div className="rounded-lg border border-border bg-surface p-3">
                      <p className="text-xl font-semibold text-success">+18</p>
                      <p className="mt-1 text-[11px] text-muted-foreground">Score, 8 weeks</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>AI performance brief</CardTitle>
                      <CardDescription className="mt-1">Priority readout from this analysis.</CardDescription>
                    </div>
                    <Bot className="size-5 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="rounded-xl border border-warning/20 bg-warning/10 p-4">
                    <div className="flex gap-3">
                      <Zap className="mt-0.5 size-4 shrink-0 text-warning" />
                      <p className="text-sm leading-6 text-muted-foreground">
                        vendor.js is the biggest lever right now: it is 13 KB over its gzip budget and drags Total Blocking Time above target. Splitting it and virtualizing the file tree would meaningfully lift the score.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            <section className="mt-6 grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Bundle size analysis</CardTitle>
                      <CardDescription className="mt-1">Gzip size per chunk against its performance budget.</CardDescription>
                    </div>
                    <Package className="size-4 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent>
                  <BundleBars />
                  <div className="mt-5 flex items-start gap-3 rounded-lg border border-warning/20 bg-warning/10 p-3">
                    <CircleAlert className="mt-0.5 size-4 shrink-0 text-warning" />
                    <p className="text-xs leading-5 text-muted-foreground"><span className="font-medium text-foreground">vendor.js</span> is over budget. Everything else is within its limit.</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Render performance</CardTitle>
                      <CardDescription className="mt-1">Core Web Vitals from the latest profiling run.</CardDescription>
                    </div>
                    <Activity className="size-4 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {coreVitals.map(({ label, value, target, status, icon: Icon }) => (
                      <div key={label} className="rounded-xl border border-border bg-surface p-4">
                        <div className="flex items-center justify-between">
                          <span className={cn("grid size-8 place-items-center rounded-lg", status === "good" ? "bg-success/15 text-success" : "bg-warning/15 text-warning")}><Icon className="size-4" /></span>
                          <span className={cn("size-1.5 rounded-full", status === "good" ? "bg-success" : "bg-warning")} />
                        </div>
                        <p className="mt-3 text-xl font-semibold tracking-[-0.03em]">{value}</p>
                        <p className="mt-1 text-xs font-medium text-foreground">{label}</p>
                        <p className="mt-0.5 text-[11px] text-muted-foreground">{target}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </section>

            <section className="mt-6">
              <Card>
                <CardHeader className="border-b border-border">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <CardTitle>Performance trends</CardTitle>
                      <CardDescription className="mt-1">{trendMeta[metric].label} over the last 8 weekly scans. Hover the chart for exact values.</CardDescription>
                    </div>
                    <div className="flex flex-wrap gap-2" role="group" aria-label="Choose trend metric">
                      {(Object.keys(trendMeta) as TrendMetric[]).map((key) => (
                        <button key={key} type="button" onClick={() => setMetric(key)} className={cn("rounded-full border px-3 py-1.5 text-xs font-medium transition-colors", metric === key ? "border-foreground bg-foreground text-background" : "border-border bg-secondary text-muted-foreground hover:text-foreground")}>
                          {trendMeta[key].label}
                        </button>
                      ))}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-5 sm:p-6">
                  <TrendChart metric={metric} />
                </CardContent>
              </Card>
            </section>

            <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
              <Card>
                <CardHeader className="border-b border-border">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <CardTitle>Slow components</CardTitle>
                      <CardDescription className="mt-1">Components with the highest average render time this run.</CardDescription>
                    </div>
                    <div className="relative w-full lg:w-64">
                      <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                      <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search components or files" className="h-9 pl-9 text-xs" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-5">
                  <div className="mb-5 flex flex-wrap gap-2" aria-label="Filter components by severity">
                    <span className="inline-flex items-center gap-1.5 py-1 pr-1 text-xs text-muted-foreground"><Filter className="size-3.5" />Filter</span>
                    {(["All", "Critical", "Warning", "Watch"] as const).map((option) => (
                      <button type="button" key={option} onClick={() => setSeverity(option)} className={cn("rounded-full border px-3 py-1.5 text-xs font-medium transition-colors", severity === option ? "border-foreground bg-foreground text-background" : "border-border bg-secondary text-muted-foreground hover:text-foreground")}>
                        {option}{option === "All" ? "" : ` ${slowComponents.filter((item) => item.severity === option).length}`}
                      </button>
                    ))}
                  </div>
                  {visibleComponents.length ? (
                    <div className="space-y-3">
                      {visibleComponents.map((component, index) => {
                        const meta = severityMeta[component.severity];
                        const Icon = meta.icon;
                        return (
                          <motion.article key={component.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }} className="rounded-xl border border-border bg-surface p-4 sm:p-5">
                            <div className="flex gap-3">
                              <span className={cn("grid size-9 shrink-0 place-items-center rounded-lg border", component.severity === "Critical" ? "border-destructive/30 bg-destructive/10 text-destructive" : component.severity === "Warning" ? "border-warning/30 bg-warning/10 text-warning" : "border-info/30 bg-info/10 text-info")}>
                                <Icon className="size-4" />
                              </span>
                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <Badge variant={meta.badge}>{component.severity}</Badge>
                                  <span className="font-mono text-sm font-medium">{component.name}</span>
                                </div>
                                <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] text-muted-foreground">
                                  <span className="inline-flex min-w-0 items-center gap-1.5"><FileCode2 className="size-3.5 shrink-0" /><span className="max-w-[240px] truncate sm:max-w-none">{component.file}</span></span>
                                </p>
                                <div className="mt-3 flex flex-wrap items-center gap-4 text-xs">
                                  <span className="inline-flex items-center gap-1.5 text-muted-foreground"><Timer className="size-3.5" />Avg render <span className="font-mono font-medium text-foreground">{component.avgRenderMs}ms</span></span>
                                  <span className="inline-flex items-center gap-1.5 text-muted-foreground"><Activity className="size-3.5" />{component.renders} renders profiled</span>
                                </div>
                                <div className="mt-3 rounded-lg border border-border bg-muted/25 p-3">
                                  <div className="flex gap-2">
                                    <Bot className="mt-0.5 size-3.5 shrink-0 text-info" />
                                    <p className="text-xs leading-5 text-muted-foreground">{component.suggestion}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </motion.article>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex min-h-72 flex-col items-center justify-center px-5 text-center">
                      <span className="grid size-11 place-items-center rounded-xl bg-secondary"><Search className="size-5 text-muted-foreground" /></span>
                      <p className="mt-4 text-sm font-medium">No components match these filters</p>
                      <p className="mt-1 max-w-xs text-xs leading-5 text-muted-foreground">Try another severity or clear your search to see every profiled component.</p>
                      <Button variant="secondary" size="sm" className="mt-5" onClick={() => { setQuery(""); setSeverity("All"); }}>
                        <X className="size-3.5" />
                        Clear filters
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              <aside className="space-y-6">
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>AI optimization suggestions</CardTitle>
                        <CardDescription className="mt-1">Ordered by expected impact.</CardDescription>
                      </div>
                      <Sparkles className="size-4 text-muted-foreground" />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {optimizationSuggestions.map(({ title, detail, impact, icon: Icon }, index) => (
                      <motion.div key={title} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }} className="rounded-xl border border-border bg-surface p-4">
                        <div className="flex gap-3">
                          <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-secondary"><Icon className="size-4" /></span>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-sm font-medium leading-5">{title}</h3>
                              <Badge variant={impact === "High impact" ? "warning" : "neutral"}>{impact}</Badge>
                            </div>
                            <p className="mt-1.5 text-xs leading-5 text-muted-foreground">{detail}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </CardContent>
                </Card>
                <div className="rounded-xl border border-border bg-surface p-4">
                  <div className="flex gap-2">
                    <Lightbulb className="mt-0.5 size-4 shrink-0 text-info" />
                    <p className="text-xs leading-5 text-muted-foreground">Results are interface preview data only. No code is executed or profiled by this page.</p>
                  </div>
                </div>
              </aside>
            </section>

            <section className="mt-6 rounded-xl border border-border bg-surface p-4 sm:flex sm:items-center sm:justify-between sm:p-5">
              <div className="flex items-start gap-3">
                <span className="grid size-9 place-items-center rounded-lg bg-secondary"><Clock3 className="size-4" /></span>
                <div>
                  <h2 className="text-sm font-medium">Analysis information</h2>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">Completed in 1m 42s · 5 routes profiled · Results shown are preview data only.</p>
                </div>
              </div>
            </section>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}