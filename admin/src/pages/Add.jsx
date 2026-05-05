// Add.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { assets } from "../assets/assets.js";
import { backendUrl } from "../App.jsx";
import { toast } from "react-toastify";

const Add = () => {
  // Admin login credentials (you can hardcode or use a login form)
  const ADMIN_EMAIL = "codeculture983@gmail.com";
  const ADMIN_PASSWORD = "admin12345";

  const [token, setToken] = useState("");
  const [image1, setImage1] = useState(null);
  const [image2, setImage2] = useState(null);
  const [image3, setImage3] = useState(null);
  const [image4, setImage4] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [longDescription, setLongDescription] = useState("");
  const [category, setCategory] = useState("Men");
  const [subCategory, setSubCategory] = useState("Topwear");
  const [bestseller, setBestseller] = useState(false);
  const [price, setPrice] = useState("");
  const [sizes, setSizes] = useState([]);

  // Auto-login admin and get token
  useEffect(() => {
    const loginAdmin = async () => {
      try {
        const res = await axios.post(`${backendUrl}/api/user/admin/login`, {
          email: ADMIN_EMAIL,
          password: ADMIN_PASSWORD,
        });
       if (res.data.success) {
  setToken(res.data.token);
  localStorage.setItem("adminToken", res.data.token); // 🔑 SAVE TOKEN
  console.log("Admin logged in, token:", res.data.token);
}else {
          alert("Admin login failed: " + res.data.message);
        }
      } catch (err) {
        console.error("Admin login error:", err.response?.data || err.message);
      }
    };
    loginAdmin();
  }, []);

  // Toggle size selection
  const toggleSize = (size) => {
    setSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  // Submit handler
  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (!token) {
      alert("Admin token not available. Try refreshing the page.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("longDescription", longDescription);
      formData.append("price", price);
      formData.append("category", category);
      formData.append("subCategory", subCategory);
      formData.append("bestseller", bestseller ? "true" : "false");
      formData.append("sizes", JSON.stringify(sizes));

      image1 && formData.append("image1", image1);
      image2 && formData.append("image2", image2);
      image3 && formData.append("image3", image3);
      image4 && formData.append("image4", image4);

      const res = await axios.post(`${backendUrl}/api/product/add`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.data.success) {
        toast("Product added successfully!");
        console.log("Added product:", res.data.product);
        // Reset form
        setName("");
        setDescription("");
        setLongDescription("");
        setPrice("");
        setCategory("Men");
        setSubCategory("Topwear");
        setBestseller(false);
        setSizes([]);
        setImage1(null);
        setImage2(null);
        setImage3(null);
        setImage4(null);
      } else {
        toast.error("Error adding product: " + res.data.message);
      }
    } catch (err) {
      console.error("Error submitting product:", err.response?.data || err.message);
      toast.error(err.response?.data?.message || "Error adding product");
    }
  };

  return (
    <form onSubmit={onSubmitHandler} className="flex flex-col w-full items-start gap-3">
      {/* Image Uploads */}
      <div>
        <p className="mb-2">Upload Images</p>
        <div className="flex gap-2">
          {[image1, image2, image3, image4].map((img, idx) => (
            <label key={idx} htmlFor={`image${idx + 1}`}>
              <img
                className="w-20 h-20 object-cover border"
                src={img ? URL.createObjectURL(img) : assets.upload_area}
                alt=""
              />
              <input
                type="file"
                id={`image${idx + 1}`}
                hidden
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (idx === 0) setImage1(file);
                  else if (idx === 1) setImage2(file);
                  else if (idx === 2) setImage3(file);
                  else if (idx === 3) setImage4(file);
                }}
              />
            </label>
          ))}
        </div>
      </div>

      {/* Name & Description */}
      <div className="w-full">
        <p className="mb-2">Product Name</p>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Product Name"
          className="w-full max-w-[500px] px-3 py-2"
          required
        />
      </div>
      <div className="w-full">
        <p className="mb-2">Product Description</p>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Product Description"
          className="w-full max-w-[500px] px-3 py-2"
          required
        />
      </div>

      {/* Long Description */}
      <div className="w-full">
        <p className="mb-2">Product Details</p>
        <textarea
          value={longDescription}
          onChange={(e) => setLongDescription(e.target.value)}
          placeholder="Product Details"
          className="w-full max-w-[500px] px-3 py-2"
        />
      </div>

      {/* Category, Subcategory, Price */}
      <div className="flex flex-col sm:flex-row gap-2 w-full sm:gap-8">
        <div>
          <p className="mb-2">Category</p>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="px-3 py-2">
            <option value="Men">Men</option>
            <option value="Women">Women</option>
            <option value="Kids">Kids</option>
          </select>
        </div>
        <div>
          <p className="mb-2">Sub Category</p>
          <select value={subCategory} onChange={(e) => setSubCategory(e.target.value)} className="px-3 py-2">
            <option value="Topwear">Topwear</option>
            <option value="Bottomwear">Bottomwear</option>
            <option value="Winterwear">Winterwear</option>
          </select>
        </div>
        <div>
          <p className="mb-2">Price</p>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="20"
            className="px-3 py-2 sm:w-[120px]"
          />
        </div>
      </div>

      {/* Sizes */}
      <div>
        <p className="mb-2">Sizes</p>
        <div className="flex gap-3">
          {["S", "M", "L", "XL", "XXL"].map((size) => (
            <p
              key={size}
              onClick={() => toggleSize(size)}
              className={`${sizes.includes(size) ? "bg-pink-300" : "bg-slate-200"} px-3 py-1 cursor-pointer`}
            >
              {size}
            </p>
          ))}
        </div>
      </div>

      {/* Bestseller */}
      <div className="flex gap-2 mt-2">
        <input type="checkbox" checked={bestseller} onChange={() => setBestseller((prev) => !prev)} id="bestseller" />
        <label htmlFor="bestseller" className="cursor-pointer">
          Add to Best Seller
        </label>
      </div>

      <button type="submit" className="w-28 py-3 bg-black text-white mt-3">
        ADD
      </button>
    </form>
  );
};

export default Add;
