import React, { useEffect, useState, useContext } from "react";
import { ShopContext } from "../Context/ShopContext";
import axios from "axios";
import Title from "../Components/Title";
import { FaEye, FaTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const steps = ["Order Placed", "Packing", "Shipped", "Delivered"];

const Orders = () => {
  const { token, currency, backend_url } = useContext(ShopContext);
  const [orders, setOrders] = useState([]);
  const [user, setUser] = useState(null);
  const [openTrack, setOpenTrack] = useState(null);
  const navigate = useNavigate();

  // ================= FETCH USER =================
  const fetchUser = async () => {
    try {
      const res = await axios.get(`${backend_url}/api/user/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUser(res.data.user);
    } catch (err) {
      console.log(err);
    }
  };

  // ================= FETCH ORDERS =================
  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${backend_url}/api/order/userorders`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        setOrders(res.data.orders.reverse());
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (token) {
      fetchUser();
      fetchOrders();
    }
  }, [token]);

  // ================= STEP =================
  const getStep = (status) => {
    const index = steps.indexOf(status);
    return index === -1 ? 0 : index;
  };

  const toggleTrack = (id) => {
    setOpenTrack(openTrack === id ? null : id);
  };

  // ❌ IMPORTANT: tracking OFF = hide all tracking UI
  const trackingEnabled = user?.privacy?.activityTracking !== false;

  return (
    <div className="max-w-5xl mx-auto p-4">

      <Title text1="MY" text2="ORDERS" />

      {orders.length === 0 && (
        <p className="text-center text-gray-500 mt-10">
          No orders found
        </p>
      )}

      {orders.map((order) => (
        <div key={order._id} className="border p-5 rounded-xl mb-6">

          {/* HEADER */}
          <div className="flex justify-between border-b pb-2">
            <p className="text-sm text-gray-600">
              ORDER ID: #{order._id}
            </p>
            <p className="font-bold">
              {currency} {order.amount}
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
                  className="w-20 h-20 object-cover rounded border"
                />

                <div className="flex justify-between w-full">

                  <div>
                    <p className="font-semibold">
                      {snap.name || "Product"}
                    </p>
                    <p className="text-sm text-gray-500">
                      Size: {snap.size || "-"}
                    </p>
                    <p className="text-sm">Qty: {item.quantity}</p>
                  </div>

                  <p className="font-semibold">
                    {currency}
                    {((snap.price || 0) * item.quantity).toFixed(2)}
                  </p>

                </div>
              </div>
            );
          })}

          {/* ACTIONS */}
          <div className="flex gap-4 mt-4">

            {/* TRACK BUTTON (ONLY IF ENABLED) */}
            {trackingEnabled && (
              <button
                onClick={() => toggleTrack(order._id)}
                className="text-blue-600 flex items-center gap-1"
              >
                <FaEye />
                {openTrack === order._id ? "Hide" : "Track"}
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
              <button className="text-red-500 flex items-center gap-1">
                <FaTimes /> Cancel
              </button>
            )}

          </div>

          {/* TRACK UI */}
          {trackingEnabled && openTrack === order._id && (
            <div className="mt-5">

              <p className="mb-3 text-sm">
                Status: <b>{order.status}</b>
              </p>

              <div className="flex justify-between">

                {steps.map((s, i) => {
                  const active = i <= getStep(order.status);

                  return (
                    <div key={i} className="text-center flex-1">

                      <div
                        className={`w-7 h-7 mx-auto rounded-full flex items-center justify-center text-white text-xs
                        ${active ? "bg-green-500" : "bg-gray-300"}`}
                      >
                        {i + 1}
                      </div>

                      <p className="text-xs mt-1">{s}</p>

                    </div>
                  );
                })}

              </div>

            </div>
          )}

        </div>
      ))}
    </div>
  );
};

export default Orders;