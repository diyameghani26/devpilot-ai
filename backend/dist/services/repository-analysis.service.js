"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRepositoryAnalysis = exports.analyzeRepository = void 0;
const repository_model_1 = __importDefault(require("../models/repository.model"));
const github_repository_metadata_service_1 = require("./github-repository-metadata.service");
const hash = (value) => [...value].reduce((total, character) => ((total * 31 + character.charCodeAt(0)) >>> 0), 0);
const detectStack = (repositoryName) => {
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
const createMockAnalysis = (githubUrl) => {
    const metadata = (0, github_repository_metadata_service_1.getGitHubRepositoryMetadata)(githubUrl);
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
const analyzeRepository = async (repositoryId) => {
    const repository = await repository_model_1.default.findById(repositoryId);
    if (!repository) {
        return null;
    }
    await repository_model_1.default.findByIdAndUpdate(repositoryId, { status: "analyzing" });
    try {
        // Cloning is intentionally deferred for Phase 1. This deterministic result is derived
        // from validated GitHub metadata and can be replaced by a repository scanner later.
        const analysis = createMockAnalysis(repository.githubUrl);
        const analyzedRepository = await repository_model_1.default.findByIdAndUpdate(repositoryId, { status: "ready", analysis }, { new: true, runValidators: true });
        return analyzedRepository;
    }
    catch (error) {
        await repository_model_1.default.findByIdAndUpdate(repositoryId, { status: "pending" });
        throw error;
    }
};
exports.analyzeRepository = analyzeRepository;
const getRepositoryAnalysis = async (repositoryId) => {
    const repository = await repository_model_1.default.findById(repositoryId);
    if (!repository) {
        return null;
    }
    return repository.analysis;
};
exports.getRepositoryAnalysis = getRepositoryAnalysis;
