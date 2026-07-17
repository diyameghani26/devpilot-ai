"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRepository = exports.getRepositories = void 0;
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
