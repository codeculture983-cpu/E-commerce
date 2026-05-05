import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema(
  {
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "order" },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "user" },

    invoiceNumber: { type: String, unique: true },

    fileUrl: String,
    subtotal: Number,
    tax: Number,
    total: Number,
  },
  { timestamps: true }
);

export default mongoose.model("invoice", invoiceSchema);