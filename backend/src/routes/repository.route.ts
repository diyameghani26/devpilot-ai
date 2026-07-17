import { Router } from "express";

import { createRepository, getRepositories } from "../controllers/repository.controller";

const repositoryRouter = Router();

repositoryRouter.get("/", getRepositories);
repositoryRouter.post("/", createRepository);

export default repositoryRouter;
