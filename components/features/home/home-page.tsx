"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Bot,
  Check,
  ChevronRight,
  FileSearch,
  GitBranch,
  GitPullRequest,
  Moon,
  Network,
  ScanSearch,
  ShieldCheck,
  Sparkles,
  Sun,
} from "lucide-react";
import { useTheme } from "next-themes";

import { cn } from "@/lib/utils";

const features = [
  {
    icon: Network,
    title: "Architecture that clicks",
    href: "/repositories/architecture",
    description:
      "Map services, dependencies, and data flows in minutes—not weeks of tribal knowledge.",
  },
  {
    icon: GitPullRequest,
    title: "Reviews with context",
    href: "/repositories/code-review",
    description:
      "Spot brittle changes, missing edge cases, and code smells before they reach production.",
  },
  {
    icon: ShieldCheck,
    title: "Security built in",
    href: "/repositories/security",
    description:
      "Surface vulnerable patterns, leaked secrets, and risky dependencies across every repository.",
  },
] as const;

const activity = [
  { label: "Architecture mapped", value: "42 services", icon: Network },
  { label: "Review complete", value: "3 suggestions", icon: GitPullRequest },
  { label: "Security scan", value: "0 critical", icon: ShieldCheck },
] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0 },
};

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = React.useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );
  const isDark = mounted && resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      disabled={!mounted}
      className="inline-flex size-9 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      aria-label={`Switch to ${isDark ? "light" : "dark"} theme`}
    >
      {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </button>
  );
}

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
      <span className="grid size-8 place-items-center rounded-lg bg-foreground text-background shadow-sm">
        <Bot className="size-4.5" strokeWidth={2.25} />
      </span>
      <span>DevPilot AI</span>
    </Link>
  );
}

export function HomePage() {
  return (
    <main className="overflow-hidden bg-background">
      <section className="relative isolate border-b border-border">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-size-[56px_56px] opacity-40 [mask-[linear-gradient(to_bottom,black,transparent_78%)]"
        />

        <header className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-5 sm:px-8">
          <Logo />
          <nav className="hidden items-center gap-7 text-sm text-muted-foreground md:flex" aria-label="Primary navigation">
            <Link className="transition-colors hover:text-foreground" href="#features">
              Capabilities
            </Link>
            <Link className="transition-colors hover:text-foreground" href="#workflow">
              Workflow
            </Link>
            <Link className="transition-colors hover:text-foreground" href="#security">
              Security
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/dashboard" className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted sm:hidden">Workspace</Link>
            <Link
              href="#get-started"
              className="hidden items-center gap-2 rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90 sm:inline-flex"
            >
              Get started <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </header>

        <div className="mx-auto grid w-full max-w-7xl gap-14 px-5 pb-20 pt-14 sm:px-8 lg:grid-cols-[1fr_0.9fr] lg:items-center lg:gap-20 lg:pb-28 lg:pt-24">
          <motion.div initial="hidden" animate="visible" transition={{ staggerChildren: 0.1 }}>
            <motion.div
              variants={fadeUp}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur"
            >
              <Sparkles className="size-3.5 text-foreground" />
              The engineering context layer
            </motion.div>
            <motion.h1
              variants={fadeUp}
              className="max-w-3xl text-4xl font-semibold tracking-[-0.055em] text-balance sm:text-6xl lg:text-7xl"
            >
              See the whole codebase. <span className="text-muted-foreground">Ship the right change.</span>
            </motion.h1>
            <motion.p variants={fadeUp} className="mt-7 max-w-xl text-lg leading-8 text-muted-foreground sm:text-xl">
              DevPilot turns unfamiliar repositories into clear engineering context—so every developer can reason, review, and move faster.
            </motion.p>
            <motion.div variants={fadeUp} className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="#get-started"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-foreground px-5 text-sm font-medium text-background transition-opacity hover:opacity-90"
              >
                Analyze a repository <ArrowRight className="size-4" />
              </Link>
              <Link
                href="#workflow"
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-background px-5 text-sm font-medium text-foreground transition-opacity hover:opacity-90 lg:w-auto"
              >
                See how it works <ChevronRight className="size-4" />
              </Link>
            </motion.div>
            <motion.div variants={fadeUp} className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-muted-foreground">
              {["Private by default", "GitHub-native", "No credit card"].map((item) => (
                <span key={item} className="flex items-center gap-1.5">
                  <Check className="size-3.5 text-foreground" />
                  {item}
                </span>
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="relative mx-auto w-full max-w-xl"
          >
            <div className="absolute -inset-5 -z-10 rounded-4xl bg-muted/70 blur-2xl" />
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-2xl shadow-foreground/10">
              <div className="flex h-12 items-center justify-between border-b border-border px-4">
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-foreground/20" />
                  <span className="size-2 rounded-full bg-foreground/20" />
                  <span className="size-2 rounded-full bg-foreground/20" />
                </div>
                <span className="font-mono text-[11px] text-muted-foreground">devpilot / atlas-api</span>
                <span className="size-6" />
              </div>
             <div className="grid min-h-90 grid-cols-1 sm:min-h-102.5 sm:grid-cols-[170px_1fr]">
                <aside className="hidden border-r border-border p-3 text-xs text-muted-foreground sm:block">
                  <div className="mb-4 flex items-center gap-2 px-2 font-medium text-foreground">
                    <GitBranch className="size-3.5" /> atlas-api
                  </div>
                  {["Overview", "Architecture", "Code review", "Security", "Docs"].map((item, index) => (
                    <div
                      key={item}
                      className={cn(
                        "mb-1 flex items-center gap-2 rounded-md px-2 py-2",
                        index === 0 ? "bg-muted text-foreground" : "",
                      )}
                    >
                      {index === 0 ? <ScanSearch className="size-3.5" /> : <span className="size-3.5" />}
                      {item}
                    </div>
                  ))}
                </aside>
                <div className="p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Repository intelligence</p>
                      <h2 className="mt-1 text-xl font-semibold tracking-tight">atlas-api</h2>
                    </div>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                      <span className="size-1.5 rounded-full bg-foreground" /> Synced
                    </span>
                  </div>
                  <div className="mt-6 grid grid-cols-3 gap-2">
                    {[
                      ["142", "Files"],
                      ["18", "Services"],
                      ["94%", "Coverage"],
                    ].map(([value, label]) => (
                      <div key={label} className="rounded-lg border border-border bg-background p-3">
                        <p className="text-lg font-semibold tracking-tight">{value}</p>
                        <p className="mt-0.5 text-[10px] text-muted-foreground">{label}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-5 rounded-lg border border-border bg-muted/50 p-4">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Sparkles className="size-4" /> DevPilot summary
                    </div>
                    <p className="mt-2 text-xs leading-5 text-muted-foreground">
                      Event-driven billing API with a modular monolith core. The payment service owns invoice state and publishes events to three downstream consumers.
                    </p>
                    <button type="button" className="mt-3 text-xs font-medium underline underline-offset-4">
                      Explore architecture
                    </button>
                  </div>
                  <div className="mt-5 space-y-3">
                    {activity.map(({ icon: Icon, label, value }) => (
                      <div key={label} className="flex items-center gap-3 text-xs">
                        <span className="grid size-7 place-items-center rounded-md bg-muted text-foreground">
                          <Icon className="size-3.5" />
                        </span>
                        <span className="flex-1 text-muted-foreground">{label}</span>
                        <span className="font-medium text-foreground">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="features" className="mx-auto w-full max-w-7xl px-5 py-20 sm:px-8 lg:py-28">
        <div className="max-w-2xl">
          <p className="text-sm font-medium text-muted-foreground">Built for the work behind the work</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">More context. Fewer blind spots.</h2>
          <p className="mt-4 text-lg leading-8 text-muted-foreground">
            Replace the archaeology of large codebases with an assistant that understands how the pieces fit together.
          </p>
        </div>
        <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-3">
          {features.map(({ icon: Icon, title, description, href }) => (
            <article key={title} className="bg-background p-7 sm:p-8">
              <span className="grid size-10 place-items-center rounded-lg bg-muted">
                <Icon className="size-5" />
              </span>
              <h3 className="mt-6 text-lg font-semibold tracking-tight">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
              <Link href={href} className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium hover:underline">
                Learn more <ArrowRight className="size-3.5" />
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section id="workflow" className="border-y border-border bg-muted/35">
        <div className="mx-auto w-full max-w-7xl px-5 py-20 sm:px-8 lg:py-28">
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground">One clear workflow</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">From repository to reliable decisions.</h2>
            </div>
            <div className="space-y-1">
              {[
                ["01", "Connect your repository", "Bring in the code your team already trusts. DevPilot indexes structure and relationships securely."],
                ["02", "Ask better engineering questions", "Explore architecture, trace behavior, and get grounded answers with direct file-level context."],
                ["03", "Ship with confidence", "Review diffs, document decisions, and surface risk before it becomes an incident."],
              ].map(([number, title, description]) => (
                <div key={number} className="grid grid-cols-[52px_1fr] gap-4 border-b border-border py-6 first:pt-0">
                  <span className="font-mono text-xs text-muted-foreground">{number}</span>
                  <div>
                    <h3 className="font-semibold">{title}</h3>
                    <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="security" className="mx-auto w-full max-w-7xl px-5 py-20 sm:px-8 lg:py-28">
        <div id="get-started" className="rounded-2xl bg-foreground px-6 py-12 text-background sm:px-12 sm:py-16">
          <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <div className="flex items-center gap-2 text-sm text-background/65">
                <FileSearch className="size-4" /> Your code, understood.
              </div>
              <h2 className="mt-4 max-w-2xl text-3xl font-semibold tracking-[-0.04em] sm:text-5xl">
                Let your next merge start with clarity.
              </h2>
            </div>
            <Link
              href="/repositories/upload"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-background px-5 text-sm font-medium text-foreground transition-opacity hover:opacity-90"
            >
              Start with DevPilot <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-5 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <Logo />
          <p>© 2026 DevPilot AI. Build with context.</p>
          <div className="flex items-center gap-4">
            <Link href="#security" className="hover:text-foreground">Security</Link>
            <Link href="mailto:hello@devpilot.ai" className="hover:text-foreground">Contact</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
