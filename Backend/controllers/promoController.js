import Promo from "../models/promoModel.js";

export const createPromo = async (req, res) => {
  try {
    const { code, discount, startDate, endDate } = req.body;

    if (!code) {
      return res.status(400).json({ message: "Code required" });
    }

    const exists = await Promo.findOne({ code: code.toUpperCase() });
    if (exists) {
      return res.status(400).json({ message: "Already exists" });
    }

    const promo = await Promo.create({
      code: code.toUpperCase(),
      discount,
      startDate,
      endDate,
    });

    res.json({ success: true, promo });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const verifyPromo = async (req, res) => {
  try {
    const { code } = req.body;

    const promo = await Promo.findOne({ code: code.toUpperCase() });

    if (!promo || !promo.isActive) {
      return res.status(404).json({ success: false, message: "Invalid promo" });
    }

    const now = new Date();
    if (promo.startDate > now || promo.endDate < now) {
      return res.status(400).json({ success: false, message: "Promo expired" });
    }

    // Return full promo object
    res.json({
      success: true,
      promo: {
        _id: promo._id,
        code: promo.code,
        discount: promo.discount,
        type: "percentage", // You can add a 'type' field if needed for fixed/percentage promos
        start: promo.startDate,
        end: promo.endDate,
        status: promo.isActive ? "Active" : "Inactive",
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
// GET ALL PROMOS
export const getAllPromos = async (req, res) => {
  try {
    const promos = await Promo.find().sort({ createdAt: -1 });
    res.json({ success: true, promos });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DEACTIVATE PROMO
export const deactivatePromo = async (req, res) => {
  try {
    await Promo.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE PROMO
export const deletePromo = async (req, res) => {
  try {
    await Promo.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};