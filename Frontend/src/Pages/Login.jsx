import React, { useState, useContext, useEffect } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { ShopContext } from "../Context/ShopContext";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

const Login = () => {
  const { login, token, navigate } = useContext(ShopContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (token) navigate("/");
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      return toast.error("All fields required");
    }

    await login(email, password);
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col w-[90%] sm:max-w-96 gap-4 border p-6 rounded-lg shadow"
      >
        <h1 className="text-3xl font-semibold text-center">Login</h1>

        {/* Email */}
        <input
          type="email"
          placeholder="Email"
          className="w-full border p-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        {/* Password */}
        <div className="relative w-full">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            className="w-full border p-2 pr-10"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <span
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-2.5 cursor-pointer"
          >
            {showPassword ? <FaEye /> : <FaEyeSlash />}
          </span>
        </div>

        {/* Button */}
        <button className="bg-black text-white py-2 w-full">
          Login
        </button>

        {/* Links */}
        <div className="flex justify-between text-sm mt-2">
          <Link to="/forgot-password" className="text-blue-600">
            Forgot Password?
          </Link>

          <Link to="/signup" className="text-green-600">
            Create Account
          </Link>
        </div>
      </form>
    </div>
  );
};

export default Login;