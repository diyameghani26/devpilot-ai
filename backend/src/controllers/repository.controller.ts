import { RequestHandler } from "express";
import { isValidObjectId } from "mongoose";

import Repository from "../models/repository.model";
import { getGitHubRepositoryMetadata } from "../services/github-repository-metadata.service";
import { analyzeRepository, getRepositoryAnalysis } from "../services/repository-analysis.service";
import { getRepositoryFile, getRepositoryTree } from "../services/repository-file-explorer.service";
import { scanRepositoryDependencies } from "../services/repository-dependency-scan.service";
import { isValidGitHubRepositoryUrl } from "../utils/github-url";

type CreateRepositoryBody = {
  name?: unknown;
  githubUrl?: unknown;
  branch?: unknown;
};

type UpdateRepositoryBody = {
  name?: unknown;
  githubUrl?: unknown;
  branch?: unknown;
  status?: unknown;
};

export const getRepositories: RequestHandler = async (_request, response, next) => {
  try {
    const repositories = await Repository.find().sort({ createdAt: -1 });

    response.status(200).json({
      success: true,
      count: repositories.length,
      repositories,
    });
  } catch (error) {
    next(error);
  }
};

export const getRepositoryById: RequestHandler<{ id: string }> = async (request, response, next) => {
  const { id } = request.params;

  if (!isValidObjectId(id)) {
    response.status(400).json({
      success: false,
      message: "Invalid repository ID",
    });
    return;
  }

  try {
    const repository = await Repository.findById(id);

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
  } catch (error) {
    next(error);
  }
};

export const analyzeRepositoryById: RequestHandler<{ id: string }> = async (request, response, next) => {
  const { id } = request.params;

  if (!isValidObjectId(id)) {
    response.status(400).json({ success: false, message: "Invalid repository ID" });
    return;
  }

  try {
    const repository = await analyzeRepository(id);

    if (!repository) {
      response.status(404).json({ success: false, message: "Repository not found" });
      return;
    }

    response.status(200).json({ success: true, repository, analysis: repository.analysis });
  } catch (error) {
    next(error);
  }
};

export const getRepositoryAnalysisById: RequestHandler<{ id: string }> = async (request, response, next) => {
  const { id } = request.params;

  if (!isValidObjectId(id)) {
    response.status(400).json({ success: false, message: "Invalid repository ID" });
    return;
  }

  try {
    const analysis = await getRepositoryAnalysis(id);

    if (analysis === null) {
      response.status(404).json({ success: false, message: "Repository not found" });
      return;
    }
    if (!analysis) {
      response.status(404).json({ success: false, message: "Repository analysis not available" });
      return;
    }

    response.status(200).json({ success: true, analysis });
  } catch (error) {
    next(error);
  }
};

export const scanRepositoryDependenciesById: RequestHandler<{ id: string }> = async (request, response, next) => {
  if (!isValidObjectId(request.params.id)) {
    response.status(400).json({ success: false, message: "Invalid repository ID" });
    return;
  }

  try {
    const scan = await scanRepositoryDependencies(request.params.id);
    if (!scan) {
      response.status(404).json({ success: false, message: "Repository not found" });
      return;
    }
    response.status(200).json({ success: true, scan });
  } catch (error) {
    next(error);
  }
};

export const getRepositoryTreeById: RequestHandler<{ id: string }> = async (request, response, next) => {
  if (!isValidObjectId(request.params.id)) {
    response.status(400).json({ success: false, message: "Invalid repository ID" });
    return;
  }

  try {
    const repositoryTree = await getRepositoryTree(request.params.id);
    if (!repositoryTree) {
      response.status(404).json({ success: false, message: "Repository not found" });
      return;
    }
    response.status(200).json({ success: true, ...repositoryTree });
  } catch (error) {
    next(error);
  }
};

export const getRepositoryFileById: RequestHandler<{ id: string }, unknown, unknown, { path?: string }> = async (request, response, next) => {
  if (!isValidObjectId(request.params.id)) {
    response.status(400).json({ success: false, message: "Invalid repository ID" });
    return;
  }
  if (typeof request.query.path !== "string") {
    response.status(400).json({ success: false, message: "A repository file path is required" });
    return;
  }

  try {
    const file = await getRepositoryFile(request.params.id, request.query.path);
    if (!file) {
      response.status(404).json({ success: false, message: "Repository not found" });
      return;
    }
    response.status(200).json({ success: true, file });
  } catch (error) {
    next(error);
  }
};

export const updateRepository: RequestHandler<{ id: string }, unknown, UpdateRepositoryBody> = async (
  request,
  response,
  next,
) => {
  const { id } = request.params;

  if (!isValidObjectId(id)) {
    response.status(400).json({
      success: false,
      message: "Invalid repository ID",
    });
    return;
  }

  const allowedFields = ["name", "githubUrl", "branch", "status"] as const;
  const updates: Partial<Record<(typeof allowedFields)[number], string>> = {};

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

    if (field === "githubUrl" && !isValidGitHubRepositoryUrl(value.trim())) {
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
    const repository = await Repository.findByIdAndUpdate(id, updates, {
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
  } catch (error) {
    next(error);
  }
};

export const deleteRepository: RequestHandler<{ id: string }> = async (request, response, next) => {
  const { id } = request.params;

  if (!isValidObjectId(id)) {
    response.status(400).json({
      success: false,
      message: "Invalid repository ID",
    });
    return;
  }

  try {
    const repository = await Repository.findByIdAndDelete(id);

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
  } catch (error) {
    next(error);
  }
};

export const createRepository: RequestHandler<unknown, unknown, CreateRepositoryBody> = async (
  request,
  response,
  next,
) => {
  const { name, githubUrl, branch } = request.body;

  if (typeof name !== "string" || !name.trim() || typeof githubUrl !== "string" || !githubUrl.trim()) {
    response.status(400).json({
      success: false,
      message: "Name and GitHub URL are required",
    });
    return;
  }

  if (!isValidGitHubRepositoryUrl(githubUrl.trim())) {
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
    const metadata = getGitHubRepositoryMetadata(githubUrl.trim());
    const repository = await Repository.create({
      name: name.trim(),
      githubUrl: githubUrl.trim(),
      branch: branch?.trim() || metadata.defaultBranch,
    });

    response.status(201).json({
      success: true,
      data: repository,
    });
  } catch (error) {
    next(error);
  }
};
