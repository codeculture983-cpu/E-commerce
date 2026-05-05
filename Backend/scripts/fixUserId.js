import mongoose from "mongoose";
import orderModel from "../models/orderModels.js";
import dotenv from "dotenv";

dotenv.config(); // ✅ FIXED

const fixUserIds = async () => {
  try {
    console.log("ENV:", process.env.MONGODB_URL); // debug

    await mongoose.connect(process.env.MONGODB_URL);
    console.log("✅ MongoDB Connected");

    const orders = await orderModel.find();

    for (let order of orders) {
      if (!mongoose.Types.ObjectId.isValid(order.userId)) {
        console.log(`⚠️ Skipping invalid ID: ${order._id}`);
        continue;
      }

      if (typeof order.userId !== "string") continue;

      const newId = new mongoose.Types.ObjectId(order.userId);

      await orderModel.findByIdAndUpdate(order._id, {
        userId: newId,
      });

      console.log(`✅ Updated: ${order._id}`);
    }

    console.log("🎉 Migration Completed");
    process.exit();
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
};

fixUserIds();