/* eslint-disable react-hooks/exhaustive-deps */
 
import React, { useEffect, useState } from "react";
import axios from "axios";
import { backendUrl } from "../App";
import dayjs from "dayjs";
import { toast } from "react-toastify";

const AdminPromo = ({ token }) => {
  const [promos, setPromos] = useState([]);

  const [form, setForm] = useState({
    code: "",
    discount: "",
    startDate: "",
    endDate: "",
  });

  const generateCode = () => {
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    setForm({ ...form, code: "PROMO-" + random });
  };

  const fetchPromos = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/promo/admin/all`, {
        headers: { token },
      });
      setPromos(res.data.promos);
    } catch (err) {
        console.log(err)
      toast.error("Failed to load promos");
    }
  };

  const createPromo = async (e) => {
    e.preventDefault();

    try {
      await axios.post(
        `${backendUrl}/api/promo/create`,
        form,
        { headers: { token } }
      );

      toast.success("Promo created");
      setForm({ code: "", discount: "", startDate: "", endDate: "" });
      fetchPromos();
    } catch (err) {
      toast.error(err.response?.data?.message || "Error");
    }
  };

  const deactivatePromo = async (id) => {
    try {
      await axios.put(
        `${backendUrl}/api/promo/deactivate/${id}`,
        {},
        { headers: { token } }
      );
      toast.success("Promo deactivated");
      fetchPromos();
    } catch (err) {
        console.log(err)
      toast.error("Error");
    }
  };

  const deletePromo = async (id) => {
    try {
      await axios.delete(
        `${backendUrl}/api/promo/delete/${id}`,
        { headers: { token } }
      );
      toast.success("Deleted");
      fetchPromos();
    } catch (err) {
        console.log(err)
      toast.error("Error");
    }
  };

  const getStatus = (promo) => {
    const now = dayjs();
    if (!promo.isActive) return "Inactive";
    if (now.isBefore(promo.startDate)) return "Not Started";
    if (now.isAfter(promo.endDate)) return "Expired";
    return "Active";
  };

  useEffect(() => {
    fetchPromos();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Promo Code Manager</h2>

      {/* CREATE FORM */}
      <form
        onSubmit={createPromo}
        className="bg-white p-4 rounded shadow mb-6 grid gap-3"
      >
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Promo Code"
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
            className="border p-2 flex-1"
            required
          />
          <button
            type="button"
            onClick={generateCode}
            className="bg-blue-500 text-white px-3"
          >
            Generate
          </button>
        </div>

        <input
          type="number"
          placeholder="Discount %"
          value={form.discount}
          onChange={(e) => setForm({ ...form, discount: e.target.value })}
          className="border p-2"
          required
        />

        <div className="flex gap-2">
          <input
            type="datetime-local"
            value={form.startDate}
            onChange={(e) =>
              setForm({ ...form, startDate: e.target.value })
            }
            className="border p-2 flex-1"
            required
          />

          <input
            type="datetime-local"
            value={form.endDate}
            onChange={(e) =>
              setForm({ ...form, endDate: e.target.value })
            }
            className="border p-2 flex-1"
            required
          />
        </div>

        <button className="bg-green-600 text-white py-2">
          Create Promo
        </button>
      </form>

      {/* PROMO LIST */}
      <div className="bg-white p-4 rounded shadow">
        <h3 className="font-semibold mb-3">All Promos</h3>

        <table className="w-full border">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2">Code</th>
              <th>Discount</th>
              <th>Start</th>
              <th>End</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {promos.map((p) => (
              <tr key={p._id} className="text-center border-t">
                <td className="p-2">{p.code}</td>
                <td>{p.discount}%</td>
                <td>{dayjs(p.startDate).format("DD MMM YYYY")}</td>
                <td>{dayjs(p.endDate).format("DD MMM YYYY")}</td>
                <td>
                  <span
                    className={`px-2 py-1 rounded text-white ${
                      getStatus(p) === "Active"
                        ? "bg-green-500"
                        : getStatus(p) === "Expired"
                        ? "bg-red-500"
                        : "bg-gray-500"
                    }`}
                  >
                    {getStatus(p)}
                  </span>
                </td>

                <td className="flex gap-2 justify-center p-2">
                  <button
                    onClick={() => deactivatePromo(p._id)}
                    className="bg-yellow-500 text-white px-2"
                  >
                    Deactivate
                  </button>

                  <button
                    onClick={() => deletePromo(p._id)}
                    className="bg-red-500 text-white px-2"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminPromo;