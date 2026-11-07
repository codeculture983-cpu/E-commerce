
import React, { useContext, useMemo } from "react";
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
    updateQuantity,
    navigate,
  } = useContext(ShopContext);

  // Convert cart object into separate product-size rows
  const cartData = useMemo(() => {
    const items = [];

    if (!cartItems || typeof cartItems !== "object") {
      return items;
    }

    Object.entries(cartItems).forEach(([itemId, sizes]) => {
      if (!sizes || typeof sizes !== "object") return;

      Object.entries(sizes).forEach(([size, quantity]) => {
        const qty = Number(quantity);

        if (qty > 0) {
          items.push({
            _id: itemId,
            size,
            quantity: qty,
          });
        }
      });
    });

    return items;
  }, [cartItems]);

  // Final price
  const getFinalPrice = (product) => {
    const originalPrice = Number(product.price || 0);
    const discountPrice = Number(product.discountPrice || 0);

    return discountPrice > 0 && discountPrice < originalPrice
      ? discountPrice
      : originalPrice;
  };

  // Discount percentage
  const getDiscountPercent = (product) => {
    const originalPrice = Number(product.price || 0);
    const discountPrice = Number(product.discountPrice || 0);

    if (discountPrice > 0 && discountPrice < originalPrice) {
      return Math.round(
        ((originalPrice - discountPrice) / originalPrice) * 100
      );
    }

    return 0;
  };

  // Update quantity
  const handleUpdateQuantity = async (itemId, size, quantity) => {
    const newQuantity = Math.max(0, Math.floor(Number(quantity) || 0));

    if (Number(cartItems[itemId]?.[size]) === newQuantity) return;

    await updateQuantity(itemId, size, newQuantity);

    if (newQuantity === 0) {
      toast.success("Item removed from cart");
    } else {
      toast.success("Cart updated");
    }
  };

  // Remove only selected size
  const handleRemoveItem = async (itemId, size) => {
    await handleUpdateQuantity(itemId, size, 0);
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
          <p className="text-lg">Your cart is empty</p>
        </div>
      )}

      {/* CART ITEMS */}
      <div>
        {cartData.map((item) => {
          const productData = products.find(
            (product) => String(product._id) === String(item._id)
          );

          if (!productData) return null;

          const originalPrice = Number(productData.price || 0);
          const finalPrice = getFinalPrice(productData);
          const discountPercent = getDiscountPercent(productData);
          const hasDiscount = finalPrice < originalPrice;

          return (
            <div
              key={`${item._id}-${item.size}`}
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
                        <p className="text-sm text-gray-400 line-through">
                          {currency}{originalPrice}
                        </p>

                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-bold text-green-600">
                            {currency}{finalPrice}
                          </p>

                          <span className="bg-red-100 text-red-600 text-xs font-semibold px-2 py-1 rounded">
                            {discountPercent}% OFF
                          </span>
                        </div>
                      </>
                    ) : (
                      <p className="font-bold">
                        {currency}{originalPrice}
                      </p>
                    )}

                    {/* SIZE */}
                    <p className="px-2 sm:px-3 sm:py-1 border bg-slate-50 inline-block mt-2">
                      Size: {item.size}
                    </p>
                  </div>
                </div>
              </div>

              {/* QUANTITY */}
              <input
                type="number"
                min={1}
                step={1}
                className="border max-w-10 sm:max-w-20 px-1 sm:px-2 py-1"
                value={item.quantity}
                onChange={(e) =>
                  handleUpdateQuantity(
                    item._id,
                    item.size,
                    e.target.value
                  )
                }
              />

              {/* REMOVE */}
              <img
                onClick={() => handleRemoveItem(item._id, item.size)}
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
                type="button"
                onClick={() => navigate("/placeorder")}
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
