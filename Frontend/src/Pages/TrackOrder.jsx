import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { ShopContext } from "../Context/ShopContext";

const steps = ["Order Placed", "Packing", "Shipped", "Delivered"];

const TrackOrder = () => {
  const { id } = useParams();
  const { backend_url, token } = useContext(ShopContext);
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      const res = await axios.get(
        `${backend_url}/api/order/single/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data.success) setOrder(res.data.order);
    };

    fetchOrder();
  }, [id]);

  const getStep = (status) => steps.indexOf(status);

  if (!order) return <p>Loading...</p>;

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">Track Order</h2>

      <p>Order ID: {order._id}</p>
      <p>Status: <b>{order.status}</b></p>

      <div className="flex justify-between mt-6">
        {steps.map((s, i) => (
          <div key={i} className="text-center">
            <div
              className={`w-6 h-6 rounded-full mx-auto ${
                i <= getStep(order.status)
                  ? "bg-green-500 text-white"
                  : "bg-gray-300"
              }`}
            >
              {i + 1}
            </div>
            <p className="text-xs">{s}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrackOrder;