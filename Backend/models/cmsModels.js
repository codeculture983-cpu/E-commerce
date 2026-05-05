import mongoose from "mongoose";

// Policy Schema
const policySchema = new mongoose.Schema({
  type: { type: String, required: true, unique: true },
  content: { type: String, required: true },
});
export const Policy = mongoose.model("Policy", policySchema);

// FAQ Schema
const faqSchema = new mongoose.Schema({
  question: String,
  answer: String,
});
export const FAQ = mongoose.model("FAQ", faqSchema);

// Review is embedded in Product, so no separate Review model needed