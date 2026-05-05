import Product from "../models/productModels.js";
import { v2 as cloudinary } from "cloudinary";
import csvtojson from "csvtojson";
import Review from "../models/reviewModel.js"; 
// ---------------- ADD PRODUCT ----------------
export const addProduct = async (req, res) => {
  try {
    const { name, description, longDescription, price, category, subCategory, bestseller, sizes } = req.body;

    const uploadedImages = [];
    for (let key of ["image1", "image2", "image3", "image4"]) {
      if (req.files && req.files[key]) {
        const file = req.files[key][0];
        const result = await cloudinary.uploader.upload(file.path, { folder: "products" });
        uploadedImages.push(result.secure_url);
      }
    }

    const newProduct = new Product({
      name,
      description,
      longDescription,
      price,
      category,
      subCategory,
      bestseller: bestseller === "true",
      sizes: JSON.parse(sizes || "[]"),
      images: uploadedImages,
    });

    await newProduct.save();
    res.json({ success: true, message: "Product added successfully", product: newProduct });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ---------------- LIST PRODUCTS ----------------
export const listProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json({ success: true, products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ---------------- REMOVE PRODUCT ----------------
export const removeProduct = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) return res.status(400).json({ success: false, message: "Product ID required" });
    await Product.findByIdAndDelete(id);
    res.json({ success: true, message: "Product removed successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ---------------- GET SINGLE PRODUCT ----------------
export const getSingleProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    const approvedReviews = product.reviews.filter(r => r.approved);
    res.json({ success: true, product: { ...product.toObject(), reviews: approvedReviews } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ---------------- ADD REVIEW ----------------
export const addReview = async (req, res) => {
  try {
    const { productId } = req.params;
    const { user, rating, comment } = req.body;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    product.reviews.push({
  userId: req.user._id, // ✅ ADD THIS
  user: req.user.name,
  rating,
  comment,
  approved: false,
});

    res.json({ success: true, message: "Review submitted. Pending admin approval." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



// ---------------- UPDATE PRODUCT ----------------
export const updateProductDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Product.findByIdAndUpdate(id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ---------------- TOGGLE AVAILABILITY ----------------
export const toggleProductAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    product.available = !product.available;
    await product.save();
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ---------------- BULK IMPORT PRODUCTS ----------------
export const bulkImportProducts = async (req, res) => {
  try {
    const { filePath } = req.body;
    if (!filePath) return res.status(400).json({ message: "filePath is required" });

    const products = await csvtojson().fromFile(filePath);
    const inserted = await Product.insertMany(products);
    res.json({ success: true, inserted });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getProductReviews = async (req, res) => {
  try {
    const productId = req.params.id;
    const reviews = await Review.find({ product: productId }).populate("user", "name");
    res.json(reviews);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch reviews" });
  }
};

// ================= ADD REVIEW =================
export const addProductReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ success: false });

    product.reviews.push({
  userId: req.user._id, 
  user: req.user.name,
  rating,
  comment,
  approved: false,
});

    await product.save();

    res.json({
      success: true,
      message: "Review submitted (pending approval)",
      product,
    });

  } catch (err) {
    res.status(500).json({ success: false });
  }
};
// ================= GET ALL REVIEWS (ADMIN) =================
export const getAllReviews = async (req, res) => {
  try {
    const products = await Product.find();

    let reviews = [];

    products.forEach((p) => {
      p.reviews.forEach((r) => {
        reviews.push({
          ...r._doc,
          productId: p._id,
          productName: p.name,
        });
      });
    });

    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ================= APPROVE / REJECT =================
export const updateReviewStatus = async (req, res) => {
  try {
    const { productId, reviewId } = req.params;
    const { approve } = req.body;

    const product = await Product.findById(productId);
    const review = product.reviews.id(reviewId);

    if (!review) return res.status(404).json({ message: "Not found" });

    if (approve) {
      review.approved = true;
    } else {
      review.deleteOne();
    }

    await product.save();

    res.json({ success: true, message: "Updated" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// ================= UPDATE PRODUCT =================
export const updateProduct = async (req, res) => {
  try {
    const {
      id,
      name,
      price,
      discountPrice,
      category,
    } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Product ID required",
      });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        name,
        price,
        discountPrice: discountPrice || 0,
        category,
      },
      {
        new: true,
      }
    );

    if (!updatedProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.json({
      success: true,
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    console.log("UPDATE ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};