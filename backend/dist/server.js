"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const env_1 = require("./config/env");
app_1.default.listen(env_1.env.port, () => {
    console.log(`DevPilot AI backend running in ${env_1.env.nodeEnv} mode on port ${env_1.env.port}`);
});
