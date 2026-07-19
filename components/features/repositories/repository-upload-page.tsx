"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, CheckCircle2, ChevronRight, FileArchive, FileCode2, FolderGit2,
  Info, Link2, LoaderCircle, Plus, ShieldCheck, Upload, X,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { repositoriesApi, type Repository } from "@/lib/api";
import { cn } from "@/lib/utils";

type UploadState = "idle" | "uploading" | "success" | "error";

function GitHubMark({ className }: { className?: string }) {
  return <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}><path d="M12 2C6.477 2 2 6.586 2 12.242c0 4.522 2.865 8.36 6.839 9.716.5.095.683-.222.683-.494 0-.243-.009-.888-.014-1.744-2.782.621-3.369-1.374-3.369-1.374-.455-1.183-1.11-1.498-1.11-1.498-.908-.637.068-.624.068-.624 1.004.073 1.532 1.055 1.532 1.055.892 1.566 2.341 1.114 2.91.852.09-.664.349-1.114.635-1.37-2.22-.26-4.555-1.139-4.555-5.068 0-1.12.391-2.036 1.03-2.754-.103-.26-.446-1.306.098-2.723 0 0 .84-.277 2.75 1.052A9.336 9.336 0 0 1 12 6.46c.85.004 1.705.118 2.504.347 1.91-1.329 2.748-1.052 2.748-1.052.546 1.417.203 2.463.1 2.723.64.718 1.028 1.633 1.028 2.754 0 3.94-2.338 4.805-4.565 5.06.359.32.678.952.678 1.919 0 1.385-.012 2.503-.012 2.843 0 .275.18.595.688.493C19.14 20.598 22 16.762 22 12.242 22 6.586 17.523 2 12 2Z" /></svg>;
}

function repositoryDate(date: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(date));
}
  
export function RepositoryUploadPage() {
  const router = useRouter();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [url, setUrl] = React.useState("");
  const [file, setFile] = React.useState<File | null>(null);
  const [state, setState] = React.useState<UploadState>("idle");
  const [isDragging, setIsDragging] = React.useState(false);
  const [error, setError] = React.useState("");
  const [repositories, setRepositories] = React.useState<Repository[]>([]);
  const [isLoadingRepositories, setIsLoadingRepositories] = React.useState(true);
  const [repositoriesError, setRepositoriesError] = React.useState("");

  const isGitHubUrl = /^https:\/\/(www\.)?github\.com\/[\w.-]+\/[\w.-]+\/?$/.test(url.trim());

  const loadRepositories = React.useCallback(async () => {
    setIsLoadingRepositories(true);
    setRepositoriesError("");
    try {
      setRepositories(await repositoriesApi.list());
    } catch (requestError) {
      setRepositoriesError(requestError instanceof Error ? requestError.message : "Unable to load repositories.");
    } finally {
      setIsLoadingRepositories(false);
    }
  }, []);

  React.useEffect(() => {
    void loadRepositories();
  }, [loadRepositories]);

  const beginUpload = async () => {
    if (file) {
      setError("ZIP archive uploads are not available through the API yet. Connect a GitHub repository instead.");
      setState("error");
      return;
    }
    if (!url.trim() || !isGitHubUrl) {
      setError("Enter a valid public GitHub repository URL.");
      setState("error");
      return;
    }

    setError("");
    setState("uploading");
    try {
      const githubUrl = url.trim();
      const name = githubUrl.replace(/^https:\/\/(www\.)?github\.com\//, "").replace(/\/$/, "");
      const repository = await repositoriesApi.create({ name, githubUrl });
      setRepositories((current) => [
        repository,
        ...current.filter((r) => r.githubUrl.toLowerCase().replace(/\/$/, "") !== githubUrl.toLowerCase().replace(/\/$/, ""))
      ]);
      setState("success");
      router.push(`/repositories/${repository._id}`);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to add repository.");
      setState("error");
    }
  };

  const selectFile = (nextFile?: File) => {
    if (!nextFile) return;
    if (!nextFile.name.toLowerCase().endsWith(".zip")) {
      setError("Please choose a .zip archive.");
      setState("error");
      return;
    }
    setFile(nextFile); setUrl(""); setError(""); setState("idle");
  };

  const reset = () => {
    setFile(null); setUrl(""); setError(""); setState("idle");
    if (inputRef.current) inputRef.current.value = "";
  };

  return <main className="min-h-screen bg-background">
    <header className="border-b border-border bg-background/85 backdrop-blur-xl"><div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8"><Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"><ArrowLeft className="size-4" />Back to dashboard</Link><div className="flex items-center gap-2 text-sm font-medium"><span className="grid size-7 place-items-center rounded-lg bg-primary text-primary-foreground"><FolderGit2 className="size-4" /></span>DevPilot AI</div></div></header>
    <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="max-w-2xl"><Badge variant="info"><Plus className="size-3" />New repository</Badge><h1 className="mt-5 text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">Bring your codebase into focus.</h1><p className="mt-3 max-w-xl text-base leading-7 text-muted-foreground">Connect a GitHub repository or upload a ZIP archive. DevPilot will prepare it for analysis locally in this interface.</p></motion.div>
      <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        <Card className="overflow-hidden"><CardHeader className="border-b border-border"><CardTitle>Add a repository</CardTitle><CardDescription>Choose one source to get started.</CardDescription></CardHeader><CardContent className="space-y-8 p-5 sm:p-7">
          <section aria-labelledby="github-url-title"><div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-lg bg-secondary"><GitHubMark className="size-4" /></span><div><h2 id="github-url-title" className="text-sm font-medium">GitHub repository URL</h2><p className="mt-0.5 text-xs text-muted-foreground">Public repositories only in this preview.</p></div></div><div className="mt-4 flex flex-col gap-3 sm:flex-row"><div className="relative flex-1"><Link2 className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={url} onChange={(event) => { setUrl(event.target.value); setFile(null); setError(""); if (state !== "uploading") setState("idle"); }} placeholder="https://github.com/owner/repository" className="pl-9" disabled={state === "uploading"} /></div><Button type="button" onClick={() => void beginUpload()} disabled={state === "uploading" || !url.trim()} isLoading={state === "uploading"}><GitHubMark className="size-4" />Connect</Button></div></section>
          <div className="relative"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div><div className="relative flex justify-center"><span className="bg-card px-3 text-xs text-muted-foreground">or upload an archive</span></div></div>
          <section aria-labelledby="zip-upload-title"><h2 id="zip-upload-title" className="sr-only">ZIP file upload</h2><motion.div layout className={cn("relative overflow-hidden rounded-xl border border-dashed p-6 text-center transition-colors sm:p-10", isDragging ? "border-ring bg-accent/60" : "border-border bg-surface hover:border-foreground/25 hover:bg-surface-raised", state === "error" ? "border-destructive/50" : "")} onDragEnter={(event) => { event.preventDefault(); setIsDragging(true); }} onDragOver={(event) => event.preventDefault()} onDragLeave={() => setIsDragging(false)} onDrop={(event) => { event.preventDefault(); setIsDragging(false); selectFile(event.dataTransfer.files[0]); }}><input ref={inputRef} type="file" accept=".zip,application/zip,application/x-zip-compressed" className="sr-only" onChange={(event) => selectFile(event.target.files?.[0])} /><AnimatePresence mode="wait">{state === "uploading" ? <motion.div key="uploading" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}><span className="mx-auto grid size-12 place-items-center rounded-xl bg-secondary"><LoaderCircle className="size-5 animate-spin" /></span><h3 className="mt-4 text-sm font-medium">Preparing your repository</h3><p className="mt-1 text-xs text-muted-foreground">Saving your repository connection…</p></motion.div> : state === "success" ? <motion.div key="success" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}><span className="mx-auto grid size-12 place-items-center rounded-xl bg-success/15 text-success"><CheckCircle2 className="size-5" /></span><h3 className="mt-4 text-sm font-medium">Repository ready for analysis</h3><p className="mt-1 text-xs text-muted-foreground">{url.replace(/^https:\/\/(www\.)?github\.com\//, "")} has been added to your workspace.</p><Button variant="secondary" size="sm" className="mt-5" onClick={reset}>Upload another</Button></motion.div> : <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }}><span className="mx-auto grid size-12 place-items-center rounded-xl border border-border bg-card shadow-sm"><FileArchive className="size-5 text-muted-foreground" /></span><h3 className="mt-4 text-sm font-medium">Drop a ZIP file here</h3><p className="mt-1 text-xs text-muted-foreground">or <button type="button" className="font-medium text-foreground underline underline-offset-4" onClick={() => inputRef.current?.click()}>browse your computer</button></p><p className="mt-4 text-[11px] text-muted-foreground">ZIP archives up to 250 MB</p>{file ? <div className="mx-auto mt-5 flex max-w-sm items-center gap-3 rounded-lg border border-border bg-card px-3 py-2 text-left"><FileCode2 className="size-4 text-muted-foreground" /><span className="min-w-0 flex-1 truncate text-xs font-medium">{file.name}</span><button type="button" className="text-muted-foreground hover:text-foreground" aria-label="Remove selected file" onClick={reset}><X className="size-4" /></button></div> : null}{file ? <Button className="mt-5" size="sm" onClick={() => void beginUpload()}><Upload className="size-3.5" />Upload archive</Button> : null}</motion.div>}</AnimatePresence></motion.div></section>
          {state === "error" ? <div role="alert" className="flex items-start gap-3 rounded-lg border border-destructive/25 bg-destructive/10 p-3 text-sm text-destructive"><Info className="mt-0.5 size-4 shrink-0" /><div><p className="font-medium">Unable to add repository</p><p className="mt-0.5 text-xs opacity-90">{error}</p></div><button type="button" className="ml-auto" aria-label="Dismiss error" onClick={() => { setState("idle"); setError(""); }}><X className="size-4" /></button></div> : null}
        </CardContent></Card>
        <aside className="space-y-5"><Card><CardHeader className="pb-3"><CardTitle className="text-sm">What happens next</CardTitle></CardHeader><CardContent className="space-y-4"><div className="flex gap-3"><span className="grid size-6 shrink-0 place-items-center rounded-full bg-secondary text-[11px] font-medium">1</span><p className="pt-0.5 text-xs leading-5 text-muted-foreground">We inspect your repository structure and languages.</p></div><div className="flex gap-3"><span className="grid size-6 shrink-0 place-items-center rounded-full bg-secondary text-[11px] font-medium">2</span><p className="pt-0.5 text-xs leading-5 text-muted-foreground">DevPilot maps modules and important dependencies.</p></div><div className="flex gap-3"><span className="grid size-6 shrink-0 place-items-center rounded-full bg-secondary text-[11px] font-medium">3</span><p className="pt-0.5 text-xs leading-5 text-muted-foreground">Your workspace is ready for exploration and review.</p></div></CardContent></Card><div className="rounded-xl border border-border bg-surface p-4"><div className="flex items-center gap-2 text-sm font-medium"><ShieldCheck className="size-4" />Private by design</div><p className="mt-2 text-xs leading-5 text-muted-foreground">This is a UI-only preview. No files or repository data are sent or retained.</p></div></aside>
      </div>
      <section className="mt-12" aria-labelledby="recent-title"><div className="flex items-center justify-between"><div><h2 id="recent-title" className="text-lg font-semibold tracking-[-0.03em]">Recently uploaded</h2><p className="mt-1 text-sm text-muted-foreground">Repositories added to your workspace.</p></div><Link href="/dashboard" className="hidden items-center gap-1 text-sm text-muted-foreground hover:text-foreground sm:inline-flex">View workspace <ChevronRight className="size-4" /></Link></div><div className="mt-5 overflow-hidden rounded-xl border border-border bg-card">{isLoadingRepositories ? <div className="flex flex-col items-center px-6 py-12 text-center"><LoaderCircle className="size-5 animate-spin text-muted-foreground" /><p className="mt-4 text-sm font-medium">Loading repositories</p><p className="mt-1 text-xs text-muted-foreground">Fetching your workspace repositories.</p></div> : repositoriesError ? <div role="alert" className="flex items-start gap-3 p-4 text-sm text-destructive"><Info className="mt-0.5 size-4 shrink-0" /><div className="flex-1"><p className="font-medium">Unable to load repositories</p><p className="mt-0.5 text-xs opacity-90">{repositoriesError}</p></div><Button type="button" variant="ghost" size="sm" onClick={() => void loadRepositories()}>Retry</Button></div> : repositories.length > 0 ? repositories.map((repository) => <div key={repository._id} className="flex flex-col gap-3 border-b border-border p-4 last:border-0 sm:flex-row sm:items-center sm:gap-4"><span className="grid size-9 place-items-center rounded-lg bg-secondary"><FolderGit2 className="size-4 text-muted-foreground" /></span><div className="min-w-0 flex-1"><p className="truncate font-mono text-xs font-medium">{repository.name}</p><p className="mt-1 text-xs text-muted-foreground">GitHub · {repositoryDate(repository.createdAt)}</p></div><Badge variant={repository.status === "ready" ? "success" : "neutral"}><span className="size-1.5 rounded-full bg-current" />{repository.status}</Badge><Link href={`/repositories/${repository._id}`} className="hidden text-xs font-medium text-muted-foreground hover:text-foreground sm:block">Open</Link></div>) : <div className="flex flex-col items-center px-6 py-12 text-center"><span className="grid size-10 place-items-center rounded-xl bg-secondary"><FolderGit2 className="size-5 text-muted-foreground" /></span><p className="mt-4 text-sm font-medium">No repositories yet</p><p className="mt-1 text-xs text-muted-foreground">Your uploaded repositories will appear here.</p></div>}</div></section>
    </div>
  </main>;
}
