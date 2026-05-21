import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { backendUrl, currency } from "../App";

const COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#06b6d4"];

const TABS = ["ORDERS", "INSIGHT", "FORECAST", "PRODUCTS", "TOP"];

const RANGE_OPTIONS = [
  { label: "TODAY", value: 1 },
  { label: "7 DAYS", value: 7 },
  { label: "15 DAYS", value: 15 },
  { label: "30 DAYS", value: 30 },
  { label: "180 DAYS", value: 180 },
  { label: "365 DAYS", value: 365 },
];

const AnalyticsPage = () => {
  const [range, setRange] = useState(7);
  const [activeTab, setActiveTab] = useState("ORDERS");

  const [data, setData] = useState({
    revenue: 0,
    products: [],
    forecast: [],
    clv: 0,
  });

  const [orders, setOrders] = useState({});
  const [insight, setInsight] = useState(null);

  const token = localStorage.getItem("token");

  const config = {
    headers: { Authorization: `Bearer ${token}` },
  };

  // ================= LOAD COD ONLY =================
  const load = async () => {
    try {
      const [
        revenueRes,
        productsRes,
        forecastRes,
        clvRes,
        orderRes,
        insightRes,
      ] = await Promise.all([
        axios.get(`${backendUrl}/api/analytics/revenue?days=${range}&paymentMethod=COD`, config),
        axios.get(`${backendUrl}/api/analytics/top-products?days=${range}&paymentMethod=COD`, config),
        axios.get(`${backendUrl}/api/analytics/forecast?days=${range}&paymentMethod=COD`, config),
        axios.get(`${backendUrl}/api/analytics/clv?paymentMethod=COD`, config),
        axios.get(`${backendUrl}/api/analytics/order-analytics?days=${range}&paymentMethod=COD`, config),
        axios.get(`${backendUrl}/api/analytics/insight?days=${range}&paymentMethod=COD`, config),
      ]);

      setData({
        revenue: revenueRes.data?.revenue || 0,
        products: productsRes.data?.products || [],
        forecast: forecastRes.data?.forecast || [],
        clv: clvRes.data?.clv || 0,
      });

      setOrders(orderRes.data?.orders || {});
      setInsight(insightRes.data || null);

    } catch (err) {
      console.log("API ERROR:", err.message);
    }
  };

  useEffect(() => {
    load();
  }, [range]);

  const revenue = data.revenue;

  // ================= INSIGHT =================
  const insightCalc = useMemo(() => {
    const totalOrders = Object.values(orders || {}).reduce(
      (sum, o) => sum + (o.count || 0),
      0
    );

    const avgOrderValue = totalOrders ? revenue / totalOrders : 0;

    const status =
      revenue > 5000
        ? "Strong 🚀"
        : revenue > 2000
        ? "Stable ⚡"
        : "Weak 📉";

    return {
      revenue,
      orders: totalOrders,
      avgOrderValue,
      status,
    };
  }, [orders, revenue]);

  return (
    <div className="min-h-screen bg-[#f6f7fb]">

      {/* TOP BAR */}
      <div className="sticky top-0 bg-white border-b px-4 md:px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-3">

        <h1 className="text-lg font-bold">📊 ANALYTICS DASHBOARD </h1>

        <div className="flex flex-wrap gap-2 justify-center">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`px-3 py-1 border rounded text-sm ${
                activeTab === t ? "bg-black text-white" : ""
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <select
          className="border px-3 py-2 rounded"
          value={range}
          onChange={(e) => setRange(Number(e.target.value))}
        >
          {RANGE_OPTIONS.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
      </div>

      <div className="p-4 md:p-6 space-y-6">

        {/* KPI */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">

          <div className="bg-white p-4 rounded-xl border">
            <p>REVENUE (COD)</p>
            <h2 className="font-bold">{currency}{revenue}</h2>
          </div>

          <div className="bg-white p-4 rounded-xl border">
            <p>CLV (COD)</p>
            <h2 className="font-bold">{currency}{Number(data.clv).toFixed(2)}</h2>
          </div>

          <div className="bg-white p-4 rounded-xl border">
            <p>PRODUCTS</p>
            <h2 className="font-bold">{data.products.length}</h2>
          </div>

        </div>

        {/* ORDERS */}
        {activeTab === "ORDERS" && (
          <div className="bg-white p-5 rounded-xl border">
            <h3 className="font-semibold mb-4">ORDER ANALYTICS (COD ONLY)</h3>

            <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
              {Object.entries(orders).map(([key, val]) => (
                <div key={key} className="border p-3 rounded text-center">
                  <p className="text-xs uppercase">{key}</p>
                  <h2 className="font-bold">{val.count}</h2>
                  <p className="text-green-600 text-xs">
                    {currency}{val.revenue}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* INSIGHT */}
        {activeTab === "INSIGHT" && (
          <div className="bg-black text-white p-6 rounded-xl space-y-3">
            <h2 className="font-bold text-lg">AI INSIGHT ENGINE (COD ONLY)</h2>

            <p>Revenue: {currency}{insightCalc.revenue}</p>
            <p>Orders: {insightCalc.orders}</p>
            <p>Avg Order Value: {currency}{insightCalc.avgOrderValue.toFixed(2)}</p>

            <p className="text-green-400 font-bold">
              Performance: {insightCalc.status}
            </p>

            {insight && (
              <>
                <p>Growth: {insight.growth}%</p>
                <p>Alert: {insight.alert}</p>
                <p>Profit: {currency}{Number(insight.profit).toFixed(2)}</p>
              </>
            )}
          </div>
        )}

        {/* FORECAST */}
        {activeTab === "FORECAST" && (
          <div className="bg-white p-5 rounded-xl border">
            <h3>REVENUE FORECAST (COD ONLY)</h3>

            <ResponsiveContainer width="100%" height={250}>
              <BarChart
                data={(data.forecast || []).map((v, i) => ({
                  name: `D${i + 1}`,
                  value: v,
                }))}
              >
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#6366f1" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* PRODUCTS */}
        {activeTab === "PRODUCTS" && (
          <div className="bg-white p-5 rounded-xl border">
            <h3>PRODUCT SHARE (COD ONLY)</h3>

            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={data.products}
                  dataKey="sold"
                  nameKey="name"
                  outerRadius={90}
                >
                  {data.products.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* TOP */}
        {activeTab === "TOP" && (
          <div className="bg-white p-5 rounded-xl border">
            <h3 className="font-semibold mb-3">🏆 TOP PRODUCTS (COD ONLY)</h3>

            <div className="space-y-3">
              {[...data.products]
                .sort((a, b) => b.sold - a.sold)
                .map((p, i) => (
                  <div
                    key={p._id}
                    className="flex items-center justify-between border p-3 rounded"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={p.image || "/placeholder.png"}
                        alt={p.name}
                        className="w-10 h-10 rounded object-cover"
                      />
                      <span>#{i + 1} {p.name}</span>
                    </div>

                    <span>{p.sold} sold</span>
                  </div>
                ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AnalyticsPage;
