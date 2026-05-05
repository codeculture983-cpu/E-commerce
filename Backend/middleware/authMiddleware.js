import jwt from "jsonwebtoken";
import { userModel } from "../models/usermodels.js";

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ success: false, message: "No token provided" });

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await userModel.findById(decoded.id);
    if (!user) return res.status(401).json({ success: false, message: "User not found" });

    req.user = user;
    next(); // ✅ Must call next
  } catch (err) {
    res.status(401).json({ success: false, message: "Not authorized" });
  }
};