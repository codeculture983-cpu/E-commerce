// src/Pages/Tabs/ProfileInfoTab.jsx
import React, { useContext, useState } from "react";
import { ProfileContext } from "../Context/ProfileContext";
import axios from "axios";
import { toast } from "react-toastify";

const ProfileInfoTab = () => {
  const { profile, token, backendUrl, fetchProfileData } = useContext(ProfileContext);
  const [formData, setFormData] = useState({
    name: profile?.name || "",
    email: profile?.email || "",
    phone: profile?.phone || "",
    password: "",
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${backendUrl}/api/user/profile`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Profile updated successfully");
      fetchProfileData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <div>
        <label className="block mb-1 font-medium">Name</label>
        <input
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div>
        <label className="block mb-1 font-medium">Email</label>
        <input
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div>
        <label className="block mb-1 font-medium">Phone</label>
        <input
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div>
        <label className="block mb-1 font-medium">Password</label>
        <input
          name="password"
          type="password"
          placeholder="Enter new password"
          value={formData.password}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
        Save Changes
      </button>
    </form>
  );
};

export default ProfileInfoTab;