import React, { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const PaymentSuccess = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const verify = async () => {
      const orderId = params.get("orderId");
      const token = localStorage.getItem("token");

      try {
        await axios.post(
          "http://localhost:4000/api/order/verifyStripe",
          { success: true, orderId },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        toast.success("Payment Successful 🎉");

        setTimeout(() => {
          navigate("/orders");
        }, 1500);

      } catch (err) {
        console.log(err)
        toast.error("Payment failed");
      }
    };

    verify();
  }, []);

  return (
    <div className="h-screen flex flex-col justify-center items-center">
      <h1 className="text-2xl font-bold text-green-600">Processing Payment...</h1>
    </div>
  );
};

export default PaymentSuccess;