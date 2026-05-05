import mongoose from "mongoose";

// ================= ORDER ITEM =================
const orderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: String,
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    size: {
      type: String,
      default: "",
    },

    // ================= PRODUCT SNAPSHOT =================
    snapshot: {
      name: {
        type: String,
        required: true,
        default: "Product",
      },

      price: {
        type: Number,
        required: true,
        default: 0,
      },

      image: {
        type: String,
        default: "",
      },

      size: {
        type: String,
        default: "",
      },
    },
  },
  { _id: false }
);

// ================= STATUS TIMELINE =================
const statusTimelineSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: [
        "Pending",
        "Pending Payment",
        "Paid",
        "Order Placed",
        "Packing",
        "Shipped",
        "Out for Delivery",
        "Delivered",
        "Cancelled",
      ],
      required: true,
    },

    time: {
      type: Date,
      default: Date.now,
    },

    note: {
      type: String,
      default: "",
    },
  },
  { _id: false }
);

// ================= ORDER SCHEMA =================
const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ================= ITEMS =================
    items: {
      type: [orderItemSchema],
      required: true,
      default: [],
    },

    // ================= TOTAL AMOUNT =================
    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    // ================= ADDRESS =================
    address: {
      type: Object,
      required: true,
    },

    // ================= ORDER STATUS =================
    status: {
      type: String,
      enum: [
        "Pending",
        "Pending Payment",
        "Paid",
        "Order Placed",
        "Packing",
        "Shipped",
        "Out for Delivery",
        "Delivered",
        "Cancelled",
      ],
      default: "Pending",
    },

    // ================= PAYMENT METHOD =================
    paymentMethod: {
      type: String,
      required: true,
      enum: ["COD", "Stripe", "Razorpay"],
    },

    // ================= PAYMENT STATUS =================
    payment: {
      type: Boolean,
      default: false,
    },

    // ================= STATUS TIMELINE =================
    statusTimeline: {
      type: [statusTimelineSchema],
      default: [
        {
          status: "Pending",
          note: "Order created successfully",
        },
      ],
    },

    // ================= REFUND STATUS =================
    refundStatus: {
      type: String,
      enum: [
        "Not Requested",
        "Processing",
        "Approved",
        "Rejected",
      ],
      default: "Not Requested",
    },
  },
  {
    timestamps: true,
  }
);

// ================= MODEL EXPORT =================
const orderModel =
  mongoose.models.Order || mongoose.model("Order", orderSchema);

export default orderModel;