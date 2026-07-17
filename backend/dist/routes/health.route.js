"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const healthRouter = (0, express_1.Router)();
healthRouter.get("/", (_request, response) => {
    response.status(200).json({
        success: true,
        message: "DevPilot AI Backend is running",
        timestamp: new Date().toISOString(),
    });
});
exports.default = healthRouter;
