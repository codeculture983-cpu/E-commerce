// src/Pages/Tabs/AddressesTab.jsx
import React, { useContext, useState } from "react";
import { ProfileContext } from "../Context/ProfileContext";
import axios from "axios";
import { toast } from "react-toastify";

const AddressesTab = () => {
  const { addresses, token, backendUrl, fetchProfileData } = useContext(ProfileContext);
  const [newAddress, setNewAddress] = useState("");

  const addAddress = async () => {
    if (!newAddress) return toast.error("Address cannot be empty");
    try {
      await axios.post(
        `${backendUrl}/api/user/addresses`,
        { address: newAddress },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Address added");
      setNewAddress("");
      fetchProfileData();
    } catch (err) {
        console.log(err)
      toast.error("Failed to add address");
    }
  };

  const removeAddress = async (id) => {
    try {
      await axios.delete(`${backendUrl}/api/user/addresses/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Address removed");
      fetchProfileData();
    } catch (err) {
        console.log(err)
      toast.error("Failed to remove address");
    }
  };

  return (
    <div className="space-y-4 max-w-md">
      <div className="flex space-x-2">
        <input
          type="text"
          placeholder="New address"
          value={newAddress}
          onChange={(e) => setNewAddress(e.target.value)}
          className="flex-1 border rounded px-3 py-2"
        />
        <button
          onClick={addAddress}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Add
        </button>
      </div>

      {addresses.length === 0 ? (
        <p>No addresses added yet.</p>
      ) : (
        addresses.map((addr) => (
          <div
            key={addr._id}
            className="border rounded p-3 flex justify-between items-center"
          >
            <span>{addr.address}</span>
            <button
              onClick={() => removeAddress(addr._id)}
              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
            >
              Remove
            </button>
          </div>
        ))
      )}
    </div>
  );
};

export default AddressesTab;