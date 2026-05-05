/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../Context/ShopContext";
import { assets } from "../assets/assets";
import CartTotal from "../Components/CartTotal";
import Title from "../Components/Title";
import { toast } from "react-toastify";

const Cart = () => {
  const {
    products,
    currency,
    cartItems,
    setCartItems,
    updateQuantity,
    getUserCart,
    token,
    navigate,
  } = useContext(ShopContext);

  const [cartData, setCartData] = useState([]);

  /* =========================
     GET FINAL PRICE
  ========================= */
  const getFinalPrice = (product) => {
    const originalPrice = Number(product.price || 0);
    const discountPrice = Number(product.discountPrice || 0);

    if (
      discountPrice > 0 &&
      discountPrice < originalPrice
    ) {
      return discountPrice;
    }

    return originalPrice;
  };

  /* =========================
     GET DISCOUNT %
  ========================= */
  const getDiscountPercent = (product) => {
    const originalPrice = Number(product.price || 0);
    const discountPrice = Number(product.discountPrice || 0);

    if (
      discountPrice > 0 &&
      discountPrice < originalPrice
    ) {
      return Math.round(
        ((originalPrice - discountPrice) /
          originalPrice) *
          100
      );
    }

    return 0;
  };

  /* =========================
     CONVERT CART OBJECT → UI ARRAY
  ========================= */
  useEffect(() => {
    const tempData = [];

    for (const itemId in cartItems) {
      for (const size in cartItems[itemId]) {
        if (cartItems[itemId][size] > 0) {
          tempData.push({
            _id: itemId,
            size: size,
            quantity: cartItems[itemId][size],
          });
        }
      }
    }

    setCartData(tempData);
  }, [cartItems]);

  /* =========================
     LOAD CART
  ========================= */
  useEffect(() => {
    const loadCart = async () => {
      if (token) {
        await getUserCart(token);
      } else {
        const guestCart =
          localStorage.getItem("guestCart");

        if (guestCart) {
          setCartItems(JSON.parse(guestCart));
        }
      }
    };

    loadCart();
  }, [token]);

  /* =========================
     SAVE GUEST CART
  ========================= */
  useEffect(() => {
    if (!token) {
      localStorage.setItem(
        "guestCart",
        JSON.stringify(cartItems)
      );
    }
  }, [cartItems, token]);

  /* =========================
     UPDATE QUANTITY
  ========================= */
  const handleUpdateQuantity = async (
    itemId,
    size,
    quantity
  ) => {
    if (quantity < 0) quantity = 0;

    if (
      cartItems[itemId]?.[size] !== quantity
    ) {
      await updateQuantity(
        itemId,
        size,
        quantity
      );

      if (quantity === 0) {
        toast.success(
          "Item removed from cart"
        );
      } else {
        toast.success("Cart updated");
      }
    }
  };

  /* =========================
     REMOVE ITEM
  ========================= */
  const handleRemoveItem = async (
    itemId,
    size
  ) => {
    await handleUpdateQuantity(
      itemId,
      size,
      0
    );
  };

  return (
    <div className="border-t pt-14">
      {/* TITLE */}
      <div className="text-2xl mb-3">
        <Title text1="YOUR" text2="CART" />
      </div>

      {/* EMPTY CART */}
      {cartData.length === 0 && (
        <div className="text-center py-16 text-gray-500">
          <p className="text-lg">
            Your cart is empty
          </p>
        </div>
      )}

      {/* CART ITEMS */}
      <div>
        {cartData.map((item, index) => {
          const productData = products.find(
            (product) =>
              product._id === item._id
          );

          if (!productData) return null;

          const originalPrice = Number(
            productData.price || 0
          );

          const finalPrice =
            getFinalPrice(productData);

          const discountPercent =
            getDiscountPercent(productData);

          const hasDiscount =
            finalPrice < originalPrice;

          return (
            <div
              key={index}
              className="py-4 border-t border-b text-gray-700 
              grid grid-cols-[4fr_0.5fr_0.5fr] 
              sm:grid-cols-[4fr_2fr_0.5fr] 
              items-center gap-4"
            >
              {/* PRODUCT INFO */}
              <div className="flex items-start gap-6">
                <img
                  className="w-16 sm:w-20"
                  src={
                    productData.images?.[0] ||
                    productData.image?.[0] ||
                    "/placeholder.png"
                  }
                  alt={productData.name}
                />

                <div>
                  <p className="text-xs sm:text-lg font-medium">
                    {productData.name}
                  </p>

                  <div className="mt-2">
                    {hasDiscount ? (
                      <>
                        {/* original price */}
                        <p className="text-sm text-gray-400 line-through">
                          {currency}
                          {originalPrice}
                        </p>

                        {/* discount price + % */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-bold text-green-600">
                            {currency}
                            {finalPrice}
                          </p>

                          <span className="bg-red-100 text-red-600 text-xs font-semibold px-2 py-1 rounded">
                            {discountPercent}% OFF
                          </span>
                        </div>
                      </>
                    ) : (
                      <p className="font-bold">
                        {currency}
                        {originalPrice}
                      </p>
                    )}

                    {/* size */}
                    <p className="px-2 sm:px-3 sm:py-1 border bg-slate-50 inline-block mt-2">
                      {item.size}
                    </p>
                  </div>
                </div>
              </div>

              {/* QUANTITY */}
              <input
                type="number"
                min={1}
                className="border max-w-10 sm:max-w-20 px-1 sm:px-2 py-1"
                value={item.quantity}
                onChange={(e) =>
                  handleUpdateQuantity(
                    item._id,
                    item.size,
                    Number(
                      e.target.value
                    )
                  )
                }
              />

              {/* REMOVE */}
              <img
                onClick={() =>
                  handleRemoveItem(
                    item._id,
                    item.size
                  )
                }
                className="w-4 mr-4 sm:w-5 cursor-pointer"
                src={assets.bin_icon}
                alt="Remove"
              />
            </div>
          );
        })}
      </div>

      {/* CART TOTAL */}
      {cartData.length > 0 && (
        <div className="flex justify-end my-20">
          <div className="w-full sm:w-[450px]">
            <CartTotal />

            <div className="w-full text-end">
              <button
                onClick={() =>
                  navigate("/placeorder")
                }
                className="bg-black text-white text-sm my-8 px-8 py-3"
              >
                PROCEED TO CHECKOUT
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;