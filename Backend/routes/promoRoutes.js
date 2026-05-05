import express from "express";
import {
  createPromo,
  getAllPromos,
  deactivatePromo,
  deletePromo,
  verifyPromo,
} from "../controllers/promoController.js";
import { authUser } from "../middleware/auth.js";

const router = express.Router();

router.post("/create", createPromo);
router.get("/admin/all", getAllPromos);
router.put("/deactivate/:id", deactivatePromo);
router.delete("/delete/:id", deletePromo);
router.post("/verify", authUser, verifyPromo);
export default router;