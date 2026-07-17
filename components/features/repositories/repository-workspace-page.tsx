"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, FolderGit2, Info, LoaderCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { repositoriesApi, type Repository } from "@/lib/api";

export function RepositoryWorkspacePage({ repositoryId }: { repositoryId: string }) {
  const [repository, setRepository] = React.useState<Repository | null>(null);
  const [error, setError] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(true);

  const loadRepository = React.useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      setRepository(await repositoriesApi.get(repositoryId));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to load repository.");
    } finally {
      setIsLoading(false);
    }
  }, [repositoryId]);

  React.useEffect(() => {
    void loadRepository();
  }, [loadRepository]);

  return <main className="min-h-screen bg-background">
    <header className="border-b border-border bg-background/85 backdrop-blur-xl"><div className="mx-auto flex h-16 max-w-4xl items-center px-5 sm:px-8"><Link href="/repositories/upload" className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"><ArrowLeft className="size-4" />Back to repositories</Link></div></header>
    <div className="mx-auto max-w-4xl px-5 py-10 sm:px-8 sm:py-14">
      {isLoading ? <Card><CardContent className="flex flex-col items-center py-14 text-center"><LoaderCircle className="size-5 animate-spin text-muted-foreground" /><p className="mt-4 text-sm font-medium">Loading repository</p></CardContent></Card> : error ? <Card><CardContent className="flex items-start gap-3 p-5 text-destructive"><Info className="mt-0.5 size-4 shrink-0" /><div className="flex-1"><p className="font-medium">Unable to load repository</p><p className="mt-1 text-sm opacity-90">{error}</p></div><Button type="button" variant="ghost" size="sm" onClick={() => void loadRepository()}>Retry</Button></CardContent></Card> : repository ? <><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-secondary"><FolderGit2 className="size-5 text-muted-foreground" /></span><div><h1 className="text-2xl font-semibold tracking-[-0.03em]">{repository.name}</h1><p className="mt-1 text-sm text-muted-foreground">Repository workspace</p></div></div><Card className="mt-8"><CardHeader><CardTitle>Repository details</CardTitle><CardDescription>The connected repository context for this workspace.</CardDescription></CardHeader><CardContent className="space-y-5"><div><p className="text-xs font-medium text-muted-foreground">GitHub URL</p><a href={repository.githubUrl} target="_blank" rel="noreferrer" className="mt-1 block break-all text-sm text-foreground underline underline-offset-4">{repository.githubUrl}</a></div><div><p className="text-xs font-medium text-muted-foreground">Status</p><Badge className="mt-2" variant={repository.status === "ready" ? "success" : "neutral"}>{repository.status}</Badge></div><div className="rounded-lg border border-border bg-surface p-4"><p className="text-sm font-medium">Analysis coming soon</p><p className="mt-1 text-xs text-muted-foreground">Repository analysis will appear here when it is available.</p></div></CardContent></Card></> : null}
    </div>
  </main>;
}
