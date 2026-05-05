import React, { useState, useContext } from "react";
import axios from "axios";
import { ShopContext } from "../Context/ShopContext.jsx";
import { toast } from "react-toastify";
import { useNavigate, useLocation } from "react-router-dom";

const ResetPassword = () => {
  const { backend_url } = useContext(ShopContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState(location.state?.email || "");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post(
        `${backend_url}/api/user/reset-password-otp`,
        {
          email,
          otp,
          newPassword,
        }
      );

      if (res.data.success) {
        toast.success(res.data.message);
        navigate("/login");
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      console.log(err);
      toast.error("Reset failed");
    }

    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <form
        onSubmit={handleSubmit}
        className="w-[90%] sm:max-w-96 border p-6 rounded shadow flex flex-col gap-4"
      >
        <h2 className="text-2xl font-semibold text-center">
          Reset Password
        </h2>

        <input
          type="email"
          placeholder="Email"
          className="border p-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="text"
          placeholder="OTP"
          className="border p-2"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="New Password"
          className="border p-2"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-black text-white py-2"
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;