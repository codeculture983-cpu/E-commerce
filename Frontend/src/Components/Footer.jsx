import React from "react";
import { assets } from "../assets/assets";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <div>
      <div className="flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10 mt-40 text-sm">

        {/* LOGO */}
        <div>
          <img src={assets.logo} className="mb-5 w-32" alt="" />
          <p className="w-full md:w-2/3 text-gray-600">
            Forever – Quality products, timeless style.
          </p>
        </div>

        {/* COMPANY */}
        <div>
          <p className="text-xl font-medium mb-5">COMPANY</p>

          <ul className="flex flex-col gap-2 text-gray-500">

            <li>
              <Link to="/" className="hover:text-black">
                Home
              </Link>
            </li>

            <li>
              <Link to="/about" className="hover:text-black">
                About Us
              </Link>
            </li>

            <li>
              <Link to="/orders" className="hover:text-black">
                Delivery
              </Link>
            </li>

            <li>
              <Link to="/privacy" className="hover:text-black">
                Privacy Policy
              </Link>
            </li>

          </ul>
        </div>

        {/* CONTACT */}
        <div>
          <p className="text-xl font-medium mb-5">GET IN TOUCH</p>
          <ul className="flex flex-col gap-1 text-gray-500">
            <li>+92-323-4-4463-51</li>
            <li>codeculture@gmail.com</li>
          </ul>
        </div>
      </div>

      {/* POLICY LINKS */}
      <div className="flex flex-wrap gap-4 text-sm text-gray-900 justify-center">
        <Link to="/terms">Terms</Link>
        <Link to="/privacy">Privacy</Link>
        <Link to="/refund">Refund</Link>
        <Link to="/shipping">Shipping</Link>
      </div>

      <div>
        <hr />
        <p className="py-5 text-sm text-center">
          Copyright 2026@ forever.com - All Right Reserved.
        </p>
      </div>
    </div>
  );
};

export default Footer;