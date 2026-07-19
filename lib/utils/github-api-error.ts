export class GitHubApiError extends Error {
  public type?: string;

  constructor(message: string, public readonly statusCode: number, type?: string) {
    super(message);
    this.name = "GitHubApiError";
    if (type) {
      this.type = type;
    }
  }
}

export const githubApiError = (response: Response): GitHubApiError => {
  // A 403 can be a rate limit if the x-ratelimit-remaining header is 0,
  // or it could be because the user needs authentication.
  // 429 is explicitly a rate limit.
  const isRateLimit = response.status === 429 || 
    (response.status === 403 && response.headers.get("x-ratelimit-remaining") === "0");

  if (isRateLimit) {
    return new GitHubApiError(
      "GitHub API rate limit exceeded.",
      429,
      "github_rate_limit"
    );
  }

  if (response.status === 403) {
    return new GitHubApiError(
      "GitHub API access forbidden.",
      403,
    );
  }

  return new GitHubApiError("Unable to access the repository from GitHub. Please retry later.", response.status);
};
