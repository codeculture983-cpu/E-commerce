import Policy from "../models/policyModel.js";
import Review from "../models/reviewModel.js";

/* ================= POLICIES ================= */

// GET ALL POLICIES
export const getPolicies = async (req, res) => {
  try {
    const policies = await Policy.find();
    res.json({ success: true, policies });
  } catch (err) {
    res.status(500).json({ success: false, message: "Cannot fetch policies" });
  }
};

// GET SINGLE POLICY (IMPORTANT FIX FOR YOUR FRONTEND)
export const getPolicyByType = async (req, res) => {
  try {
    const { type } = req.params;

    const policy = await Policy.findOne({ type });

    if (!policy) {
      return res.json({ success: false, policy: null });
    }

    res.json({ success: true, policy });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching policy" });
  }
};

// ADD POLICY
export const addPolicy = async (req, res) => {
  try {
    const { type, content } = req.body;

    const exists = await Policy.findOne({ type });
    if (exists)
      return res.status(400).json({ success: false, message: "Already exists" });

    const policy = await Policy.create({ type, content });

    res.json({ success: true, policy });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to add policy" });
  }
};

// UPDATE POLICY
export const updatePolicy = async (req, res) => {
  try {
    const { policyId, content } = req.body;

    const updated = await Policy.findByIdAndUpdate(
      policyId,
      { content },
      { new: true }
    );

    res.json({ success: true, policy: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to update" });
  }
};

/* ================= REVIEWS ================= */

// GET REVIEWS
export const getReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate("product", "name")
      .sort({ createdAt: -1 });

    res.json({ success: true, reviews });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};

// UPDATE REVIEW STATUS
export const updateReviewStatus = async (req, res) => {
  try {
    const { reviewId, status } = req.body;

    const review = await Review.findByIdAndUpdate(
      reviewId,
      { status },
      { new: true }
    );

    res.json({ success: true, review });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};