import { InferSchemaType, Model, Schema, model, models } from "mongoose";

const repositorySchema = new Schema(
  {
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
      type: Schema.Types.Mixed,
      required: false,
    },
    analysisHistory: {
      type: [Schema.Types.Mixed],
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
  },
  {
    timestamps: true,
  },
);

export type RepositoryDocument = InferSchemaType<typeof repositorySchema>;

const Repository: Model<RepositoryDocument> =
  models.Repository || model<RepositoryDocument>("Repository", repositorySchema);

export default Repository;
