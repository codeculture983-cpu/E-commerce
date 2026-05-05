import express from "express";
import { getPolicy, updatePolicy } from "../controllers/policyController.js";
import { authUser } from "../middleware/auth.js";
import { adminAuth } from "../middleware/adminAuth.js";

const router = express.Router();

// Public
router.get("/:type", getPolicy);

// Admin
router.put("/:type", authUser, adminAuth, updatePolicy);

export default router;