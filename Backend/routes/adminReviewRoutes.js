import express from "express";
import {
  getAllReviewsAdmin,
  updateReviewStatus,
} from "../controllers/reviewController.js";

import { adminAuth } from "../middleware/adminAuth.js";

const router = express.Router();

router.get("/all", adminAuth, getAllReviewsAdmin);
router.patch("/status", adminAuth, updateReviewStatus);

export default router;