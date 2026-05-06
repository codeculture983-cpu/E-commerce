import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";

import connectDB from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";

import productRoutes from "./routes/productRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import cartRouter from "./routes/cartRoutes.js";
import orderRouter from "./routes/orderRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import adminReviewRoutes from "./routes/adminReviewRoutes.js";
import cmsRoutes from "./routes/cmsRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

// ================= TRUST PROXY =================
app.set("trust proxy", 1);

// ================= ALLOWED ORIGINS =================
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://forever-gamma-eight.vercel.app",
  "https://forever-admin-ivory-alpha.vercel.app"
];

// ================= CORS FIX =================
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.log("❌ BLOCKED ORIGIN:", origin);

    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

// Apply CORS
app.use(cors(corsOptions));

// IMPORTANT: preflight fix
app.options("*", cors(corsOptions));

// ================= SOCKET.IO =================
export const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

// ================= MIDDLEWARE =================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ================= DB =================
connectDB();
connectCloudinary();

// ================= LOGS =================
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

// ================= TEST =================
app.get("/", (req, res) => {
  res.send("🚀 Backend working with STRICT CORS FIX");
});

// ================= ERROR HANDLER =================
app.use((err, req, res, next) => {
  console.error("❌ SERVER ERROR:", err.message);

  res.status(500).json({
    success: false,
    message: err.message,
  });
});

// ================= START =================
const port = process.env.PORT || 4000;

server.listen(port, () => {
  console.log("🚀 Server running on port", port);
});
