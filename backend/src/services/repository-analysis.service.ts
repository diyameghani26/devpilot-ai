import Repository from "../models/repository.model";
import { getGitHubRepositoryMetadata } from "./github-repository-metadata.service";
import { env } from "../config/env";
import { githubApiError } from "../utils/github-api-error";

export type RepositoryAnalysis = {
  primaryLanguage: string;
  repositorySizeEstimate: {
    value: number;
    unit: "KB";
  };
  fileCountEstimate: number;
  frameworks: string[];
  runtimes: ("Node.js" | "Bun" | "Deno")[];
  packageManager: "npm" | "yarn" | "pnpm" | "bun" | "pip" | "unknown";
  dependencies: Record<string, string>;
  scripts: Record<string, string>;
  source: "github-rest-api";
  analyzedAt: Date;
};

type GitHubRepositoryResponse = {
  default_branch: string;
  size: number;
};

type GitTreeEntry = {
  path: string;
  type: "blob" | "tree" | "commit";
  sha: string;
  size?: number;
};

type GitTreeResponse = { tree: GitTreeEntry[]; truncated?: boolean };

type GitHubContentResponse = {
  content?: string;
  encoding?: string;
};

type PackageJson = {
  dependencies?: Record<string, unknown>;
  devDependencies?: Record<string, unknown>;
  peerDependencies?: Record<string, unknown>;
  optionalDependencies?: Record<string, unknown>;
  scripts?: Record<string, unknown>;
  engines?: Record<string, unknown>;
};

const languageExtensions: Record<string, string> = {
  ".ts": "TypeScript", ".tsx": "TypeScript", ".js": "JavaScript", ".jsx": "JavaScript",
  ".py": "Python", ".java": "Java", ".go": "Go", ".rs": "Rust", ".rb": "Ruby",
  ".php": "PHP", ".cs": "C#", ".cpp": "C++", ".c": "C", ".vue": "Vue",
};

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

const getExtension = (path: string): string => {
  const name = path.split("/").pop() ?? "";
  const extensionStart = name.lastIndexOf(".");
  return extensionStart === -1 ? "" : name.slice(extensionStart).toLowerCase();
};

const asStringRecord = (value: Record<string, unknown> | undefined): Record<string, string> =>
  Object.fromEntries(Object.entries(value ?? {}).filter((entry): entry is [string, string] => typeof entry[1] === "string"));

const detectPackageManager = (paths: Set<string>): RepositoryAnalysis["packageManager"] => {
  if (paths.has("bun.lockb") || paths.has("bun.lock")) return "bun";
  if (paths.has("pnpm-lock.yaml")) return "pnpm";
  if (paths.has("yarn.lock")) return "yarn";
  if (paths.has("package-lock.json") || paths.has("npm-shrinkwrap.json")) return "npm";
  if (paths.has("requirements.txt") || paths.has("poetry.lock") || paths.has("Pipfile.lock")) return "pip";
  if (paths.has("package.json")) return "npm";
  return "unknown";
};

const frameworkPackages: Record<string, string> = {
  next: "Next.js",
  react: "React",
  "react-dom": "React",
  vite: "Vite",
  express: "Express",
  vue: "Vue",
  "@angular/core": "Angular",
  svelte: "Svelte",
  nuxt: "Nuxt",
  "@nestjs/core": "NestJS",
  fastify: "Fastify",
  koa: "Koa",
  "@hapi/hapi": "Hapi",
  "@remix-run/react": "Remix",
  astro: "Astro",
  "solid-js": "Solid",
  "@builder.io/qwik": "Qwik",
};

const detectFrameworks = (dependencies: Record<string, string>): string[] => {
  const packages = new Set(Object.keys(dependencies));
  const frameworks = new Set<string>();

  for (const [packageName, framework] of Object.entries(frameworkPackages)) {
    if (packages.has(packageName)) frameworks.add(framework);
  }

  return [...frameworks];
};

const detectRuntimes = (
  packageManager: RepositoryAnalysis["packageManager"],
  packageJson: PackageJson,
  paths: Set<string>,
): RepositoryAnalysis["runtimes"] => {
  const runtimes = new Set<RepositoryAnalysis["runtimes"][number]>();
  const engines = asStringRecord(packageJson.engines);

  if (paths.has("package.json") || packageManager === "npm" || packageManager === "yarn" || packageManager === "pnpm" || engines.node) {
    runtimes.add("Node.js");
  }
  if (packageManager === "bun" || engines.bun) runtimes.add("Bun");
  if (paths.has("deno.json") || paths.has("deno.jsonc") || engines.deno) runtimes.add("Deno");

  return [...runtimes];
};

const findPrimaryLanguage = (entries: GitTreeEntry[]): string => {
  const counts = new Map<string, number>();
  for (const entry of entries) {
    if (entry.type !== "blob") continue;
    const language = languageExtensions[getExtension(entry.path)];
    if (language) counts.set(language, (counts.get(language) ?? 0) + 1);
  }
  return [...counts.entries()].sort(([, left], [, right]) => right - left)[0]?.[0] ?? "Unknown";
};

const parsePackageJson = (content: unknown): PackageJson => {
  if (!content || typeof content !== "object" || Array.isArray(content)) return {};
  return content as PackageJson;
};

const getCompleteTree = async (repositoryPath: string, ref: string): Promise<GitTreeEntry[]> => {
  const recursiveTree = await githubRequest<GitTreeResponse>(`${repositoryPath}/git/trees/${encodeURIComponent(ref)}?recursive=1`);
  if (!recursiveTree.truncated) return recursiveTree.tree;

  const completeTree: GitTreeEntry[] = [];
  const visitTree = async (treeRef: string, prefix = ""): Promise<void> => {
    const tree = await githubRequest<GitTreeResponse>(`${repositoryPath}/git/trees/${encodeURIComponent(treeRef)}`);
    for (const entry of tree.tree) {
      const path = `${prefix}${entry.path}`;
      if (entry.type === "tree") {
        await visitTree(entry.sha, `${path}/`);
      } else {
        completeTree.push({ ...entry, path });
      }
    }
  };

  await visitTree(ref);
  return completeTree;
};

const createGitHubAnalysis = async (githubUrl: string, branch: string): Promise<RepositoryAnalysis> => {
  const metadata = getGitHubRepositoryMetadata(githubUrl);
  const repositoryPath = `/repos/${encodeURIComponent(metadata.owner)}/${encodeURIComponent(metadata.repository)}`;
  const repository = await githubRequest<GitHubRepositoryResponse>(repositoryPath);
  let ref = branch || metadata.defaultBranch || repository.default_branch;
  let tree: GitTreeEntry[];

  try {
    tree = await getCompleteTree(repositoryPath, ref);
  } catch (error) {
    // Older records defaulted to "main" before GitHub metadata was retrieved. Fall back
    // to GitHub's current default branch when that stored branch no longer exists.
    if (ref === repository.default_branch) throw error;
    ref = repository.default_branch;
    tree = await getCompleteTree(repositoryPath, ref);
  }
  const paths = new Set(tree.map((entry) => entry.path));
  let packageJson: PackageJson = {};

  if (paths.has("package.json")) {
    const packageFile = await githubRequest<GitHubContentResponse>(`${repositoryPath}/contents/package.json?ref=${encodeURIComponent(ref)}`);
    if (packageFile.encoding !== "base64" || !packageFile.content) {
      throw new Error("GitHub returned package.json in an unsupported format");
    }
    packageJson = parsePackageJson(JSON.parse(Buffer.from(packageFile.content, "base64").toString("utf8")) as unknown);
  }

  const dependencies = {
    ...asStringRecord(packageJson.dependencies),
    ...asStringRecord(packageJson.devDependencies),
    ...asStringRecord(packageJson.peerDependencies),
    ...asStringRecord(packageJson.optionalDependencies),
  };
  const packageManager = detectPackageManager(paths);

  return {
    repositorySizeEstimate: {
      value: repository.size,
      unit: "KB",
    },
    fileCountEstimate: tree.filter((entry) => entry.type === "blob").length,
    primaryLanguage: findPrimaryLanguage(tree),
    frameworks: detectFrameworks(dependencies),
    runtimes: detectRuntimes(packageManager, packageJson, paths),
    packageManager,
    dependencies,
    scripts: asStringRecord(packageJson.scripts),
    source: "github-rest-api",
    analyzedAt: new Date(),
  };
};

export const analyzeRepository = async (repositoryId: string) => {
  const repository = await Repository.findById(repositoryId);

  if (!repository) {
    return null;
  }

  await Repository.findByIdAndUpdate(repositoryId, { status: "analyzing" });

  try {
    const analysis = await createGitHubAnalysis(repository.githubUrl, repository.branch);
    const analyzedRepository = await Repository.findByIdAndUpdate(
      repositoryId,
      { status: "ready", analysis },
      { new: true, runValidators: true },
    );

    return analyzedRepository;
  } catch (error) {
    await Repository.findByIdAndUpdate(repositoryId, { status: "pending" });
    throw error;
  }
};

export const getRepositoryAnalysis = async (repositoryId: string) => {
  const repository = await Repository.findById(repositoryId);

  if (!repository) {
    return null;
  }

  return repository.analysis as RepositoryAnalysis | undefined;
};
