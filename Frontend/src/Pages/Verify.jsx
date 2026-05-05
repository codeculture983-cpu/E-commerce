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
      if (!token) {
        return null;
      }

      const response = await axios.post(
        backend_url + "/api/order/verifyStripe",
        { success, orderId },
        {
          headers: { Authorization: `Bearer ${token}` } 
        }
      );

      if (response.data.success) {
        setCartItems({});
        navigate("/orders");
      } else {
        navigate("/cart");
      }

    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (token && success && orderId) {
      verifyPayment();
    }
  }, [token, success, orderId]); 

  return (
    <div className="min-h-[60vh] flex items-center justify-center text-lg">
      Verifying Payment...
    </div>
  );
};

export default Verify;