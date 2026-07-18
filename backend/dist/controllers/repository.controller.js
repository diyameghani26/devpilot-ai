"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRepository = exports.deleteRepository = exports.updateRepository = exports.getRepositoryFileById = exports.getRepositoryTreeById = exports.scanRepositoryBugsById = exports.scanRepositoryDependenciesById = exports.getRepositoryAnalysisById = exports.analyzeRepositoryById = exports.getRepositoryById = exports.getRepositories = void 0;
const mongoose_1 = require("mongoose");
const repository_model_1 = __importDefault(require("../models/repository.model"));
const github_repository_metadata_service_1 = require("../services/github-repository-metadata.service");
const repository_analysis_service_1 = require("../services/repository-analysis.service");
const repository_file_explorer_service_1 = require("../services/repository-file-explorer.service");
const repository_dependency_scan_service_1 = require("../services/repository-dependency-scan.service");
const repository_bug_scan_service_1 = require("../services/repository-bug-scan.service");
const github_url_1 = require("../utils/github-url");
const getRepositories = async (_request, response, next) => {
    try {
        const repositories = await repository_model_1.default.find().sort({ createdAt: -1 });
        response.status(200).json({
            success: true,
            count: repositories.length,
            repositories,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getRepositories = getRepositories;
const getRepositoryById = async (request, response, next) => {
    const { id } = request.params;
    if (!(0, mongoose_1.isValidObjectId)(id)) {
        response.status(400).json({
            success: false,
            message: "Invalid repository ID",
        });
        return;
    }
    try {
        const repository = await repository_model_1.default.findById(id);
        if (!repository) {
            response.status(404).json({
                success: false,
                message: "Repository not found",
            });
            return;
        }
        response.status(200).json({
            success: true,
            repository,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getRepositoryById = getRepositoryById;
const analyzeRepositoryById = async (request, response, next) => {
    const { id } = request.params;
    if (!(0, mongoose_1.isValidObjectId)(id)) {
        response.status(400).json({ success: false, message: "Invalid repository ID" });
        return;
    }
    try {
        const repository = await (0, repository_analysis_service_1.analyzeRepository)(id);
        if (!repository) {
            response.status(404).json({ success: false, message: "Repository not found" });
            return;
        }
        response.status(200).json({ success: true, repository, analysis: repository.analysis });
    }
    catch (error) {
        next(error);
    }
};
exports.analyzeRepositoryById = analyzeRepositoryById;
const getRepositoryAnalysisById = async (request, response, next) => {
    const { id } = request.params;
    if (!(0, mongoose_1.isValidObjectId)(id)) {
        response.status(400).json({ success: false, message: "Invalid repository ID" });
        return;
    }
    try {
        const analysis = await (0, repository_analysis_service_1.getRepositoryAnalysis)(id);
        if (analysis === null) {
            response.status(404).json({ success: false, message: "Repository not found" });
            return;
        }
        if (!analysis) {
            response.status(404).json({ success: false, message: "Repository analysis not available" });
            return;
        }
        response.status(200).json({ success: true, analysis });
    }
    catch (error) {
        next(error);
    }
};
exports.getRepositoryAnalysisById = getRepositoryAnalysisById;
const scanRepositoryDependenciesById = async (request, response, next) => {
    if (!(0, mongoose_1.isValidObjectId)(request.params.id)) {
        response.status(400).json({ success: false, message: "Invalid repository ID" });
        return;
    }
    try {
        const scan = await (0, repository_dependency_scan_service_1.scanRepositoryDependencies)(request.params.id);
        if (!scan) {
            response.status(404).json({ success: false, message: "Repository not found" });
            return;
        }
        response.status(200).json({ success: true, scan });
    }
    catch (error) {
        next(error);
    }
};
exports.scanRepositoryDependenciesById = scanRepositoryDependenciesById;
const scanRepositoryBugsById = async (request, response, next) => {
    if (!(0, mongoose_1.isValidObjectId)(request.params.id)) {
        response.status(400).json({ success: false, message: "Invalid repository ID" });
        return;
    }
    try {
        const scan = await (0, repository_bug_scan_service_1.scanRepositoryBugs)(request.params.id);
        if (!scan) {
            response.status(404).json({ success: false, message: "Repository not found" });
            return;
        }
        response.status(200).json({ success: true, scan });
    }
    catch (error) {
        next(error);
    }
};
exports.scanRepositoryBugsById = scanRepositoryBugsById;
const getRepositoryTreeById = async (request, response, next) => {
    if (!(0, mongoose_1.isValidObjectId)(request.params.id)) {
        response.status(400).json({ success: false, message: "Invalid repository ID" });
        return;
    }
    try {
        const repositoryTree = await (0, repository_file_explorer_service_1.getRepositoryTree)(request.params.id);
        if (!repositoryTree) {
            response.status(404).json({ success: false, message: "Repository not found" });
            return;
        }
        response.status(200).json({ success: true, ...repositoryTree });
    }
    catch (error) {
        next(error);
    }
};
exports.getRepositoryTreeById = getRepositoryTreeById;
const getRepositoryFileById = async (request, response, next) => {
    if (!(0, mongoose_1.isValidObjectId)(request.params.id)) {
        response.status(400).json({ success: false, message: "Invalid repository ID" });
        return;
    }
    if (typeof request.query.path !== "string") {
        response.status(400).json({ success: false, message: "A repository file path is required" });
        return;
    }
    try {
        const file = await (0, repository_file_explorer_service_1.getRepositoryFile)(request.params.id, request.query.path);
        if (!file) {
            response.status(404).json({ success: false, message: "Repository not found" });
            return;
        }
        response.status(200).json({ success: true, file });
    }
    catch (error) {
        next(error);
    }
};
exports.getRepositoryFileById = getRepositoryFileById;
const updateRepository = async (request, response, next) => {
    const { id } = request.params;
    if (!(0, mongoose_1.isValidObjectId)(id)) {
        response.status(400).json({
            success: false,
            message: "Invalid repository ID",
        });
        return;
    }
    const allowedFields = ["name", "githubUrl", "branch", "status"];
    const updates = {};
    for (const field of allowedFields) {
        const value = request.body[field];
        if (value === undefined) {
            continue;
        }
        if (typeof value !== "string" || !value.trim()) {
            response.status(400).json({
                success: false,
                message: `${field} must be a non-empty string`,
            });
            return;
        }
        if (field === "githubUrl" && !(0, github_url_1.isValidGitHubRepositoryUrl)(value.trim())) {
            response.status(400).json({
                success: false,
                message: "Invalid GitHub repository URL",
            });
            return;
        }
        updates[field] = value.trim();
    }
    if (Object.keys(updates).length === 0) {
        response.status(400).json({
            success: false,
            message: "Provide at least one repository field to update",
        });
        return;
    }
    try {
        const repository = await repository_model_1.default.findByIdAndUpdate(id, updates, {
            new: true,
            runValidators: true,
        });
        if (!repository) {
            response.status(404).json({
                success: false,
                message: "Repository not found",
            });
            return;
        }
        response.status(200).json({
            success: true,
            repository,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateRepository = updateRepository;
const deleteRepository = async (request, response, next) => {
    const { id } = request.params;
    if (!(0, mongoose_1.isValidObjectId)(id)) {
        response.status(400).json({
            success: false,
            message: "Invalid repository ID",
        });
        return;
    }
    try {
        const repository = await repository_model_1.default.findByIdAndDelete(id);
        if (!repository) {
            response.status(404).json({
                success: false,
                message: "Repository not found",
            });
            return;
        }
        response.status(200).json({
            success: true,
            message: "Repository deleted successfully",
        });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteRepository = deleteRepository;
const createRepository = async (request, response, next) => {
    const { name, githubUrl, branch } = request.body;
    if (typeof name !== "string" || !name.trim() || typeof githubUrl !== "string" || !githubUrl.trim()) {
        response.status(400).json({
            success: false,
            message: "Name and GitHub URL are required",
        });
        return;
    }
    if (!(0, github_url_1.isValidGitHubRepositoryUrl)(githubUrl.trim())) {
        response.status(400).json({
            success: false,
            message: "Invalid GitHub repository URL",
        });
        return;
    }
    if (branch !== undefined && (typeof branch !== "string" || !branch.trim())) {
        response.status(400).json({
            success: false,
            message: "Branch must be a non-empty string",
        });
        return;
    }
    try {
        const metadata = (0, github_repository_metadata_service_1.getGitHubRepositoryMetadata)(githubUrl.trim());
        const repository = await repository_model_1.default.create({
            name: name.trim(),
            githubUrl: githubUrl.trim(),
            branch: branch?.trim() || metadata.defaultBranch,
        });
        response.status(201).json({
            success: true,
            data: repository,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createRepository = createRepository;
