import { Router } from "express";

const healthRouter = Router();

healthRouter.get("/", (_request, response) => {
  response.status(200).json({
    success: true,
    message: "DevPilot AI Backend is running",
    timestamp: new Date().toISOString(),
  });
});

export default healthRouter;
