/* eslint-disable react-hooks/exhaustive-deps */
import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import { ShopContext } from "./ShopContext";
import { toast } from "react-toastify";

// eslint-disable-next-line react-refresh/only-export-components
export const ProfileContext = createContext();

export const ProfileProvider = ({ children }) => {
  const { backend_url, token } = useContext(ShopContext);

  const [user, setUser] = useState({
    name: "",
    email: "",
    phone: "",
    addresses: [],
    wishlist: [],
    orders: [],
    loyalty: null,
    recentlyViewed: [],
  });

  const [loading, setLoading] = useState(true);

  const fetchProfileData = async () => {
    setLoading(true);

    // List of endpoints to fetch
    const endpoints = [
      { key: "orders", path: "/user/orders" },
      { key: "wishlist", path: "/user/wishlist" },
      { key: "addresses", path: "/user/addresses" },
      { key: "loyalty", path: "/user/loyalty" },
      { key: "recentlyViewed", path: "/user/recently-viewed" },
    ];

    try {
      const results = await Promise.all(
        endpoints.map(async (endpoint) => {
          try {
            const res = await axios.get(`${backend_url}${endpoint.path}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            return { key: endpoint.key, data: res.data };
          } catch (err) {
            console.warn(`Failed to fetch ${endpoint.path}:`, err.response?.status || err.message);
            return { key: endpoint.key, data: null }; // graceful fallback
          }
        })
      );

      // Merge fetched data into user state
      const updatedUser = { ...user };
      results.forEach((r) => {
        updatedUser[r.key] = r.data ?? updatedUser[r.key]; // keep default if null
      });

      setUser(updatedUser);
    } catch (err) {
      console.error("Unexpected fetch error:", err);
      toast.error("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchProfileData();
  }, [token]);

  return (
    <ProfileContext.Provider value={{ user, setUser, loading, fetchProfileData }}>
      {children}
    </ProfileContext.Provider>
  );
};