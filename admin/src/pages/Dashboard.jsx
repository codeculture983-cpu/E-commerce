// pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";

const Dashboard = ({ backendUrl }) => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    axios.get(`${backendUrl}/api/admin/stats`).then((res) => {
      setStats(res.data);
    });
  }, []);

  if (!stats) return <div>Loading...</div>;

  return (
    <div className="p-6 grid gap-6">

      <div className="grid grid-cols-4 gap-4">
        <Card title="Orders" value={stats.orders} />
        <Card title="Revenue" value={`$${stats.revenue}`} />
        <Card title="Users" value={stats.users} />
        <Card title="Products" value={stats.products} />
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h2 className="font-bold mb-4">Revenue Trend</h2>
        <Line data={stats.chartData} />
      </div>

    </div>
  );
};

const Card = ({ title, value }) => (
  <div className="bg-white p-4 rounded shadow">
    <h3 className="text-gray-500">{title}</h3>
    <p className="text-2xl font-bold">{value}</p>
  </div>
);

export default Dashboard;