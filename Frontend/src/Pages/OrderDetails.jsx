import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
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
  const { backend_url, token, currency } = useContext(ShopContext);

  const [order, setOrder] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await axios.get(
          `${backend_url}/api/order/order/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (res.data.success) setOrder(res.data.order);
      } catch (err) {
        console.log(err);
      }
    };

    if (token) fetchOrder();
  }, [id, token]);

  const getStep = (status) => {
    if (status === "Cancelled") return -1;
    return steps.indexOf(status);
  };

  if (!order) return <p className="p-5">Loading order...</p>;

  const stepIndex = getStep(order.status);
  const isCancelled = order.status === "Cancelled";

  return (
    <div className="max-w-5xl mx-auto p-5 space-y-6">

      {/* HEADER */}
      <div className="border rounded p-4">
        <h2 className="text-2xl font-bold">Order Details</h2>
        <p className="text-sm text-gray-500">ID: {order._id}</p>
      </div>

      {/* SUMMARY */}
      <div className="border rounded p-4 grid md:grid-cols-2 gap-4">
        <div>
          <p><b>Status:</b> {order.status}</p>
          <p><b>Payment:</b> {order.payment ? "Paid" : "Pending"}</p>
          <p><b>Method:</b> {order.paymentMethod}</p>
          <p><b>Total:</b> {currency}{order.amount}</p>
        </div>

        <div>
          <p className="font-semibold mb-2">Shipping Address</p>
          <p>{order.address?.firstName} {order.address?.lastName}</p>
          <p>{order.address?.street}</p>
          <p>{order.address?.city}, {order.address?.state}</p>
          <p>{order.address?.country}</p>
          <p>{order.address?.phone}</p>
        </div>
      </div>

      {/* TRACKING */}
      <div className="border rounded p-4">
        <h3 className="font-semibold mb-4">Order Progress</h3>

        <div className="flex justify-between">

          {steps.map((s, i) => {
            const active = i <= stepIndex;

            return (
              <div key={i} className="text-center flex-1">

                <div
                  className={`w-7 h-7 mx-auto rounded-full flex items-center justify-center text-white
                  ${
                    isCancelled
                      ? "bg-red-500"
                      : active
                      ? "bg-green-500"
                      : "bg-gray-300"
                  }`}
                >
                  {i + 1}
                </div>

                <p className="text-xs mt-2">{s}</p>
              </div>
            );
          })}

          {/* CANCEL STATUS (extra visual indicator) */}
          {isCancelled && (
            <div className="text-center flex-1">
              <div className="w-7 h-7 mx-auto rounded-full bg-red-600 flex items-center justify-center text-white">
                ✕
              </div>
              <p className="text-xs mt-2 text-red-600">Cancelled</p>
            </div>
          )}

        </div>
      </div>

      {/* PRODUCTS (UNCHANGED) */}
      <div className="border rounded p-4">
        <h3 className="font-semibold mb-4">Products</h3>

        {order.items?.map((item, i) => {
          const snap = item.snapshot || {};

          return (
            <div key={i} className="flex items-center gap-4 border-b py-3">

              <img
                src={snap.image?.trim() ? snap.image : "/placeholder.png"}
                className="w-16 h-16 object-cover rounded"
              />

              <div className="flex justify-between w-full">
                <div>
                  <p className="font-semibold">{snap.name || "Product"}</p>
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
      </div>

    </div>
  );
};

export default OrderDetails;