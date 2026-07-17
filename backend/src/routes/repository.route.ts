import { Router } from "express";

import {
  createRepository,
  deleteRepository,
  getRepositoryById,
  getRepositories,
  updateRepository,
} from "../controllers/repository.controller";

const repositoryRouter = Router();

repositoryRouter.get("/", getRepositories);
repositoryRouter.get("/:id", getRepositoryById);
repositoryRouter.post("/", createRepository);
repositoryRouter.put("/:id", updateRepository);
repositoryRouter.delete("/:id", deleteRepository);

export default repositoryRouter;
