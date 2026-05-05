import express from "express";
import multer from "multer";
import { adminAuth } from "../middleware/adminAuth.js";
import {
  addProduct,
  listProducts,
  removeProduct,
  getSingleProduct,
  addReview,
  getAllReviews,
  updateReviewStatus,
  updateProductDetails,
  updateProduct,
  toggleProductAvailability,
  getProductReviews,
  bulkImportProducts,
  addProductReview
} from "../controllers/productController.js";
import { authUser } from "../middleware/auth.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// ---------------- PRODUCT CRUD ----------------
router.post("/add", adminAuth, upload.fields([
  { name: "image1" }, { name: "image2" }, { name: "image3" }, { name: "image4" }
]), addProduct);
router.get("/", (req, res) => {
  res.json({ message: "Product route working" });
});
router.get("/list", listProducts);
router.post("/remove", adminAuth, removeProduct);
router.put("/:id", updateProductDetails);
router.put("/toggle/:id", toggleProductAvailability);
router.post("/bulk-import", bulkImportProducts);
router.post("/update", adminAuth, updateProduct);
// ---------------- REVIEWS ----------------
router.post("/:productId/reviews", addReview);
router.get("/single/:productId", getSingleProduct);
router.get("/reviews/:id", getProductReviews);   // fetch reviews




router.post("/review/:id",authUser, addProductReview);
router.get("/reviews", getAllReviews);
router.put("/review/:productId/:reviewId", updateReviewStatus);


export default router;
