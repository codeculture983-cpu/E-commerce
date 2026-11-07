
import React, {
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";
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

const safe = (value) => {
  if (value === null || value === undefined) return "-";
  if (typeof value === "object") return JSON.stringify(value);
  return value;
};

const Orders = ({ token }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [amountFilter, setAmountFilter] = useState("all");

  const [page, setPage] = useState(1);
  const [updatingOrders, setUpdatingOrders] = useState([]);

  const limit = 10;

  // ================= NOTIFICATION MEMORY =================
  const getSeenOrders = () => {
    try {
      return JSON.parse(localStorage.getItem("seenOrders") || "[]");
    } catch {
      return [];
    }
  };

  const saveSeenOrders = (data) => {
    localStorage.setItem("seenOrders", JSON.stringify(data));
  };

  // ================= FETCH ORDERS =================
  const fetchOrders = useCallback(async (showError = false) => {
    if (!token) {
      setOrders([]);
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get(`${backendUrl}/api/order/list`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const safeOrders = (res.data.orders || []).map((order) => ({
        ...order,
        items: Array.isArray(order.items) ? order.items : [],
      }));

      safeOrders.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      // ================= NEW ORDER NOTIFICATIONS =================
      const today = dayjs().format("YYYY-MM-DD");
      const seen = getSeenOrders();

      const todayNewOrders = safeOrders.filter(
        (order) =>
          dayjs(order.createdAt).format("YYYY-MM-DD") === today &&
          !seen.includes(order._id)
      );

      if (todayNewOrders.length > 0) {
        todayNewOrders.forEach((order) => {
          toast.success(
            `🆕 New Order: ${order._id.slice(-6)} ($${order.amount})`
          );
        });

        saveSeenOrders([
          ...seen,
          ...todayNewOrders.map((order) => order._id),
        ]);
      }

      setOrders(safeOrders);
    } catch (error) {
      console.log("Fetch orders error:", error);

      if (showError) {
        toast.error("Failed to load orders");
      }
    } finally {
      setLoading(false);
    }
  }, [token]);

  // ================= INITIAL LOAD + AUTO REFRESH =================
  useEffect(() => {
    if (!token) {
      setOrders([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    fetchOrders(true);

    const interval = setInterval(() => {
      fetchOrders(false);
    }, 10000);

    return () => clearInterval(interval);
  }, [token, fetchOrders]);

  // ================= UPDATE STATUS =================
  const updateStatus = async (id, status) => {
    if (updatingOrders.includes(id)) return;

    setUpdatingOrders((prev) => [...prev, id]);

    try {
      const res = await axios.put(
        `${backendUrl}/api/order/${id}/status`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data.success === false) {
        throw new Error(res.data.message || "Status update failed");
      }

      // Update status immediately in admin UI
      setOrders((prev) =>
        prev.map((order) =>
          order._id === id
            ? { ...order, status }
            : order
        )
      );

      toast.success(`Order status updated to ${status}`);

      // Confirm latest saved status from backend
      await fetchOrders(false);
    } catch (error) {
      console.log("Update status error:", error);

      toast.error(
        error.response?.data?.message ||
        error.message ||
        "Order status update failed"
      );

      // Reload actual status if update failed
      await fetchOrders(false);
    } finally {
      setUpdatingOrders((prev) =>
        prev.filter((orderId) => orderId !== id)
      );
    }
  };

  // ================= DOWNLOAD INVOICE =================
  const downloadInvoice = async (order) => {
    try {
      const response = await axios.get(
        `${backendUrl}/api/order/invoice/${order._id}`,
        {
          responseType: "blob",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const blob = new Blob([response.data], {
        type: "application/pdf",
      });

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `invoice-${order._id}.pdf`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);

      toast.success("Invoice downloaded");
    } catch (error) {
      console.log("Invoice error:", error);
      toast.error("PDF download failed");
    }
  };

  // ================= FILTER + SEARCH =================
  const filteredOrders = useMemo(() => {
    let data = [...orders];

    if (search.trim()) {
      data = data.filter((order) =>
        String(order._id)
          .toLowerCase()
          .includes(search.trim().toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      data = data.filter(
        (order) => order.status === statusFilter
      );
    }

    if (amountFilter === "high") {
      data.sort((a, b) => Number(b.amount) - Number(a.amount));
    }

    if (amountFilter === "low") {
      data.sort((a, b) => Number(a.amount) - Number(b.amount));
    }

    return data;
  }, [orders, search, statusFilter, amountFilter]);

  // ================= PAGINATION =================
  const totalPages = Math.ceil(filteredOrders.length / limit);

  const paginatedOrders = useMemo(() => {
    const start = (page - 1) * limit;
    return filteredOrders.slice(start, start + limit);
  }, [filteredOrders, page]);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, amountFilter]);

  // ================= LOADING =================
  if (loading) {
    return (
      <div className="p-6 text-center">
        Loading enterprise dashboard...
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 md:p-6 bg-gray-100 min-h-screen">

      {/* HEADER */}
      <div className="flex flex-col lg:flex-row justify-between gap-3 mb-6">

        <h1 className="text-2xl sm:text-3xl font-bold">
          📦 Enterprise Orders
        </h1>

        <div className="flex flex-col sm:flex-row flex-wrap gap-2 w-full lg:w-auto">

          {/* SEARCH */}
          <input
            type="text"
            className="p-2 border rounded w-full sm:w-auto"
            placeholder="Search Order ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {/* STATUS FILTER */}
          <select
            className="p-2 border rounded w-full sm:w-auto"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>

            {statusFlow.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>

          {/* AMOUNT SORT */}
          <select
            className="p-2 border rounded w-full sm:w-auto"
            value={amountFilter}
            onChange={(e) => setAmountFilter(e.target.value)}
          >
            <option value="all">Sort Amount</option>
            <option value="high">High → Low</option>
            <option value="low">Low → High</option>
          </select>

          {/* MANUAL REFRESH */}
          <button
            onClick={() => fetchOrders(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Refresh
          </button>

        </div>
      </div>

      {/* ORDER COUNT */}
      <p className="text-sm text-gray-600 mb-4">
        Showing {paginatedOrders.length} of {filteredOrders.length} orders
      </p>

      {/* ORDERS */}
      <div className="grid gap-4 sm:gap-6">

        {paginatedOrders.map((order) => {
          const isUpdating = updatingOrders.includes(order._id);

          return (
            <div
              key={order._id}
              className="bg-white p-3 sm:p-5 rounded-xl shadow-md"
            >

              {/* ORDER HEADER */}
              <div className="flex flex-col sm:flex-row sm:justify-between gap-2 border-b pb-3">

                <div className="text-sm sm:text-base">

                  <p className="text-gray-500">
                    Order ID
                  </p>

                  <p className="font-bold break-all">
                    {safe(order._id)}
                  </p>

                  <p>
                    Total: <b>${safe(order.amount)}</b>
                  </p>

                  <p className="text-xs text-gray-500 mt-1">
                    {order.createdAt
                      ? dayjs(order.createdAt).format("DD MMM YYYY, hh:mm A")
                      : "-"}
                  </p>

                </div>

                <span
                  className={`px-3 py-1 text-white rounded w-fit h-fit ${
                    statusColors[order.status] || "bg-gray-500"
                  }`}
                >
                  {order.status || "Order Placed"}
                </span>

              </div>

              {/* ACTIONS */}
              <div className="flex flex-col sm:flex-row gap-2 mt-4">

                {/* UPDATE STATUS */}
                <select
                  className="border p-2 rounded w-full sm:w-auto"
                  value={order.status || "Order Placed"}
                  disabled={isUpdating}
                  onChange={(e) =>
                    updateStatus(order._id, e.target.value)
                  }
                >
                  {statusFlow.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>

                {/* INVOICE */}
                <button
                  onClick={() => downloadInvoice(order)}
                  className="bg-black text-white px-4 py-2 rounded w-full sm:w-auto hover:bg-gray-800"
                >
                  Download Invoice
                </button>

                {isUpdating && (
                  <span className="text-sm text-blue-600 self-center">
                    Updating status...
                  </span>
                )}

              </div>

              {/* ITEMS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mt-4">

                {order.items.map((item, index) => {
                  const snap = item.snapshot || {};

                  return (
                    <div
                      key={item._id || index}
                      className="flex gap-3 p-3 border rounded bg-gray-50"
                    >

                      <img
                        src={
                          snap.image && snap.image.startsWith("http")
                            ? snap.image
                            : "/placeholder.png"
                        }
                        alt={snap.name || "Product"}
                        className="w-14 h-14 object-cover rounded"
                      />

                      <div className="text-sm min-w-0">

                        <p className="font-medium break-words">
                          {safe(snap.name)}
                        </p>

                        <p>
                          Size: {safe(snap.size)}
                        </p>

                        <p>
                          Qty: {safe(item.quantity)}
                        </p>

                        <p className="font-bold">
                          ${safe(snap.price)}
                        </p>

                      </div>

                    </div>
                  );
                })}

              </div>

            </div>
          );
        })}

        {/* EMPTY STATE */}
        {filteredOrders.length === 0 && (
          <div className="bg-white p-8 rounded-xl text-center text-gray-500">
            No orders found.
          </div>
        )}

      </div>

      {/* PAGINATION */}
      <div className="flex flex-col sm:flex-row justify-center items-center mt-6 gap-2">

        <button
          className="px-3 py-2 bg-gray-300 rounded w-full sm:w-auto disabled:opacity-50"
          disabled={page === 1}
          onClick={() => setPage((prev) => Math.max(1, prev - 1))}
        >
          Prev
        </button>

        <span className="px-3 py-2">
          {page} / {totalPages || 1}
        </span>

        <button
          className="px-3 py-2 bg-gray-300 rounded w-full sm:w-auto disabled:opacity-50"
          disabled={page >= totalPages || totalPages === 0}
          onClick={() =>
            setPage((prev) => Math.min(totalPages, prev + 1))
          }
        >
          Next
        </button>

      </div>

    </div>
  );
};

export default Orders;
