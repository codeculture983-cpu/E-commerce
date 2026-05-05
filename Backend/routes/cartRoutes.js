import express from "express";
import { getCart, addToCart, updateCart, clearCart } from "../controllers/cartController.js";
import { authUser } from "../middleware/auth.js";

const router = express.Router();

router.post("/get", authUser, getCart);
router.post("/add", authUser, addToCart);
router.post("/update", authUser, updateCart);
router.post("/clear",authUser, clearCart);

export default router;