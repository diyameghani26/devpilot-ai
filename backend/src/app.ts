import cors from "cors";
import express from "express";

import { globalErrorHandler } from "./middlewares/error.middleware";
import { notFoundHandler } from "./middlewares/not-found.middleware";
import healthRouter from "./routes/health.route";
import repositoryRouter from "./routes/repository.route";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/health", healthRouter);
app.use("/api/repositories", repositoryRouter);
app.use(notFoundHandler);
app.use(globalErrorHandler);

export default app;
