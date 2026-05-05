import Policy from "../models/policyModel.js";

// Get single policy
export const getPolicy = async (req, res) => {
  try {
    const { type } = req.params;
    const policy = await Policy.findOne({ type });
    res.json({ success: true, policy });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update policy (admin)
export const updatePolicy = async (req, res) => {
  try {
    const { type } = req.params;
    const { content } = req.body;

    const policy = await Policy.findOneAndUpdate(
      { type },
      { content },
      { new: true, upsert: true }
    );

    res.json({ success: true, policy });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};