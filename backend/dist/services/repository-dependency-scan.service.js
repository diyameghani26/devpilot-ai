"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.scanRepositoryDependencies = void 0;
const repository_model_1 = __importDefault(require("../models/repository.model"));
const repository_file_explorer_service_1 = require("./repository-file-explorer.service");
const github_api_error_1 = require("../utils/github-api-error");
const dependencyGroups = ["dependencies", "devDependencies", "peerDependencies", "optionalDependencies"];
const asStringRecord = (value) => Object.fromEntries(Object.entries(value ?? {}).filter((entry) => typeof entry[1] === "string"));
const lineForDependency = (packageJson, name) => {
    const index = packageJson.indexOf(`\"${name}\"`);
    return index === -1 ? 1 : packageJson.slice(0, index).split("\n").length;
};
const dependencyFinding = (name, version, line) => {
    if (version === "*" || version.toLowerCase() === "latest") {
        return {
            id: `${name}-unbounded`, severity: "Medium", kind: "Unbounded dependency version",
            title: `${name} can resolve to an unexpected release`, file: "package.json", line,
            explanation: `The ${name} dependency is declared as ${version}, so installs are not constrained to a reviewed version.`,
            risk: "A future release could change behavior or introduce a vulnerability without a package.json change.",
            fix: "Pin the dependency to a reviewed version and commit the package manager lockfile.",
            before: `\"${name}\": \"${version}\"`, after: `\"${name}\": \"<reviewed-version>\"`,
        };
    }
    if (/^(?:git\+|github:|https?:\/\/)/i.test(version)) {
        return {
            id: `${name}-remote-source`, severity: "Medium", kind: "Remote dependency source",
            title: `${name} is installed from a mutable remote source`, file: "package.json", line,
            explanation: `The ${name} dependency points to ${version} instead of a registry release.`,
            risk: "The remote source can change independently of normal package version review.",
            fix: "Use a signed, immutable commit reference or a reviewed registry release.",
            before: `\"${name}\": \"${version}\"`, after: `\"${name}\": \"<reviewed-version>\"`,
        };
    }
    if (/^(?:file:|link:|workspace:)/i.test(version)) {
        return {
            id: `${name}-local-source`, severity: "Low", kind: "Local dependency source",
            title: `${name} resolves from a local workspace source`, file: "package.json", line,
            explanation: `The ${name} dependency uses ${version}, which cannot be independently resolved from a public registry.`,
            risk: "Builds may differ when the referenced workspace content is unavailable or changes outside dependency review.",
            fix: "Keep the workspace source under review and use a lockfile that records the resolved dependency graph.",
            before: `\"${name}\": \"${version}\"`, after: `\"${name}\": \"<reviewed-version>\"`,
        };
    }
    return null;
};
const scanRepositoryDependencies = async (repositoryId) => {
    const repository = await repository_model_1.default.findById(repositoryId);
    if (!repository)
        return null;
    let packageFile;
    try {
        packageFile = await (0, repository_file_explorer_service_1.getRepositoryFile)(repositoryId, "package.json");
    }
    catch (error) {
        if (error instanceof github_api_error_1.GitHubApiError && error.statusCode === 404) {
            repository.dependencyIssueCount = 0;
            await repository.save();
            return { branch: repository.branch, analyzedAt: new Date(), dependencyCount: 0, findings: [], score: 100 };
        }
        throw error;
    }
    if (!packageFile)
        return null;
    let parsed;
    try {
        parsed = JSON.parse(packageFile.content);
    }
    catch {
        throw new Error("The repository package.json could not be parsed");
    }
    const dependencies = dependencyGroups.flatMap((group) => Object.entries(asStringRecord(parsed[group])));
    const findings = dependencies
        .map(([name, version]) => dependencyFinding(name, version, lineForDependency(packageFile.content, name)))
        .filter((finding) => finding !== null);
    const penalty = findings.reduce((total, finding) => total + (finding.severity === "Critical" ? 35 : finding.severity === "High" ? 20 : finding.severity === "Medium" ? 10 : 4), 0);
    repository.dependencyIssueCount = findings.length;
    await repository.save();
    return {
        branch: packageFile.branch,
        analyzedAt: new Date(),
        dependencyCount: dependencies.length,
        findings,
        score: Math.max(0, 100 - penalty),
    };
};
exports.scanRepositoryDependencies = scanRepositoryDependencies;
