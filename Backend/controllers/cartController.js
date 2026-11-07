
import mongoose from "mongoose";
import { userModel } from "../models/usermodels.js";

// Convert cart data into a normal JavaScript object.
const normalizeCartData = (cartData) => {
  if (!cartData) return {};

  if (cartData instanceof Map) {
    return Object.fromEntries(
      Array.from(cartData.entries()).map(([itemId, sizes]) => [
        itemId,
        sizes instanceof Map
          ? Object.fromEntries(sizes)
          : { ...(sizes || {}) },
      ])
    );
  }

  if (typeof cartData === "object") {
    return Object.fromEntries(
      Object.entries(cartData).map(([itemId, sizes]) => [
        itemId,
        sizes instanceof Map
          ? Object.fromEntries(sizes)
          : { ...(sizes || {}) },
      ])
    );
  }

  return {};
};

// Validate product ID and size.
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

// ---------------- GET CART ----------------

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

// ---------------- ADD TO CART ----------------

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

    const safeSize = size.trim();
    const cartPath = `cartData.${itemId}.${safeSize}`;

    // Atomically increment only this product's selected size.
    const user = await userModel.findByIdAndUpdate(
      req.user._id,
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

// ---------------- UPDATE CART ----------------

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
      !Number.isInteger(parsedQuantity) ||
      parsedQuantity < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid quantity",
      });
    }

    const safeSize = size.trim();
    const cartPath = `cartData.${itemId}.${safeSize}`;

    const updateOperation =
      parsedQuantity === 0
        ? {
            $unset: {
              [cartPath]: "",
            },
          }
        : {
            $set: {
              [cartPath]: parsedQuantity,
            },
          };

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
