import Link from "next/link";
import { ArrowRight, ChevronLeft, CircleHelp, Github, Mail, SearchCheck, Wrench } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const quickStart = [
  ["1", "Add a repository", "Paste a public GitHub repository URL to bring it into your workspace.", "/repositories/upload"],
  ["2", "Run an analysis", "Generate an overview of technologies, structure, and dependencies.", "/repositories/analysis"],
  ["3", "Explore the results", "Use architecture, bugs, and security views to guide the next review.", "/repositories/architecture"],
] as const;

const faqs = [
  ["Which repositories can I add?", "This preview supports public GitHub repositories. Paste the repository URL on the Add repository page."],
  ["Why did my analysis fail?", "Confirm that the repository is public and reachable, then try the analysis again. GitHub API rate limits can also temporarily delay requests."],
  ["How current are the results?", "Results are based on the repository state available when the analysis runs. Run another analysis after significant changes."],
] as const;

export function HelpPage() {
  return (
    <main className="min-h-screen bg-background px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"><ChevronLeft className="size-4" /> Back to workspace</Link>
        <div className="mt-6 flex items-start gap-4"><span className="grid size-11 place-items-center rounded-xl bg-secondary"><CircleHelp className="size-5" /></span><div><h1 className="text-3xl font-semibold tracking-[-0.04em]">Help &amp; support</h1><p className="mt-1.5 text-sm leading-6 text-muted-foreground">Everything you need to get productive with DevPilot AI.</p></div></div>

        <section className="mt-8" aria-labelledby="quick-start-title"><div className="mb-4"><h2 id="quick-start-title" className="text-lg font-semibold tracking-[-0.02em]">Quick start</h2><p className="mt-1 text-sm text-muted-foreground">Move from repository URL to useful engineering context in a few steps.</p></div><div className="grid gap-4 md:grid-cols-3">{quickStart.map(([step, title, description, href]) => <Link key={step} href={href} className="group rounded-xl border border-border bg-card p-5 shadow-sm transition-colors hover:bg-surface"><span className="grid size-8 place-items-center rounded-lg bg-secondary text-xs font-semibold">{step}</span><h3 className="mt-4 text-sm font-semibold">{title}</h3><p className="mt-1.5 text-xs leading-5 text-muted-foreground">{description}</p><span className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-muted-foreground group-hover:text-foreground">Open <ArrowRight className="size-3" /></span></Link>)}</div></section>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <Card><CardHeader><div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-lg bg-secondary"><CircleHelp className="size-4" /></span><div><CardTitle>Frequently asked questions</CardTitle><CardDescription>Answers to common workspace questions.</CardDescription></div></div></CardHeader><CardContent className="space-y-2">{faqs.map(([question, answer]) => <details key={question} className="rounded-lg border border-border bg-surface px-3.5 py-3"><summary className="cursor-pointer text-sm font-medium">{question}</summary><p className="mt-2 text-xs leading-5 text-muted-foreground">{answer}</p></details>)}</CardContent></Card>
          <div className="space-y-5"><Card><CardHeader><div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-lg bg-secondary"><Mail className="size-4" /></span><div><CardTitle>Contact support</CardTitle><CardDescription>Need a hand from the DevPilot team?</CardDescription></div></div></CardHeader><CardContent><a href="mailto:support@devpilot.ai" className="text-sm font-medium underline underline-offset-4">support@devpilot.ai</a><p className="mt-2 text-xs leading-5 text-muted-foreground">Include the repository URL and a short description of the issue when possible.</p></CardContent></Card><Card><CardHeader><div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-lg bg-secondary"><Wrench className="size-4" /></span><div><CardTitle>Troubleshooting</CardTitle><CardDescription>Resolve common connection and analysis issues.</CardDescription></div></div></CardHeader><CardContent><ul className="space-y-3 text-xs leading-5 text-muted-foreground"><li className="flex gap-2"><Github className="mt-0.5 size-3.5 shrink-0" />Use a complete public GitHub repository URL.</li><li className="flex gap-2"><SearchCheck className="mt-0.5 size-3.5 shrink-0" />Retry after a short wait if GitHub reports a rate limit.</li><li className="flex gap-2"><Wrench className="mt-0.5 size-3.5 shrink-0" />Refresh the page and re-run the analysis if results do not load.</li></ul></CardContent></Card></div>
        </div>
      </div>
    </main>
  );
}
