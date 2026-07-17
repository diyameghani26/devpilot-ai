"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Bot,
  BookOpen,
  Braces,
  CheckCircle2,
  ChevronDown,
  CircleAlert,
  Code2,
  Copy,
  FileCode2,
  Filter,
  GitBranch,
  Info,
  Lightbulb,
  ListFilter,
  RefreshCw,
  ScanSearch,
  Search,
  ShieldAlert,
  Sparkles,
  Wrench,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

type Severity = "Critical" | "High" | "Medium" | "Low";
type Category = "Code smell" | "Best practice" | "Duplication" | "Complexity" | "Maintainability";

type Finding = {
  id: string;
  severity: Severity;
  category: Category;
  title: string;
  file: string;
  line: number;
  explanation: string;
  impact: string;
  fix: string;
  before: string;
  after: string;
};

const findings: Finding[] = [
  { id: "deep-nesting", severity: "Critical", category: "Complexity", title: "Deeply nested conditional rendering reduces readability", file: "components/features/repositories/architecture-explorer-page.tsx", line: 91, explanation: "The structure view nests ternaries and conditional JSX several levels deep inside a single render path. This raises cyclomatic complexity and makes the branch logic difficult to verify by inspection.", impact: "Future changes to this view are more likely to introduce regressions that are hard to spot in review.", fix: "Extract each conditional branch into a small named component and let the parent compose them.", before: "{query\n  ? matches.length\n    ? matches.map((m) => <Node key={m.id} {...m} />)\n    : <EmptyState />\n  : <DefaultTree />}", after: "if (!query) return <DefaultTree />;\nreturn matches.length\n  ? <NodeList items={matches} />\n  : <EmptyState />;" },
  { id: "long-function", severity: "High", category: "Complexity", title: "uploadRepository orchestrates too many responsibilities in one function", file: "components/features/repositories/repository-upload-page.tsx", line: 58, explanation: "A single handler validates input, manages the progress timer, updates multiple pieces of state, and handles navigation. This concentration of responsibility increases the surface area for defects.", impact: "Isolated changes to one responsibility, like validation, risk breaking unrelated behavior such as the progress timer.", fix: "Split the handler into small, single-purpose functions and compose them from the event handler.", before: "async function uploadRepository(source) {\n  validate(source);\n  startTimer();\n  await send(source);\n  setState(\"done\");\n  router.push(\"/repositories/analysis\");\n}", after: "async function uploadRepository(source) {\n  validate(source);\n  const stopTimer = startProgressTimer();\n  await sendUpload(source);\n  stopTimer();\n  onUploadComplete();\n}" },
  { id: "duplicate-severity-map", severity: "Medium", category: "Duplication", title: "Severity badge mapping is duplicated across review pages", file: "components/features/repositories/security-scanner-page.tsx", line: 26, explanation: "An almost identical severity-to-badge-and-icon mapping is redefined independently in the security scanner and bug detection pages, with only minor differences in tone.", impact: "Changes to severity colors or icons require updating the same logic in multiple places, which invites drift.", fix: "Extract a single shared severityMeta map into a common module and import it from every review page.", before: "const severityMeta = {\n  Critical: { badge: \"danger\", icon: ShieldX },\n  High: { badge: \"warning\", icon: ShieldAlert },\n};", after: "import { severityMeta } from \"@/constants/severity\";\n\n// same shape reused across bug, security, and code review pages" },
  { id: "magic-number-timeout", severity: "Low", category: "Code smell", title: "Simulated scan delay is a repeated magic number", file: "components/features/repositories/bug-detection-page.tsx", line: 82, explanation: "The 800ms delay used to simulate a scan, and the 2800ms auto-dismiss for the completion badge, are inlined as literals in more than one review page.", impact: "The behavior is harmless today, but the duplicated literals make intent unclear and are easy to desynchronize later.", fix: "Name the delays as constants and share them across the review pages that use the same interaction pattern.", before: "window.setTimeout(() => {\n  setIsLoading(false);\n}, 800);", after: "const SCAN_DURATION_MS = 800;\n\nwindow.setTimeout(() => {\n  setIsLoading(false);\n}, SCAN_DURATION_MS);" },
  { id: "generic-prop-name", severity: "Low", category: "Best practice", title: "Generic prop name obscures intent in the shared score ring", file: "components/features/repositories/repository-analysis-page.tsx", line: 55, explanation: "The score visualization accepts a prop named value with no unit or range documented, so callers must read the implementation to know it expects a 0 to 100 scale.", impact: "New call sites risk passing an out-of-range or differently-scaled number without any type-level warning.", fix: "Rename the prop to communicate its contract and constrain it with a narrower type where practical.", before: "function ScoreRing({ value, label }: { value: number; label: string }) {", after: "function ScoreRing({ scorePercent, label }: { scorePercent: number; label: string }) {" },
  { id: "repeated-gradient-classes", severity: "Medium", category: "Code smell", title: "Repeated utility class combinations should be extracted", file: "components/features/dashboard/dashboard-page.tsx", line: 40, explanation: "The same long combination of surface, border, and shadow utility classes appears on several unrelated cards across the dashboard.", impact: "Adjusting the shared visual style means editing many near-identical class strings instead of one definition.", fix: "Lift the repeated class combination into a small shared className constant or a wrapper component.", before: "<div className=\"rounded-xl border border-border bg-surface p-4 shadow-sm hover:bg-surface-raised\">", after: "const metricCardClass = \"rounded-xl border border-border bg-surface p-4 shadow-sm hover:bg-surface-raised\";\n\n<div className={metricCardClass}>" },
] as const;

const duplicateBlocks = [
  { id: "dup-severity-meta", label: "Severity badge mapping", files: ["security-scanner-page.tsx", "bug-detection-page.tsx"], lines: 14, similarity: 92 },
  { id: "dup-empty-state", label: "Empty filter state markup", files: ["bug-detection-page.tsx", "security-scanner-page.tsx"], lines: 9, similarity: 88 },
  { id: "dup-skeleton", label: "Loading skeleton layout", files: ["repository-analysis-page.tsx", "architecture-explorer-page.tsx"], lines: 6, similarity: 81 },
] as const;

const complexityHotspots = [
  { file: "architecture-explorer-page.tsx", value: 22 },
  { file: "security-scanner-page.tsx", value: 17 },
  { file: "bug-detection-page.tsx", value: 15 },
] as const;

const qualityMetrics = [
  { key: "maintainability", label: "Maintainability", value: 78, description: "How easily this code can be safely extended." },
  { key: "readability", label: "Readability", value: 85, description: "How clearly intent is expressed in the source." },
  { key: "reliability", label: "Reliability", value: 74, description: "Resilience to edge cases and unexpected input." },
] as const;

const categoryMeta: Record<Category, { icon: React.ElementType; tone: string }> = {
  "Code smell": { icon: Code2, tone: "bg-secondary text-muted-foreground" },
  "Best practice": { icon: BookOpen, tone: "bg-info/15 text-info" },
  Duplication: { icon: Copy, tone: "bg-warning/15 text-warning" },
  Complexity: { icon: Braces, tone: "bg-destructive/15 text-destructive" },
  Maintainability: { icon: Wrench, tone: "bg-success/15 text-success" },
};

const severityMeta: Record<Severity, { badge: "danger" | "warning" | "info" | "neutral"; tone: string; dot: string; icon: React.ElementType }> = {
  Critical: { badge: "danger", tone: "border-destructive/30 bg-destructive/10 text-destructive", dot: "bg-destructive", icon: ShieldAlert },
  High: { badge: "warning", tone: "border-warning/30 bg-warning/10 text-warning", dot: "bg-warning", icon: CircleAlert },
  Medium: { badge: "info", tone: "border-info/30 bg-info/10 text-info", dot: "bg-info", icon: CircleAlert },
  Low: { badge: "neutral", tone: "border-border bg-secondary text-muted-foreground", dot: "bg-muted-foreground", icon: Info },
};

function ScoreRing({ value, label, tone = "foreground" }: { value: number; label: string; tone?: "foreground" | "warning" | "success" }) {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  const strokeClass = tone === "warning" ? "text-warning" : tone === "success" ? "text-success" : "text-foreground";
  return (
    <div className="flex items-center gap-4">
      <svg   width="96"
  height="96" viewBox="0 0 112 112" className=" h-24 w-24  sm:h-28 sm:w-28 shrink-0 -rotate-90" role="img" aria-label={`${label}: ${value} out of 100`}>
        <circle cx="56" cy="56" r={radius} fill="none" stroke="currentColor" strokeWidth="9" className="text-muted" />
        <motion.circle cx="56" cy="56" r={radius} fill="none" stroke="currentColor" strokeWidth="9" strokeLinecap="round" className={strokeClass} strokeDasharray={circumference} initial={{ strokeDashoffset: circumference }} animate={{ strokeDashoffset: offset }} transition={{ duration: 0.8, ease: "easeOut" }} />
      </svg>
      <div>
        <p className="text-3xl font-semibold tracking-tight">{value}</p>
        <p className="mt-0.5 text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

function MetricBar({ label, value, description }: { label: string; value: number; description: string }) {
  const tone = value >= 80 ? "bg-success" : value >= 60 ? "bg-warning" : "bg-destructive";
  return (
    <div>
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-foreground">{label}</span>
        <span className="font-mono text-muted-foreground">{value}/100</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
        <motion.div initial={{ width: 0 }} animate={{ width: `${value}%` }} transition={{ duration: 0.6, ease: "easeOut" }} className={cn("h-full rounded-full", tone)} />
      </div>
      <p className="mt-1.5 text-[11px] leading-5 text-muted-foreground">{description}</p>
    </div>
  );
}

function ReviewSkeleton() {
  return (
    <div className="mx-auto max-w-7xl animate-pulse space-y-5 px-4 py-6 sm:space-y-6 sm:px-6 sm:py-9 lg:px-8 lg:py-12">
      <div className="h-5 w-36 rounded bg-muted" />
      <div className="h-11 w-full max-w-80 rounded bg-muted" />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
        <div className="h-56 rounded-xl bg-muted" />
        <div className="h-56 rounded-xl bg-muted" />
      </div>
      <div className="h-16 rounded-xl bg-muted" />
      <div className="h-96 rounded-xl bg-muted" />
    </div>
  );
}

function FindingCard({ finding, index }: { finding: Finding; index: number }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const meta = severityMeta[finding.severity];
  const catMeta = categoryMeta[finding.category];
  const SeverityIcon = meta.icon;
  const CategoryIcon = catMeta.icon;

  return (
    <motion.article initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }} className="overflow-hidden rounded-xl border border-border bg-surface">
      <div className="flex gap-3 p-4 sm:p-5">
        <span className={cn("grid size-9 shrink-0 place-items-center rounded-lg border", meta.tone)}>
            <SeverityIcon className="size-4" /></span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={meta.badge}>{finding.severity}</Badge>
            <Badge variant="neutral"><CategoryIcon className="size-3" />{finding.category}</Badge>
          </div>
          <h3 className="mt-3 text-sm font-medium leading-6">{finding.title}</h3>
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] text-muted-foreground">
            <span className="inline-flex min-w-0 items-center gap-1.5"><FileCode2 className="size-3.5 shrink-0" /><span className="max-w-auto truncate sm:max-w-none">{finding.file}</span></span>
            <span>Ln {finding.line}</span>
          </div>
          <div className="mt-4 rounded-lg border border-border bg-muted/25 p-3">
            <div className="flex items-start gap-2"><Bot className="mt-0.5 size-3.5 shrink-0 text-info" /><p className="text-xs leading-5 text-muted-foreground">{finding.explanation}</p></div>
          </div>
          <p className="mt-3 text-xs leading-5 text-muted-foreground"><span className="font-medium text-foreground">Why it matters:</span> {finding.impact}</p>
          <button type="button" onClick={() => setIsOpen((value) => !value)} className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground" aria-expanded={isOpen}>
            <Lightbulb className="size-3.5" />Suggested fix <ChevronDown className={cn("size-3.5 transition-transform", isOpen && "rotate-180")} />
          </button>
        </div>
      </div>
      <AnimatePresence initial={false}>
        {isOpen ? (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t border-border">
            <div className="p-4 sm:p-5">
              <p className="text-xs leading-5 text-muted-foreground">{finding.fix}</p>
              <div className="mt-4 grid gap-3 lg:grid-cols-2">
                <div>
                  <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">Current</p>
                  <pre className="overflow-x-auto rounded-lg border border-destructive/20 bg-destructive/5 p-3 font-mono text-[11px] leading-5 text-muted-foreground"><code>{finding.before}</code></pre>
                </div>
                <div>
                  <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">Suggested</p>
                  <pre className="overflow-x-auto rounded-lg border border-success/20 bg-success/5 p-3 font-mono text-[11px] leading-5 text-muted-foreground"><code>{finding.after}</code></pre>
                </div>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.article>
  );
}

export function CodeReviewPage() {
  const [query, setQuery] = React.useState("");
  const [severity, setSeverity] = React.useState<Severity | "All">("All");
  const [category, setCategory] = React.useState<Category | "All">("All");
  const [isLoading, setIsLoading] = React.useState(false);
  const [hasRefreshed, setHasRefreshed] = React.useState(false);

  const visibleFindings = findings.filter((finding) => {
    const matchesSeverity = severity === "All" || finding.severity === severity;
    const matchesCategory = category === "All" || finding.category === category;
    const matchesQuery = `${finding.title} ${finding.file} ${finding.category}`.toLowerCase().includes(query.toLowerCase());
    return matchesSeverity && matchesCategory && matchesQuery;
  });

  const clearFilters = () => {
    setQuery("");
    setSeverity("All");
    setCategory("All");
  };

  const refresh = () => {
    setHasRefreshed(false);
    setIsLoading(true);
    window.setTimeout(() => {
      setIsLoading(false);
      setHasRefreshed(true);
      window.setTimeout(() => setHasRefreshed(false), 2800);
    }, 800);
  };

  const overallScore = 82;
  const duplicatedLines = duplicateBlocks.reduce((total, block) => total + block.lines, 0);
  const avgComplexity = 9.2;

  return (
    <main className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b border-border bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex min-h-16 max-w-7xl flex-wrap items-center justify-between gap-x-3 gap-y-2 px-4 py-2 sm:h-16 sm:flex-nowrap sm:px-6 sm:py-0 lg:px-8">
          <Link href="/repositories/analysis" className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"><ArrowLeft className="size-4" />Analysis</Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={refresh} disabled={isLoading}><RefreshCw className={cn("size-3.5", isLoading && "animate-spin")} /><span className="hidden sm:inline">Run review again</span><span className="sm:hidden">Refresh</span></Button>
            <AnimatePresence initial={false}>
              {hasRefreshed ? (
                <motion.span initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}><Badge variant="success"><CheckCircle2 className="size-3" /><span className="hidden sm:inline">Review complete</span><span className="sm:hidden">Done</span></Badge></motion.span>
              ) : (
                <Badge variant="success" className="hidden sm:inline-flex"><CheckCircle2 className="size-3" />Review ready</Badge>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div key="skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><ReviewSkeleton /></motion.div>
        ) : (
          <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mx-auto w-full max-w-[420px] px-4 py-6 sm:max-w-7xl sm:px-6 sm:py-9 lg:px-8 lg:py-12">
            <section className="flex flex-col gap-4 sm:gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="info"><ScanSearch className="size-3" />AI code review</Badge>
                  <span className="text-xs text-muted-foreground">UI preview · Review completed just now</span>
                </div>
                <h1 className="mt-4 text-2xl font-semibold tracking-[-0.04em] sm:text-3xl lg:text-4xl lg:tracking-[-0.045em]">Cleaner code, shipped with confidence.</h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">DevPilot reviewed <span className="font-mono text-sm text-foreground">devpilot-ai</span> for code smells, best-practice violations, duplicated logic, and complexity hotspots.</p>
              </div>
              <div className="flex w-full items-center  gap-3 rounded-xl border border-border bg-surface px-4 py-3 sm:justify-start lg:w-auto">
                <GitBranch className="size-4 shrink-0 text-muted-foreground" />
                <div>
                  <p className="font-mono text-xs font-medium">main</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">18 modules · 2.8k lines scanned</p>
                </div>
              </div>
            </section>

            <section className="mt-6 grid gap-4 sm:mt-8 sm:gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
              <Card>
                <CardHeader className="border-b border-border p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Code quality score</CardTitle>
                      <CardDescription className="mt-1">Overall maintainability, readability, and reliability blend.</CardDescription>
                    </div>
                    <Sparkles className="size-5 shrink-0 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-5 p-4 sm:gap-6 sm:p-6 lg:flex-row lg:items-center">
                  <ScoreRing value={overallScore} label="Quality score" tone="success" />
                  <Separator className="lg:hidden" />
                  <div className="grid w-full flex-1 gap-5 sm:grid-cols-1">
                    {qualityMetrics.map((metric) => <MetricBar key={metric.key} label={metric.label} value={metric.value} description={metric.description} />)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Duplication &amp; complexity</CardTitle>
                      <CardDescription className="mt-1">Repeated logic and structural hotspots.</CardDescription>
                    </div>
                    <Braces className="size-4 shrink-0 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-5 p-4 sm:p-6">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="rounded-lg border border-border bg-surface p-3">
                      <p className="text-xl font-semibold">6.4%</p>
                      <p className="mt-1 text-[11px] text-muted-foreground">Duplicated lines · {duplicatedLines} lines</p>
                    </div>
                    <div className="rounded-lg border border-border bg-surface p-3">
                      <p className="text-xl font-semibold text-warning">{avgComplexity}</p>
                      <p className="mt-1 text-[11px] text-muted-foreground">Avg. cyclomatic complexity</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium">Complexity hotspots</p>
                    <div className="mt-3 space-y-3">
                      {complexityHotspots.map((hotspot) => (
                        <div key={hotspot.file}>
                          <div className="flex items-center justify-between text-xs">
                            <span className="truncate font-mono text-[11px] text-muted-foreground">{hotspot.file}</span>
                            <span className="font-mono text-foreground">{hotspot.value}</span>
                          </div>
                          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted"><motion.div initial={{ width: 0 }} animate={{ width: `${(hotspot.value / 25) * 100}%` }} className="h-full rounded-full bg-destructive" /></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            <section className="mt-5 grid gap-3 sm:mt-6 grid-cols-2 sm:grid-cols-2 xl:grid-cols-4">
              <Card><CardContent className="p-4 sm:p-5"><p className="text-sm text-muted-foreground">Findings</p><p className="mt-5 text-3xl font-semibold tracking-[-0.05em]">{findings.length}</p><p className="mt-1 text-xs text-muted-foreground">Across {new Set(findings.map((f) => f.file)).size} files</p></CardContent></Card>
              {(["Critical", "High", "Medium"] as Severity[]).map((item) => {
                const count = findings.filter((finding) => finding.severity === item).length;
                return (
                  <Card key={item}>
                    <CardContent className="p-4 sm:p-5">
                      <div className="flex items-start justify-between"><p className="text-sm text-muted-foreground">{item}</p><span className={cn("size-2 rounded-full", severityMeta[item].dot)} /></div>
                      <p className="mt-5 text-3xl font-semibold tracking-[-0.05em]">{count}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{item === "Critical" ? "Needs immediate review" : item === "High" ? "Prioritize this sprint" : "Safe to schedule"}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </section>

            <section className="mt-5 grid gap-4 sm:mt-6 sm:gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
              <Card>
                <CardHeader className="border-b border-border p-4 sm:p-6">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <CardTitle>Review findings</CardTitle>
                      <CardDescription className="mt-1">Grouped by severity, with AI context and a suggested remediation.</CardDescription>
                    </div>
                    <div className="relative w-full lg:w-64">
                      <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                      <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search findings or files" className="h-9 pl-9 text-xs" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-5">
                  <div className="mb-3 flex flex-wrap gap-2" aria-label="Filter findings by severity">
                    <span className="inline-flex items-center gap-1.5 py-1 pr-1 text-xs text-muted-foreground"><ListFilter className="size-3.5" />Severity</span>
                    {(["All", "Critical", "High", "Medium", "Low"] as const).map((option) => (
                      <button type="button" key={option} onClick={() => setSeverity(option)} className={cn("rounded-full border px-3 py-1.5 text-xs font-medium transition-colors", severity === option ? "border-foreground bg-foreground text-background" : "border-border bg-secondary text-muted-foreground hover:text-foreground")}>
                        {option}{option !== "All" ? ` ${findings.filter((finding) => finding.severity === option).length}` : ""}
                      </button>
                    ))}
                  </div>
                  <div className="mb-5 flex flex-wrap gap-2" aria-label="Filter findings by category">
                    <span className="inline-flex items-center gap-1.5 py-1 pr-1 text-xs text-muted-foreground"><Filter className="size-3.5" />Category</span>
                    {(["All", "Code smell", "Best practice", "Duplication", "Complexity", "Maintainability"] as const).map((option) => (
                      <button type="button" key={option} onClick={() => setCategory(option)} className={cn("rounded-full border px-3 py-1.5 text-xs font-medium transition-colors", category === option ? "border-foreground bg-foreground text-background" : "border-border bg-secondary text-muted-foreground hover:text-foreground")}>
                        {option}
                      </button>
                    ))}
                  </div>
                  {visibleFindings.length ? (
                    <div className="space-y-3">
                      {(["Critical", "High", "Medium", "Low"] as Severity[]).map((group) => {
                        const groupFindings = visibleFindings.filter((finding) => finding.severity === group);
                        return groupFindings.length ? (
                          <section key={group} aria-labelledby={`${group}-findings`}>
                            <div className="mb-3 flex items-center gap-2">
                              <span className={cn("size-1.5 rounded-full", severityMeta[group].dot)} />
                              <h2 id={`${group}-findings`} className="text-xs font-medium text-muted-foreground">{group} · {groupFindings.length}</h2>
                            </div>
                            <div className="space-y-3">{groupFindings.map((finding, index) => <FindingCard key={finding.id} finding={finding} index={index} />)}</div>
                          </section>
                        ) : null;
                      })}
                    </div>
                  ) : (
                    <div className="flex min-h-80 flex-col items-center justify-center px-4 text-center">
                      <span className="grid size-11 place-items-center rounded-xl bg-secondary"><Search className="size-5 text-muted-foreground" /></span>
                      <p className="mt-4 text-sm font-medium">No findings match these filters</p>
                      <p className="mt-1 max-w-xs text-xs leading-5 text-muted-foreground">Try another severity or category, or clear your search to see all findings.</p>
                      <Button variant="secondary" size="sm" className="mt-5 w-full sm:w-auto" onClick={clearFilters}><X className="size-3.5" />Clear filters</Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              <aside className="space-y-4 sm:space-y-6">
                <Card>
                  <CardHeader className="p-4 pb-3 sm:p-6 sm:pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Severity distribution</CardTitle>
                        <CardDescription className="mt-1">{findings.length} findings across four levels.</CardDescription>
                      </div>
                      <Filter className="size-4 shrink-0 text-muted-foreground" />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 px-4 pb-4 sm:px-6 sm:pb-6">
                    {(["Critical", "High", "Medium", "Low"] as Severity[]).map((item) => {
                      const count = findings.filter((finding) => finding.severity === item).length;
                      const width = (count / findings.length) * 100;
                      return (
                        <div key={item}>
                          <div className="flex items-center justify-between text-xs"><span className="text-muted-foreground">{item}</span><span className="font-mono text-foreground">{count}</span></div>
                          <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted"><motion.div initial={{ width: 0 }} animate={{ width: `${width}%` }} className={cn("h-full rounded-full", severityMeta[item].dot)} /></div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="p-4 pb-3 sm:p-6 sm:pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Duplicated code</CardTitle>
                        <CardDescription className="mt-1">Repeated blocks worth consolidating.</CardDescription>
                      </div>
                      <Copy className="size-4 shrink-0 text-muted-foreground" />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 px-4 pb-4 sm:px-6 sm:pb-6">
                    {duplicateBlocks.map((block) => (
                      <div key={block.id} className="rounded-lg border border-border bg-surface p-3">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-medium">{block.label}</p>
                          <Badge variant="warning">{block.similarity}%</Badge>
                        </div>
                        <p className="mt-2 truncate font-mono text-[11px] text-muted-foreground">{block.files.join(" ↔ ")}</p>
                        <p className="mt-1 text-[11px] text-muted-foreground">{block.lines} duplicated lines</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="overflow-hidden">
                  <CardHeader className="border-b border-border p-4 sm:p-6">
                    <div className="flex items-center gap-2">
                      <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-secondary"><Bot className="size-4 text-muted-foreground" /></span>
                      <div>
                        <CardTitle className="text-sm">AI triage</CardTitle>
                        <CardDescription className="text-xs">Suggested order of work</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-5">
                    <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3">
                      <div className="flex gap-2"><Sparkles className="mt-0.5 size-3.5 shrink-0 text-destructive" /><p className="text-xs leading-5 text-muted-foreground">Simplify the nested rendering in the architecture explorer first. It is the single largest contributor to this scan&apos;s complexity score.</p></div>
                    </div>
                    <Separator className="my-4" />
                    <p className="text-xs font-medium">Recommended sequence</p>
                    <ol className="mt-3 space-y-3 text-xs text-muted-foreground">
                      <li className="flex gap-2"><span className="grid size-5 shrink-0 place-items-center rounded-full bg-secondary text-[10px] text-foreground">1</span><span className="pt-0.5">Reduce nesting in structure view</span></li>
                      <li className="flex gap-2"><span className="grid size-5 shrink-0 place-items-center rounded-full bg-secondary text-[10px] text-foreground">2</span><span className="pt-0.5">Split the upload orchestration</span></li>
                      <li className="flex gap-2"><span className="grid size-5 shrink-0 place-items-center rounded-full bg-secondary text-[10px] text-foreground">3</span><span className="pt-0.5">Share the severity mapping module</span></li>
                    </ol>
                  </CardContent>
                </Card>
              </aside>
            </section>

            <section className="mt-5 rounded-xl border border-border bg-surface p-4 sm:mt-6 sm:flex sm:items-center sm:justify-between sm:p-5">
              <div className="flex items-start gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-secondary"><ScanSearch className="size-4" /></span>
                <div>
                  <h2 className="text-sm font-medium">Review information</h2>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">Completed in 1m 42s · 142 files processed · Results shown are preview data only.</p>
                </div>
              </div>
            </section>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}