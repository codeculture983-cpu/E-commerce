import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  user: { type: String, required: true },
  rating: { type: Number, required: true },
  comment: { type: String, required: true },
  approved: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const productSchema = new mongoose.Schema({
  name: String,
  description: String,
  longDescription: String,
  category: String,
  subCategory: String,
  price: Number,
  discountPrice: {
  type: Number,
  default: 0,
},
  sizes: [String],
  images: [String],
  reviews: [reviewSchema],
});

export default mongoose.model("Product", productSchema);