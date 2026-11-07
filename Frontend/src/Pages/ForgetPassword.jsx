
import React, { useState, useContext } from "react";
import axios from "axios";
import { ShopContext } from "../Context/ShopContext.jsx";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const { backend_url } = useContext(ShopContext);

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      toast.error("Please enter your email address");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post(
        `${backend_url}/api/user/forgot-password`,
        {
          email: normalizedEmail,
        }
      );

      if (res.data.success) {
        toast.success(
          res.data.message || "OTP sent successfully to your email!"
        );

        navigate("/reset-password", {
          state: {
            email: normalizedEmail,
          },
        });
      } else {
        toast.error(res.data.message || "Unable to send OTP");
      }
    } catch (err) {
      console.error(
        "Forgot Password Error:",
        err.response?.data || err.message
      );

      toast.error(
        err.response?.data?.message ||
          "Failed to send OTP. Please check your email and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4">
      <form
        onSubmit={handleSubmit}
        className="w-[90%] sm:max-w-96 border p-6 rounded shadow flex flex-col gap-4"
      >
        <h2 className="text-2xl font-semibold text-center">
          Forgot Password
        </h2>

        <p className="text-sm text-gray-500 text-center">
          Enter your registered email address. We will send you a
          verification OTP to reset your password.
        </p>

        <input
          type="email"
          placeholder="Enter your email"
          className="border p-2 rounded outline-none focus:border-black"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
          autoComplete="email"
        />

        <button
          type="submit"
          disabled={loading || !email.trim()}
          className="bg-black text-white py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Sending OTP..." : "Send OTP"}
        </button>

        <button
          type="button"
          onClick={() => navigate("/login")}
          className="text-sm text-gray-600 hover:text-black"
        >
          Back to Login
        </button>
      </form>
    </div>
  );
};

export default ForgotPassword;
