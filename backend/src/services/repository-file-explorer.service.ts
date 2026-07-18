import Repository from "../models/repository.model";
import { env } from "../config/env";
import { getGitHubRepositoryMetadata } from "./github-repository-metadata.service";
import { githubApiError } from "../utils/github-api-error";

export type RepositoryTreeEntry = {
  path: string;
  type: "file" | "directory";
};

type GitHubRepositoryResponse = { default_branch: string };
type GitHubTreeEntry = { path: string; type: "blob" | "tree" | "commit" };
type GitHubTreeResponse = { tree: GitHubTreeEntry[] };
type GitHubContentResponse = { content?: string; encoding?: string; type?: string };

const githubRequest = async <T>(path: string): Promise<T> => {
  const response = await fetch(`https://api.github.com${path}`, {
    headers: {
      Accept: "application/vnd.github+json",
      "User-Agent": "DevPilot-AI",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(env.githubToken ? { Authorization: `Bearer ${env.githubToken}` } : {}),
    },
  });

  if (!response.ok) {
    throw githubApiError(response);
  }

  return response.json() as Promise<T>;
};

const getRepositoryContext = async (repositoryId: string) => {
  const repository = await Repository.findById(repositoryId);
  if (!repository) return null;

  const metadata = getGitHubRepositoryMetadata(repository.githubUrl);
  const repositoryPath = `/repos/${encodeURIComponent(metadata.owner)}/${encodeURIComponent(metadata.repository)}`;
  const githubRepository = await githubRequest<GitHubRepositoryResponse>(repositoryPath);
  const preferredBranch = repository.branch || metadata.defaultBranch;

  return { repositoryPath, preferredBranch, defaultBranch: githubRepository.default_branch };
};

const withResolvedBranch = async <T>(
  context: NonNullable<Awaited<ReturnType<typeof getRepositoryContext>>>,
  request: (branch: string) => Promise<T>,
): Promise<{ branch: string; result: T }> => {
  try {
    return { branch: context.preferredBranch, result: await request(context.preferredBranch) };
  } catch (error) {
    if (context.preferredBranch === context.defaultBranch) throw error;
    return { branch: context.defaultBranch, result: await request(context.defaultBranch) };
  }
};

const isSafeRepositoryPath = (path: string): boolean =>
  Boolean(path) && !path.startsWith("/") && !path.split("/").some((segment) => !segment || segment === "." || segment === "..");

const encodeRepositoryPath = (path: string): string => path.split("/").map(encodeURIComponent).join("/");

export const getRepositoryTree = async (repositoryId: string) => {
  const context = await getRepositoryContext(repositoryId);
  if (!context) return null;

  const { branch, result } = await withResolvedBranch(context, (ref) =>
    githubRequest<GitHubTreeResponse>(`${context.repositoryPath}/git/trees/${encodeURIComponent(ref)}?recursive=1`),
  );

  return {
    branch,
    tree: result.tree
      .filter((entry) => entry.type === "blob" || entry.type === "tree")
      .map<RepositoryTreeEntry>((entry) => ({ path: entry.path, type: entry.type === "tree" ? "directory" : "file" })),
  };
};

export const getRepositoryFile = async (repositoryId: string, path: string) => {
  if (!isSafeRepositoryPath(path)) throw new Error("Invalid repository file path");

  const context = await getRepositoryContext(repositoryId);
  if (!context) return null;

  const { branch, result } = await withResolvedBranch(context, (ref) =>
    githubRequest<GitHubContentResponse>(
      `${context.repositoryPath}/contents/${encodeRepositoryPath(path)}?ref=${encodeURIComponent(ref)}`,
    ),
  );

  if (result.type !== "file" || result.encoding !== "base64" || !result.content) {
    throw new Error("GitHub did not return readable file content");
  }

  return { branch, path, content: Buffer.from(result.content, "base64").toString("utf8") };
};
