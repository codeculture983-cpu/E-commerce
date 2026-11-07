
/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react-hooks/exhaustive-deps */

import React, {
  createContext,
  useState,
  useEffect,
  useRef,
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

  // ---------------- STATES ----------------

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

  // ---------------- CART REQUEST CONTROL ----------------

  const cartRequestQueue = useRef(Promise.resolve());
  const cartSessionRef = useRef(0);

  // Run cart requests one after another.
  const queueCartRequest = (request) => {
    const nextRequest = cartRequestQueue.current.then(
      request,
      request
    );

    cartRequestQueue.current = nextRequest.catch(() => {});

    return nextRequest;
  };

  // ---------------- PRODUCTS ----------------

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

  // ---------------- USER DATA ----------------

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

  // ---------------- GET USER CART ----------------

  const getUserCart = async (userToken = token) => {
    if (!userToken) return;

    const currentSession = cartSessionRef.current;

    try {
      // IMPORTANT:
      // Cart loading uses the same queue as add/update requests.
      // An older response cannot overwrite a newer cart update.
      await queueCartRequest(async () => {
        const res = await axios.post(
          `${backend_url}/api/cart/get`,
          {},
          {
            headers: {
              Authorization: `Bearer ${userToken}`,
            },
          }
        );

        if (!res.data.success) {
          throw new Error(
            res.data.message || "Could not load cart"
          );
        }

        if (currentSession === cartSessionRef.current) {
          setCartItems(res.data.cartData || {});
        }
      });
    } catch (error) {
      console.error(
        "Get cart error:",
        error.response?.data || error.message
      );
    }
  };

  // ---------------- LOGIN ----------------

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

        // Start a new cart session.
        cartSessionRef.current += 1;

        localStorage.setItem("token", userToken);

        setToken(userToken);

        axios.defaults.headers.common.Authorization =
          `Bearer ${userToken}`;

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

  // ---------------- LOGOUT ----------------

  const logout = () => {
    // Ignore responses from the previous login session.
    cartSessionRef.current += 1;

    localStorage.removeItem("token");

    delete axios.defaults.headers.common.Authorization;

    setToken("");
    setUser(null);
    setCartItems({});

    navigate("/login");
    toast.info("Logged out");
  };

  // ---------------- CART COUNT ----------------

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

  // ---------------- CART AMOUNT ----------------

  const getCartAmount = () => {
    let total = 0;

    for (const itemId in cartItems) {
      const product = products.find(
        (item) => String(item._id) === String(itemId)
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

  // ---------------- ADD TO CART ----------------

  const addToCart = async (itemId, size) => {
    if (!size) {
      toast.error("Select a size");
      return;
    }

    const selectedToken = token;
    const currentSession = cartSessionRef.current;

    // Update the UI immediately.
    setCartItems((prev) => {
      const updatedCart = structuredClone(prev || {});

      if (!updatedCart[itemId]) {
        updatedCart[itemId] = {};
      }

      updatedCart[itemId][size] =
        (Number(updatedCart[itemId][size]) || 0) + 1;

      return updatedCart;
    });

    // Guest cart is stored locally.
    if (!selectedToken) {
      toast.success("Cart updated");
      return;
    }

    try {
      await queueCartRequest(async () => {
        const res = await axios.post(
          `${backend_url}/api/cart/add`,
          {
            itemId,
            size,
          },
          {
            headers: {
              Authorization: `Bearer ${selectedToken}`,
            },
          }
        );

        if (!res.data.success) {
          throw new Error(
            res.data.message || "Failed to add item"
          );
        }

        // Use the latest server cart only in this session.
        if (currentSession === cartSessionRef.current) {
          setCartItems(res.data.cartData || {});
        }
      });

      toast.success("Cart updated");
    } catch (error) {
      console.error(
        "Add to cart error:",
        error.response?.data || error.message
      );

      toast.error("Failed to save cart. Please try again.");

      // Reload the actual server cart after a failed request.
      await getUserCart(selectedToken);
    }
  };

  // ---------------- UPDATE QUANTITY ----------------

  const updateQuantity = async (
    itemId,
    size,
    quantity
  ) => {
    const newQuantity = Math.max(
      0,
      Math.floor(Number(quantity) || 0)
    );

    const selectedToken = token;
    const currentSession = cartSessionRef.current;

    // Update UI immediately.
    setCartItems((prev) => {
      const updatedCart = structuredClone(prev || {});

      if (!updatedCart[itemId]) {
        return updatedCart;
      }

      if (newQuantity === 0) {
        delete updatedCart[itemId][size];

        if (
          Object.keys(updatedCart[itemId]).length === 0
        ) {
          delete updatedCart[itemId];
        }
      } else {
        updatedCart[itemId][size] = newQuantity;
      }

      return updatedCart;
    });

    // Guest cart is saved by the effect below.
    if (!selectedToken) return;

    try {
      await queueCartRequest(async () => {
        const res = await axios.post(
          `${backend_url}/api/cart/update`,
          {
            itemId,
            size,
            quantity: newQuantity,
          },
          {
            headers: {
              Authorization: `Bearer ${selectedToken}`,
            },
          }
        );

        if (!res.data.success) {
          throw new Error(
            res.data.message || "Cart update failed"
          );
        }

        if (currentSession === cartSessionRef.current) {
          setCartItems(res.data.cartData || {});
        }
      });
    } catch (error) {
      console.error(
        "Update cart error:",
        error.response?.data || error.message
      );

      toast.error("Failed to update cart. Please try again.");

      await getUserCart(selectedToken);
    }
  };

  // ---------------- CLEAR CART ----------------

  const clearCart = async () => {
    const selectedToken = token;
    const currentSession = cartSessionRef.current;

    setCartItems({});
    localStorage.removeItem("guestCart");

    if (!selectedToken) return;

    try {
      await queueCartRequest(async () => {
        const res = await axios.post(
          `${backend_url}/api/cart/clear`,
          {},
          {
            headers: {
              Authorization: `Bearer ${selectedToken}`,
            },
          }
        );

        if (!res.data.success) {
          throw new Error(
            res.data.message || "Cart clear failed"
          );
        }

        if (currentSession === cartSessionRef.current) {
          setCartItems({});
        }
      });
    } catch (error) {
      console.error("Cart clear error:", error);
      toast.error("Could not clear server cart");

      await getUserCart(selectedToken);
    }
  };

  // ---------------- REVIEWS ----------------

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
      console.error("Review error:", error);
      toast.error("Failed to submit review");
      return null;
    }
  };

  // ---------------- SAVE GUEST CART ----------------

  useEffect(() => {
    if (!token) {
      localStorage.setItem(
        "guestCart",
        JSON.stringify(cartItems)
      );
    }
  }, [cartItems, token]);

  // ---------------- INITIAL LOAD ----------------

  useEffect(() => {
    fetchProducts();

    const savedToken = localStorage.getItem("token");

    if (savedToken) {
      cartSessionRef.current += 1;

      setToken(savedToken);

      axios.defaults.headers.common.Authorization =
        `Bearer ${savedToken}`;

      getUserData(savedToken);
      getUserCart(savedToken);
    }
  }, []);

  // ---------------- PROVIDER ----------------

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
