import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../Context/ShopContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const { token, backend_url } = useContext(ShopContext);
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);

  // ================= FETCH USER =================
  const fetchUser = async () => {
    try {
      setLoading(true);

      const res = await axios.get(`${backend_url}/api/user/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUser(res.data.user);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchUser();
  }, [token]);

  // ================= CHANGE PASSWORD =================
  const changePassword = async () => {
    const oldPassword = prompt("Enter old password:");
    const newPassword = prompt("Enter new password:");

    if (!oldPassword || !newPassword) return;

    await axios.put(
      `${backend_url}/api/user/change-password`,
      { oldPassword, newPassword },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    alert("Password updated successfully");
  };

  // ================= DELETE ACCOUNT =================
  const deleteAccount = async () => {
    const confirmDelete = window.confirm("Are you sure?");
    if (!confirmDelete) return;

    await axios.delete(`${backend_url}/api/user/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    localStorage.removeItem("token");
    window.location.href = "/";
  };

  // ================= CLEAR CART =================
  const clearCart = async () => {
    await axios.put(
      `${backend_url}/api/user/clear-cart`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );

    alert("Cart cleared");
  };

  // ================= PRIVACY =================
  const togglePrivacy = async (key) => {
    const res = await axios.put(
      `${backend_url}/api/user/privacy`,
      { [key]: !user.privacy?.[key] },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setUser((p) => ({ ...p, privacy: res.data.privacy }));
  };

  // ================= LOADING =================
  if (loading)
    return (
      <div className="h-[60vh] flex items-center justify-center text-gray-500">
        Loading...
      </div>
    );

  if (!user)
    return (
      <div className="h-[60vh] flex items-center justify-center text-red-500">
        User not found
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto p-6">

      {/* HEADER */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold">{user.name}</h2>

        {/* EMAIL CONTROL (PRIVACY) */}
        {user.privacy?.showEmail && (
          <p className="text-sm">{user.email}</p>
        )}
      </div>

      {/* NAV */}
      <div className="flex flex-wrap gap-2 mt-5">
        {["dashboard", "orders", "privacy", "security"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 border rounded-lg text-sm ${
              tab === t ? "bg-black text-white" : "bg-white"
            }`}
          >
            {t.toUpperCase()}
          </button>
        ))}
      </div>

      {/* DASHBOARD */}
      {tab === "dashboard" && (
        <div className="grid md:grid-cols-2 gap-4 mt-6">

          <div onClick={() => navigate("/orders")}>
            <Card title="Orders" value="View Orders" />
          </div>

          <Card title="Account Status" value="Active" />
        </div>
      )}

      {/* ORDERS */}
      {tab === "orders" && (
        <div className="mt-6">
          <button
            onClick={() => navigate("/orders")}
            className="bg-black text-white px-4 py-2 rounded"
          >
            Go to Orders Page
          </button>
        </div>
      )}

      {/* PRIVACY */}
      {tab === "privacy" && (
        <div className="mt-6 space-y-3">

          <Toggle
            label="Show Email"
            value={user.privacy?.showEmail}
            onClick={() => togglePrivacy("showEmail")}
          />

          <Toggle
            label="Tracking (Order Tracking)"
            value={user.privacy?.activityTracking}
            onClick={() => togglePrivacy("activityTracking")}
          />
        </div>
      )}

      {/* SECURITY */}
      {tab === "security" && (
        <div className="mt-6 space-y-4">

          <button
            onClick={changePassword}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Change Password
          </button>

          <button
            onClick={clearCart}
            className="bg-yellow-500 text-white px-4 py-2 rounded ml-3"
          >
            Clear Cart
          </button>

          <button
            onClick={deleteAccount}
            className="bg-red-600 text-white px-4 py-2 rounded ml-3"
          >
            Delete Account
          </button>

        </div>
      )}

    </div>
  );
};

export default Profile;

// ================= UI =================
const Card = ({ title, value }) => (
  <div className="p-4 bg-white shadow rounded-xl border">
    <p className="text-gray-500">{title}</p>
    <h3 className="text-xl font-bold">{value}</h3>
  </div>
);

const Toggle = ({ label, value, onClick }) => (
  <div className="flex justify-between border p-3 rounded">
    <span>{label}</span>
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded ${
        value ? "bg-green-500 text-white" : "bg-gray-300"
      }`}
    >
      {value ? "ON" : "OFF"}
    </button>
  </div>
);