"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRepositoryFile = exports.getRepositoryTree = void 0;
const repository_model_1 = __importDefault(require("../models/repository.model"));
const env_1 = require("../config/env");
const github_repository_metadata_service_1 = require("./github-repository-metadata.service");
const githubRequest = async (path) => {
    const response = await fetch(`https://api.github.com${path}`, {
        headers: {
            Accept: "application/vnd.github+json",
            "User-Agent": "DevPilot-AI",
            "X-GitHub-Api-Version": "2022-11-28",
            ...(env_1.env.githubToken ? { Authorization: `Bearer ${env_1.env.githubToken}` } : {}),
        },
    });
    if (!response.ok) {
        const message = await response.json().then((body) => body.message).catch(() => undefined);
        throw new Error(`GitHub API request failed (${response.status}): ${message ?? response.statusText}`);
    }
    return response.json();
};
const getRepositoryContext = async (repositoryId) => {
    const repository = await repository_model_1.default.findById(repositoryId);
    if (!repository)
        return null;
    const metadata = (0, github_repository_metadata_service_1.getGitHubRepositoryMetadata)(repository.githubUrl);
    const repositoryPath = `/repos/${encodeURIComponent(metadata.owner)}/${encodeURIComponent(metadata.repository)}`;
    const githubRepository = await githubRequest(repositoryPath);
    const preferredBranch = repository.branch || metadata.defaultBranch;
    return { repositoryPath, preferredBranch, defaultBranch: githubRepository.default_branch };
};
const withResolvedBranch = async (context, request) => {
    try {
        return { branch: context.preferredBranch, result: await request(context.preferredBranch) };
    }
    catch (error) {
        if (context.preferredBranch === context.defaultBranch)
            throw error;
        return { branch: context.defaultBranch, result: await request(context.defaultBranch) };
    }
};
const isSafeRepositoryPath = (path) => Boolean(path) && !path.startsWith("/") && !path.split("/").some((segment) => !segment || segment === "." || segment === "..");
const encodeRepositoryPath = (path) => path.split("/").map(encodeURIComponent).join("/");
const getRepositoryTree = async (repositoryId) => {
    const context = await getRepositoryContext(repositoryId);
    if (!context)
        return null;
    const { branch, result } = await withResolvedBranch(context, (ref) => githubRequest(`${context.repositoryPath}/git/trees/${encodeURIComponent(ref)}?recursive=1`));
    return {
        branch,
        tree: result.tree
            .filter((entry) => entry.type === "blob" || entry.type === "tree")
            .map((entry) => ({ path: entry.path, type: entry.type === "tree" ? "directory" : "file" })),
    };
};
exports.getRepositoryTree = getRepositoryTree;
const getRepositoryFile = async (repositoryId, path) => {
    if (!isSafeRepositoryPath(path))
        throw new Error("Invalid repository file path");
    const context = await getRepositoryContext(repositoryId);
    if (!context)
        return null;
    const { branch, result } = await withResolvedBranch(context, (ref) => githubRequest(`${context.repositoryPath}/contents/${encodeRepositoryPath(path)}?ref=${encodeURIComponent(ref)}`));
    if (result.type !== "file" || result.encoding !== "base64" || !result.content) {
        throw new Error("GitHub did not return readable file content");
    }
    return { branch, path, content: Buffer.from(result.content, "base64").toString("utf8") };
};
exports.getRepositoryFile = getRepositoryFile;
