// controllers/adminController.js
import jwt from "jsonwebtoken";
import Admin from "../models/adminModels.js";

export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });
    if (!admin)
      return res.status(404).json({ success: false, message: "Admin not found" });

    if (admin.password !== password)
      return res.status(401).json({ success: false, message: "Invalid credentials" });

    // ✅ Generate token with role: admin
    const token = jwt.sign(
      { _id: admin._id, email: admin.email, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "21d" }
    );

    res.json({ success: true, token });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};