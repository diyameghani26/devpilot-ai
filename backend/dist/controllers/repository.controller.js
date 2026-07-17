"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRepository = exports.deleteRepository = exports.updateRepository = exports.getRepositoryById = exports.getRepositories = void 0;
const mongoose_1 = require("mongoose");
const repository_model_1 = __importDefault(require("../models/repository.model"));
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
    if (branch !== undefined && (typeof branch !== "string" || !branch.trim())) {
        response.status(400).json({
            success: false,
            message: "Branch must be a non-empty string",
        });
        return;
    }
    try {
        const repository = await repository_model_1.default.create({
            name: name.trim(),
            githubUrl: githubUrl.trim(),
            ...(branch ? { branch: branch.trim() } : {}),
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
