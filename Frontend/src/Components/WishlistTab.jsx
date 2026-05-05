// src/Pages/Tabs/WishlistTab.jsx
import React, { useContext } from "react";
import { ProfileContext } from "../Context/ProfileContext";
import axios from "axios";
import { toast } from "react-toastify";

const WishlistTab = () => {
  const { wishlist, token, backendUrl, fetchProfileData } = useContext(ProfileContext);

  const removeItem = async (id) => {
    try {
      await axios.delete(`${backendUrl}/api/user/wishlist/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Item removed from wishlist");
      fetchProfileData();
    } catch (err) {
        console.log(err)
      toast.error("Failed to remove item");
    }
  };

  if (!wishlist.length) return <p>Your wishlist is empty.</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {wishlist.map((item) => (
        <div key={item._id} className="border rounded p-4 flex justify-between items-center">
          <div>
            <p className="font-medium">{item.name}</p>
            <p className="text-gray-500">${item.price}</p>
          </div>
          <button
            onClick={() => removeItem(item._id)}
            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
          >
            Remove
          </button>
        </div>
      ))}
    </div>
  );
};

export default WishlistTab;