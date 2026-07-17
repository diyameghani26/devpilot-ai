import { Router } from "express";

import { createRepository } from "../controllers/repository.controller";

const repositoryRouter = Router();

repositoryRouter.post("/", createRepository);

export default repositoryRouter;
