import dotenv from "dotenv";

dotenv.config();

const parsedPort = Number(process.env.PORT ?? 5000);

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number.isInteger(parsedPort) && parsedPort > 0 ? parsedPort : 5000,
  mongodbUri: process.env.MONGODB_URI,
  githubToken: process.env.GITHUB_TOKEN,
} as const;
