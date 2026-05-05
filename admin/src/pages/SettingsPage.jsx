import React, { useEffect, useState } from "react";
import axios from "axios";
import { backendUrl } from "../App";

const Settings = () => {
  const [settings, setSettings] = useState(null);
  const token = localStorage.getItem("token");

  // ================= FETCH SETTINGS =================
  const fetchSettings = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/settings`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSettings(res.data);
    } catch (error) {
      console.log("Settings load error:", error);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // ================= TOGGLE PAYMENT =================
  const togglePayment = async (gateway) => {
    try {
      const updated = !settings.paymentGateways[gateway];

      const res = await axios.put(
        `${backendUrl}/api/settings/payment`,
        {
          gateway,
          status: updated,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // ✅ IMPORTANT: use backend response
      setSettings(res.data);
    } catch (error) {
      console.log("Toggle error:", error);
    }
  };

  if (!settings) {
    return <p className="p-6 text-gray-500">Loading settings...</p>;
  }

  return (
    <div className="p-6 space-y-6">

      <h2 className="text-2xl font-bold">System Settings</h2>

      <div className="border p-4 rounded bg-white shadow-sm">

        <h3 className="font-semibold mb-4">Payment Methods</h3>

        {/* COD */}
        <div className="flex justify-between items-center border p-3 rounded mb-3">
          <span>Cash on Delivery</span>

          <button
            onClick={() => togglePayment("cod")}
            className={`px-4 py-1 rounded text-white transition ${
              settings.paymentGateways.cod
                ? "bg-green-500"
                : "bg-gray-400"
            }`}
          >
            {settings.paymentGateways.cod ? "ON" : "OFF"}
          </button>
        </div>

        {/* STRIPE */}
        <div className="flex justify-between items-center border p-3 rounded">
          <span>Stripe Payment</span>

          <button
            onClick={() => togglePayment("stripe")}
            className={`px-4 py-1 rounded text-white transition ${
              settings.paymentGateways.stripe
                ? "bg-green-500"
                : "bg-gray-400"
            }`}
          >
            {settings.paymentGateways.stripe ? "ON" : "OFF"}
          </button>
        </div>

      </div>
    </div>
  );
};

export default Settings;