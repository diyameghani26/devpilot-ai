"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRepositoryAnalysis = exports.analyzeRepository = void 0;
const repository_model_1 = __importDefault(require("../models/repository.model"));
const github_repository_metadata_service_1 = require("./github-repository-metadata.service");
const env_1 = require("../config/env");
const languageExtensions = {
    ".ts": "TypeScript", ".tsx": "TypeScript", ".js": "JavaScript", ".jsx": "JavaScript",
    ".py": "Python", ".java": "Java", ".go": "Go", ".rs": "Rust", ".rb": "Ruby",
    ".php": "PHP", ".cs": "C#", ".cpp": "C++", ".c": "C", ".vue": "Vue",
};
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
const getExtension = (path) => {
    const name = path.split("/").pop() ?? "";
    const extensionStart = name.lastIndexOf(".");
    return extensionStart === -1 ? "" : name.slice(extensionStart).toLowerCase();
};
const asStringRecord = (value) => Object.fromEntries(Object.entries(value ?? {}).filter((entry) => typeof entry[1] === "string"));
const detectPackageManager = (paths) => {
    if (paths.has("bun.lockb") || paths.has("bun.lock"))
        return "bun";
    if (paths.has("pnpm-lock.yaml"))
        return "pnpm";
    if (paths.has("yarn.lock"))
        return "yarn";
    if (paths.has("package-lock.json") || paths.has("npm-shrinkwrap.json"))
        return "npm";
    if (paths.has("requirements.txt") || paths.has("poetry.lock") || paths.has("Pipfile.lock"))
        return "pip";
    if (paths.has("package.json"))
        return "npm";
    return "unknown";
};
const detectFrameworks = (dependencies, paths) => {
    const packages = new Set(Object.keys(dependencies));
    const frameworks = new Set();
    const hasPath = (prefix) => [...paths].some((path) => path.startsWith(prefix));
    if (packages.has("next") || [...paths].some((path) => /^next\.config\./.test(path)))
        frameworks.add("Next.js");
    if (packages.has("react") || packages.has("react-dom"))
        frameworks.add("React");
    if (packages.has("vite") || [...paths].some((path) => /^vite\.config\./.test(path)))
        frameworks.add("Vite");
    if (packages.has("express"))
        frameworks.add("Express");
    if (packages.has("vue") || hasPath("src/") && [...paths].some((path) => path.endsWith(".vue")))
        frameworks.add("Vue");
    if (packages.has("@angular/core") || paths.has("angular.json"))
        frameworks.add("Angular");
    if (packages.has("svelte") || paths.has("svelte.config.js"))
        frameworks.add("Svelte");
    if (packages.has("django") || paths.has("manage.py"))
        frameworks.add("Django");
    if (packages.has("flask"))
        frameworks.add("Flask");
    if (Object.keys(dependencies).length > 0 || [...paths].some((path) => /\.(?:cjs|mjs|js|ts)$/.test(path)))
        frameworks.add("Node.js");
    return [...frameworks];
};
const findPrimaryLanguage = (entries) => {
    const counts = new Map();
    for (const entry of entries) {
        if (entry.type !== "blob")
            continue;
        const language = languageExtensions[getExtension(entry.path)];
        if (language)
            counts.set(language, (counts.get(language) ?? 0) + 1);
    }
    return [...counts.entries()].sort(([, left], [, right]) => right - left)[0]?.[0] ?? "Unknown";
};
const parsePackageJson = (content) => {
    if (!content || typeof content !== "object" || Array.isArray(content))
        return {};
    return content;
};
const getCompleteTree = async (repositoryPath, ref) => {
    const recursiveTree = await githubRequest(`${repositoryPath}/git/trees/${encodeURIComponent(ref)}?recursive=1`);
    if (!recursiveTree.truncated)
        return recursiveTree.tree;
    const completeTree = [];
    const visitTree = async (treeRef, prefix = "") => {
        const tree = await githubRequest(`${repositoryPath}/git/trees/${encodeURIComponent(treeRef)}`);
        for (const entry of tree.tree) {
            const path = `${prefix}${entry.path}`;
            if (entry.type === "tree") {
                await visitTree(entry.sha, `${path}/`);
            }
            else {
                completeTree.push({ ...entry, path });
            }
        }
    };
    await visitTree(ref);
    return completeTree;
};
const createGitHubAnalysis = async (githubUrl, branch) => {
    const metadata = (0, github_repository_metadata_service_1.getGitHubRepositoryMetadata)(githubUrl);
    const repositoryPath = `/repos/${encodeURIComponent(metadata.owner)}/${encodeURIComponent(metadata.repository)}`;
    const repository = await githubRequest(repositoryPath);
    let ref = branch || metadata.defaultBranch || repository.default_branch;
    let tree;
    try {
        tree = await getCompleteTree(repositoryPath, ref);
    }
    catch (error) {
        // Older records defaulted to "main" before GitHub metadata was retrieved. Fall back
        // to GitHub's current default branch when that stored branch no longer exists.
        if (ref === repository.default_branch)
            throw error;
        ref = repository.default_branch;
        tree = await getCompleteTree(repositoryPath, ref);
    }
    const paths = new Set(tree.map((entry) => entry.path));
    let packageJson = {};
    if (paths.has("package.json")) {
        const packageFile = await githubRequest(`${repositoryPath}/contents/package.json?ref=${encodeURIComponent(ref)}`);
        if (packageFile.encoding !== "base64" || !packageFile.content) {
            throw new Error("GitHub returned package.json in an unsupported format");
        }
        packageJson = parsePackageJson(JSON.parse(Buffer.from(packageFile.content, "base64").toString("utf8")));
    }
    const dependencies = {
        ...asStringRecord(packageJson.dependencies),
        ...asStringRecord(packageJson.devDependencies),
        ...asStringRecord(packageJson.peerDependencies),
        ...asStringRecord(packageJson.optionalDependencies),
    };
    return {
        repositorySizeEstimate: {
            value: repository.size,
            unit: "KB",
        },
        fileCountEstimate: tree.filter((entry) => entry.type === "blob").length,
        primaryLanguage: findPrimaryLanguage(tree),
        frameworks: detectFrameworks(dependencies, paths),
        packageManager: detectPackageManager(paths),
        dependencies,
        scripts: asStringRecord(packageJson.scripts),
        source: "github-rest-api",
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
        const analysis = await createGitHubAnalysis(repository.githubUrl, repository.branch);
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
