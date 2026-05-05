import express from "express";
import {
  getPolicies,
  addPolicy,
  updatePolicy,
  getPolicyByType,
} from "../controllers/cmsController.js";

import {
  getAllReviewsAdmin,
  updateReviewStatus,
} from "../controllers/reviewController.js";

import { adminAuth } from "../middleware/adminAuth.js";

const router = express.Router();

/* ================= POLICIES ================= */
router.get("/texts", adminAuth, getPolicies);
router.get("/policy/:type", getPolicyByType);
router.post("/add", adminAuth, addPolicy);
router.patch("/update", adminAuth, updatePolicy);

/* ================= REVIEWS (FIXED) ================= */
router.get("/reviews/all", adminAuth, getAllReviewsAdmin);
router.patch("/reviews/status", adminAuth, updateReviewStatus);

export default router;