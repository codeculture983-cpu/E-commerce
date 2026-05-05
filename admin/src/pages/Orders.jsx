import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";
import dayjs from "dayjs";

const statusFlow = [
  "Order Placed",
  "Packing",
  "Shipped",
  "Out for Delivery",
  "Delivered",
  "Cancelled",
];

const statusColors = {
  "Order Placed": "bg-blue-500",
  Packing: "bg-indigo-500",
  Shipped: "bg-yellow-500",
  "Out for Delivery": "bg-orange-500",
  Delivered: "bg-green-500",
  Cancelled: "bg-red-500",
};

const safe = (v) => {
  if (v === null || v === undefined) return "-";
  if (typeof v === "object") return JSON.stringify(v);
  return v;
};

const Orders = ({ token }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [amountFilter, setAmountFilter] = useState("all");

  const [page, setPage] = useState(1);
  const limit = 10;

  // ================= NOTIFICATION MEMORY =================
  const getSeenOrders = () =>
    JSON.parse(localStorage.getItem("seenOrders") || "[]");

  const saveSeenOrders = (data) =>
    localStorage.setItem("seenOrders", JSON.stringify(data));

  // ================= FETCH ORDERS =================
  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/order/list`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const safeOrders = (res.data.orders || []).map((o) => ({
        ...o,
        items: Array.isArray(o.items) ? o.items : [],
      }));

      safeOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      // ================= ONLY TODAY NOTIFICATION =================
      const today = dayjs().format("YYYY-MM-DD");
      const seen = getSeenOrders();

      const todayNewOrders = safeOrders.filter(
        (o) =>
          dayjs(o.createdAt).format("YYYY-MM-DD") === today &&
          !seen.includes(o._id)
      );

      if (todayNewOrders.length > 0) {
        todayNewOrders.forEach((o) => {
          toast.success(`🆕 New Order: ${o._id.slice(-6)} ($${o.amount})`);
        });

        const updatedSeen = [
          ...seen,
          ...todayNewOrders.map((o) => o._id),
        ];
        saveSeenOrders(updatedSeen);
      }

      setOrders(safeOrders);
    } catch {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  // ================= FILTER =================
  const filteredOrders = useMemo(() => {
    let data = [...orders];

    if (search) {
      data = data.filter((o) =>
        o._id.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      data = data.filter((o) => o.status === statusFilter);
    }

    if (amountFilter === "high") data.sort((a, b) => b.amount - a.amount);
    if (amountFilter === "low") data.sort((a, b) => a.amount - b.amount);

    return data;
  }, [orders, search, statusFilter, amountFilter]);

  const totalPages = Math.ceil(filteredOrders.length / limit);

  const paginatedOrders = useMemo(() => {
    const start = (page - 1) * limit;
    return filteredOrders.slice(start, start + limit);
  }, [filteredOrders, page]);

  // ================= UPDATE STATUS =================
  const updateStatus = async (id, status) => {
    try {
      await axios.put(
        `${backendUrl}/api/order/${id}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setOrders((prev) =>
        prev.map((o) => (o._id === id ? { ...o, status } : o))
      );

      toast.success("Updated");
    } catch {
      toast.error("Update failed");
    }
  };

  // ================= DOWNLOAD INVOICE =================
  const downloadInvoice = async (order) => {
    try {
      const response = await axios.get(
        `${backendUrl}/api/order/invoice/${order._id}`,
        {
          responseType: "blob",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const blob = new Blob([response.data], {
        type: "application/pdf",
      });

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `invoice-${order._id}.pdf`;
      link.click();

      window.URL.revokeObjectURL(url);
    } catch {
      toast.error("PDF download failed");
    }
  };

  if (loading)
    return <div className="p-6">Loading enterprise dashboard...</div>;

  return (
    <div className="p-3 sm:p-4 md:p-6 bg-gray-100 min-h-screen">

      {/* HEADER */}
      <div className="flex flex-col lg:flex-row justify-between gap-3 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">📦 Enterprise Orders</h1>

        <div className="flex flex-col sm:flex-row flex-wrap gap-2 w-full lg:w-auto">

          <input
            className="p-2 border rounded w-full sm:w-auto"
            placeholder="Search Order ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            className="p-2 border rounded w-full sm:w-auto"
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            {statusFlow.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>

          <select
            className="p-2 border rounded w-full sm:w-auto"
            onChange={(e) => setAmountFilter(e.target.value)}
          >
            <option value="all">Sort Amount</option>
            <option value="high">High → Low</option>
            <option value="low">Low → High</option>
          </select>

        </div>
      </div>

      {/* ORDERS */}
      <div className="grid gap-4 sm:gap-6">

        {paginatedOrders.map((o) => (
          <div key={o._id} className="bg-white p-3 sm:p-5 rounded-xl shadow-md">

            <div className="flex flex-col sm:flex-row sm:justify-between gap-2 border-b pb-3">

              <div className="text-sm sm:text-base">
                <p className="text-gray-500">Order ID</p>
                <p className="font-bold break-all">{safe(o._id)}</p>
                <p>Total: <b>${safe(o.amount)}</b></p>
              </div>

              <span className={`px-3 py-1 text-white rounded w-fit ${statusColors[o.status]}`}>
                {o.status}
              </span>

            </div>

            {/* ACTIONS */}
            <div className="flex flex-col sm:flex-row gap-2 mt-4">

              <select
                className="border p-2 rounded w-full sm:w-auto"
                value={o.status}
                onChange={(e) => updateStatus(o._id, e.target.value)}
              >
                {statusFlow.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>

              {/* ✅ DOWNLOAD INVOICE BUTTON */}
              <button
                onClick={() => downloadInvoice(o)}
                className="bg-black text-white px-4 py-2 rounded w-full sm:w-auto"
              >
                Download Invoice
              </button>

            </div>

            {/* ITEMS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mt-4">

              {o.items.map((item, i) => {
                const snap = item.snapshot || {};

                return (
                  <div key={i} className="flex gap-3 p-3 border rounded bg-gray-50">

                    <img
                      src={
                        snap.image && snap.image.startsWith("http")
                          ? snap.image
                          : "https://via.placeholder.com/80"
                      }
                      className="w-14 h-14 object-cover rounded"
                      alt=""
                    />

                    <div className="text-sm">
                      <p className="font-medium">{safe(snap.name)}</p>
                      <p>Qty: {safe(item.quantity)}</p>
                      <p className="font-bold">${safe(snap.price)}</p>
                    </div>

                  </div>
                );
              })}

            </div>

          </div>
        ))}

      </div>

      {/* PAGINATION */}
      <div className="flex flex-col sm:flex-row justify-center items-center mt-6 gap-2">

        <button
          className="px-3 py-1 bg-gray-300 rounded w-full sm:w-auto"
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
        >
          Prev
        </button>

        <span className="px-3 py-1">
          {page} / {totalPages || 1}
        </span>

        <button
          className="px-3 py-1 bg-gray-300 rounded w-full sm:w-auto"
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
        >
          Next
        </button>

      </div>

    </div>
  );
};

export default Orders;