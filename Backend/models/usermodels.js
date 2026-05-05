import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
  name: String,
  phone: String,
  address: String,
});

const paymentSchema = new mongoose.Schema({
  method: String,
  details: String,
});

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    cartData: {
      type: Map,
      of: Object,
      default: new Map(),
    },

    // ================= ENTERPRISE V3 =================
    addresses: [addressSchema],
    wishlist: [{ type: String }],
    payments: [paymentSchema],

    privacy: {
      showEmail: { type: Boolean, default: true },
      activityTracking: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

export const userModel = mongoose.model("User", userSchema);