import { userModel } from "../models/usermodels.js";
import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { authUser } from "../middleware/auth.js";
import Admin from "../models/adminModels.js";

import crypto from "crypto";
// ============================
// JWT GENERATOR
// ============================
export const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// ============================
// USER REGISTRATION
// ============================
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password)
      return res.json({ success: false, message: "All fields are required" });

    if (!validator.isEmail(email))
      return res.json({ success: false, message: "Invalid email format" });

    if (password.length < 8)
      return res.json({ success: false, message: "Password must be at least 8 characters" });

    // Check existing user
    const exists = await userModel.findOne({ email });
    if (exists)
      return res.json({ success: false, message: "User already exists" });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const newUser = new userModel({ name, email, password: hashedPassword });
    const user = await newUser.save();

    // Create token
    const token = createToken(user._id);

    res.json({
      success: true,
      token,
      user: { _id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ============================
// USER LOGIN
// ============================
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.json({ success: false, message: "Email and password required" });

    const user = await userModel.findOne({ email });
    if (!user) return res.json({ success: false, message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.json({ success: false, message: "Invalid credentials" });

    const token = createToken(user._id);

    res.json({
      success: true,
      token,
      user: { _id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ============================
// ADMIN LOGIN
// ============================
export const adminLogin = async (req, res) => {
  const { email, password } = req.body;

  if (
    email === process.env.ADMIN_EMAIL &&
    password === process.env.ADMIN_PASSWORD
  ) {
    const token = jwt.sign(
      { role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({ success: true, token });
  }

  res.json({ success: false, message: "Invalid admin credentials" });
};
// GET USER PROFILE
// ============================
export const getUserProfile = async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id).select("-password");

    res.json({
      success: true,
      user,
    });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};
// ============================
// UPDATE USER PROFILE
export const updateUserProfile = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    const user = await userModel.findById(req.user._id);

    if (!user)
      return res.status(404).json({
        success: false,
        message: "User not found",
      });

    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;

    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    if (req.file) {
      user.avatar = `/uploads/avatars/${req.file.filename}`;
    }

    await user.save();

    res.json({
      success: true,
      user,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
// ============================
// FETCH ALL USERS (ADMIN)
// ============================
export const fetchAllUsers = async (req, res) => {
  try {
    const users = await userModel.find().select("-password");
    res.json({ success: true, users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ============================
// UPDATE USER STATUS (ADMIN)
// ============================
export const updateUserStatus = async (req, res) => {
  try {
    const { userId, status } = req.body;
    const user = await userModel
      .findByIdAndUpdate(userId, { status }, { new: true })
      .select("-password");
    res.json({ success: true, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ============================
// ASSIGN USER ROLE (ADMIN)
// ============================
export const assignUserRole = async (req, res) => {
  try {
    const { userId, role } = req.body;
    const user = await userModel
      .findByIdAndUpdate(userId, { role }, { new: true })
      .select("-password");
    res.json({ success: true, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ============================
// RESET USER PASSWORD (ADMIN)
// ============================
export const resetUserPassword = async (req, res) => {
  try {
    const { userId, newPassword } = req.body;
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const user = await userModel
      .findByIdAndUpdate(userId, { password: hashedPassword }, { new: true })
      .select("-password");
    res.json({ success: true, message: "Password reset successfully", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
export const addAddress = async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id);

    user.addresses.push(req.body);
    await user.save();

    res.json({ success: true, addresses: user.addresses });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};

export const deleteAddress = async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id);

    user.addresses = user.addresses.filter(
      (a, i) => i != req.params.id
    );

    await user.save();

    res.json({ success: true, addresses: user.addresses });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};
export const addWishlist = async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id);

    if (!user.wishlist.includes(req.body.item)) {
      user.wishlist.push(req.body.item);
    }

    await user.save();

    res.json({ success: true, wishlist: user.wishlist });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};

export const removeWishlist = async (req, res) => {
  try {
    const { item } = req.body;

    const user = await userModel.findById(req.user._id);

    user.wishlist = user.wishlist.filter((w) => w !== item);

    await user.save();

    res.json({
      success: true,
      wishlist: user.wishlist,
    });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};
export const addPayment = async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id);

    user.payments.push(req.body);
    await user.save();

    res.json({ success: true, payments: user.payments });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};
export const updatePrivacy = async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id);

    user.privacy = {
      ...user.privacy,
      ...req.body,
    };

    await user.save();

    res.json({ success: true, privacy: user.privacy });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};
export const getUserOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({ userId: req.user._id });

    res.json({
      success: true,
      orders,
    });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};
export const deleteAccount = async (req, res) => {
  try {
    await userModel.findByIdAndDelete(req.user._id);

    res.json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};
export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    const user = await userModel.findById(req.user._id);

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.json({
        success: false,
        message: "Old password incorrect",
      });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();

    res.json({
      success: true,
      message: "Password updated",
    });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};
export const clearCart = async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // ✅ proper clear
    user.cartData = new Map();

    // IMPORTANT for Mongoose Map
    user.markModified("cartData");

    await user.save();

    res.json({
      success: true,
      message: "Cart cleared successfully",
      cartData: {},
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
export const getUserStats = async (req, res) => {
  try {
    const totalUsers = await userModel.countDocuments();
    const totalOrders = await orderModel.countDocuments();

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalOrders,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};
export const updateAddress = async (req, res) => {
  try {
    const { index, address } = req.body;

    const user = await userModel.findById(req.user._id);

    if (user.addresses[index]) {
      user.addresses[index].address = address;
    }

    await user.save();

    res.json({
      success: true,
      addresses: user.addresses,
    });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};

// TEMP STORAGE (use Redis in production)
let otpStore = {};

// ================= FORGOT PASSWORD =================
import { sendEmail } from "../utils/sendEmail.js";


export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    const otp = crypto.randomInt(100000, 999999).toString();

    otpStore[email] = {
      otp,
      expires: Date.now() + 10 * 60 * 1000,
    };

    // ===== SEND EMAIL =====
    const html = `
      <div style="font-family:Arial">
        <h2>Password Reset OTP</h2>
        <p>Your OTP code is:</p>
        <h1 style="color:#000">${otp}</h1>
        <p>This OTP will expire in 10 minutes.</p>
      </div>
    `;

    await sendEmail(email, "Password Reset OTP", html);

    res.json({
      success: true,
      message: "OTP sent to your email",
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false });
  }
};

// ================= RESET PASSWORD =================
export const resetPasswordOtp = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const record = otpStore[email];

    if (!record) {
      return res.json({ success: false, message: "OTP expired" });
    }

    if (record.otp !== otp) {
      return res.json({ success: false, message: "Invalid OTP" });
    }

    if (Date.now() > record.expires) {
      delete otpStore[email];
      return res.json({ success: false, message: "OTP expired" });
    }

    const user = await userModel.findOne({ email });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();

    delete otpStore[email];

    res.json({
      success: true,
      message: "Password reset successful",
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false });
  }
};