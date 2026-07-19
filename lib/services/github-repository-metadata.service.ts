export type GitHubRepositoryMetadata = {
  owner: string;
  repository: string;
  defaultBranch: string;
};

const DEFAULT_BRANCH = "main";

/**
 * Extracts repository metadata from a validated GitHub repository URL.
 * Branch-qualified URLs follow GitHub's /owner/repository/tree/branch format.
 */
export const getGitHubRepositoryMetadata = (githubUrl: string): GitHubRepositoryMetadata => {
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
