import express from "express";
import { createPromoCode, listActiveCoupons, deletePromoCode } from "../controllers/marketingController.js";
import { authUser, adminAuth } from "../middleware/auth.js";

const router = express.Router();
router.use(authUser, adminAuth);

router.post("/", createPromoCode);
router.get("/", listActiveCoupons);
router.delete("/:id", deletePromoCode);

export default router;