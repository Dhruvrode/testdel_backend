import mongoose, { Schema, Document } from "mongoose";

export interface LabelDocument extends Document {
  key: string;
  value: string;
  usages: {
    page: string;
    component: string;
  }[];
}

const LabelSchema = new Schema<LabelDocument>(
  {
    key: { type: String, required: true, unique: true },
    value: { type: String, required: true },
    usages: [
      {
        page: { type: String, required: true },
        component: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);

export const Label =
  mongoose.models.Label || mongoose.model("Label", LabelSchema);
