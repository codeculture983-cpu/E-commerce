import Review from "../models/reviewModel.js";


/* ================= PUBLIC REVIEWS ================= */
export const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;

    const reviews = await Review.find({
      product: productId,
      status: "approved",
    }).sort({ createdAt: -1 });

    res.json({ success: true, reviews });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

/* ================= ADMIN: ALL REVIEWS ================= */
export const getAllReviewsAdmin = async (req, res) => {
  try {
    const { status } = req.query;

    let filter = {};
    if (status) filter.status = status;

    const reviews = await Review.find(filter)
      .populate("product", "name")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      reviews,
    });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

export const updateReviewStatus = async (req, res) => {
  try {
    const { reviewId, status } = req.body;

    const review = await Review.findByIdAndUpdate(
      reviewId,
      { status },
      { new: true }
    );

    res.json({
      success: true,
      review,
      message: "Status updated",
    });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};


/* ================= USER: SUBMIT REVIEW ================= */
export const submitReview = async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;

    const userId = req.user._id;

    const exists = await Review.findOne({
      product: productId,
      user: userId,
    });

    if (exists) {
      return res.json({
        success: false,
        message: "Already reviewed",
      });
    }

    const review = await Review.create({
      product: productId,
      user: userId,
      userName: req.user.name,
      rating,
      comment,
      status: "pending", // 🔥 ENTERPRISE FLOW
    });

    res.json({
      success: true,
      review,
      message: "Review submitted for approval",
    });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};