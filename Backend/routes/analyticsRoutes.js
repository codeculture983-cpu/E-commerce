import express from "express";
import {
  getSalesRevenueReport,
  getNewUserRegistrationsCount,
  fetchTopSellingProducts,
  getOrderFunnel,
  getCLV,
  getForecast,
  getOrderAnalytics,
  getOrderStatusSummary,
  getInsight,
  getMLPrediction,
  getCohortAnalysis,
  getProfitLoss,
  checkSalesAlert,
} from "../controllers/analyticsController.js";

import { adminAuth } from "../middleware/adminAuth.js";

const router = express.Router();

router.use(adminAuth);

// ================= CORE =================
router.get("/revenue", getSalesRevenueReport);
router.get("/new-users", getNewUserRegistrationsCount);
router.get("/top-products", fetchTopSellingProducts);
router.get("/clv", getCLV);
router.get("/forecast", getForecast);
router.get("/order-analytics", getOrderAnalytics);
router.get("/order-status", getOrderStatusSummary);
router.get("/funnel", getOrderFunnel);

// ================= NEW INSIGHTS =================
router.get("/insight", getInsight);
router.get("/ml-prediction", getMLPrediction);
router.get("/profit-loss", getProfitLoss);
router.get("/sales-alert", checkSalesAlert);
router.get("/cohort", getCohortAnalysis);
export default router;