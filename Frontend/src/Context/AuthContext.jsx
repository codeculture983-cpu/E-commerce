/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const backend_url = import.meta.env.VITE_BACKEND_URL;
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || "");

  const normalizeUser = (u) => ({
    firstName: u.firstName || "",
    lastName: u.lastName || "",
    email: u.email || "",
    phone: u.phone || "",
    city: u.city || "",
    country: u.country || "",
    avatar: u.avatar || "/default-avatar.png",
  });

  // Persist token
  useEffect(() => {
    if (token) localStorage.setItem("token", token);
    else localStorage.removeItem("token");
  }, [token]);

  // Fetch user on token change
  useEffect(() => {
    if (!token) return setUser(null);
    const fetchUser = async () => {
      try {
        const res = await axios.get(`${backend_url}/api/user/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.success) setUser(normalizeUser(res.data.user));
      } catch (err) {
        console.log(err);
        setUser(null);
        setToken("");
      }
    };
    fetchUser();
  }, [token]);

  // LOGIN
  const login = async (email, password) => {
    try {
      const res = await axios.post(`${backend_url}/api/user/login`, { email, password });
      if (res.data.success) {
        setToken(res.data.token);
        setUser(normalizeUser(res.data.user));
        toast.success("Login successful!");
        navigate("/"); // ✅ React Router v6
      } else toast.error(res.data.message);
    } catch (err) {
      console.log(err);
      toast.error("Login failed");
    }
  };

  // SIGNUP
  const signup = async (formData, isFileUpload = false) => {
    try {
      const config = isFileUpload ? { headers: { "Content-Type": "multipart/form-data" } } : {};
      const res = await axios.post(`${backend_url}/api/user/register`, formData, config);
      if (res.data.success) {
        setToken(res.data.token);
        setUser(normalizeUser(res.data.user));
        toast.success("Account created!");
        navigate("/");
      } else toast.error(res.data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || "Signup failed");
    }
  };

  // LOGOUT
  const logout = () => {
    setToken("");
    setUser(null);
    toast.info("Logged out");
    navigate("/login");
  };

  // UPDATE PROFILE
  const updateProfile = async (formData, isFileUpload = false) => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          ...(isFileUpload && { "Content-Type": "multipart/form-data" }),
        },
      };
      const res = await axios.put(`${backend_url}/api/user/profile`, formData, config);
      if (res.data.success) {
        setUser(normalizeUser(res.data.user));
        toast.success("Profile updated!");
      }
    } catch (err) {
      console.log(err);
      toast.error(err.response?.data?.message || "Update failed");
    }
  };

  // FORGOT PASSWORD
  const forgotPassword = async (email) => {
    try {
      const res = await axios.post(`${backend_url}/api/user/forgot-password`, { email });
      if (res.data.success) toast.success(res.data.message);
      else toast.error(res.data.message);
      return res.data.success;
    } catch (err) {
      console.log(err);
      toast.error("Failed to send OTP");
      return false;
    }
  };

  // RESET PASSWORD
  const resetPassword = async (email, otp, newPassword) => {
    try {
      const res = await axios.post(`${backend_url}/api/user/reset-password-otp`, {
        email,
        otp,
        newPassword,
      });
      if (res.data.success) toast.success(res.data.message);
      else toast.error(res.data.message);
      return res.data.success;
    } catch (err) {
      console.log(err);
      toast.error("Reset failed");
      return false;
    }
  };

  const userAvatar = user?.avatar || "/default-avatar.png";
  const userName = user ? `${user.firstName} ${user.lastName}`.trim() : "Guest";

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        signup,
        logout,
        updateProfile,
        forgotPassword,
        resetPassword,
        userAvatar,
        userName,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;