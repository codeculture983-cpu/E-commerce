import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { backendUrl } from "../App";

const Promo = () => {
  const [promos, setPromos] = useState([]);
  const [code, setCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [expiry, setExpiry] = useState("");

  const fetchPromos = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await axios.get(`${backendUrl}/api/promo/list`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPromos(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load promo codes");
    }
  };

  const addPromo = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await axios.post(
        `${backendUrl}/api/promo`,
        { code, discount, expiryDate: expiry },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data) {
        toast.success("Promo added");
        fetchPromos();
        setCode("");
        setDiscount(0);
        setExpiry("");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to add promo");
    }
  };

  const deletePromo = async (id) => {
    try {
      const token = localStorage.getItem("adminToken");
      await axios.delete(`${backendUrl}/api/promo/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Promo deleted");
      fetchPromos();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete promo");
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchPromos();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Promo Codes</h2>

      <div className="flex gap-2 mb-4">
        <input
          placeholder="Code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="px-3 py-2 border"
        />
        <input
          type="number"
          placeholder="Discount %"
          value={discount}
          onChange={(e) => setDiscount(e.target.value)}
          className="px-3 py-2 border"
        />
        <input
          type="date"
          value={expiry}
          onChange={(e) => setExpiry(e.target.value)}
          className="px-3 py-2 border"
        />
        <button onClick={addPromo} className="px-4 py-2 bg-black text-white">
          Add
        </button>
      </div>

      <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-4 font-semibold bg-gray-100 p-2 rounded mb-2">
        <div>Code</div>
        <div>Discount</div>
        <div>Expiry</div>
        <div>Action</div>
      </div>

      {promos.map((p) => (
        <div
          key={p._id}
          className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-4 p-2 border-b items-center"
        >
          <div>{p.code}</div>
          <div>{p.discount}%</div>
          <div>{new Date(p.expiryDate).toLocaleDateString()}</div>
          <div>
            <button
              onClick={() => deletePromo(p._id)}
              className="px-2 py-1 bg-red-500 text-white rounded"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Promo;