import React from "react";
import { Routes, Route } from "react-router-dom";
import ScrollToTop from "./Components/ScrollToTop";

// Pages
import Home from "./Pages/Home.jsx";
import Login from "./Pages/Login.jsx";
import Signup from "./Pages/Signup.jsx";
import Profile from "./Pages/Profile.jsx";
import PlaceOrder from "./Pages/PlaceOrder.jsx";
import Order from "./Pages/Order.jsx";
import OrderDetails from "./Pages/OrderDetails.jsx";
import About from "./Pages/About.jsx";
import Collection from "./Pages/Collection.jsx";
import Contact from "./Pages/Contact.jsx";
import Product from "./Pages/Product.jsx";
import Cart from "./Pages/Cart.jsx";
import Verify from "./Pages/verify.jsx";
import Privacy from "./Pages/Privacy.jsx";
import Terms from "./Pages/Terms.jsx";
import Refund from "./Pages/Refund.jsx";
import Shipping from "./Pages/Shipping.jsx";

// Components
import Navbar from "./Components/Navbar.jsx";
import Footer from "./Components/Footer.jsx";
import Searchbar from "./Components/Searchbar.jsx";
import TrackOrder from "./Pages/TrackOrder.jsx";
// Toast
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// ✅ FIXED: default import
import AuthProvider from "./Context/AuthContext.jsx";

// Error Boundary
import ErrorBoundary from "./Components/ErrorBoundary.jsx";

// Password Pages
import ForgotPassword from "./Pages/ForgetPassword.jsx";
import ResetPassword from "./Pages/ResetPassword.jsx";

const App = () => {
  return (
    <AuthProvider>
      <ErrorBoundary>
        <ScrollToTop />

        <div className="px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]">
          
          {/* Toast */}
          <ToastContainer position="top-right" autoClose={3000} />

          {/* Layout */}
          <Navbar />
          <Searchbar />

          {/* Routes */}
          <Routes>

            {/* ================= MAIN ================= */}
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/collection" element={<Collection />} />
            <Route path="/contact" element={<Contact />} />

            {/* ================= AUTH ================= */}
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/profile" element={<Profile />} />

            {/* ================= CART & PRODUCT ================= */}
            <Route path="/cart" element={<Cart />} />
            <Route path="/product/:productId" element={<Product />} />

            {/* ================= ORDERS ================= */}
            <Route path="/placeorder" element={<PlaceOrder />} />
            <Route path="/orders" element={<Order />} />
            <Route path="/order/:id" element={<OrderDetails />} />
             <Route path="/track/:id" element={<TrackOrder />} />
            {/* ================= VERIFY ================= */}
            <Route path="/verify" element={<Verify />} />

            {/* ================= PASSWORD ================= */}
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* ================= POLICIES ================= */}
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/refund" element={<Refund />} />
            <Route path="/shipping" element={<Shipping />} />

            {/* ================= FALLBACK ================= */}
            <Route path="*" element={<Login />} />

          </Routes>

          {/* Footer */}
          <Footer />

        </div>
      </ErrorBoundary>
    </AuthProvider>
  );
};

export default App;