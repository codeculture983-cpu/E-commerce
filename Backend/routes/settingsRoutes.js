import express from "express";
import {
  getSettings,
  updateStoreSettings,
  managePaymentGateways,
  checkServerHealth,
} from "../controllers/settingsController.js";

import { authUser } from "../middleware/auth.js";
import { adminAuth } from "../middleware/adminAuth.js";

const router = express.Router();

// protect routes
router.use(authUser, adminAuth);

// ================= ROUTES =================
router.get("/", getSettings);
router.put("/store", updateStoreSettings);
router.put("/payment", managePaymentGateways);
router.get("/health", checkServerHealth);

export default router;