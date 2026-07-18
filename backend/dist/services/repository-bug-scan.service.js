"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.scanRepositoryBugs = void 0;
const repository_model_1 = __importDefault(require("../models/repository.model"));
const env_1 = require("../config/env");
const github_repository_metadata_service_1 = require("./github-repository-metadata.service");
const sourceExtensions = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".py"]);
const maxFiles = 40;
const ignoredDirectories = new Set(["node_modules", ".next", "dist", "build", "coverage", "vendor"]);
const githubRequest = async (path) => {
    const response = await fetch(`https://api.github.com${path}`, { headers: { Accept: "application/vnd.github+json", "User-Agent": "DevPilot-AI", "X-GitHub-Api-Version": "2022-11-28", ...(env_1.env.githubToken ? { Authorization: `Bearer ${env_1.env.githubToken}` } : {}) } });
    if (!response.ok) {
        const message = await response.json().then((body) => body.message).catch(() => undefined);
        throw new Error(`GitHub API request failed (${response.status}): ${message ?? response.statusText}`);
    }
    return response.json();
};
const extension = (path) => { const name = path.split("/").pop() ?? ""; return name.slice(name.lastIndexOf(".")).toLowerCase(); };
const lineAt = (content, index) => content.slice(0, index).split("\n").length;
const snippetAt = (content, line) => content.split("\n")[line - 1]?.trim() || "";
const encodePath = (path) => path.split("/").map(encodeURIComponent).join("/");
const findIssues = (path, content) => {
    const findings = [];
    const jsonPattern = /JSON\.parse\s*\(/g;
    for (const match of content.matchAll(jsonPattern)) {
        const index = match.index ?? 0;
        const preceding = content.slice(Math.max(0, index - 500), index);
        if (/\btry\s*\{[^}]*$/s.test(preceding))
            continue;
        const line = lineAt(content, index);
        findings.push({ id: `${path}:json:${line}`, severity: "Medium", title: "JSON parsing can throw outside an error boundary", file: path, line, category: "Error handling", explanation: "This JSON.parse call is not within a nearby try/catch block, so malformed input can terminate the current request or interaction.", impact: "Unexpected or corrupted data can cause a user-visible failure instead of a recoverable error.", fix: "Catch parsing failures and return a controlled fallback or error state.", before: snippetAt(content, line), after: "try {\n  const value = JSON.parse(input);\n} catch {\n  // handle invalid JSON\n}" });
    }
    const intervalPattern = /(?:window\.)?setInterval\s*\(/g;
    for (const match of content.matchAll(intervalPattern)) {
        if (/clearInterval\s*\(/.test(content))
            continue;
        const line = lineAt(content, match.index ?? 0);
        findings.push({ id: `${path}:interval:${line}`, severity: "High", title: "Interval is created without visible cleanup", file: path, line, category: "Lifecycle", explanation: "This file starts an interval but does not clear it. The callback can continue after its owning view or request is no longer active.", impact: "Stale callbacks can update disposed state, leak resources, or perform duplicate work.", fix: "Store the interval handle and clear it from the relevant cleanup path.", before: snippetAt(content, line), after: "const timer = window.setInterval(run, 1000);\nreturn () => window.clearInterval(timer);" });
    }
    const asyncMapPattern = /\.map\s*\(\s*async\b/g;
    for (const match of content.matchAll(asyncMapPattern)) {
        const index = match.index ?? 0;
        const surrounding = content.slice(Math.max(0, index - 80), index + 240);
        if (/Promise\.all\s*\(/.test(surrounding))
            continue;
        const line = lineAt(content, index);
        findings.push({ id: `${path}:async-map:${line}`, severity: "Medium", title: "Async map results are not visibly awaited", file: path, line, category: "Async control flow", explanation: "Array.map with an async callback creates promises. No nearby Promise.all call was detected to await their completion.", impact: "Follow-up code can run before the mapped work finishes and rejected promises can be missed.", fix: "Await Promise.all around the mapped callbacks when their work must complete before continuing.", before: snippetAt(content, line), after: "await Promise.all(items.map(async (item) => {\n  await process(item);\n}));" });
    }
    return findings;
};
const scanRepositoryBugs = async (repositoryId) => {
    const repository = await repository_model_1.default.findById(repositoryId);
    if (!repository)
        return null;
    const metadata = (0, github_repository_metadata_service_1.getGitHubRepositoryMetadata)(repository.githubUrl);
    const repositoryPath = `/repos/${encodeURIComponent(metadata.owner)}/${encodeURIComponent(metadata.repository)}`;
    const githubRepository = await githubRequest(repositoryPath);
    let branch = repository.branch || metadata.defaultBranch || githubRepository.default_branch;
    let tree;
    try {
        tree = (await githubRequest(`${repositoryPath}/git/trees/${encodeURIComponent(branch)}?recursive=1`)).tree;
    }
    catch (error) {
        if (branch === githubRepository.default_branch)
            throw error;
        branch = githubRepository.default_branch;
        tree = (await githubRequest(`${repositoryPath}/git/trees/${encodeURIComponent(branch)}?recursive=1`)).tree;
    }
    const paths = tree.filter((entry) => entry.type === "blob" && sourceExtensions.has(extension(entry.path)) && !entry.path.split("/").some((segment) => ignoredDirectories.has(segment))).map((entry) => entry.path).slice(0, maxFiles);
    const files = await Promise.all(paths.map(async (path) => {
        const result = await githubRequest(`${repositoryPath}/contents/${encodePath(path)}?ref=${encodeURIComponent(branch)}`);
        return result.type === "file" && result.encoding === "base64" && result.content ? { path, content: Buffer.from(result.content, "base64").toString("utf8") } : null;
    }));
    const readableFiles = files.filter((file) => file !== null);
    return { branch, analyzedAt: new Date(), sourceFileCount: readableFiles.length, lineCount: readableFiles.reduce((total, file) => total + file.content.split("\n").length, 0), findings: readableFiles.flatMap((file) => findIssues(file.path, file.content)).slice(0, 50) };
};
exports.scanRepositoryBugs = scanRepositoryBugs;
