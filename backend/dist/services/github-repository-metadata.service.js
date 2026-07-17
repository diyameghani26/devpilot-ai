"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGitHubRepositoryMetadata = void 0;
const DEFAULT_BRANCH = "main";
/**
 * Extracts repository metadata from a validated GitHub repository URL.
 * Branch-qualified URLs follow GitHub's /owner/repository/tree/branch format.
 */
const getGitHubRepositoryMetadata = (githubUrl) => {
    const url = new URL(githubUrl);
    const pathSegments = url.pathname.split("/").filter(Boolean);
    const [owner, repositoryWithExtension] = pathSegments;
    if (!owner || !repositoryWithExtension) {
        throw new Error("GitHub repository URL must include an owner and repository name");
    }
    return {
        owner,
        repository: repositoryWithExtension.replace(/\.git$/i, ""),
        defaultBranch: pathSegments[2] === "tree" ? pathSegments.slice(3).join("/") : DEFAULT_BRANCH,
    };
};
exports.getGitHubRepositoryMetadata = getGitHubRepositoryMetadata;
