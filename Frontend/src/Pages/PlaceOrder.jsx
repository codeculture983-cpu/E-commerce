import React, { useContext, useState, useEffect } from "react";
import { ShopContext } from "../Context/ShopContext";
import Title from "../Components/Title";
import CartTotal from "../Components/CartTotal";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { assets } from "../assets/assets.js";

const PlaceOrder = () => {
  const {
    backend_url,
    token,
    cartItems,
    clearCart,
    getCartAmount,
    delivery_fee,
    products,
  } = useContext(ShopContext);

  const navigate = useNavigate();

  const [method, setMethod] = useState("cod");
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    state: "",
    zipcode: "",
    country: "",
    phone: "",
  });

  // Load Stripe script (optional future use)
  useEffect(() => {
    if (!window.Razorpay) {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const onChangeHandler = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // ================= ORDER ITEMS =================
  const getOrderItems = () => {
    let orderItems = [];

    for (const itemId in cartItems) {
      const product = products.find((item) => item._id === itemId);
      if (!product) continue;

      for (const size in cartItems[itemId]) {
        const quantity = cartItems[itemId][size];

        if (quantity > 0) {
          orderItems.push({
            productId: product._id,
            name: product.name,
            price: product.price,
            size,
            quantity,
            snapshot: {
              name: product.name,
              price: product.price,
              size,
              image: product.images?.[0] || "/placeholder.png",
            },
          });
        }
      }
    }

    return orderItems;
  };

  // ================= SUBMIT ORDER =================
  const onSubmitHandler = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const savedToken = token || localStorage.getItem("token");

      if (!savedToken) {
        toast.error("Please login first");
        navigate("/login");
        return;
      }

      const orderItems = getOrderItems();

      if (!orderItems.length) {
        toast.error("Cart is empty");
        return;
      }

      const orderData = {
        items: orderItems,
        amount: Number(getCartAmount()) + Number(delivery_fee),
        address: formData,
      };

      // ================= COD =================
      if (method === "cod") {
        const { data } = await axios.post(
          `${backend_url}/api/order/place`,
          orderData,
          {
            headers: { Authorization: `Bearer ${savedToken}` },
          }
        );

        if (data.success) {
          toast.success("Order placed successfully");
          await clearCart();
          localStorage.removeItem("guestCart");
          navigate("/orders");
        } else {
          toast.error(data.message);
        }
      }

      // ================= STRIPE =================
      if (method === "stripe") {
        const { data } = await axios.post(
          `${backend_url}/api/order/stripe`,
          orderData,
          {
            headers: { Authorization: `Bearer ${savedToken}` },
          }
        );

        if (data.success) {
          window.location.replace(data.session_url);
        } else {
          toast.error(data.message);
        }
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message || "Error placing order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={onSubmitHandler}
      className="flex flex-col lg:flex-row gap-8 pt-5"
    >
      {/* LEFT FORM */}
      <div className="w-full lg:max-w-[480px] flex flex-col gap-4">
        <Title text1="DELIVERY" text2="INFO" />

        {Object.keys(formData).map((key) => (
          <input
            key={key}
            required
            name={key}
            value={formData[key]}
            onChange={onChangeHandler}
            placeholder={key}
            className="border p-2 rounded"
          />
        ))}
      </div>

      {/* RIGHT SIDE */}
      <div className="w-full">
        <CartTotal />

        <div className="mt-5">
          <Title text1="PAYMENT" text2="METHOD" />

          <div className="flex flex-col gap-3 mt-3">
            <div onClick={() => setMethod("cod")} className="border p-3 cursor-pointer">
              Cash on Delivery
            </div>

            <div
              onClick={() => setMethod("stripe")}
              className="border p-3 cursor-pointer flex items-center gap-2"
            >
              <img src={assets.stripe_logo} className="h-5" />
              Stripe
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-black text-white py-3 mt-5"
          >
            {loading ? "Processing..." : "Place Order"}
          </button>
        </div>
      </div>
    </form>
  );
};

export default PlaceOrder;