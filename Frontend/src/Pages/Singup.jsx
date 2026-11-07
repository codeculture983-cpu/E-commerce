
import React, { useState, useContext } from "react";
import axios from "axios";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { ShopContext } from "../Context/ShopContext";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

const Signup = () => {
  const { backend_url, navigate } = useContext(ShopContext);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !email || !password) {
      return toast.error("All fields required");
    }

    try {
      const res = await axios.post(`${backend_url}/api/user/register`, {
        name,
        email,
        password,
      });

      if (res.data.success) {
        toast.success("Account created successfully");
        navigate("/login");
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      console.log(err);
      toast.error("Signup failed");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col w-[90%] sm:max-w-96 gap-4 border p-6 rounded-lg shadow"
      >
        <h1 className="text-3xl font-semibold text-center">
          Sign Up
        </h1>

        {/* Name */}
        <input
          type="text"
          placeholder="Name"
          className="w-full border p-2"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        {/* Email */}
        <input
          type="email"
          placeholder="Email"
          className="w-full border p-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        {/* Password with Show/Hide Effect */}
        <div className="relative w-full">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            className="w-full border p-2 pr-10"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <FaEye /> : <FaEyeSlash />}
          </button>
        </div>

        {/* Button */}
        <button className="bg-black text-white py-2 w-full">
          Create Account
        </button>

        {/* Links */}
        <div className="flex justify-between text-sm mt-2">
          <Link to="/login" className="text-blue-600">
            Already have account? Login
          </Link>
        </div>
      </form>
    </div>
  );
};

export default Signup;
