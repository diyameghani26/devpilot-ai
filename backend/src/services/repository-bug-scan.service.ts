import Repository from "../models/repository.model";
import { env } from "../config/env";
import { getGitHubRepositoryMetadata } from "./github-repository-metadata.service";

export type BugSeverity = "Critical" | "High" | "Medium" | "Low";
export type BugFinding = { id: string; severity: BugSeverity; title: string; file: string; line: number; category: string; explanation: string; impact: string; fix: string; before: string; after: string };
export type RepositoryBugScan = { branch: string; analyzedAt: Date; sourceFileCount: number; lineCount: number; findings: BugFinding[] };

type GitHubRepositoryResponse = { default_branch: string };
type GitTreeEntry = { path: string; type: "blob" | "tree" | "commit" };
type GitTreeResponse = { tree: GitTreeEntry[] };
type GitHubContentResponse = { content?: string; encoding?: string; type?: string };

const sourceExtensions = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".py"]);
const maxFiles = 40;
const ignoredDirectories = new Set(["node_modules", ".next", "dist", "build", "coverage", "vendor"]);

const githubRequest = async <T>(path: string): Promise<T> => {
  const response = await fetch(`https://api.github.com${path}`, { headers: { Accept: "application/vnd.github+json", "User-Agent": "DevPilot-AI", "X-GitHub-Api-Version": "2022-11-28", ...(env.githubToken ? { Authorization: `Bearer ${env.githubToken}` } : {}) } });
  if (!response.ok) {
    const message = await response.json().then((body: { message?: string }) => body.message).catch(() => undefined);
    throw new Error(`GitHub API request failed (${response.status}): ${message ?? response.statusText}`);
  }
  return response.json() as Promise<T>;
};

const extension = (path: string) => { const name = path.split("/").pop() ?? ""; return name.slice(name.lastIndexOf(".")).toLowerCase(); };
const lineAt = (content: string, index: number) => content.slice(0, index).split("\n").length;
const snippetAt = (content: string, line: number) => content.split("\n")[line - 1]?.trim() || "";
const encodePath = (path: string) => path.split("/").map(encodeURIComponent).join("/");

const findIssues = (path: string, content: string): BugFinding[] => {
  const findings: BugFinding[] = [];
  const jsonPattern = /JSON\.parse\s*\(/g;
  for (const match of content.matchAll(jsonPattern)) {
    const index = match.index ?? 0;
    const preceding = content.slice(Math.max(0, index - 500), index);
    if (/\btry\s*\{[^}]*$/s.test(preceding)) continue;
    const line = lineAt(content, index);
    findings.push({ id: `${path}:json:${line}`, severity: "Medium", title: "JSON parsing can throw outside an error boundary", file: path, line, category: "Error handling", explanation: "This JSON.parse call is not within a nearby try/catch block, so malformed input can terminate the current request or interaction.", impact: "Unexpected or corrupted data can cause a user-visible failure instead of a recoverable error.", fix: "Catch parsing failures and return a controlled fallback or error state.", before: snippetAt(content, line), after: "try {\n  const value = JSON.parse(input);\n} catch {\n  // handle invalid JSON\n}" });
  }

  const intervalPattern = /(?:window\.)?setInterval\s*\(/g;
  for (const match of content.matchAll(intervalPattern)) {
    if (/clearInterval\s*\(/.test(content)) continue;
    const line = lineAt(content, match.index ?? 0);
    findings.push({ id: `${path}:interval:${line}`, severity: "High", title: "Interval is created without visible cleanup", file: path, line, category: "Lifecycle", explanation: "This file starts an interval but does not clear it. The callback can continue after its owning view or request is no longer active.", impact: "Stale callbacks can update disposed state, leak resources, or perform duplicate work.", fix: "Store the interval handle and clear it from the relevant cleanup path.", before: snippetAt(content, line), after: "const timer = window.setInterval(run, 1000);\nreturn () => window.clearInterval(timer);" });
  }

  const asyncMapPattern = /\.map\s*\(\s*async\b/g;
  for (const match of content.matchAll(asyncMapPattern)) {
    const index = match.index ?? 0;
    const surrounding = content.slice(Math.max(0, index - 80), index + 240);
    if (/Promise\.all\s*\(/.test(surrounding)) continue;
    const line = lineAt(content, index);
    findings.push({ id: `${path}:async-map:${line}`, severity: "Medium", title: "Async map results are not visibly awaited", file: path, line, category: "Async control flow", explanation: "Array.map with an async callback creates promises. No nearby Promise.all call was detected to await their completion.", impact: "Follow-up code can run before the mapped work finishes and rejected promises can be missed.", fix: "Await Promise.all around the mapped callbacks when their work must complete before continuing.", before: snippetAt(content, line), after: "await Promise.all(items.map(async (item) => {\n  await process(item);\n}));" });
  }

  return findings;
};

export const scanRepositoryBugs = async (repositoryId: string): Promise<RepositoryBugScan | null> => {
  const repository = await Repository.findById(repositoryId);
  if (!repository) return null;
  const metadata = getGitHubRepositoryMetadata(repository.githubUrl);
  const repositoryPath = `/repos/${encodeURIComponent(metadata.owner)}/${encodeURIComponent(metadata.repository)}`;
  const githubRepository = await githubRequest<GitHubRepositoryResponse>(repositoryPath);
  let branch = repository.branch || metadata.defaultBranch || githubRepository.default_branch;
  let tree: GitTreeEntry[];
  try { tree = (await githubRequest<GitTreeResponse>(`${repositoryPath}/git/trees/${encodeURIComponent(branch)}?recursive=1`)).tree; }
  catch (error) { if (branch === githubRepository.default_branch) throw error; branch = githubRepository.default_branch; tree = (await githubRequest<GitTreeResponse>(`${repositoryPath}/git/trees/${encodeURIComponent(branch)}?recursive=1`)).tree; }
  const paths = tree.filter((entry) => entry.type === "blob" && sourceExtensions.has(extension(entry.path)) && !entry.path.split("/").some((segment) => ignoredDirectories.has(segment))).map((entry) => entry.path).slice(0, maxFiles);
  const files = await Promise.all(paths.map(async (path) => {
    const result = await githubRequest<GitHubContentResponse>(`${repositoryPath}/contents/${encodePath(path)}?ref=${encodeURIComponent(branch)}`);
    return result.type === "file" && result.encoding === "base64" && result.content ? { path, content: Buffer.from(result.content, "base64").toString("utf8") } : null;
  }));
  const readableFiles = files.filter((file): file is { path: string; content: string } => file !== null);
  return { branch, analyzedAt: new Date(), sourceFileCount: readableFiles.length, lineCount: readableFiles.reduce((total, file) => total + file.content.split("\n").length, 0), findings: readableFiles.flatMap((file) => findIssues(file.path, file.content)).slice(0, 50) };
};
