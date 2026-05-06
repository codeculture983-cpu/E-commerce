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

const app = express();
const server = http.createServer(app);

// ================= ALLOWED ORIGINS =================
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://forever-gamma-eight.vercel.app",
];

// ================= CORS FIX (PRODUCTION SAFE) =================
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.log("❌ CORS blocked origin:", origin);
      return callback(null, false); // IMPORTANT: block unknown origins properly
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Handle preflight requests
app.options("*", cors());

// ================= SOCKET.IO =================
export const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("🔵 Client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("🔴 Client disconnected:", socket.id);
  });
});

// ================= DB =================
connectDB();
connectCloudinary();

const port = process.env.PORT || 4000;

// ================= SWAGGER =================
let swaggerDocument = {};
try {
  swaggerDocument = yaml.load(
    fs.readFileSync("./promo-api.yaml", "utf8")
  );
} catch (err) {
  console.log("⚠ Swagger not loaded");
}

// ================= MIDDLEWARE =================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ================= STATIC FILES =================
app.use("/uploads", express.static(path.join(path.resolve(), "uploads")));

// ================= LOGGING =================
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

// ================= TEST ROUTE =================
app.get("/", (req, res) => {
  res.send("🚀 Backend is running successfully!");
});

// ================= SWAGGER =================
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// ================= ERROR HANDLER =================
app.use((err, req, res, next) => {
  console.error("🔥 Error:", err);

  res.setHeader("Access-Control-Allow-Origin", "*"); // 🔥 extra safety
  res.status(500).json({
    success: false,
    message: err.message || "Server error",
  });
});

// ================= START SERVER =================
server.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
  console.log("⚡ Socket.IO enabled");
});
