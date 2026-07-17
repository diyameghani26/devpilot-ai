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

export const repositoriesApi = {
  list: async (): Promise<Repository[]> => (await request<RepositoryListResponse>("/api/repositories")).repositories,
  get: async (id: string): Promise<Repository> =>
    (await request<RepositoryResponse>(`/api/repositories/${encodeURIComponent(id)}`)).repository,
  getAnalysis: async (id: string): Promise<RepositoryAnalysis> =>
    (await request<RepositoryAnalysisResponse>(`/api/repositories/${encodeURIComponent(id)}/analysis`)).analysis,
  analyze: async (id: string): Promise<AnalyzeRepositoryResponse> =>
    request<AnalyzeRepositoryResponse>(`/api/repositories/${encodeURIComponent(id)}/analyze`, { method: "POST" }),
  create: async (repository: Pick<Repository, "name" | "githubUrl"> & { branch?: string }): Promise<Repository> =>
    (await request<CreateRepositoryResponse>("/api/repositories", {
      method: "POST",
      body: JSON.stringify(repository),
    })).data,
};
