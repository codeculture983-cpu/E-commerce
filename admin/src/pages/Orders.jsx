
import React, { useEffect, useState, useContext, useCallback } from "react";
import { ShopContext } from "../Context/ShopContext";
import axios from "axios";
import Title from "../Components/Title";
import { FaEye, FaTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const steps = [
  "Order Placed",
  "Packing",
  "Shipped",
  "Out for Delivery",
  "Delivered",
];

const Orders = () => {
  const { token, currency, backend_url } = useContext(ShopContext);

  const [orders, setOrders] = useState([]);
  const [user, setUser] = useState(null);
  const [openTrack, setOpenTrack] = useState(null);

  const navigate = useNavigate();

  // ================= FETCH USER =================
  const fetchUser = useCallback(async () => {
    try {
      const res = await axios.get(`${backend_url}/api/user/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUser(res.data.user);
    } catch (err) {
      console.log("Fetch user error:", err);
    }
  }, [backend_url, token]);

  // ================= FETCH ORDERS =================
  const fetchOrders = useCallback(async () => {
    try {
      const res = await axios.get(
        `${backend_url}/api/order/userorders`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data.success) {
        const updatedOrders = [...(res.data.orders || [])].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        setOrders(updatedOrders);
      }
    } catch (error) {
      console.log("Fetch orders error:", error);
    }
  }, [backend_url, token]);

  // ================= INITIAL LOAD + AUTO REFRESH =================
  useEffect(() => {
    if (!token) {
      setOrders([]);
      setUser(null);
      return;
    }

    fetchUser();
    fetchOrders();

    const interval = setInterval(() => {
      fetchOrders();
    }, 10000);

    return () => clearInterval(interval);
  }, [token, fetchUser, fetchOrders]);

  // ================= STEP =================
  const getStep = (status) => {
    if (status === "Cancelled") return -1;
    return steps.indexOf(status);
  };

  // ================= TRACK TOGGLE =================
  const toggleTrack = (id) => {
    setOpenTrack((prev) => (prev === id ? null : id));
  };

  // Tracking OFF = hide tracking UI
  const trackingEnabled = user?.privacy?.activityTracking !== false;

  return (
    <div className="max-w-5xl mx-auto p-4">

      <Title text1="MY" text2="ORDERS" />

      {orders.length === 0 && (
        <p className="text-center text-gray-500 mt-10">
          No orders found
        </p>
      )}

      {orders.map((order) => {
        const cancelled = order.status === "Cancelled";
        const currentStep = getStep(order.status);

        return (
          <div key={order._id} className="border p-5 rounded-xl mb-6">

            {/* HEADER */}
            <div className="flex flex-col sm:flex-row justify-between gap-2 border-b pb-2">
              <p className="text-sm text-gray-600 break-all">
                ORDER ID: #{order._id}
              </p>

              <p className="font-bold">
                {currency} {Number(order.amount || 0).toFixed(2)}
              </p>
            </div>

            {/* ITEMS */}
            {order.items?.map((item, i) => {
              const snap = item.snapshot || {};

              return (
                <div key={i} className="flex gap-4 mt-4">

                  <img
                    src={
                      snap.image?.trim()
                        ? snap.image
                        : "/placeholder.png"
                    }
                    alt={snap.name || "Product"}
                    className="w-20 h-20 object-cover rounded border"
                  />

                  <div className="flex justify-between w-full gap-2">

                    <div>
                      <p className="font-semibold">
                        {snap.name || "Product"}
                      </p>

                      <p className="text-sm text-gray-500">
                        Size: {snap.size || "-"}
                      </p>

                      <p className="text-sm">
                        Qty: {item.quantity}
                      </p>
                    </div>

                    <p className="font-semibold whitespace-nowrap">
                      {currency}
                      {(
                        Number(snap.price || 0) *
                        Number(item.quantity || 0)
                      ).toFixed(2)}
                    </p>

                  </div>
                </div>
              );
            })}

            {/* CURRENT STATUS */}
            <div className="mt-4">
              <p className="text-sm">
                Order Status:{" "}
                <span
                  className={`font-semibold ${
                    cancelled ? "text-red-600" : "text-green-600"
                  }`}
                >
                  {order.status || "Order Placed"}
                </span>
              </p>
            </div>

            {/* ACTIONS */}
            <div className="flex flex-wrap gap-4 mt-4">

              {/* TRACK BUTTON */}
              {trackingEnabled && (
                <button
                  onClick={() => toggleTrack(order._id)}
                  className="text-blue-600 flex items-center gap-1"
                >
                  <FaEye />
                  {openTrack === order._id ? "Hide Tracking" : "Track Order"}
                </button>
              )}

              {/* DETAILS */}
              <button
                onClick={() => navigate(`/order/${order._id}`)}
                className="text-green-600"
              >
                Details
              </button>

              {/* CANCEL */}
              {order.status === "Order Placed" && (
                <button
                  type="button"
                  disabled
                  title="Order cancellation is not connected yet"
                  className="text-red-400 flex items-center gap-1 cursor-not-allowed"
                >
                  <FaTimes /> Cancel
                </button>
              )}

            </div>

            {/* TRACKING TIMELINE */}
            {trackingEnabled && openTrack === order._id && (
              <div className="mt-5 border-t pt-4">

                <h3 className="font-semibold mb-3">
                  Order Tracking
                </h3>

                {cancelled ? (
                  <p className="text-red-600 font-semibold">
                    ✕ This order has been cancelled.
                  </p>
                ) : (
                  <div className="flex justify-between gap-1">

                    {steps.map((step, index) => {
                      const active = index <= currentStep;

                      return (
                        <div
                          key={step}
                          className="text-center flex-1 min-w-0"
                        >
                          <div
                            className={`w-7 h-7 mx-auto rounded-full flex items-center justify-center text-white text-xs ${
                              active ? "bg-green-500" : "bg-gray-300"
                            }`}
                          >
                            {index + 1}
                          </div>

                          <p className="text-[10px] sm:text-xs mt-2">
                            {step}
                          </p>
                        </div>
                      );
                    })}

                  </div>
                )}

              </div>
            )}

          </div>
        );
      })}

    </div>
  );
};

export default Orders;
