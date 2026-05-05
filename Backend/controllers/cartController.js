import { userModel } from "../models/usermodels.js";

// Get user cart
export const getCart = async (req, res) => {
  const userId = req.user._id;
  const user = await userModel.findById(userId);
  if (!user) return res.json({ success: false });
  res.json({ success: true, cartData: Object.fromEntries(user.cartData) });
};

// Add item to cart
export const addToCart = async (req, res) => {
  const { itemId, size } = req.body;
  const user = await userModel.findById(req.user._id);
  if (!user) return res.json({ success: false });

  const current = user.cartData.get(itemId) || {};
  current[size] = (current[size] || 0) + 1;
  user.cartData.set(itemId, current);
  await user.save();

  res.json({ success: true, cartData: Object.fromEntries(user.cartData) });
};

// Update cart quantity
export const updateCart = async (req, res) => {
  try {
    const { itemId, size, quantity } = req.body;
    const userId = req.user._id;

    const user = await userModel.findById(userId);

    if (!user) {
      return res.json({
        success: false,
        message: "User not found",
      });
    }

    let cartData = user.cartData || new Map();

    let itemData = cartData.get(itemId) || {};

    // IMPORTANT FIX
    itemData = { ...itemData };

    if (quantity <= 0) {
      delete itemData[size];

      if (Object.keys(itemData).length === 0) {
        cartData.delete(itemId);
      } else {
        cartData.set(itemId, itemData);
      }
    } else {
      itemData[size] = Number(quantity);
      cartData.set(itemId, itemData);
    }

    user.markModified("cartData");

    await user.save();

    return res.json({
      success: true,
      cartData: Object.fromEntries(user.cartData),
    });
  } catch (error) {
    console.log(error);

    return res.json({
      success: false,
      message: error.message,
    });
  }
};


export const clearCart = async (req, res) => {
  try {
    await userModel.findByIdAndUpdate(req.user._id, {
      cartData: {},
    });

    res.json({ success: true, message: "Cart cleared" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};