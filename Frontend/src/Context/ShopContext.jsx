/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export const ShopContext = createContext();

const ShopContextProvider = ({ children }) => {
  const currency = "$";
  const delivery_fee = 10;
  const backend_url = "https://forver-backend.onrender.com";

  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState({});
  const [user, setUser] = useState(null);
  const [token, setToken] = useState("");

  const navigate = useNavigate();

  // ----------------- PRODUCT FETCH -----------------
  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${backend_url}/api/product/list`);
      if (res.data.success) setProducts(res.data.products);
      else toast.error(res.data.message);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch products");
    }
  };

  // ----------------- USER AUTH -----------------
  const login = async (email, password) => {
  try {
    const res = await axios.post(`${backend_url}/api/user/login`, {
      email,
      password,
    });

    if (res.data.success) {
      const userToken = res.data.token;

      localStorage.setItem("token", userToken);
      setToken(userToken);

      axios.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${userToken}`;

      await getUserData(userToken);
      await getUserCart(userToken);

      toast.success("Login successful");
      navigate("/");
    } else {
      toast.error(res.data.message);
    }
  } catch (error) {
    console.log(error);
    toast.error("Login failed");
  }
};

  const logout = () => {
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];

    setToken("");
    setUser(null);
    setCartItems({});
    navigate("/login");
    toast.info("Logged out");
  };

  const getUserData = async (userToken = token) => {
    if (!userToken) return setUser(null);
    try {
      const res = await axios.get(`${backend_url}/api/user/me`, {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      if (res.data.success) setUser(res.data.user);
      else setUser(null);
    } catch (error) {
      console.error(error);
      setUser(null);
    }
  };

 
  // Cart helpers
  const getCartCount = () =>
    Object.values(cartItems).reduce(
      (acc, sizes) => acc + Object.values(sizes).reduce((a, b) => a + b, 0),
      0
    );

  const getCartAmount = () => {
    let total = 0;
    for (const id in cartItems) {
      const product = products.find((p) => p._id === id);
      if (!product) continue;
      for (const size in cartItems[id]) total += product.price * cartItems[id][size];
    }
    return total;
  };

 const clearCart = async () => {
  setCartItems({});

  if (token) {
    try {
      await axios.post(
        `${backend_url}/api/cart/clear`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    } catch (err) {
      console.log("Cart clear failed", err);
    }
  }
};
  // ------------------ Cart API ------------------
  const getUserCart = async (userToken = token) => {
    if (!userToken) return setCartItems({});
    try {
      const res = await axios.post(
        `${backend_url}/api/cart/get`,
        {},
        { headers: { Authorization: `Bearer ${userToken}` } }
      );
      if (res.data.success) setCartItems(res.data.cartData || {});
      else setCartItems({});
    } catch (error) {
      console.error(error);
      setCartItems({});
    }
  };

  const addToCart = async (itemId, size) => {
    if (!size) return toast.error("Select a size");
    const updatedCart = structuredClone(cartItems);
    if (updatedCart[itemId]) updatedCart[itemId][size] = (updatedCart[itemId][size] || 0) + 1;
    else updatedCart[itemId] = { [size]: 1 };
    setCartItems(updatedCart);

    if (token) {
      try {
        const res = await axios.post(
          `${backend_url}/api/cart/add`,
          { itemId, size },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.data.success) setCartItems(res.data.cartData);
      } catch {
        toast.error("Failed to add to cart");
      }
    }
  };

 const updateQuantity = async (itemId, size, quantity) => {
  try {
    // Prevent negative quantity
    if (quantity < 0) quantity = 0;

    // Clone current cart safely
    let updatedCart = structuredClone(cartItems);

    // Ensure product exists
    if (!updatedCart[itemId]) {
      updatedCart[itemId] = {};
    }

    // Remove item if quantity <= 0
    if (quantity <= 0) {
      delete updatedCart[itemId][size];

      // Remove product completely if no sizes left
      if (Object.keys(updatedCart[itemId]).length === 0) {
        delete updatedCart[itemId];
      }
    } else {
      // Update quantity
      updatedCart[itemId][size] = Number(quantity);
    }

    // Instant frontend update
    setCartItems(updatedCart);

    // ---------------- Logged-in user ----------------
    if (token) {
      const response = await axios.post(
        `${backend_url}/api/cart/update`,
        {
          itemId,
          size,
          quantity: Number(quantity),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        // Sync frontend with backend response
        setCartItems(response.data.cartData || {});
      } else {
        toast.error(response.data.message || "Cart update failed");

        // Rollback if backend failed
        await getUserCart(token);
      }
    }

  
  } catch (error) {
    console.log(error);
    toast.error("Failed to update cart");

    // Safety rollback
    if (token) {
      await getUserCart(token);
    }
  }
};

  // ----------------- REVIEWS -----------------
  const submitReview = async (productId, reviewData) => {
    if (!token) return toast.error("Login required");
    try {
      const res = await axios.post(
        `${backend_url}/api/reviews`,
        { productId, ...reviewData },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) return res.data.review;
      toast.error(res.data.message || "Failed to add review");
      return null;
    } catch (error) {
      console.error(error);
      toast.error("Failed to submit review");
      return null;
    }
  };

  // ----------------- EFFECTS -----------------
  useEffect(() => {
    fetchProducts();

    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      setToken(savedToken);
      axios.defaults.headers.common["Authorization"] = `Bearer ${savedToken}`;
      getUserData(savedToken);
      getUserCart(savedToken);
    }
  }, []);

  return (
    <ShopContext.Provider
      value={{
        products,
        cartItems,
        setCartItems,
        updateQuantity,
        getCartCount,
        getCartAmount,
        addToCart,
        clearCart,
        token,
        setToken,
        user,
        setUser,
        login,
        logout,
        submitReview,
        currency,
        delivery_fee,
        navigate,
        getUserCart,
        backend_url,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

export default ShopContextProvider;
