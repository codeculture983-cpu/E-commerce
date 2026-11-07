
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URL, {
      dbName: "ecommerce",
    });

    console.log(`MongoDB connected: ${conn.connection.host}`);
    console.log(`Database selected: ${conn.connection.name}`);
  } catch (err) {
    console.error("DB Error:", err.message);
    process.exit(1);
  }
};

export default connectDB;
