/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { ShopContext } from "../Context/ShopContext";

const PaymentHistory = () => {
  const { backend_url, token, currency } = useContext(ShopContext);
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    const fetchPayments = async () => {
      const res = await axios.get(
        `${backend_url}/api/payment/history`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setPayments(res.data.payments);
    };
    fetchPayments();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl mb-4">Payment History</h2>

      {payments.map((p, i) => (
        <div key={i} className="border p-3 mb-3">
          <p>Order ID: {p._id}</p>
          <p>Amount: {currency}{p.amount}</p>
          <p>Method: {p.paymentMethod}</p>
          <p>Status: Paid ✅</p>
        </div>
      ))}
    </div>
  );
};

export default PaymentHistory;