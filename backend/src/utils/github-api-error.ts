export class GitHubApiError extends Error {
  constructor(message: string, public readonly statusCode: number) {
    super(message);
    this.name = "GitHubApiError";
  }
}

export const githubApiError = (response: Response): GitHubApiError => {
  if (response.status === 403) {
    return new GitHubApiError(
      "GitHub API rate limit has been reached. Please retry later or authenticate with a GitHub token.",
      429,
    );
  }

  return new GitHubApiError("Unable to access the repository from GitHub. Please retry later.", response.status);
};
