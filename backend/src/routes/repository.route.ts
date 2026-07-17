import { Router } from "express";

import {
  analyzeRepositoryById,
  createRepository,
  deleteRepository,
  getRepositoryAnalysisById,
  getRepositoryById,
  getRepositories,
  updateRepository,
} from "../controllers/repository.controller";

const repositoryRouter = Router();

repositoryRouter.get("/", getRepositories);
repositoryRouter.post("/:id/analyze", analyzeRepositoryById);
repositoryRouter.get("/:id/analysis", getRepositoryAnalysisById);
repositoryRouter.get("/:id", getRepositoryById);
repositoryRouter.post("/", createRepository);
repositoryRouter.put("/:id", updateRepository);
repositoryRouter.delete("/:id", deleteRepository);

export default repositoryRouter;
