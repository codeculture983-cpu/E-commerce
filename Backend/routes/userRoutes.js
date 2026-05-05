import express from "express";
import {
  loginUser,
  registerUser,
  adminLogin,
  getUserProfile,
  updateUserProfile,
  fetchAllUsers,
  updateUserStatus,
  assignUserRole,
  resetUserPassword,
  addAddress,
  forgotPassword,
  resetPasswordOtp,
  deleteAddress,
  addWishlist,
  removeWishlist,
  addPayment,
  updatePrivacy,
  getUserOrders,
  deleteAccount,
  changePassword,
  clearCart,
  updateAddress,
  getUserStats,
} from "../controllers/userController.js";

import { authUser } from "../middleware/auth.js";

const router = express.Router();

// Admin middleware
const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Access denied" });
  }
  next();
};

// ================= PUBLIC =================
router.post("/login", loginUser);
router.post("/register", registerUser);
router.post("/admin/login", adminLogin);

// ================= USER =================
router.get("/me", authUser, getUserProfile);
router.put("/me", authUser, updateUserProfile);

// Password reset
router.post("/forgot-password", forgotPassword);
router.post("/reset-password-otp", resetPasswordOtp);

// ================= ADDRESS =================
router.post("/address", authUser, addAddress);
router.delete("/address/:id", authUser, deleteAddress);
router.put("/address/update", authUser, updateAddress);

// ================= WISHLIST =================
router.post("/wishlist", authUser, addWishlist);
router.delete("/wishlist", authUser, removeWishlist);

// ================= PAYMENT =================
router.post("/payment", authUser, addPayment);

// ================= PRIVACY =================
router.put("/privacy", authUser, updatePrivacy);

// ================= ORDERS =================
router.get("/orders", authUser, getUserOrders);

// ================= ACCOUNT =================
router.delete("/me", authUser, deleteAccount);
router.put("/change-password", authUser, changePassword);

// ================= CART =================
router.put("/clear-cart", authUser, clearCart);

// ================= ADMIN =================
router.get("/all", authUser, adminOnly, fetchAllUsers);
router.put("/status", authUser, adminOnly, updateUserStatus);
router.put("/role", authUser, adminOnly, assignUserRole);
router.put("/reset-password", authUser, adminOnly, resetUserPassword);
router.get("/stats", authUser, adminOnly, getUserStats);

export default router;