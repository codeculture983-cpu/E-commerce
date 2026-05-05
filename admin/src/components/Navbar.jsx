import React from "react";
import { assets } from "../assets/assets.js";

const Navbar = ({ setToken }) => { // <-- destructure props
  return (
    <div className="flex items-center justify-between px-[4%] py-2">
      
      {/* Logo */}
      <img
        className="w-[max(10%,80px)]"
        src={assets.logo}
        alt="logo"
      />

      {/* Logout Button */}
                     <button
                  onClick={() => {
                    setToken('');
                    localStorage.removeItem('token');
                  }}
                  className="bg-gray-600 text-white px-5 py-2 sm:px-7 sm:py-2 rounded-full text-xs sm:text-sm hover:bg-gray-700 transition"
                         >
               LogOut
             </button>

    </div>
  );
};

export default Navbar;
