
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

  const backend_url =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState({});
  const [user, setUser] = useState(null);
  const [token, setToken] = useState("");

  const navigate = useNavigate();

  // ----------------- PRODUCT FETCH -----------------

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${backend_url}/api/product/list`);

      if (res.data.success) {
        setProducts(res.data.products);
      } else {
        toast.error(res.data.message);
      }
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
    if (!userToken) {
      return setUser(null);
    }

    try {
      const res = await axios.get(`${backend_url}/api/user/me`, {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });

      if (res.data.success) {
        setUser(res.data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error(error);
      setUser(null);
    }
  };

  // ----------------- CART HELPERS -----------------

  const getCartCount = () =>
    Object.values(cartItems).reduce(
      (acc, sizes) =>
        acc + Object.values(sizes).reduce((a, b) => a + b, 0),
      0
    );

  const getCartAmount = () => {
    let total = 0;

    for (const id in cartItems) {
      const product = products.find((p) => p._id === id);

      if (!product) continue;

      for (const size in cartItems[id]) {
        total += product.price * cartItems[id][size];
      }
    }

    return total;
  };

  // ----------------- CLEAR CART -----------------

  const clearCart = async () => {
    setCartItems({});

    if (token) {
      try {
        await axios.post(
          `${backend_url}/api/cart/clear`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } catch (err) {
        console.log("Cart clear failed", err);
      }
    }
  };

  // ----------------- GET USER CART -----------------

  const getUserCart = async (userToken = token) => {
    if (!userToken) {
      return setCartItems({});
    }

    try {
      const res = await axios.post(
        `${backend_url}/api/cart/get`,
        {},
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      );

      if (res.data.success) {
        setCartItems(res.data.cartData || {});
      } else {
        setCartItems({});
      }
    } catch (error) {
      console.error(error);
      setCartItems({});
    }
  };

  // ----------------- ADD TO CART -----------------

  const addToCart = async (itemId, size) => {
    if (!size) {
      toast.error("Select a size");
      return;
    }

    // Create updated cart
    const updatedCart = structuredClone(cartItems);

    if (updatedCart[itemId]) {
      updatedCart[itemId][size] =
        (updatedCart[itemId][size] || 0) + 1;
    } else {
      updatedCart[itemId] = {
        [size]: 1,
      };
    }

    // Guest customer
    if (!token) {
      setCartItems(updatedCart);
      toast.success("Cart updated");
      return;
    }

    // Logged-in customer
    try {
      const res = await axios.post(
        `${backend_url}/api/cart/add`,
        {
          itemId,
          size,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data.success) {
        setCartItems(res.data.cartData || updatedCart);
        toast.success("Cart updated");
      } else {
        toast.error(res.data.message || "Failed to add to cart");
      }
    } catch (error) {
      console.error("Add to cart error:", error);

      toast.error(
        error.response?.data?.message || "Failed to add to cart"
      );

      await getUserCart(token);
    }
  };

  // ----------------- UPDATE QUANTITY -----------------

  const updateQuantity = async (itemId, size, quantity) => {
    try {
      if (quantity < 0) {
        quantity = 0;
      }

      let updatedCart = structuredClone(cartItems);

      if (!updatedCart[itemId]) {
        updatedCart[itemId] = {};
      }

      if (quantity <= 0) {
        delete updatedCart[itemId][size];

        if (Object.keys(updatedCart[itemId]).length === 0) {
          delete updatedCart[itemId];
        }
      } else {
        updatedCart[itemId][size] = Number(quantity);
      }

      setCartItems(updatedCart);

      // Logged-in customer
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
          setCartItems(response.data.cartData || {});
        } else {
          toast.error(
            response.data.message || "Cart update failed"
          );

          await getUserCart(token);
        }
      }
    } catch (error) {
      console.log(error);

      toast.error("Failed to update cart");

      if (token) {
        await getUserCart(token);
      }
    }
  };

  // ----------------- REVIEWS -----------------

  const submitReview = async (productId, reviewData) => {
    if (!token) {
      toast.error("Login required");
      return null;
    }

    try {
      const res = await axios.post(
        `${backend_url}/api/reviews`,
        {
          productId,
          ...reviewData,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data.success) {
        return res.data.review;
      }

      toast.error(
        res.data.message || "Failed to add review"
      );

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

      axios.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${savedToken}`;

      getUserData(savedToken);
      getUserCart(savedToken);
    }
  }, []);

  // ----------------- CONTEXT PROVIDER -----------------

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
