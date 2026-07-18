const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000").replace(/\/$/, "");

export class ApiError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = "ApiError";
  }
}

type ApiErrorResponse = {
  message?: string;
};

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const body = (await response.json().catch(() => ({}))) as T & ApiErrorResponse;

  if (!response.ok) {
    throw new ApiError(body.message ?? "Something went wrong. Please try again.", response.status);
  }

  return body;
}

export type Repository = {
  _id: string;
  name: string;
  githubUrl: string;
  branch: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  analysis?: RepositoryAnalysis;
  analysisHistory?: RepositoryAnalysis[];
  bugIssueCount?: number;
  dependencyIssueCount?: number;
};

export type RepositoryAnalysis = {
  primaryLanguage: string;
  repositorySizeEstimate: {
    value: number;
    unit: "KB";
  };
  fileCountEstimate: number;
  frameworks: string[];
  runtimes: string[];
  packageManager: string;
  dependencies: Record<string, string>;
  scripts: Record<string, string>;
  source: string;
  analyzedAt: string;
};

export type RepositoryTreeEntry = { path: string; type: "file" | "directory" };
export type RepositoryFile = { path: string; content: string; branch: string };
export type DependencySeverity = "Critical" | "High" | "Medium" | "Low";
export type DependencyFinding = { id: string; severity: DependencySeverity; kind: string; title: string; file: string; line: number; explanation: string; risk: string; fix: string; before: string; after: string };
export type RepositoryDependencyScan = { branch: string; analyzedAt: string; dependencyCount: number; findings: DependencyFinding[]; score: number };
export type BugSeverity = "Critical" | "High" | "Medium" | "Low";
export type BugFinding = { id: string; severity: BugSeverity; title: string; file: string; line: number; category: string; explanation: string; impact: string; fix: string; before: string; after: string };
export type RepositoryBugScan = { branch: string; analyzedAt: string; sourceFileCount: number; lineCount: number; findings: BugFinding[] };

type RepositoryListResponse = {
  success: boolean;
  count: number;
  repositories: Repository[];
};

type CreateRepositoryResponse = {
  success: boolean;
  data: Repository;
};

type RepositoryResponse = {
  success: boolean;
  repository: Repository;
};

type RepositoryAnalysisResponse = {
  success: boolean;
  analysis: RepositoryAnalysis;
};

type AnalyzeRepositoryResponse = RepositoryAnalysisResponse & {
  repository: Repository;
};

type RepositoryTreeResponse = { success: boolean; branch: string; tree: RepositoryTreeEntry[] };
type RepositoryFileResponse = { success: boolean; file: RepositoryFile };
type RepositoryDependencyScanResponse = { success: boolean; scan: RepositoryDependencyScan };
type RepositoryBugScanResponse = { success: boolean; scan: RepositoryBugScan };

export const repositoriesApi = {
  list: async (): Promise<Repository[]> => (await request<RepositoryListResponse>("/api/repositories")).repositories,
  get: async (id: string): Promise<Repository> =>
    (await request<RepositoryResponse>(`/api/repositories/${encodeURIComponent(id)}`)).repository,
  getAnalysis: async (id: string): Promise<RepositoryAnalysis> =>
    (await request<RepositoryAnalysisResponse>(`/api/repositories/${encodeURIComponent(id)}/analysis`)).analysis,
  analyze: async (id: string): Promise<AnalyzeRepositoryResponse> =>
    request<AnalyzeRepositoryResponse>(`/api/repositories/${encodeURIComponent(id)}/analyze`, { method: "POST" }),
  getTree: async (id: string): Promise<RepositoryTreeResponse> =>
    request<RepositoryTreeResponse>(`/api/repositories/${encodeURIComponent(id)}/tree`),
  getFile: async (id: string, path: string): Promise<RepositoryFile> =>
    (await request<RepositoryFileResponse>(`/api/repositories/${encodeURIComponent(id)}/file?path=${encodeURIComponent(path)}`)).file,
  getDependencyScan: async (id: string): Promise<RepositoryDependencyScan> =>
    (await request<RepositoryDependencyScanResponse>(`/api/repositories/${encodeURIComponent(id)}/dependency-scan`)).scan,
  getBugScan: async (id: string): Promise<RepositoryBugScan> =>
    (await request<RepositoryBugScanResponse>(`/api/repositories/${encodeURIComponent(id)}/bug-scan`)).scan,
  create: async (repository: Pick<Repository, "name" | "githubUrl"> & { branch?: string }): Promise<Repository> =>
    (await request<CreateRepositoryResponse>("/api/repositories", {
      method: "POST",
      body: JSON.stringify(repository),
    })).data,
};
