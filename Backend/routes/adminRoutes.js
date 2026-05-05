import express from "express";
import { adminLogin } from "../controllers/adminController.js";
import { adminAuth } from "../middleware/adminAuth.js";
import { allOrders, updateStatus } from "../controllers/orderController.js";

const router = express.Router();

// Login
router.post("/login", adminLogin); // ✅ this is /api/admin/login

// Protected routes
router.post("/list", adminAuth, allOrders);
router.post("/status", adminAuth, updateStatus);

export default router;