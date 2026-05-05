/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useContext, useEffect } from "react";
import { ShopContext } from "../Context/ShopContext";
import { assets } from "../assets/assets";
import Title from "../Components/Title";
import ProductItem from "../Components/ProductItem";

const Collection = () => {
  const {
    products,
    search,
    showSearch,
  } = useContext(ShopContext);

  const [showFilter, setShowFilter] = useState(false);
  const [filterProducts, setFilterProducts] = useState([]);
  const [category, setCategory] = useState([]);
  const [subCategory, setSubCategory] = useState([]);
  const [sortType, setSortType] = useState("relevant");

  /* =========================
     TOGGLE CATEGORY
  ========================= */
  const toggleCategory = (e) => {
    const value = e.target.value;

    setCategory((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value]
    );
  };

  /* =========================
     TOGGLE SUBCATEGORY
  ========================= */
  const toggleSubCategory = (e) => {
    const value = e.target.value;

    setSubCategory((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value]
    );
  };

  /* =========================
     APPLY FILTER
  ========================= */
  const applyFilter = () => {
    let productsCopy = [...products];

    if (showSearch && search) {
      productsCopy = productsCopy.filter((item) =>
        item.name
          ?.toLowerCase()
          .includes(search.toLowerCase())
      );
    }

    if (category.length > 0) {
      productsCopy = productsCopy.filter((item) =>
        category.includes(item.category)
      );
    }

    if (subCategory.length > 0) {
      productsCopy = productsCopy.filter((item) =>
        subCategory.includes(item.subCategory)
      );
    }

    setFilterProducts(productsCopy);
  };

  /* =========================
     SORT PRODUCTS
  ========================= */
  const sortProduct = () => {
    let fpCopy = [...filterProducts];

    switch (sortType) {
      case "low-high":
        fpCopy.sort(
          (a, b) => Number(a.price || 0) - Number(b.price || 0)
        );
        break;

      case "high-low":
        fpCopy.sort(
          (a, b) => Number(b.price || 0) - Number(a.price || 0)
        );
        break;

      default:
        applyFilter();
        return;
    }

    setFilterProducts(fpCopy);
  };

  /* =========================
     EFFECTS
  ========================= */
  useEffect(() => {
    setFilterProducts(products);
  }, [products]);

  useEffect(() => {
    applyFilter();
  }, [
    category,
    subCategory,
    products,
    search,
    showSearch,
  ]);

  useEffect(() => {
    sortProduct();
  }, [sortType]);

  return (
    <div className="flex flex-col sm:flex-row gap-4 pt-10 border-t">
      {/* ================= FILTERS ================= */}
      <div className="min-w-[240px]">
        <p
          onClick={() => setShowFilter(!showFilter)}
          className="my-2 text-xl flex items-center cursor-pointer gap-2"
        >
          FILTERS

          <img
            src={assets.dropdown_icon}
            className={`h-3 sm:hidden ${
              showFilter ? "rotate-90" : ""
            }`}
            alt=""
          />
        </p>

        {/* CATEGORY */}
        <div
          className={`border pl-5 py-3 mt-6 ${
            showFilter ? "" : "hidden"
          } sm:block`}
        >
          <p className="mb-3 font-medium text-sm">
            CATEGORIES
          </p>

          {["Men", "Women", "Kids"].map((cat) => (
            <label
              key={cat}
              className="flex gap-2 items-center"
            >
              <input
                type="checkbox"
                value={cat}
                onChange={toggleCategory}
              />
              {cat}
            </label>
          ))}
        </div>

        {/* TYPE */}
        <div
          className={`border pl-5 py-3 my-5 ${
            showFilter ? "" : "hidden"
          } sm:block`}
        >
          <p className="mb-3 font-medium text-sm">
            TYPE
          </p>

          {[
            "Topwear",
            "Bottomwear",
            "Winterwear",
          ].map((sub) => (
            <label
              key={sub}
              className="flex gap-2 items-center"
            >
              <input
                type="checkbox"
                value={sub}
                onChange={toggleSubCategory}
              />
              {sub}
            </label>
          ))}
        </div>
      </div>

      {/* ================= PRODUCTS ================= */}
      <div className="flex-1">
        <div className="flex justify-between mb-4 text-base sm:text-2xl">
          <Title text1="ALL" text2="COLLECTIONS" />

          <select
            value={sortType}
            onChange={(e) =>
              setSortType(e.target.value)
            }
            className="border px-2 text-sm"
          >
            <option value="relevant">
              Sort by: Relevant
            </option>
            <option value="low-high">
              Sort by: Low to High
            </option>
            <option value="high-low">
              Sort by: High to Low
            </option>
          </select>
        </div>

        {/* PRODUCT GRID */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filterProducts.length > 0 ? (
            filterProducts.map((item) => {
              const id =
                item._id?.$oid || item._id;

              const imageUrl =
                item.images?.[0] ||
                item.image?.[0] ||
                "/placeholder.png";

              const price = Number(item.price || 0);

              return (
                <div key={id}>
                  <ProductItem
                    id={id}
                    name={item.name}
                    image={imageUrl}
                    price={price}
                  />
                </div>
              );
            })
          ) : (
            <p className="col-span-full text-center text-gray-500">
              No products found.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Collection;