import express from "express";
import authUser from "../middleware/auth.js";
import { paymentHistory } from "../controllers/paymentController.js";

const router = express.Router();

router.get("/history", authUser, paymentHistory);

export default router;