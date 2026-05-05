// context/AdminContext.jsx
import { createContext, useEffect, useState } from "react";
import axios from "axios";

export const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const fetchAdmin = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/admin/me`, {
        withCredentials: true,
      });
      setAdmin(res.data.admin);
    } catch {
      setAdmin(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmin();
  }, []);

  return (
    <AdminContext.Provider value={{ admin, backendUrl }}>
      {!loading && children}
    </AdminContext.Provider>
  );
};