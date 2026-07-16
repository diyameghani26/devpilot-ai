"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Activity,
  ArrowUpRight,
  Bell,
  Bot,
  CheckCircle2,
  ChevronDown,
  CircleAlert,
  Clock3,
  Code2,
  Command,
  FileCode2,
  FolderGit2,
  GitPullRequest,
  HelpCircle,
  LayoutDashboard,
  Menu,
  MessageSquare,
  Plus,
  Search,
  Send,
  Settings,
  ShieldCheck,
  Sparkles,
  Upload,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const navigation = [
  { label: "Overview", icon: LayoutDashboard, href: "/dashboard" },
   { label: "Chat assistant", icon: MessageSquare, href: "/chat" },
  { label: "Add repository", icon: FolderGit2, href: "/repositories/upload" },
  { label: "Repository analysis", icon: Activity, href: "/repositories/analysis" },
  { label: "Security scanner", icon: ShieldCheck, href: "/repositories/security" },
] as const;

const secondaryNavigation = [
  { label: "Settings", icon: Settings },
  { label: "Help & support", icon: HelpCircle },
] as const;

const statistics = [
  { label: "Repositories", value: "12", caption: "+2 this month", icon: FolderGit2 },
  { label: "Analyses run", value: "48", caption: "+18% from last month", icon: Activity },
  { label: "Issues resolved", value: "127", caption: "Across 8 repositories", icon: CheckCircle2 },
  { label: "Hours saved", value: "36.5", caption: "Estimated this month", icon: Clock3 },
] as const;

const quickActions = [
  { title: "Analyze repository", description: "Understand architecture and dependencies.", icon: Sparkles, href: "/repositories/analysis" },
  { title: "Explore architecture", description: "Trace modules, responsibilities, and relationships.", icon: GitPullRequest, href: "/repositories/architecture" },
  { title: "Run security scan", description: "Surface risks before they ship.", icon: ShieldCheck, href: "/repositories/security" },
] as const;

const analyses = [
  { name: "payments-service", type: "Architecture analysis", time: "12 min ago", status: "Complete", icon: Code2 },
  { name: "web-platform", type: "Pull request review", time: "1 hr ago", status: "Complete", icon: GitPullRequest },
  { name: "mobile-app", type: "Security scan", time: "Yesterday", status: "Attention", icon: ShieldCheck },
  { name: "data-pipeline", type: "Documentation", time: "Yesterday", status: "Complete", icon: FileCode2 },
] as const;

const activity = [
  { text: "Architecture map completed for", subject: "payments-service", time: "12 min ago", icon: Sparkles },
  { text: "3 suggestions added to", subject: "PR #482", time: "1 hr ago", icon: GitPullRequest },
  { text: "Security review flagged a dependency in", subject: "mobile-app", time: "Yesterday", icon: CircleAlert },
] as const;

function Brand() {
  return (
    <div className="flex items-center gap-2.5 px-1">
      <span className="grid size-8 place-items-center rounded-[10px] bg-primary text-primary-foreground shadow-sm">
        <Bot className="size-[18px]" strokeWidth={2.2} />
      </span>
      <span className="font-semibold tracking-[-0.03em]">DevPilot AI</span>
    </div>
  );
}

function Sidebar({ mobile = false, onClose }: { mobile?: boolean; onClose?: () => void }) {
  return (
    <aside className={cn("flex h-full flex-col bg-background", mobile ? "w-[19rem] p-4" : "w-64 border-r border-border p-4")}>
      <div className="flex h-10 items-center justify-between">
        <Brand />
        {mobile ? (
          <button type="button" className="grid size-9 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground" onClick={onClose} aria-label="Close navigation">
            <X className="size-4" />
          </button>
        ) : null}
      </div>
      <div className="mt-8 px-1">
        <p className="mb-2 px-2 text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">Workspace</p>
        <nav className="space-y-1" aria-label="Dashboard navigation">
          {navigation.map(({ label, icon: Icon, href }) => (
            <Link
              key={label}
              href={href}
              className={cn(
                "flex h-9 w-full items-center gap-2.5 rounded-lg px-2.5 text-sm transition-colors",
                href === "/dashboard" ? "bg-secondary font-medium text-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
              onClick={onClose}
            >
              <Icon className="size-4" />
              {label}
            </Link>
          ))}
        </nav>
      </div>
      <Separator className="my-6" />
      <nav className="space-y-1 px-1" aria-label="Account navigation">
        {secondaryNavigation.map(({ label, icon: Icon }) => (
          <button key={label} type="button" className="flex h-9 w-full items-center gap-2.5 rounded-lg px-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground" onClick={onClose}>
            <Icon className="size-4" />
            {label}
          </button>
        ))}
      </nav>
      <div className="mt-auto rounded-xl border border-border bg-surface p-3.5">
        <div className="flex items-center gap-2">
          <span className="grid size-7 place-items-center rounded-lg bg-secondary text-foreground"><Sparkles className="size-3.5" /></span>
          <p className="text-xs font-medium">Pro workspace</p>
        </div>
        <p className="mt-2 text-xs leading-5 text-muted-foreground">8 of 20 analyses used this month.</p>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full w-2/5 rounded-full bg-foreground" /></div>
      </div>
    </aside>
  );
}

function StatusBadge({ status }: { status: "Complete" | "Attention" }) {
  return <Badge variant={status === "Complete" ? "success" : "warning"}><span className="size-1.5 rounded-full bg-current" />{status}</Badge>;
}

export function DashboardPage() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-y-0 left-0 z-30 hidden lg:block"><Sidebar /></div>
      <AnimatePresence>
        {isMenuOpen ? (
          <>
            <motion.button type="button" aria-label="Close navigation" className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsMenuOpen(false)} />
            <motion.div className="fixed inset-y-0 left-0 z-50 lg:hidden" initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ type: "spring", damping: 28, stiffness: 300 }}>
              <Sidebar mobile onClose={() => setIsMenuOpen(false)} />
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-background/85 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
          <button type="button" className="grid size-9 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground lg:hidden" onClick={() => setIsMenuOpen(true)} aria-label="Open navigation">
            <Menu className="size-5" />
          </button>
          <div className="relative max-w-md flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input aria-label="Search workspace" placeholder="Search repositories, analyses, and docs..." className="h-9 bg-secondary pl-9 pr-14 text-xs" />
            <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground"><Command className="inline size-2.5" />K</kbd>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button type="button" className="relative grid size-9 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground" aria-label="Notifications">
              <Bell className="size-4" /><span className="absolute right-2 top-2 size-1.5 rounded-full bg-info ring-2 ring-background" />
            </button>
            <Separator orientation="vertical" className="mx-1 hidden h-5 sm:block" />
            <button type="button" className="flex items-center gap-2 rounded-lg p-1 text-left transition-colors hover:bg-muted" aria-label="Open account menu">
              <span className="grid size-7 place-items-center rounded-md bg-secondary text-xs font-semibold">DW</span>
              <span className="hidden sm:block"><span className="block text-xs font-medium">Demo workspace</span><span className="block text-[11px] text-muted-foreground">Product team</span></span>
              <ChevronDown className="hidden size-3.5 text-muted-foreground sm:block" />
            </button>
          </div>
        </header>

        <main className="mx-auto max-w-[1600px] px-4 py-7 sm:px-6 lg:px-8 lg:py-9">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div><p className="text-sm text-muted-foreground">Engineering workspace</p><h1 className="mt-1 text-2xl font-semibold tracking-[-0.04em] sm:text-3xl">Your work, in context.</h1><p className="mt-2 text-sm text-muted-foreground">Here’s the latest across this demo engineering workspace.</p></div>
            <Link href="/repositories/upload" className="inline-flex h-11 items-center justify-center gap-2 rounded-[calc(var(--radius)-0.15rem)] bg-primary px-5 text-[0.9375rem] font-medium text-primary-foreground shadow-[0_1px_2px_rgb(0_0_0_/_0.2)] transition-opacity hover:opacity-90"><Plus className="size-4" />New analysis</Link>
          </motion.div>

          <section className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Workspace statistics">
            {statistics.map(({ label, value, caption, icon: Icon }, index) => (
              <motion.div key={label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * index, duration: 0.3 }}>
                <Card className="group h-full transition-transform duration-200 hover:-translate-y-0.5 hover:border-foreground/20">
                  <CardContent className="p-5"><div className="flex items-start justify-between"><p className="text-sm text-muted-foreground">{label}</p><span className="grid size-8 place-items-center rounded-lg bg-secondary text-muted-foreground transition-colors group-hover:text-foreground"><Icon className="size-4" /></span></div><p className="mt-5 text-3xl font-semibold tracking-[-0.05em]">{value}</p><p className="mt-1 text-xs text-muted-foreground">{caption}</p></CardContent>
                </Card>
              </motion.div>
            ))}
          </section>

          <section className="mt-8" aria-labelledby="quick-actions-title"><div className="mb-4 flex items-center justify-between"><h2 id="quick-actions-title" className="text-base font-semibold tracking-[-0.02em]">Quick actions</h2><button type="button" className="text-sm text-muted-foreground hover:text-foreground">View all</button></div><div className="grid gap-3 lg:grid-cols-3">
            {quickActions.map(({ title, description, icon: Icon, href }) => <Link href={href} key={title} className="group rounded-xl border border-border bg-card p-5 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-foreground/20 hover:bg-surface-raised focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><span className="grid size-9 place-items-center rounded-lg bg-secondary text-foreground"><Icon className="size-4" /></span><div className="mt-5 flex items-center justify-between gap-3"><div><h3 className="text-sm font-medium">{title}</h3><p className="mt-1 text-xs leading-5 text-muted-foreground">{description}</p></div><ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" /></div></Link>)}
          </div></section>

          <section className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
            <Card><CardHeader className="flex-row items-center justify-between gap-4 pb-4"><div><CardTitle>Recent analyses</CardTitle><CardDescription className="mt-1">Latest work across your repositories.</CardDescription></div><button type="button" className="text-sm font-medium text-muted-foreground hover:text-foreground">View all</button></CardHeader><CardContent className="px-0 pb-0"><div className="overflow-x-auto"><table className="w-full min-w-[600px] text-left"><thead className="border-y border-border bg-muted/30 text-[11px] font-medium uppercase tracking-[0.06em] text-muted-foreground"><tr><th className="px-6 py-3">Repository</th><th className="px-4 py-3">Analysis</th><th className="px-4 py-3">Updated</th><th className="px-6 py-3 text-right">Status</th></tr></thead><tbody>{analyses.map(({ name, type, time, status, icon: Icon }) => <tr key={`${name}-${type}`} className="border-b border-border last:border-0 transition-colors hover:bg-muted/30"><td className="px-6 py-4"><div className="flex items-center gap-3"><span className="grid size-8 place-items-center rounded-lg bg-secondary text-muted-foreground"><Icon className="size-4" /></span><span className="font-mono text-xs font-medium">{name}</span></div></td><td className="px-4 py-4 text-sm text-muted-foreground">{type}</td><td className="px-4 py-4 text-sm text-muted-foreground">{time}</td><td className="px-6 py-4 text-right"><StatusBadge status={status} /></td></tr>)}</tbody></table></div></CardContent></Card>
          


   <div className="space-y-6"><Card
              className="cursor-pointer overflow-hidden transition-colors hover:border-foreground/20"
             role="link"
              tabIndex={0}
              onClick={() => router.push("/chat")}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") router.push("/chat");
              }}
            >
                <CardHeader className="border-b border-border">
                  
                  <div className="flex items-center gap-2"><span className="grid size-7 place-items-center rounded-lg bg-secondary"><Bot className="size-4" /></span><div>
                    <CardTitle className="text-sm">DevPilot assistant</CardTitle><CardDescription className="text-xs">Always ready to help</CardDescription></div></div></CardHeader><CardContent className="p-4"><div className="rounded-lg border border-border bg-muted/40 p-3 text-sm leading-6 text-muted-foreground">Ask about your codebase, a recent analysis, or what to review next.</div><div className="relative mt-3">
                      
                  
        <Input readOnly aria-label="Message DevPilot assistant" placeholder="Ask DevPilot anything..." className="pr-10 text-xs" onFocus={(event) => { event.stopPropagation(); router.push("/chat"); }} />
           <button type="button" className="absolute right-1 top-1 grid size-8 place-items-center rounded-md bg-primary text-primary-foreground" aria-label="Send message" onClick={(event) => { event.stopPropagation(); router.push("/chat"); }}><Send className="size-3.5" /></button>
                      
                      </div></CardContent></Card>
              <Card><CardHeader className="pb-3"><div className="flex items-center justify-between"><CardTitle>Recent activity</CardTitle><MessageSquare className="size-4 text-muted-foreground" /></div></CardHeader><CardContent className="space-y-5">{activity.map(({ text, subject, time, icon: Icon }) => <div key={subject} className="flex gap-3"><span className="grid size-7 shrink-0 place-items-center rounded-lg bg-secondary text-muted-foreground"><Icon className="size-3.5" /></span><div className="min-w-0"><p className="text-xs leading-5 text-muted-foreground">{text} <span className="font-medium text-foreground">{subject}</span></p><p className="mt-1 text-[11px] text-muted-foreground">{time}</p></div></div>)}</CardContent></Card></div>
          </section>

          <section className="mt-8"><Card className="relative overflow-hidden border-dashed bg-surface"><div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,var(--accent),transparent_28%)] opacity-30" /><CardContent className="relative flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-4"><span className="grid size-11 place-items-center rounded-xl border border-border bg-card shadow-sm"><Upload className="size-5" /></span><div><h2 className="font-semibold tracking-[-0.02em]">Upload a repository</h2><p className="mt-1 text-sm text-muted-foreground">Start a new analysis from a Git URL or upload an archive.</p></div></div><Button variant="secondary"><Upload className="size-4" />Add repository</Button></CardContent></Card></section>
        </main>
      </div>
    </div>
  );
}
