"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const parsedPort = Number(process.env.PORT ?? 5000);
exports.env = {
    nodeEnv: process.env.NODE_ENV ?? "development",
    port: Number.isInteger(parsedPort) && parsedPort > 0 ? parsedPort : 5000,
    mongodbUri: process.env.MONGODB_URI,
    githubToken: process.env.GITHUB_TOKEN,
};
