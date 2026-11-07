
import mongoose from "mongoose";
import { userModel } from "../models/usermodels.js";

// Convert Mongoose Map or normal object into a plain object.
const normalizeCartData = (cartData) => {
  if (!cartData) return {};

  if (cartData instanceof Map) {
    return Object.fromEntries(cartData);
  }

  if (typeof cartData === "object") {
    return cartData;
  }

  return {};
};

// Validate product ID and size before using them in MongoDB paths.
const validateCartItem = (itemId, size) => {
  if (!mongoose.isValidObjectId(itemId)) {
    return "Invalid product ID";
  }

  if (
    typeof size !== "string" ||
    !/^[A-Za-z0-9_-]+$/.test(size.trim())
  ) {
    return "Invalid product size";
  }

  return null;
};

// ---------------- GET USER CART ----------------

export const getCart = async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.json({
      success: true,
      cartData: normalizeCartData(user.cartData),
    });
  } catch (error) {
    console.error("Get cart error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load cart",
    });
  }
};

// ---------------- ADD ITEM TO CART ----------------

export const addToCart = async (req, res) => {
  try {
    const { itemId, size } = req.body;

    const validationError = validateCartItem(itemId, size);

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    const userId = req.user._id;

    // Atomic increment: safely increases quantity by 1.
    const cartPath = `cartData.${itemId}.${size}`;

    const user = await userModel.findByIdAndUpdate(
      userId,
      {
        $inc: {
          [cartPath]: 1,
        },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.json({
      success: true,
      message: "Item added to cart",
      cartData: normalizeCartData(user.cartData),
    });
  } catch (error) {
    console.error("Add to cart error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to add item to cart",
    });
  }
};

// ---------------- UPDATE CART QUANTITY ----------------

export const updateCart = async (req, res) => {
  try {
    const { itemId, size, quantity } = req.body;

    const validationError = validateCartItem(itemId, size);

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    const parsedQuantity = Number(quantity);

    if (
      !Number.isFinite(parsedQuantity) ||
      parsedQuantity < 0 ||
      !Number.isInteger(parsedQuantity)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid quantity",
      });
    }

    const cartPath = `cartData.${itemId}.${size}`;

    let updateOperation;

    if (parsedQuantity === 0) {
      updateOperation = {
        $unset: {
          [cartPath]: "",
        },
      };
    } else {
      updateOperation = {
        $set: {
          [cartPath]: parsedQuantity,
        },
      };
    }

    const user = await userModel.findByIdAndUpdate(
      req.user._id,
      updateOperation,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.json({
      success: true,
      message: "Cart updated",
      cartData: normalizeCartData(user.cartData),
    });
  } catch (error) {
    console.error("Update cart error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update cart",
    });
  }
};

// ---------------- CLEAR CART ----------------

export const clearCart = async (req, res) => {
  try {
    const user = await userModel.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          cartData: {},
        },
      },
      {
        new: true,
      }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.json({
      success: true,
      message: "Cart cleared successfully",
      cartData: {},
    });
  } catch (error) {
    console.error("Clear cart error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to clear cart",
    });
  }
};
