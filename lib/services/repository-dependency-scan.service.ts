import { GoogleGenAI } from "@google/genai";
import { getRepositoryFile } from "./repository-file-explorer.service";

export type DependencySeverity = "Critical" | "High" | "Medium" | "Low";

export type DependencyFinding = {
  id: string;
  severity: DependencySeverity;
  kind: string;
  title: string;
  file: string;
  line: number;
  explanation: string;
  risk: string;
  fix: string;
  before: string;
  after: string;
};

export type RepositoryDependencyScan = {
  branch: string;
  analyzedAt: Date;
  dependencyCount: number;
  findings: DependencyFinding[];
  score: number;
};

export const scanRepositoryDependencies = async (githubUrl: string, branch: string = "main"): Promise<RepositoryDependencyScan | null> => {
  let packageFile;
  try {
    packageFile = await getRepositoryFile(githubUrl, "package.json", branch);
  } catch {
    return { branch, analyzedAt: new Date(), dependencyCount: 0, findings: [], score: 100 };
  }

  if (!packageFile) return null;

  let parsed: any;
  try {
    parsed = JSON.parse(packageFile.content);
  } catch {
    throw new Error("The repository package.json could not be parsed");
  }

  const deps = { ...parsed.dependencies, ...parsed.devDependencies, ...parsed.peerDependencies, ...parsed.optionalDependencies };
  const dependencyCount = Object.keys(deps).length;
  let findings: DependencyFinding[] = [];

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const prompt = `Analyze this package.json for dependency risks (unbounded versions, remote sources, known insecure packages). Return a JSON array of findings with this exact structure: [{ "id": "unique-id", "severity": "Critical"|"High"|"Medium"|"Low", "kind": "string", "title": "string", "file": "package.json", "line": number, "explanation": "string", "risk": "string", "fix": "string", "before": "string", "after": "string" }]. Do NOT wrap in markdown, return pure JSON array. \n\n${packageFile.content}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    
    const text = response.text || "[]";
    const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
    findings = JSON.parse(cleaned);
  } catch (error) {
    console.error("Gemini dependency scan failed", error);
  }

  const penalty = findings.reduce((total, finding) => total + (finding.severity === "Critical" ? 35 : finding.severity === "High" ? 20 : finding.severity === "Medium" ? 10 : 4), 0);

  return {
    branch: packageFile.branch,
    analyzedAt: new Date(),
    dependencyCount,
    findings,
    score: Math.max(0, 100 - penalty),
  };
};
