/* eslint-disable no-unused-vars */
import { useEffect, useState, useContext } from "react";
import axios from "../services/api";
import { AuthContext } from "../context/AuthContext";

export default function OrdersTab() {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      const res = await axios.get("/order/user");
      setOrders(res.data.orders);
    };
    fetchOrders();
  }, []);

  return (
    <div>
      {orders.map((o) => (
        <div key={o._id} style={{ border: "1px solid #ccc", margin: "5px", padding: "10px" }}>
          <h4>Order ID: {o._id}</h4>
          <p>Status: {o.status}</p>
          <p>Total: {o.amount}</p>
          <p>Items: {o.items.map((i) => `${i.productName} x${i.qty}`).join(", ")}</p>
        </div>
      ))}
    </div>
  );
}