import express from "express";
import {
  placeOrder,
  placeOrderStripe,
  placeOrderRazorpay,
  verifyStripe,
  verifyRazorpay,
  userOrders,
  allOrders,
  updateStatus,
  downloadInvoice,
  cancelOrder,
  getSingleOrder,
  fetchAllOrders, 
  updateOrderStatus, 
  generateInvoice, 
  processRefund,
   trackShipment
} from "../controllers/orderController.js";

import { authUser } from "../middleware/auth.js";
import { adminAuth } from "../middleware/adminAuth.js";

const router = express.Router();

// ===== USER ROUTES =====
router.post("/place", authUser, placeOrder);
router.post("/stripe", authUser, placeOrderStripe);
router.post("/razorpay", authUser, placeOrderRazorpay);
router.get("/", fetchAllOrders);
router.put("/status", updateOrderStatus);
router.get("/invoice/:orderId", generateInvoice);
router.put("/refund", processRefund);
router.get("/track/:orderId", trackShipment)
router.get("/userorders", authUser, userOrders);        // GET all user orders
router.post("/cancel", authUser, cancelOrder);          // Cancel order
router.get("/order/:id", authUser, getSingleOrder);    // Get single order by ID

// ===== ADMIN ROUTES =====
router.get("/list", adminAuth, allOrders);             // Get all orders for admin
router.put("/:id/status", adminAuth, updateStatus);    // Update order status

// ===== VERIFY PAYMENTS =====
router.post("/verifyStripe", authUser, verifyStripe);
router.post("/razorpay/verify", authUser, verifyRazorpay);

// ===== INVOICE =====
router.get("/invoice/:id", async (req, res) => {
  try {
    await adminAuth(req, res, async () => await downloadInvoice(req, res));
  } catch {
    await authUser(req, res, async () => await downloadInvoice(req, res));
  }
});

export default router;