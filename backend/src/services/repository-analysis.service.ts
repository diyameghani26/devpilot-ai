import Repository from "../models/repository.model";
import { getGitHubRepositoryMetadata } from "./github-repository-metadata.service";

export type RepositoryAnalysis = {
  primaryLanguage: string;
  repositorySizeEstimate: {
    value: number;
    unit: "KB";
  };
  fileCountEstimate: number;
  frameworks: string[];
  packageManager: "npm" | "yarn" | "pnpm" | "bun" | "pip";
  source: "github-metadata-mock";
  analyzedAt: Date;
};

type DetectedStack = Pick<RepositoryAnalysis, "primaryLanguage" | "frameworks" | "packageManager">;

const hash = (value: string): number =>
  [...value].reduce((total, character) => ((total * 31 + character.charCodeAt(0)) >>> 0), 0);

const detectStack = (repositoryName: string): DetectedStack => {
  const name = repositoryName.toLowerCase();

  if (name.includes("next")) {
    return { primaryLanguage: "TypeScript", frameworks: ["Next.js", "React", "Node.js"], packageManager: "pnpm" };
  }
  if (name.includes("react")) {
    return { primaryLanguage: "TypeScript", frameworks: ["React", "Node.js"], packageManager: "npm" };
  }
  if (name.includes("express") || name.includes("api") || name.includes("server")) {
    return { primaryLanguage: "TypeScript", frameworks: ["Express", "Node.js"], packageManager: "npm" };
  }
  if (name.includes("django")) {
    return { primaryLanguage: "Python", frameworks: ["Django"], packageManager: "pip" };
  }
  if (name.includes("flask")) {
    return { primaryLanguage: "Python", frameworks: ["Flask"], packageManager: "pip" };
  }
  if (name.includes("bun")) {
    return { primaryLanguage: "TypeScript", frameworks: ["Node.js"], packageManager: "bun" };
  }
  if (name.includes("yarn")) {
    return { primaryLanguage: "JavaScript", frameworks: ["Node.js"], packageManager: "yarn" };
  }

  return { primaryLanguage: "TypeScript", frameworks: ["Node.js"], packageManager: "npm" };
};

const createMockAnalysis = (githubUrl: string): RepositoryAnalysis => {
  const metadata = getGitHubRepositoryMetadata(githubUrl);
  const seed = hash(`${metadata.owner}/${metadata.repository}`);
  const stack = detectStack(metadata.repository);
  const fileCountEstimate = 40 + (seed % 960);

  return {
    ...stack,
    repositorySizeEstimate: {
      value: 180 + (seed % 9_820),
      unit: "KB",
    },
    fileCountEstimate,
    source: "github-metadata-mock",
    analyzedAt: new Date(),
  };
};

export const analyzeRepository = async (repositoryId: string) => {
  const repository = await Repository.findById(repositoryId);

  if (!repository) {
    return null;
  }

  await Repository.findByIdAndUpdate(repositoryId, { status: "analyzing" });

  try {
    // Cloning is intentionally deferred for Phase 1. This deterministic result is derived
    // from validated GitHub metadata and can be replaced by a repository scanner later.
    const analysis = createMockAnalysis(repository.githubUrl);
    const analyzedRepository = await Repository.findByIdAndUpdate(
      repositoryId,
      { status: "ready", analysis },
      { new: true, runValidators: true },
    );

    return analyzedRepository;
  } catch (error) {
    await Repository.findByIdAndUpdate(repositoryId, { status: "pending" });
    throw error;
  }
};

export const getRepositoryAnalysis = async (repositoryId: string) => {
  const repository = await Repository.findById(repositoryId);

  if (!repository) {
    return null;
  }

  return repository.analysis as RepositoryAnalysis | undefined;
};
