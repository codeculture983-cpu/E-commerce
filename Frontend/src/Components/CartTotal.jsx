/* eslint-disable react-hooks/set-state-in-effect */

import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../Context/ShopContext";

const CartTotal = () => {
  const {
    cartItems,
    products,
    currency,
    delivery_fee,
  } = useContext(ShopContext);

  const [subtotal, setSubtotal] = useState(0);
  const [total, setTotal] = useState(0);
  const [originalSubtotal, setOriginalSubtotal] =
    useState(0);

  /* =========================
     GET FINAL PRICE
  ========================= */
  const getFinalPrice = (product) => {
    const originalPrice = Number(product.price || 0);
    const discountPrice = Number(
      product.discountPrice || 0
    );

    // if discount exists → use discount price
    if (
      discountPrice > 0 &&
      discountPrice < originalPrice
    ) {
      return discountPrice;
    }

    return originalPrice;
  };

  useEffect(() => {
    let newSubtotal = 0; // discounted subtotal
    let newOriginalSubtotal = 0; // original subtotal

    for (const prodId in cartItems) {
      const product = products.find(
        (p) => p._id === prodId
      );

      if (!product) continue;

      const originalPrice = Number(
        product.price || 0
      );

      const finalPrice =
        getFinalPrice(product);

      for (const size in cartItems[prodId]) {
        const qty =
          Number(cartItems[prodId][size]) || 0;

        // original price total
        newOriginalSubtotal +=
          originalPrice * qty;

        // discounted price total
        newSubtotal += finalPrice * qty;
      }
    }

    setOriginalSubtotal(newOriginalSubtotal);
    setSubtotal(newSubtotal);
    setTotal(newSubtotal + delivery_fee);
  }, [cartItems, products, delivery_fee]);

  const hasDiscount =
    subtotal < originalSubtotal;

  return (
    <div className="border p-4 bg-gray-50 rounded-md">
      <h3 className="text-lg font-medium mb-4">
        CART TOTAL
      </h3>

      {/* SUBTOTAL */}
      <div className="flex justify-between mb-3">
        <span>Subtotal</span>

        <div className="text-right">
          {hasDiscount ? (
            <>
              {/* Original Price */}
              <p className="text-sm text-gray-400 line-through">
                {currency}
                {originalSubtotal}
              </p>

              {/* Discounted Price */}
              <p className="font-semibold text-green-600">
                {currency}
                {subtotal}
              </p>
            </>
          ) : (
            <p>
              {currency}
              {subtotal}
            </p>
          )}
        </div>
      </div>

      {/* SHIPPING */}
      <div className="flex justify-between mb-2">
        <span>Shipping Fee</span>
        <span>
          {currency}
          {delivery_fee}
        </span>
      </div>

      {/* TOTAL */}
      <div className="flex justify-between font-semibold text-lg border-t pt-3 mt-3">
        <span>Total</span>

        <span>
          {currency}
          {total}
        </span>
      </div>
    </div>
  );
};

export default CartTotal;