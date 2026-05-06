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

// ================= APP =================
const app = express();
const server = http.createServer(app);

// ================= ALLOWED ORIGINS =================
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://forever-gamma-eight.vercel.app",
];

// ================= CORS (EXPRESS) =================
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS not allowed"));
      }
    },
    credentials: true,
  })
);

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
  console.log("⚠ Swagger file not found");
}

// ================= MIDDLEWARE =================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ================= STATIC FILES =================
app.use(
  "/uploads",
  express.static(path.join(path.resolve(), "uploads"))
);

// ================= REQUEST LOGGER =================
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

// ================= SWAGGER DOCS =================
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument)
);

// ================= TEST ROUTE =================
app.get("/", (req, res) => {
  res.send("🚀 Backend is running successfully!");
});

// ================= ERROR HANDLER =================
app.use((err, req, res, next) => {
  console.error("🔥 Error:", err);

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
