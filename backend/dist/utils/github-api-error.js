"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.githubApiError = exports.GitHubApiError = void 0;
class GitHubApiError extends Error {
    statusCode;
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.name = "GitHubApiError";
    }
}
exports.GitHubApiError = GitHubApiError;
const githubApiError = (response) => {
    if (response.status === 403) {
        return new GitHubApiError("GitHub API rate limit has been reached. Please retry later or authenticate with a GitHub token.", 429);
    }
    return new GitHubApiError("Unable to access the repository from GitHub. Please retry later.", response.status);
};
exports.githubApiError = githubApiError;
