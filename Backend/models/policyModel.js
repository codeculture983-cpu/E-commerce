import mongoose from "mongoose";

const policySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["terms", "privacy", "refund", "shipping"],
      required: true,
      unique: true,
    },
    content: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Policy", policySchema);