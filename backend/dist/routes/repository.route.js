"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const repository_controller_1 = require("../controllers/repository.controller");
const repositoryRouter = (0, express_1.Router)();
repositoryRouter.get("/", repository_controller_1.getRepositories);
repositoryRouter.post("/", repository_controller_1.createRepository);
exports.default = repositoryRouter;
