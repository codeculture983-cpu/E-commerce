import React, { useEffect, useContext } from "react";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ShopContext } from "../Context/ShopContext";
import { toast } from "react-toastify";

const Verify = () => {
  const navigate = useNavigate();
  const { token, setCartItems, backend_url } = useContext(ShopContext);

  const [searchParams] = useSearchParams();

  const success = searchParams.get("success");
  const orderId = searchParams.get("orderId");

  const verifyPayment = async () => {
    try {
      if (!token || !orderId) return;

      const response = await axios.post(
        backend_url + "/api/order/verifyStripe",
        { success, orderId },
        {
          headers: {
            Authorization: `Bearer ${token}`, // ✅ FIXED
          },
        }
      );

      if (response.data.success) {
        setCartItems({});
        toast.success("Payment Successful 🎉");
        navigate("/orders");
      } else {
        toast.error("Payment Failed ❌");
        navigate("/cart");
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Verification failed");
      navigate("/cart");
    }
  };

  useEffect(() => {
    if (orderId && success && token) {
      verifyPayment();
    }
  }, [orderId, success, token]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center text-lg">
      Verifying Payment...
    </div>
  );
};

export default Verify;
