"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalErrorHandler = void 0;
const globalErrorHandler = (error, _request, response, _next) => {
    const statusCode = typeof error.statusCode === "number" ? error.statusCode : 500;
    const message = typeof error.message === "string" ? error.message : "Internal server error";
    response.status(statusCode).json({
        success: false,
        message,
    });
};
exports.globalErrorHandler = globalErrorHandler;
