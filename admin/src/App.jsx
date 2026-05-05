/* eslint-disable react-refresh/only-export-components */
import React, { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Add from "./pages/Add";
import List from "./pages/List";
import Orders from "./pages/Orders";
import Analytics from "./pages/AnalyticsPage";
import Login from "./components/Login";
import CMS from "./pages/CMSPage";
// import Settings from "./pages/SettingsPage"; 

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const backendUrl =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

export const currency = "$";

const App = () => {
  const [token, setToken] = useState(
    localStorage.getItem("token") || ""
  );

  useEffect(() => {
    localStorage.setItem("token", token);
  }, [token]);

  return (
    <div className="bg-gray-50 min-h-screen">
      <ToastContainer />

      {token === "" ? (
        <Login setToken={setToken} />
      ) : (
        <>
          <Navbar setToken={setToken} />
          <hr />

          <div className="flex w-full">
            <Sidebar />

            <div className="w-[70%] mx-auto ml-[max(5vw,25px)] my-8 text-gray-600 text-base">
              <Routes>
                <Route path="/add" element={<Add token={token} />} />
                <Route path="/list" element={<List token={token} />} />
                <Route path="/orders" element={<Orders token={token} />} />
                <Route path="/cms" element={<CMS />} />

                {/* ✅ NEW SETTINGS ROUTE
                <Route path="/settings" element={<Settings />} /> */}

                {/* ADMIN ONLY PAGE */}
                <Route path="/analytics" element={<Analytics />} />

                {/* Default route */}
                <Route path="/" element={<Analytics />} />
              </Routes>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default App;