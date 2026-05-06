import React, { useEffect, useState } from "react";
import axios from "axios";
import { backendUrl, currency } from "../App";
import { toast } from "react-toastify";

const List = () => {
  const [list, setList] = useState([]);

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

  const removeProduct = async (id) => {
    try {
      const token = localStorage.getItem("adminToken");

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
    <div className="p-2">

      <p className="mb-4 text-xl font-bold">
        All Products List
      </p>

      <div className="flex flex-col gap-3">

        {/* HEADER */}
        <div className="hidden md:grid grid-cols-[80px_2fr_1fr_1fr_80px] items-center py-3 px-4 border bg-gray-100 text-sm font-semibold rounded">
          <p>Image</p>
          <p>Name</p>
          <p>Category</p>
          <p>Price</p>
          <p className="text-center">Action</p>
        </div>

        {/* PRODUCTS */}
        {list.map((item) => {
          const image =
            item.images?.[0] ||
            item.image ||
            "https://dummyimage.com/80x80/ccc/000.png&text=No+Image";

          return (
            <div
              key={item._id}
              className="grid grid-cols-[80px_2fr_1fr_1fr_80px] items-center gap-3 border p-3 rounded shadow-sm bg-white"
            >

              {/* IMAGE */}
              <img
                src={image}
                alt={item.name}
                className="w-14 h-14 object-cover rounded border"
              />

              {/* NAME */}
              <p className="font-medium">{item.name}</p>

              {/* CATEGORY */}
              <p className="text-gray-600">{item.category}</p>

              {/* PRICE */}
              <p className="font-semibold text-green-600">
                {currency}{item.price}
              </p>

              {/* DELETE */}
              <div className="text-center">
                <button
                  onClick={() => removeProduct(item._id)}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                >
                  Delete
                </button>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
};

export default List;
