"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { CheckCircle2, ChevronLeft, GitBranch, Info, Monitor, Moon, Settings, Sun, UserRound } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const themes = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
] as const;

export function SettingsPage() {
  const { theme, setTheme } = useTheme();

  return (
    <main className="min-h-screen bg-background px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
          <ChevronLeft className="size-4" /> Back to workspace
        </Link>
        <div className="mt-6 flex items-start gap-4">
          <span className="grid size-11 place-items-center rounded-xl bg-secondary"><Settings className="size-5" /></span>
          <div><h1 className="text-3xl font-semibold tracking-[-0.04em]">Settings</h1><p className="mt-1.5 text-sm leading-6 text-muted-foreground">Manage your workspace preferences and account details.</p></div>
        </div>

        <div className="mt-8 grid gap-5">
          <Card>
            <CardHeader><CardTitle>Theme preference</CardTitle><CardDescription>Choose the appearance that is most comfortable for your workspace.</CardDescription></CardHeader>
            <CardContent><div className="grid gap-3 sm:grid-cols-2">{themes.map(({ value, label, icon: Icon }) => <button key={value} type="button" onClick={() => setTheme(value)} className={cn("flex items-center gap-3 rounded-xl border p-4 text-left transition-colors", theme === value ? "border-foreground/30 bg-secondary" : "border-border bg-surface hover:bg-secondary/70")} aria-pressed={theme === value}><span className="grid size-9 place-items-center rounded-lg bg-card"><Icon className="size-4 text-muted-foreground" /></span><span className="flex-1"><span className="block text-sm font-medium">{label}</span><span className="mt-0.5 block text-xs text-muted-foreground">Use the {label.toLowerCase()} interface.</span></span>{theme === value ? <CheckCircle2 className="size-4 text-success" /> : null}</button>)}</div><p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground"><Monitor className="size-3.5" /> Your preference is saved in this browser.</p></CardContent>
          </Card>

          <div className="grid gap-5 md:grid-cols-2">
            <Card><CardHeader><div className="flex items-start justify-between gap-3"><div><CardTitle>GitHub connection</CardTitle><CardDescription>Repository access used by DevPilot AI.</CardDescription></div><GitBranch className="size-5 text-muted-foreground" /></div></CardHeader><CardContent><div className="flex items-center gap-2"><Badge variant="neutral"><span className="size-1.5 rounded-full bg-current" />Public repository access</Badge></div><p className="mt-4 text-sm leading-6 text-muted-foreground">DevPilot can analyze public GitHub repositories added to your workspace. OAuth account connection is not enabled in this preview.</p><Link href="/repositories/upload" className="mt-4 inline-flex text-sm font-medium text-foreground underline underline-offset-4">Add a repository</Link></CardContent></Card>
            <Card><CardHeader><div className="flex items-start justify-between gap-3"><div><CardTitle>Account</CardTitle><CardDescription>Your active DevPilot workspace.</CardDescription></div><UserRound className="size-5 text-muted-foreground" /></div></CardHeader><CardContent><dl className="space-y-3 text-sm"><div className="flex justify-between gap-4"><dt className="text-muted-foreground">Workspace</dt><dd className="font-medium">Demo workspace</dd></div><div className="flex justify-between gap-4"><dt className="text-muted-foreground">Plan</dt><dd className="font-medium">Pro workspace</dd></div><div className="flex justify-between gap-4"><dt className="text-muted-foreground">Usage</dt><dd className="font-medium">8 of 20 analyses</dd></div></dl></CardContent></Card>
          </div>

          <Card><CardHeader><div className="flex items-start gap-3"><span className="grid size-9 place-items-center rounded-lg bg-secondary"><Info className="size-4" /></span><div><CardTitle>About DevPilot AI</CardTitle><CardDescription>AI-assisted tools for understanding, reviewing, and securing codebases.</CardDescription></div></div></CardHeader><CardContent><p className="text-sm leading-6 text-muted-foreground">DevPilot AI brings repository analysis, architecture exploration, bug detection, and security scanning into one focused engineering workspace.</p><p className="mt-3 text-xs text-muted-foreground">Preview build · Version 0.1.0</p></CardContent></Card>
        </div>
      </div>
    </main>
  );
}
