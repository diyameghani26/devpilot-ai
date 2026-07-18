"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const repositorySchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
    },
    githubUrl: {
        type: String,
        required: true,
    },
    branch: {
        type: String,
        default: "main",
    },
    status: {
        type: String,
        default: "pending",
        enum: ["pending", "analyzing", "ready"],
    },
    analysis: {
        type: mongoose_1.Schema.Types.Mixed,
        required: false,
    },
    analysisHistory: {
        type: [mongoose_1.Schema.Types.Mixed],
        default: [],
    },
    bugIssueCount: {
        type: Number,
        default: 0,
    },
    dependencyIssueCount: {
        type: Number,
        default: 0,
    },
}, {
    timestamps: true,
});
const Repository = mongoose_1.models.Repository || (0, mongoose_1.model)("Repository", repositorySchema);
exports.default = Repository;
