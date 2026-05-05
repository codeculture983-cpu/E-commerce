// middleware/adminAuth.js

import jwt from "jsonwebtoken";

export const adminAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Check header exists
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    // Extract token
    const token = authHeader.split(" ")[1];

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    /*
      IMPORTANT:
      Your admin login token MUST contain:

      {
        id: "...",
        role: "admin"
      }

      otherwise this will fail
    */

    if (!decoded.role || decoded.role !== "admin") {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Admin only",
      });
    }

    // Save admin info
    req.user = decoded;

    next();
  } catch (error) {
    console.log("Admin Auth Error:", error);

    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }
};