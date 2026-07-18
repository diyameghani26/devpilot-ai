"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, FolderGit2, Info, LoaderCircle, Network, ShieldCheck, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ApiError, repositoriesApi, type Repository, type RepositoryAnalysis } from "@/lib/api";
import { RepositoryFileExplorer } from "@/components/features/repositories/repository-file-explorer";

export function RepositoryWorkspacePage({ repositoryId }: { repositoryId: string }) {
  const [repository, setRepository] = React.useState<Repository | null>(null);
  const [analysis, setAnalysis] = React.useState<RepositoryAnalysis | null>(null);
  const [error, setError] = React.useState("");
  const [analysisError, setAnalysisError] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(true);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = React.useState(true);
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);

  const loadRepository = React.useCallback(async (): Promise<Repository | null> => {
    setIsLoading(true);
    setError("");
    try {
      const loadedRepository = await repositoriesApi.get(repositoryId);
      setRepository(loadedRepository);
      return loadedRepository;
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to load repository.");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [repositoryId]);

  const loadAnalysis = React.useCallback(async () => {
    setIsLoadingAnalysis(true);
    setAnalysisError("");
    try {
      setAnalysis(await repositoriesApi.getAnalysis(repositoryId));
    } catch (requestError) {
      if (requestError instanceof ApiError && requestError.status === 404 && requestError.message === "Repository analysis not available") {
        setAnalysis(null);
      } else {
        setAnalysisError(requestError instanceof Error ? requestError.message : "Unable to load analysis.");
      }
    } finally {
      setIsLoadingAnalysis(false);
    }
  }, [repositoryId]);

  React.useEffect(() => {
    void (async () => {
      const loadedRepository = await loadRepository();
      if (loadedRepository?.status === "ready") {
        await loadAnalysis();
      } else {
        setAnalysis(null);
        setIsLoadingAnalysis(false);
      }
    })();
  }, [loadAnalysis, loadRepository]);

  const analyzeRepository = async () => {
    setIsAnalyzing(true);
    setAnalysisError("");
    try {
      const result = await repositoriesApi.analyze(repositoryId);
      setRepository(result.repository);
      await loadAnalysis();
    } catch (requestError) {
      setAnalysisError(requestError instanceof Error ? requestError.message : "Unable to analyze repository. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return <main className="min-h-screen bg-background">
    <header className="border-b border-border bg-background/85 backdrop-blur-xl"><div className="mx-auto flex h-16 max-w-4xl items-center px-5 sm:px-8"><Link href="/repositories/upload" className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"><ArrowLeft className="size-4" />Back to repositories</Link></div></header>
    <div className="mx-auto max-w-4xl px-5 py-10 sm:px-8 sm:py-14">
      {isLoading ? <Card><CardContent className="flex flex-col items-center py-14 text-center"><LoaderCircle className="size-5 animate-spin text-muted-foreground" /><p className="mt-4 text-sm font-medium">Loading repository</p></CardContent></Card> : error ? <Card><CardContent className="flex items-start gap-3 p-5 text-destructive"><Info className="mt-0.5 size-4 shrink-0" /><div className="flex-1"><p className="font-medium">Unable to load repository</p><p className="mt-1 text-sm opacity-90">{error}</p></div><Button type="button" variant="ghost" size="sm" onClick={() => void loadRepository()}>Retry</Button></CardContent></Card> : repository ? <><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-secondary"><FolderGit2 className="size-5 text-muted-foreground" /></span><div><h1 className="text-2xl font-semibold tracking-[-0.03em]">{repository.name}</h1><p className="mt-1 text-sm text-muted-foreground">Repository workspace</p></div></div><Card className="mt-8"><CardHeader><CardTitle>Repository details</CardTitle><CardDescription>The connected repository context for this workspace.</CardDescription></CardHeader><CardContent className="space-y-5"><div><p className="text-xs font-medium text-muted-foreground">GitHub URL</p><a href={repository.githubUrl} target="_blank" rel="noreferrer" className="mt-1 block break-all text-sm text-foreground underline underline-offset-4">{repository.githubUrl}</a></div><div><p className="text-xs font-medium text-muted-foreground">Status</p><Badge className="mt-2" variant={repository.status === "ready" ? "success" : "neutral"}>{repository.status}</Badge></div></CardContent></Card><Card className="mt-6"><CardHeader><CardTitle>Repository analysis</CardTitle><CardDescription>Generated repository insights for this workspace.</CardDescription></CardHeader><CardContent>{isLoadingAnalysis ? <div className="flex items-center gap-3 py-3 text-sm text-muted-foreground"><LoaderCircle className="size-4 animate-spin" />Loading analysis</div> : analysisError ? <div role="alert" className="flex items-start gap-3 rounded-lg border border-destructive/25 bg-destructive/10 p-4 text-sm text-destructive"><Info className="mt-0.5 size-4 shrink-0" /><div className="flex-1"><p className="font-medium">Analysis could not be completed</p><p className="mt-1 text-xs opacity-90">{analysisError}</p></div><Button type="button" variant="ghost" size="sm" onClick={() => void loadAnalysis()}>Retry</Button></div> : analysis ? <div className="space-y-5"><div className="grid gap-4 sm:grid-cols-3"><div className="rounded-lg border border-border bg-surface p-4"><p className="text-xs text-muted-foreground">Primary language</p><p className="mt-1 text-sm font-medium">{analysis.primaryLanguage}</p></div><div className="rounded-lg border border-border bg-surface p-4"><p className="text-xs text-muted-foreground">Repository size</p><p className="mt-1 text-sm font-medium">{analysis.repositorySizeEstimate.value.toLocaleString()} {analysis.repositorySizeEstimate.unit}</p></div><div className="rounded-lg border border-border bg-surface p-4"><p className="text-xs text-muted-foreground">File count</p><p className="mt-1 text-sm font-medium">{analysis.fileCountEstimate.toLocaleString()}</p></div></div><div><p className="text-xs font-medium text-muted-foreground">Frameworks</p><div className="mt-2 flex flex-wrap gap-2">{analysis.frameworks.map((framework) => <Badge key={framework} variant="neutral">{framework}</Badge>)}</div></div><div className="grid gap-4 sm:grid-cols-2"><div><p className="text-xs font-medium text-muted-foreground">Package manager</p><p className="mt-1 text-sm">{analysis.packageManager}</p></div><div><p className="text-xs font-medium text-muted-foreground">Analyzed</p><p className="mt-1 text-sm">{new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(analysis.analyzedAt))}</p></div></div></div> : <div className="rounded-lg border border-border bg-surface p-4"><div className="flex items-start gap-3"><Sparkles className="mt-0.5 size-4 text-muted-foreground" /><div className="flex-1"><p className="text-sm font-medium">Analysis coming soon</p><p className="mt-1 text-xs text-muted-foreground">Run an analysis to inspect this repository’s technology profile.</p><Button className="mt-4" size="sm" type="button" isLoading={isAnalyzing} onClick={() => void analyzeRepository()}><Sparkles className="size-3.5" />Analyze Repository</Button></div></div></div>}</CardContent></Card></> : null}
      {repository ? <><div className="mt-6 flex flex-wrap gap-2"><Link href={`/repositories/${repositoryId}/architecture`} className="inline-flex h-8 items-center justify-center gap-2 rounded-[calc(var(--radius)-0.15rem)] border border-border bg-secondary px-3 text-xs font-medium text-secondary-foreground shadow-sm transition-colors hover:bg-accent"><Network className="size-3.5" />Architecture Explorer</Link><Link href={`/repositories/${repositoryId}/security`} className="inline-flex h-8 items-center justify-center gap-2 rounded-[calc(var(--radius)-0.15rem)] border border-border bg-secondary px-3 text-xs font-medium text-secondary-foreground shadow-sm transition-colors hover:bg-accent"><ShieldCheck className="size-3.5" />Security Scanner</Link></div><RepositoryFileExplorer repositoryId={repositoryId} /></> : null}
    </div>
  </main>;
}
