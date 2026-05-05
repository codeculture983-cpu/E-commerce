import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const testConnection = async () => {
  try {
    // Database name is included in your connection string
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("MongoDB Playground connected!");
    
    // Optional: list collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log("Collections:", collections.map(c => c.name));

    process.exit(0);
  } catch (err) {
    console.error("Playground DB Error:", err);
    process.exit(1);
  }
};

testConnection();