import { ErrorRequestHandler } from "express";

export const globalErrorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  const statusCode = typeof error.statusCode === "number" ? error.statusCode : 500;
  const message = typeof error.message === "string" ? error.message : "Internal server error";

  response.status(statusCode).json({
    success: false,
    message,
  });
};
