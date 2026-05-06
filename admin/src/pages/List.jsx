import React, { useEffect, useState } from "react";
import axios from "axios";

import { toast } from "react-toastify";
const backendUrl = "https://forver-backend.onrender.com";
const List = () => {
  const [list, setList] = useState([]);

  const token = localStorage.getItem("adminToken");

  const fetchList = async () => {
    try {
      const res = await axios.get(
        `${backendUrl}/api/product/list`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setList(res.data.products || []);
    } catch {
      toast.error("Fetch failed");
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  const removeProduct = async (id) => {
    try {
      await axios.post(
        `${backendUrl}/api/product/remove`,
        { id },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success("Removed");
      fetchList();
    } catch {
      toast.error("Remove failed");
    }
  };

  return (
    <div>
      {list.map((item) => (
        <div key={item._id}>
          <p>{item.name}</p>
          <button onClick={() => removeProduct(item._id)}>X</button>
        </div>
      ))}
    </div>
  );
};

export default List;
