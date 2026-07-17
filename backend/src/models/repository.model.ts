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
    },
    analysis: {
      type: Schema.Types.Mixed,
      required: false,
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
