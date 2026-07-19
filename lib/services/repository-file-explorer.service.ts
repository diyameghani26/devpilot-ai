
import { getGitHubRepositoryMetadata } from "./github-repository-metadata.service";
import { 
  githubRequestCachedMetadata,
  githubRequestCachedTree,
  githubRequestCachedFile
} from "./github-client.service";

export type RepositoryTreeEntry = {
  path: string;
  type: "file" | "directory";
};

type GitHubRepositoryResponse = { default_branch: string };
type GitHubTreeEntry = { path: string; type: "blob" | "tree" | "commit" };
type GitHubTreeResponse = { tree: GitHubTreeEntry[] };
type GitHubContentResponse = { content?: string; encoding?: string; type?: string };

const isSafeRepositoryPath = (path: string): boolean =>
  Boolean(path) && !path.startsWith("/") && !path.split("/").some((segment) => !segment || segment === "." || segment === "..");

const encodeRepositoryPath = (path: string): string => path.split("/").map(encodeURIComponent).join("/");

export const getRepositoryTree = async (githubUrl: string, branch: string = "main") => {
  const metadata = getGitHubRepositoryMetadata(githubUrl);
  const repositoryPath = `/repos/${encodeURIComponent(metadata.owner)}/${encodeURIComponent(metadata.repository)}`;
  const githubRepository = await githubRequestCachedMetadata<GitHubRepositoryResponse>(repositoryPath);
  let ref = branch || metadata.defaultBranch || githubRepository.default_branch;

  let tree: GitHubTreeEntry[];
  try {
    const res = await githubRequestCachedTree<GitHubTreeResponse>(`${repositoryPath}/git/trees/${encodeURIComponent(ref)}?recursive=1`);
    tree = res.tree;
  } catch (error) {
    if (ref === githubRepository.default_branch) throw error;
    ref = githubRepository.default_branch;
    const res = await githubRequestCachedTree<GitHubTreeResponse>(`${repositoryPath}/git/trees/${encodeURIComponent(ref)}?recursive=1`);
    tree = res.tree;
  }

  return {
    branch: ref,
    tree: tree
      .filter((entry) => entry.type === "blob" || entry.type === "tree")
      .map<RepositoryTreeEntry>((entry) => ({ path: entry.path, type: entry.type === "tree" ? "directory" : "file" })),
  };
};

export const getRepositoryFile = async (githubUrl: string, path: string, branch: string = "main") => {
  if (!isSafeRepositoryPath(path)) throw new Error("Invalid repository file path");

  const metadata = getGitHubRepositoryMetadata(githubUrl);
  const repositoryPath = `/repos/${encodeURIComponent(metadata.owner)}/${encodeURIComponent(metadata.repository)}`;
  const githubRepository = await githubRequestCachedMetadata<GitHubRepositoryResponse>(repositoryPath);
  let ref = branch || metadata.defaultBranch || githubRepository.default_branch;

  let result: GitHubContentResponse;
  try {
    result = await githubRequestCachedFile<GitHubContentResponse>(
      `${repositoryPath}/contents/${encodeRepositoryPath(path)}?ref=${encodeURIComponent(ref)}`
    );
  } catch (error) {
    if (ref === githubRepository.default_branch) throw error;
    ref = githubRepository.default_branch;
    result = await githubRequestCachedFile<GitHubContentResponse>(
      `${repositoryPath}/contents/${encodeRepositoryPath(path)}?ref=${encodeURIComponent(ref)}`
    );
  }

  if (result.type !== "file" || result.encoding !== "base64" || !result.content) {
    throw new Error("GitHub did not return readable file content");
  }

  return { branch: ref, path, content: Buffer.from(result.content, "base64").toString("utf8") };
};
