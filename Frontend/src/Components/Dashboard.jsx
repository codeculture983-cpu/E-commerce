/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import PersonalInfoTab from "./PersonalInfoTab";
import OrdersTab from "./OrderTab";
import SecurityTab from "./SecurityTab";
import SettingsTab from "./SettingsTab";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("personal");

  return (
    <div className="dashboard">
      <div className="tabs">
        <button onClick={() => setActiveTab("personal")}>Personal Info</button>
        <button onClick={() => setActiveTab("orders")}>Orders</button>
        <button onClick={() => setActiveTab("security")}>Security</button>
        <button onClick={() => setActiveTab("settings")}>Settings</button>
      </div>
      <div className="tab-content">
        {activeTab === "personal" && <PersonalInfoTab />}
        {activeTab === "orders" && <OrdersTab />}
        {activeTab === "security" && <SecurityTab />}
        {activeTab === "settings" && <SettingsTab />}
      </div>
    </div>
  );
}