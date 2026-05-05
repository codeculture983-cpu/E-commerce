import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  label: String,
  line1: String,
  line2: String,
  city: String,
  state: String,
  country: String,
  phone: String,
}, { timestamps: true });

export default mongoose.model("Address", addressSchema);