import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import yaml from "js-yaml";
import swaggerUi from "swagger-ui-express";
import http from "http";
import { Server } from "socket.io";

import analyticsRoutes from "./routes/analyticsRoutes.js";
import connectDB from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";

import productRoutes from "./routes/productRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import cartRouter from "./routes/cartRoutes.js";
import orderRouter from "./routes/orderRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import adminReviewRoutes from "./routes/adminReviewRoutes.js";
import cmsRoutes from "./routes/cmsRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";


dotenv.config();

// ================= APP + SERVER =================
const app = express();
const server = http.createServer(app);

// ================= SOCKET.IO (ENTERPRISE FEATURE) =================
export const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("🔵 Admin connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("🔴 Admin disconnected:", socket.id);
  });
});

// ================= DB + CLOUD =================
connectDB();
connectCloudinary();

const port = process.env.PORT || 4000;

// ================= SWAGGER =================
let swaggerDocument = {};
try {
  swaggerDocument = yaml.load(
    fs.readFileSync("./promo-api.yaml", "utf8")
  );
} catch (error) {
  console.log("Swagger file not found or invalid");
}

// ================= MIDDLEWARE =================
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ================= STATIC =================
app.use(
  "/uploads",
  express.static(path.join(path.resolve(), "uploads"))
);

// ================= DEBUG LOGGER =================
app.use((req, res, next) => {
  console.log(`➡ ${req.method} ${req.url}`);
  next();
});

// ================= ROUTES =================
app.use("/api/product", productRoutes);
app.use("/api/user", userRoutes);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);
app.use("/api/reviews", reviewRoutes);
app.use("/api/admin/reviews", adminReviewRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/cms", cmsRoutes);
app.use("/api/settings", settingsRoutes);
// ================= SWAGGER =================
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument)
);

// ================= HOME =================
app.get("/", (req, res) => {
  res.send("🚀 API is working with REAL-TIME analytics!");
});

// ================= GLOBAL ERROR HANDLER =================
app.use((err, req, res, next) => {
  console.error("🔥 Server Error:", err);

  res.status(500).json({
    success: false,
    message: err.message || "Something went wrong",
  });
});

// ================= START SERVER =================
server.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
  console.log("⚡ REAL-TIME SOCKET ENABLED");
  console.log("🔑 Razorpay Key Loaded:", !!process.env.RAZORPAY_KEY_ID);
});