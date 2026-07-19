import { GoogleGenAI } from "@google/genai";
import { getGitHubRepositoryMetadata } from "./github-repository-metadata.service";
import { 
  githubRequestCachedMetadata,
  githubRequestCachedTree,
  githubRequestCachedFile
} from "./github-client.service";

export type BugSeverity = "Critical" | "High" | "Medium" | "Low";
export type BugFinding = { id: string; severity: BugSeverity; title: string; file: string; line: number; category: string; explanation: string; impact: string; fix: string; before: string; after: string };
export type RepositoryBugScan = { branch: string; analyzedAt: Date; sourceFileCount: number; lineCount: number; findings: BugFinding[] };

type GitHubRepositoryResponse = { default_branch: string };
type GitTreeEntry = { path: string; type: "blob" | "tree" | "commit" };
type GitTreeResponse = { tree: GitTreeEntry[] };
type GitHubContentResponse = { content?: string; encoding?: string; type?: string };

const sourceExtensions = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".py"]);
const maxFiles = 20; // Reduced to fit AI context more easily
const ignoredDirectories = new Set(["node_modules", ".next", "dist", "build", "coverage", "vendor"]);

const extension = (path: string) => { const name = path.split("/").pop() ?? ""; return name.slice(name.lastIndexOf(".")).toLowerCase(); };
const encodePath = (path: string) => path.split("/").map(encodeURIComponent).join("/");

export const scanRepositoryBugs = async (githubUrl: string, branchParam: string = "main"): Promise<RepositoryBugScan | null> => {
  const metadata = getGitHubRepositoryMetadata(githubUrl);
  const repositoryPath = `/repos/${encodeURIComponent(metadata.owner)}/${encodeURIComponent(metadata.repository)}`;
  const githubRepository = await githubRequestCachedMetadata<GitHubRepositoryResponse>(repositoryPath);
  let branch = branchParam || metadata.defaultBranch || githubRepository.default_branch;
  let tree: GitTreeEntry[];
  try { tree = (await githubRequestCachedTree<GitTreeResponse>(`${repositoryPath}/git/trees/${encodeURIComponent(branch)}?recursive=1`)).tree; }
  catch (error) { if (branch === githubRepository.default_branch) throw error; branch = githubRepository.default_branch; tree = (await githubRequestCachedTree<GitTreeResponse>(`${repositoryPath}/git/trees/${encodeURIComponent(branch)}?recursive=1`)).tree; }
  
  const paths = tree.filter((entry) => entry.type === "blob" && sourceExtensions.has(extension(entry.path)) && !entry.path.split("/").some((segment) => ignoredDirectories.has(segment))).map((entry) => entry.path).slice(0, maxFiles);
  const files = await Promise.all(paths.map(async (path) => {
    const result = await githubRequestCachedFile<GitHubContentResponse>(`${repositoryPath}/contents/${encodePath(path)}?ref=${encodeURIComponent(branch)}`);
    return result.type === "file" && result.encoding === "base64" && result.content ? { path, content: Buffer.from(result.content, "base64").toString("utf8") } : null;
  }));
  
  const readableFiles = files.filter((file): file is { path: string; content: string } => file !== null);
  
  let findings: BugFinding[] = [];
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const prompt = `Analyze these source files for code smells, potential bugs, and bad practices. Return a JSON array of findings with this exact structure: [{ "id": "unique-id", "severity": "Critical"|"High"|"Medium"|"Low", "title": "string", "file": "filepath", "line": number, "category": "string", "explanation": "string", "impact": "string", "fix": "string", "before": "string", "after": "string" }]. Do NOT wrap in markdown, return pure JSON array. \n\nFiles:\n${readableFiles.map(f => `--- ${f.path} ---\n${f.content}`).join("\n\n")}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    
    const text = response.text || "[]";
    const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
    findings = JSON.parse(cleaned);
  } catch (error) {
    console.error("Gemini bug scan failed", error);
  }

  return { 
    branch, 
    analyzedAt: new Date(), 
    sourceFileCount: readableFiles.length, 
    lineCount: readableFiles.reduce((total, file) => total + file.content.split("\n").length, 0), 
    findings: findings.slice(0, 50) 
  };
};
