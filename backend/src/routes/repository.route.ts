import { Router } from "express";

import {
  createRepository,
  getRepositoryById,
  getRepositories,
  updateRepository,
} from "../controllers/repository.controller";

const repositoryRouter = Router();

repositoryRouter.get("/", getRepositories);
repositoryRouter.get("/:id", getRepositoryById);
repositoryRouter.post("/", createRepository);
repositoryRouter.put("/:id", updateRepository);

export default repositoryRouter;
