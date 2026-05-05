import React from "react";
import { NavLink } from "react-router-dom";
import {
  PlusCircleIcon,
  ClipboardListIcon,
  HomeIcon,
  ChartBarIcon,
  DocumentTextIcon,
  CogIcon, // ✅ NEW ICON ADDED
} from "@heroicons/react/outline";

const Sidebar = () => {
  const linkClasses = ({ isActive }) =>
    `flex items-center gap-3 border border-gray-300 border-r-0 py-2 rounded-l px-3 ${
      isActive ? "bg-gray-200 font-semibold" : ""
    }`;

  return (
    <div className="w-[18%] min-h-screen border-r-2 bg-white">
      <div className="flex flex-col gap-4 pt-6 pl-[10%] text-[15px]">

        <NavLink className={linkClasses} to="/add">
          <PlusCircleIcon className="w-5 h-5" />
          <p className="hidden md:block">Add Items</p>
        </NavLink>

        <NavLink className={linkClasses} to="/list">
          <ClipboardListIcon className="w-5 h-5" />
          <p className="hidden md:block">List Items</p>
        </NavLink>

        <NavLink className={linkClasses} to="/orders">
          <HomeIcon className="w-5 h-5" />
          <p className="hidden md:block">Orders</p>
        </NavLink>

        <NavLink className={linkClasses} to="/analytics">
          <ChartBarIcon className="w-5 h-5" />
          <p className="hidden md:block">Analytics</p>
        </NavLink>

        {/* ================= CMS PAGE ================= */}
        <NavLink className={linkClasses} to="/cms">
          <DocumentTextIcon className="w-5 h-5" />
          <p className="hidden md:block">CMS</p>
        </NavLink>

        {/* ================= SETTINGS PAGE (NEW) =================
        <NavLink className={linkClasses} to="/settings">
          <CogIcon className="w-5 h-5" />
          <p className="hidden md:block">Settings</p>
        </NavLink> */}

      </div>
    </div>
  );
};

export default Sidebar;