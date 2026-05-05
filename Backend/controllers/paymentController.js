import orderModel from "../models/orderModels.js";

export const paymentHistory = async (req, res) => {
  try {
    const userId = req.user._id;

    const payments = await orderModel
      .find({ userId, payment: true })
      .sort({ date: -1 });

    res.json({ success: true, payments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};