import { Router } from "express";

import {
  createRepository,
  getRepositoryById,
  getRepositories,
} from "../controllers/repository.controller";

const repositoryRouter = Router();

repositoryRouter.get("/", getRepositories);
repositoryRouter.get("/:id", getRepositoryById);
repositoryRouter.post("/", createRepository);

export default repositoryRouter;
