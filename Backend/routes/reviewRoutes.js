import express from "express";
import {
  submitReview,
  getProductReviews,
} from "../controllers/reviewController.js";

import { authUser } from "../middleware/auth.js";

const router = express.Router();

/* USER */
router.post("/", authUser, submitReview);
router.get("/:productId", getProductReviews);

export default router;