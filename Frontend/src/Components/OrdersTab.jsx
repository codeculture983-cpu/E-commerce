/* eslint-disable react-hooks/exhaustive-deps */
 
/* eslint-disable no-unused-vars */
// src/components/OrdersTab.jsx
import React, { useContext, useEffect, useState } from "react";
import { ProfileContext } from "../Context/ProfileContext";
import { ShopContext } from "../Context/ShopContext";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";

dayjs.extend(utc);
dayjs.extend(timezone);

const statusSteps = [
  "Order Placed",
  "Packing",
  "Shipped",
  "Out for Delivery",
  "Delivered",
  "Cancelled",
];

const OrdersTab = () => {
  const { orders: contextOrders, fetchProfileOrders } = useContext(ProfileContext);
  const { backend_url, currency, token } = useContext(ShopContext);
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [imgIndex, setImgIndex] = useState({});
  const [trackModal, setTrackModal] = useState({ open: false, order: null });
  const [sortOption, setSortOption] = useState("newest");

  // Load orders from context
  useEffect(() => {
    if (contextOrders?.length) setOrders(contextOrders);
    else fetchProfileOrders?.();
  }, [contextOrders]);

  const getImages = (item) => {
    if (item.images?.length)
      return item.images.map((img) =>
        img.startsWith("http") ? img : `${backend_url}/${img}`
      );
    if (item.image)
      return [item.image.startsWith("http") ? item.image : `${backend_url}/${item.image}`];
    return [assets.parcel_icon];
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setImgIndex((prev) => {
        const updated = { ...prev };
        orders.forEach((item, i) => {
          const imgs = getImages(item.items[0]);
          updated[i] = ((prev[i] || 0) + 1) % imgs.length;
        });
        return updated;
      });
    }, 3500);
    return () => clearInterval(interval);
  }, [orders]);

  const nextSlide = (i, images) =>
    setImgIndex((prev) => ({ ...prev, [i]: ((prev[i] || 0) + 1) % images.length }));
  const prevSlide = (i, images) =>
    setImgIndex((prev) => ({ ...prev, [i]: prev[i] === 0 ? images.length - 1 : (prev[i] || 0) - 1 }));

  const formatDate = (date) => dayjs(date).tz("Asia/Karachi").format("DD MMM YYYY, hh:mm A");

  const handleCancel = async (orderId, status) => {
    if (status === "Delivered" || status === "Cancelled") return;
    try {
      const res = await fetch(`${backend_url}/api/order/cancel`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Order cancelled");
        fetchProfileOrders?.();
      } else toast.error(data.message);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const openTrack = (order) => setTrackModal({ open: true, order });
  const closeTrack = () => setTrackModal({ open: false, order: null });

  const sortedOrders = [...orders].sort((a, b) => {
    switch (sortOption) {
      case "oldest":
        return new Date(a.createdAt) - new Date(b.createdAt);
      case "priceLowHigh":
        return a.amount - b.amount;
      case "priceHighLow":
        return b.amount - a.amount;
      default:
        return new Date(b.createdAt) - new Date(a.createdAt);
    }
  });

  if (!orders.length) return <p className="text-center text-gray-500 mt-10">No orders found.</p>;

  return (
    <div className="space-y-6">
      {/* Sort */}
      <div className="flex justify-end mb-4">
        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          className="border rounded px-3 py-1 shadow-sm"
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="priceLowHigh">Price: Low to High</option>
          <option value="priceHighLow">Price: High to Low</option>
        </select>
      </div>

      {/* Orders */}
      {sortedOrders.map((order, index) => {
        const images = getImages(order.items[0]);
        const current = imgIndex[index] || 0;
        const stepIndex = statusSteps.indexOf(order.status);

        return (
          <motion.div
            key={order._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-white border rounded-xl shadow-md p-5 flex flex-col md:flex-row gap-4 hover:shadow-xl transition-shadow"
          >
            {/* Image Slider */}
            <div className="relative w-32 h-32 rounded-lg overflow-hidden flex-shrink-0">
              <AnimatePresence mode="wait">
                <motion.img
                  key={current}
                  src={images[current]}
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -50, opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="w-full h-full object-cover"
                  onError={(e) => (e.target.src = assets.parcel_icon)}
                />
              </AnimatePresence>
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => prevSlide(index, images)}
                    className="absolute left-1 top-1/2 -translate-y-1/2 bg-white rounded-full p-1 shadow hover:bg-gray-100"
                  >
                    ◀
                  </button>
                  <button
                    onClick={() => nextSlide(index, images)}
                    className="absolute right-1 top-1/2 -translate-y-1/2 bg-white rounded-full p-1 shadow hover:bg-gray-100"
                  >
                    ▶
                  </button>
                </>
              )}
            </div>

            {/* Order Details */}
            <div className="flex-1 flex flex-col justify-between gap-2">
              <div>
                <h3 className="text-lg font-semibold">{order.items[0].name}</h3>
                <p className="text-gray-700">{currency}{order.amount}</p>
                <p className="text-gray-500 text-sm">Qty: {order.items[0].quantity}</p>
                <p className="text-gray-500 text-sm">Date: {formatDate(order.createdAt)}</p>
                <p className="text-gray-500 text-sm">
                  Payment: {order.paymentMethod} ({order.payment ? "Paid" : "Pending"})
                </p>
              </div>

              <div className="flex gap-2 flex-wrap mt-2">
                <button
                  onClick={() => navigate(`/order/${order._id}`)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded shadow"
                >
                  View Details
                </button>
                <button
                  onClick={() => openTrack(order)}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded shadow"
                >
                  Track Order
                </button>
                {order.status !== "Delivered" && order.status !== "Cancelled" && (
                  <button
                    onClick={() => handleCancel(order._id, order.status)}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-1 rounded shadow"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>

            {/* Status Tracker */}
            <div className="flex flex-col justify-center gap-2">
              {statusSteps.map((s, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded-full ${i <= stepIndex ? "bg-green-500" : "bg-gray-300"}`}
                  ></div>
                  <span className="text-sm">{s}</span>
                </div>
              ))}
            </div>
          </motion.div>
        );
      })}

      {/* Track Modal */}
      {trackModal.open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg relative"
          >
            <h3 className="text-xl font-bold mb-4">Order Tracking</h3>
            <button
              className="absolute top-3 right-3 text-gray-600 font-bold text-lg"
              onClick={closeTrack}
            >
              ✖
            </button>
            {statusSteps.map((step, i) => {
              const completed = statusSteps.indexOf(trackModal.order.status) >= i;
              return (
                <div key={i} className="flex items-center gap-3 mb-3">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      completed ? "bg-green-500 text-white" : "bg-gray-300"
                    }`}
                  >
                    {completed ? "✓" : i + 1}
                  </div>
                  <div>
                    <p className={completed ? "font-semibold" : "text-gray-500"}>{step}</p>
                    {completed && (
                      <p className="text-xs text-gray-400">
                        {formatDate(trackModal.order.createdAt)}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default OrdersTab;