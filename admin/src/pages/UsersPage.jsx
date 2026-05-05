/* eslint-disable react-hooks/set-state-in-effect */
import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { backendUrl } from "../App";

const Users = () => {
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) return toast.error("Admin not logged in");

      const res = await axios.get(`${backendUrl}/api/user/list`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) setUsers(res.data.users);
      else toast.error("Failed to fetch users");
    } catch (err) {
      console.error(err);
      toast.error("Error fetching users");
    }
  };

  const toggleBlock = async (id, block) => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await axios.put(
        `${backendUrl}/api/user/block`,
        { id, block },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        toast.success(`User ${block ? "blocked" : "unblocked"}`);
        setUsers((prev) =>
          prev.map((u) => (u._id === id ? { ...u, blocked: block } : u))
        );
      } else toast.error(res.data.message);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update user");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Users Management</h2>
      <div className="grid grid-cols-[2fr_2fr_1fr_1fr] gap-4 mb-2 font-semibold bg-gray-100 p-2 rounded">
        <div>Name</div>
        <div>Email</div>
        <div>Status</div>
        <div>Action</div>
      </div>
      {users.map((u) => (
        <div
          key={u._id}
          className="grid grid-cols-[2fr_2fr_1fr_1fr] gap-4 p-2 border-b items-center"
        >
          <div>{u.name}</div>
          <div>{u.email}</div>
          <div>{u.blocked ? "Blocked" : "Active"}</div>
          <div>
            <button
              onClick={() => toggleBlock(u._id, !u.blocked)}
              className={`px-2 py-1 rounded text-white ${
                u.blocked ? "bg-green-500" : "bg-red-500"
              }`}
            >
              {u.blocked ? "Unblock" : "Block"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Users;