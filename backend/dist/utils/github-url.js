"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidGitHubRepositoryUrl = void 0;
const githubOwnerPattern = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})$/;
const githubRepositoryPattern = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;
const isValidGitHubRepositoryUrl = (value) => {
    try {
        const url = new URL(value);
        if (url.protocol !== "https:" ||
            url.hostname !== "github.com" ||
            url.username ||
            url.password ||
            url.search ||
            url.hash) {
            return false;
        }
        const pathSegments = url.pathname.split("/").filter(Boolean);
        if (pathSegments.length !== 2) {
            return false;
        }
        const [owner, repositoryWithExtension] = pathSegments;
        const repository = repositoryWithExtension.replace(/\.git$/i, "");
        return githubOwnerPattern.test(owner) && githubRepositoryPattern.test(repository);
    }
    catch {
        return false;
    }
};
exports.isValidGitHubRepositoryUrl = isValidGitHubRepositoryUrl;
