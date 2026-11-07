
import React, { useEffect, useRef, useState, useContext } from "react";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ShopContext } from "../Context/ShopContext";
import { toast } from "react-toastify";

const Verify = () => {
  const navigate = useNavigate();

  const { token, setCartItems, backend_url } =
    useContext(ShopContext);

  const [searchParams] = useSearchParams();

  const success = searchParams.get("success");
  const orderId = searchParams.get("orderId");

  const [status, setStatus] = useState("Verifying your payment...");
  const [loading, setLoading] = useState(true);

  const verificationStarted = useRef(false);

  useEffect(() => {
    const verifyPayment = async () => {
      if (!token || !orderId || !success) return;

      // Prevent duplicate API requests
      if (verificationStarted.current) return;

      verificationStarted.current = true;

      try {
        setLoading(true);
        setStatus("Verifying your Stripe payment...");

        const response = await axios.post(
          `${backend_url}/api/order/verifyStripe`,
          {
            success,
            orderId,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            timeout: 20000,
          }
        );

        if (response.data.success) {
          setCartItems({});

          setStatus("Payment successful!");

          toast.success("Payment Successful!");

          setTimeout(() => {
            navigate("/orders", { replace: true });
          }, 1500);

        } else {
          setStatus("Payment verification failed.");

          toast.error(
            response.data.message || "Payment Failed"
          );

          setTimeout(() => {
            navigate("/cart", { replace: true });
          }, 1500);
        }

      } catch (error) {
        console.error(
          "Stripe verification error:",
          error.response?.data || error.message
        );

        setStatus(
          error.code === "ECONNABORTED"
            ? "Payment verification timed out. Please check your orders."
            : error.response?.data?.message ||
              "Unable to verify payment."
        );

        toast.error(
          error.response?.data?.message ||
          "Payment verification failed"
        );

        setTimeout(() => {
          navigate("/orders", { replace: true });
        }, 2500);

      } finally {
        setLoading(false);
      }
    };

    if (token && orderId && success) {
      verifyPayment();
    }

  }, [token, orderId, success, backend_url, navigate, setCartItems]);

  if (!orderId || !success) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <h2 className="text-xl font-semibold text-red-600">
          Invalid Payment Information
        </h2>

        <button
          onClick={() => navigate("/cart")}
          className="bg-black text-white px-6 py-2"
        >
          Back to Cart
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-5 px-4 text-center">

      {loading && (
        <div className="w-12 h-12 border-4 border-gray-300 border-t-black rounded-full animate-spin"></div>
      )}

      {!loading && status === "Payment successful!" && (
        <div className="text-green-600 text-5xl">
          ✓
        </div>
      )}

      {!loading && status !== "Payment successful!" && (
        <div className="text-red-600 text-5xl">
          !
        </div>
      )}

      <h2 className="text-2xl font-semibold">
        {status}
      </h2>

      {loading && (
        <p className="text-gray-500 text-sm">
          Please don't close or refresh this page.
        </p>
      )}

    </div>
  );
};

export default Verify;
