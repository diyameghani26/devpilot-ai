const githubOwnerPattern = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})$/;
const githubRepositoryPattern = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;

export const isValidGitHubRepositoryUrl = (value: string): boolean => {
  try {
    const url = new URL(value);

    if (
      url.protocol !== "https:" ||
      url.hostname !== "github.com" ||
      url.username ||
      url.password ||
      url.search ||
      url.hash
    ) {
      return false;
    }

    const pathSegments = url.pathname.split("/").filter(Boolean);

    const isRepositoryRootUrl = pathSegments.length === 2;
    const isBranchUrl =
      pathSegments.length >= 4 &&
      pathSegments[2] === "tree" &&
      pathSegments.slice(3).every(Boolean);

    if (!isRepositoryRootUrl && !isBranchUrl) {
      return false;
    }

    const [owner, repositoryWithExtension] = pathSegments;
    const repository = repositoryWithExtension.replace(/\.git$/i, "");

    return githubOwnerPattern.test(owner) && githubRepositoryPattern.test(repository);
  } catch {
    return false;
  }
};
