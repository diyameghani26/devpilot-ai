import { GitHubApiError, githubApiError } from "../utils/github-api-error";

// Basic in-memory caches to prevent duplicate requests across services
const metadataCache = new Map<string, Promise<any>>();
const treeCache = new Map<string, Promise<any>>();
const fileCache = new Map<string, Promise<any>>();

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const fetchWithRetry = async (url: string, options: RequestInit, retries = 3, backoff = 500): Promise<Response> => {
  try {
    const response = await fetch(url, options);

    // If it's a transient error that should be retried
    if ([429, 502, 503, 504].includes(response.status) && retries > 0) {
      await delay(backoff);
      return fetchWithRetry(url, options, retries - 1, backoff * 2);
    }

    if (!response.ok) {
      throw githubApiError(response);
    }

    return response;
  } catch (error) {
    if (error instanceof GitHubApiError) {
      throw error;
    }
    // If network error, retry if possible
    if (retries > 0) {
      await delay(backoff);
      return fetchWithRetry(url, options, retries - 1, backoff * 2);
    }
    throw new GitHubApiError("Network error accessing GitHub API.", 500);
  }
};

export const githubRequest = async <T>(path: string): Promise<T> => {
  const githubToken = process.env.GITHUB_TOKEN;
  const headers: HeadersInit = {
    Accept: "application/vnd.github+json",
    "User-Agent": "DevPilot-AI",
    "X-GitHub-Api-Version": "2022-11-28",
  };

  if (githubToken) {
    headers["Authorization"] = `Bearer ${githubToken}`;
  }

  const response = await fetchWithRetry(`https://api.github.com${path}`, { headers });
  return response.json() as Promise<T>;
};

// Caching wrappers
export const githubRequestCachedMetadata = <T>(path: string): Promise<T> => {
  if (!metadataCache.has(path)) {
    const req = githubRequest<T>(path).catch(e => {
      metadataCache.delete(path);
      throw e;
    });
    metadataCache.set(path, req);
  }
  return metadataCache.get(path)!;
};

export const githubRequestCachedTree = <T>(path: string): Promise<T> => {
  if (!treeCache.has(path)) {
    const req = githubRequest<T>(path).catch(e => {
      treeCache.delete(path);
      throw e;
    });
    treeCache.set(path, req);
  }
  return treeCache.get(path)!;
};

export const githubRequestCachedFile = <T>(path: string): Promise<T> => {
  if (!fileCache.has(path)) {
    const req = githubRequest<T>(path).catch(e => {
      fileCache.delete(path);
      throw e;
    });
    fileCache.set(path, req);
  }
  return fileCache.get(path)!;
};
