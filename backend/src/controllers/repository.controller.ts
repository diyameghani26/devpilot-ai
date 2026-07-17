import { RequestHandler } from "express";
import { isValidObjectId } from "mongoose";

import Repository from "../models/repository.model";

type CreateRepositoryBody = {
  name?: unknown;
  githubUrl?: unknown;
  branch?: unknown;
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

  if (branch !== undefined && (typeof branch !== "string" || !branch.trim())) {
    response.status(400).json({
      success: false,
      message: "Branch must be a non-empty string",
    });
    return;
  }

  try {
    const repository = await Repository.create({
      name: name.trim(),
      githubUrl: githubUrl.trim(),
      ...(branch ? { branch: branch.trim() } : {}),
    });

    response.status(201).json({
      success: true,
      data: repository,
    });
  } catch (error) {
    next(error);
  }
};
