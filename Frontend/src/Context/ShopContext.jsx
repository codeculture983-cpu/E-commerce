
/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react-hooks/exhaustive-deps */

import React, {
  createContext,
  useState,
  useEffect,
} from "react";

import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export const ShopContext = createContext();

const ShopContextProvider = ({ children }) => {
  const currency = "$";
  const delivery_fee = 10;

  const backend_url =
    import.meta.env.VITE_BACKEND_URL ||
    "http://localhost:4000";

  // ----------------- STATES -----------------

  const [products, setProducts] = useState([]);

  const [cartItems, setCartItems] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem("guestCart") || "{}"
      );
    } catch (error) {
      console.error("Guest cart loading error:", error);
      return {};
    }
  });

  const [user, setUser] = useState(null);
  const [token, setToken] = useState("");

  const navigate = useNavigate();

  // ----------------- PRODUCT FETCH -----------------

  const fetchProducts = async () => {
    try {
      const res = await axios.get(
        `${backend_url}/api/product/list`
      );

      if (res.data.success) {
        setProducts(res.data.products || []);
      } else {
        toast.error(
          res.data.message || "Failed to fetch products"
        );
      }
    } catch (error) {
      console.error("Product fetch error:", error);
      toast.error("Failed to fetch products");
    }
  };

  // ----------------- USER DATA -----------------

  const getUserData = async (userToken = token) => {
    if (!userToken) {
      setUser(null);
      return;
    }

    try {
      const res = await axios.get(
        `${backend_url}/api/user/me`,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      );

      if (res.data.success) {
        setUser(res.data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("User data error:", error);
      setUser(null);
    }
  };

  // ----------------- GET USER CART -----------------

  const getUserCart = async (userToken = token) => {
    if (!userToken) return;

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
        console.error(
          "Could not load cart:",
          res.data.message
        );
      }
    } catch (error) {
      // Do not erase the existing cart if the request fails.
      console.error(
        "Get cart error:",
        error.response?.data || error.message
      );
    }
  };

  // ----------------- LOGIN -----------------

  const login = async (email, password) => {
    try {
      const res = await axios.post(
        `${backend_url}/api/user/login`,
        {
          email,
          password,
        }
      );

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
        toast.error(
          res.data.message || "Login failed"
        );
      }
    } catch (error) {
      console.error("Login error:", error);

      toast.error(
        error.response?.data?.message || "Login failed"
      );
    }
  };

  // ----------------- LOGOUT -----------------

  const logout = () => {
    localStorage.removeItem("token");

    delete axios.defaults.headers.common[
      "Authorization"
    ];

    setToken("");
    setUser(null);
    setCartItems({});

    navigate("/login");

    toast.info("Logged out");
  };

  // ----------------- CART COUNT -----------------

  const getCartCount = () => {
    return Object.values(cartItems).reduce(
      (total, sizes) => {
        return (
          total +
          Object.values(sizes || {}).reduce(
            (sum, quantity) =>
              sum + Number(quantity || 0),
            0
          )
        );
      },
      0
    );
  };

  // ----------------- CART AMOUNT -----------------

  const getCartAmount = () => {
    let total = 0;

    for (const itemId in cartItems) {
      const product = products.find(
        (item) => item._id === itemId
      );

      if (!product) continue;

      for (const size in cartItems[itemId]) {
        total +=
          Number(product.price || 0) *
          Number(cartItems[itemId][size] || 0);
      }
    }

    return total;
  };

  // ----------------- ADD TO CART -----------------

  const addToCart = async (itemId, size) => {
    if (!size) {
      toast.error("Select a size");
      return;
    }

    // Preserve other products and sizes.
    const updatedCart = JSON.parse(
      JSON.stringify(cartItems)
    );

    if (!updatedCart[itemId]) {
      updatedCart[itemId] = {};
    }

    updatedCart[itemId][size] =
      Number(updatedCart[itemId][size] || 0) + 1;

    // Update UI immediately.
    setCartItems(updatedCart);

    // Guest user.
    if (!token) {
      toast.success("Cart updated");
      return;
    }

    // Logged-in user: save to MongoDB.
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
        toast.error(
          res.data.message || "Failed to add to cart"
        );

        await getUserCart(token);
      }
    } catch (error) {
      console.error("Add to cart error:", error);

      toast.error("Failed to add to cart");

      await getUserCart(token);
    }
  };

  // ----------------- UPDATE QUANTITY -----------------

  const updateQuantity = async (
    itemId,
    size,
    quantity
  ) => {
    try {
      quantity = Math.max(0, Number(quantity) || 0);

      const updatedCart = JSON.parse(
        JSON.stringify(cartItems)
      );

      if (!updatedCart[itemId]) {
        updatedCart[itemId] = {};
      }

      if (quantity <= 0) {
        delete updatedCart[itemId][size];

        if (
          Object.keys(updatedCart[itemId]).length === 0
        ) {
          delete updatedCart[itemId];
        }
      } else {
        updatedCart[itemId][size] = quantity;
      }

      // Update UI immediately.
      setCartItems(updatedCart);

      // Guest cart is saved by the guest-cart effect.
      if (!token) return;

      // Save logged-in cart to MongoDB.
      const response = await axios.post(
        `${backend_url}/api/cart/update`,
        {
          itemId,
          size,
          quantity,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setCartItems(
          response.data.cartData || updatedCart
        );
      } else {
        toast.error(
          response.data.message || "Cart update failed"
        );

        await getUserCart(token);
      }
    } catch (error) {
      console.error("Update cart error:", error);

      toast.error("Failed to update cart");

      if (token) {
        await getUserCart(token);
      }
    }
  };

  // ----------------- CLEAR CART -----------------

  const clearCart = async () => {
    // Clear frontend cart.
    setCartItems({});

    // Clear guest cart.
    localStorage.removeItem("guestCart");

    // Clear logged-in user's database cart.
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
      } catch (error) {
        console.error(
          "Cart clear failed:",
          error
        );
      }
    }
  };

  // ----------------- REVIEWS -----------------

  const submitReview = async (
    productId,
    reviewData
  ) => {
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
      console.error("Review error:", error);

      toast.error("Failed to submit review");

      return null;
    }
  };

  // ----------------- SAVE GUEST CART -----------------

  useEffect(() => {
    if (!token) {
      localStorage.setItem(
        "guestCart",
        JSON.stringify(cartItems)
      );
    }
  }, [cartItems, token]);

  // ----------------- INITIAL LOAD -----------------

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
        setProducts,

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
