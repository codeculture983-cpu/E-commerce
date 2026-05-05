import React, { useEffect, useState } from "react";
import axios from "axios";
import { backendUrl, currency } from "../App";
import { toast } from "react-toastify";

const List = () => {
  const [list, setList] = useState([]);

  // ================= FETCH PRODUCTS =================
  const fetchList = async () => {
    try {
      const token = localStorage.getItem("adminToken");

      if (!token) {
        toast.error("Admin not logged in");
        return;
      }

      const response = await axios.get(
        `${backendUrl}/api/product/list`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setList(response.data.products || []);
      } else {
        toast.error("Failed to fetch products");
      }
    } catch (error) {
      console.log(error);
      toast.error("Unauthorized or token expired");
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  // ================= REMOVE PRODUCT =================
  const removeProduct = async (id) => {
    try {
      const token = localStorage.getItem("adminToken");

      if (!token) {
        return toast.error("Admin not logged in");
      }

      const response = await axios.post(
        `${backendUrl}/api/product/remove`,
        { id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        toast.success("Product removed successfully");
        fetchList();
      } else {
        toast.error("Failed to remove product");
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to remove product");
    }
  };

  return (
    <>
      <p className="mb-4 text-lg font-semibold">
        All Products List
      </p>

      <div className="flex flex-col gap-3">

        {/* TABLE HEADER */}
        <div className="hidden md:grid md:grid-cols-[1fr_2fr_1fr_1fr_1fr] items-center py-2 px-3 border bg-gray-100 text-sm font-semibold">
          <p>Image</p>
          <p>Name</p>
          <p>Category</p>
          <p>Price</p>
          <p className="text-center">Delete</p>
        </div>

        {/* PRODUCT LIST */}
        {list.map((item) => (
          <div
            key={item._id}
            className="grid grid-cols-1 md:grid-cols-[1fr_2fr_1fr_1fr_1fr] gap-3 items-center border p-3 text-sm"
          >
            {/* IMAGE */}
            <img
              src={
                item.images?.[0] ||
                "https://dummyimage.com/60x60/ccc/000.png&text=No+Image"
              }
              alt={item.name}
              className="w-14 h-14 object-cover rounded"
            />

            {/* NAME */}
            <p>{item.name}</p>

            {/* CATEGORY */}
            <p>{item.category}</p>

            {/* PRICE */}
            <p>
              {currency}
              {item.price}
            </p>

            {/* DELETE */}
            <div className="text-center">
              <button
                onClick={() => removeProduct(item._id)}
                className="text-red-600 text-lg font-bold"
              >
                X
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default List;