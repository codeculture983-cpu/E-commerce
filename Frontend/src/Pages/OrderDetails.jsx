
import React, { useEffect, useState, useContext, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ShopContext } from "../Context/ShopContext";
import axios from "axios";

const steps = [
  "Order Placed",
  "Packing",
  "Shipped",
  "Out for Delivery",
  "Delivered",
];

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { backend_url, token, currency } = useContext(ShopContext);

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ================= FETCH ORDER =================
  const fetchOrder = useCallback(async () => {
    try {
      const res = await axios.get(
        `${backend_url}/api/order/order/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data.success) {
        setOrder(res.data.order);
        setError("");
      } else {
        setError("Order not found.");
      }
    } catch (err) {
      console.log("Fetch order error:", err);
      setError(
        err.response?.data?.message || "Unable to load order details."
      );
    } finally {
      setLoading(false);
    }
  }, [backend_url, id, token]);

  // ================= INITIAL LOAD + AUTO REFRESH =================
  useEffect(() => {
    if (!token || !id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    fetchOrder();

    const interval = setInterval(() => {
      fetchOrder();
    }, 10000);

    return () => clearInterval(interval);
  }, [token, id, fetchOrder]);

  // ================= STATUS =================
  const isCancelled = order?.status === "Cancelled";

  const getStep = (status) => {
    return steps.indexOf(status);
  };

  const stepIndex = order ? getStep(order.status) : -1;

  // ================= LOADING =================
  if (loading) {
    return (
      <div className="p-5 text-center">
        Loading order details...
      </div>
    );
  }

  // ================= ERROR =================
  if (error || !order) {
    return (
      <div className="max-w-5xl mx-auto p-5 text-center">
        <p className="text-red-500 mb-4">
          {error || "Order not found."}
        </p>

        <button
          onClick={() => navigate("/orders")}
          className="bg-black text-white px-5 py-2 rounded"
        >
          Back to Orders
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-5 space-y-6">

      {/* HEADER */}
      <div className="border rounded p-4">
        <h2 className="text-2xl font-bold">
          Order Details
        </h2>

        <p className="text-sm text-gray-500 break-all">
          ID: {order._id}
        </p>

        <p className="mt-2">
          <b>Current Status:</b>{" "}
          <span
            className={
              isCancelled
                ? "text-red-600 font-semibold"
                : "text-green-600 font-semibold"
            }
          >
            {order.status}
          </span>
        </p>
      </div>

      {/* SUMMARY */}
      <div className="border rounded p-4 grid md:grid-cols-2 gap-4">

        <div>
          <p>
            <b>Status:</b> {order.status}
          </p>

          <p>
            <b>Payment:</b> {order.payment ? "Paid" : "Pending"}
          </p>

          <p>
            <b>Method:</b> {order.paymentMethod}
          </p>

          <p>
            <b>Total:</b> {currency}
            {Number(order.amount || 0).toFixed(2)}
          </p>
        </div>

        <div>
          <p className="font-semibold mb-2">
            Shipping Address
          </p>

          <p>
            {order.address?.firstName} {order.address?.lastName}
          </p>

          <p>{order.address?.street}</p>
          <p>
            {order.address?.city}, {order.address?.state}
          </p>
          <p>{order.address?.country}</p>
          <p>{order.address?.phone}</p>
        </div>

      </div>

      {/* TRACKING TIMELINE */}
      <div className="border rounded p-4">

        <h3 className="font-semibold mb-4">
          Order Progress
        </h3>

        <p className="mb-4 text-sm">
          Current Status: <b>{order.status}</b>
        </p>

        {isCancelled ? (
          <p className="text-red-600 font-semibold">
            ✕ This order has been cancelled.
          </p>
        ) : (
          <div className="flex justify-between gap-1">

            {steps.map((step, index) => {
              const active = index <= stepIndex;

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

      {/* PRODUCTS */}
      <div className="border rounded p-4">

        <h3 className="font-semibold mb-4">
          Products
        </h3>

        {order.items?.map((item, i) => {
          const snap = item.snapshot || {};

          return (
            <div
              key={i}
              className="flex items-center gap-4 border-b py-3"
            >

              <img
                src={
                  snap.image?.trim()
                    ? snap.image
                    : "/placeholder.png"
                }
                alt={snap.name || "Product"}
                className="w-16 h-16 object-cover rounded"
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

      </div>

      {/* BACK BUTTON */}
      <button
        onClick={() => navigate("/orders")}
        className="bg-black text-white px-5 py-2 rounded"
      >
        Back to My Orders
      </button>

    </div>
  );
};

export default OrderDetails;
