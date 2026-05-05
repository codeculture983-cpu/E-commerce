/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ShopContext } from "../Context/ShopContext";
import RelatedProduct from "../Components/RelatedProduct.jsx";
import { assets } from "../assets/assets";
import { toast } from "react-toastify";

const Product = () => {
  const { productId } = useParams();

  const {
    products,
    addToCart,
    submitReview,
    currency,
    user,
    backend_url,
  } = useContext(ShopContext);

  const [productData, setProductData] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [image, setImage] = useState("");
  const [size, setSize] = useState("");
  const [activeTab, setActiveTab] = useState("description");
  const [reviewComment, setReviewComment] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);

  /* ================= LOAD PRODUCT ================= */
  useEffect(() => {
    if (!products) return;

    const product = products.find((p) => p._id === productId);

    if (product) {
      setProductData(product);
      setImage(product.images?.[0] || "/placeholder.png");
      setSize(product.sizes?.[0] || "");
    }
  }, [products, productId]);

  /* ================= FETCH REVIEWS ================= */
  const fetchReviews = async () => {
    try {
      const res = await fetch(
        `${backend_url}/api/reviews/${productId}`
      );

      const data = await res.json();

      setReviews(data.success ? data.reviews || [] : []);
    } catch (err) {
      console.error(err);
      setReviews([]);
    }
  };

  useEffect(() => {
    fetchReviews();

    const interval = setInterval(fetchReviews, 10000);
    return () => clearInterval(interval);
  }, [productId]);

  /* ================= REVIEW STATS ================= */
  const getReviewStats = (reviews = []) => {
    const total = reviews.length;

    const avg =
      total > 0
        ? (
            reviews.reduce((sum, r) => sum + r.rating, 0) / total
          ).toFixed(1)
        : 0;

    return { total, avg };
  };

  /* ================= CHECK USER REVIEW ================= */
  const hasUserReviewed = () => {
    if (!user) return false;

    return reviews.some(
      (r) => r.user === user._id || r.user?._id === user._id
    );
  };

  /* ================= SUBMIT REVIEW ================= */
  const handleAddReview = async () => {
    if (!user) return toast.error("Login required");

    if (!reviewComment.trim()) {
      return toast.error("Comment required");
    }

    if (hasUserReviewed()) {
      return toast.error("Already reviewed");
    }

    setSubmittingReview(true);

    const newReview = {
      rating: reviewRating,
      comment: reviewComment,
    };

    const review = await submitReview(productId, newReview);

    if (review) {
      toast.success("Review submitted for approval 🎉");
      setReviewComment("");
      setReviewRating(5);
      await fetchReviews();
    }

    setSubmittingReview(false);
  };

  if (!productData) {
    return (
      <div className="pt-10 text-center text-sm sm:text-base">
        Loading...
      </div>
    );
  }

  const { total, avg } = getReviewStats(reviews);

  return (
    <div className="border-t-2 pt-6 sm:pt-10 px-3 sm:px-0">

      {/* ================= PRODUCT SECTION ================= */}
      <div className="flex flex-col sm:flex-row gap-6 sm:gap-12">

        {/* IMAGES */}
        <div className="flex flex-1 flex-col-reverse sm:flex-row gap-3">

          <div className="flex sm:flex-col gap-2 sm:w-[18%] overflow-auto">
            {(productData.images || ["/placeholder.png"]).map(
              (img, i) => (
                <img
                  key={i}
                  src={img}
                  alt=""
                  onClick={() => setImage(img)}
                  className={`w-[60px] sm:w-full cursor-pointer border rounded ${
                    image === img ? "border-black" : ""
                  }`}
                />
              )
            )}
          </div>

          <img
            src={image}
            alt={productData.name}
            className="w-full sm:w-[80%] object-cover rounded"
          />
        </div>

        {/* INFO */}
        <div className="flex-1">

          <h1 className="text-xl sm:text-2xl font-medium">
            {productData.name}
          </h1>

          <div className="flex gap-2 mt-2 text-sm sm:text-base">
            <p className="text-yellow-500">⭐ {avg}</p>
            <p className="text-gray-500">({total} Reviews)</p>
          </div>

          {/* ================= DISCOUNT PRICE UI ================= */}
          <div className="mt-4">

            {productData.discountPrice &&
            Number(productData.discountPrice) > 0 ? (
              <div className="flex items-center gap-3 flex-wrap">

                {/* Original Price */}
                <p className="text-lg sm:text-xl text-gray-400 line-through">
                  {currency}
                  {productData.price}
                </p>

                {/* Discount Price */}
                <p className="text-2xl sm:text-3xl font-bold text-green-600">
                  {currency}
                  {productData.discountPrice}
                </p>

                {/* Save Badge */}
                <span className="bg-red-100 text-red-600 px-3 py-1 rounded text-sm font-semibold">
                  Save {currency}
                  {Number(productData.price) -
                    Number(productData.discountPrice)}
                </span>

              </div>
            ) : (
              <p className="text-2xl sm:text-3xl">
                {currency}
                {productData.price}
              </p>
            )}

          </div>

          <p className="text-gray-500 mt-4 text-sm sm:text-base">
            {productData.description}
          </p>

          {/* SIZE */}
          <div className="my-6">
            <p className="font-medium text-sm sm:text-base">
              Select Size
            </p>

            <div className="flex flex-wrap gap-2 mt-2">
              {(productData.sizes || []).map((s, i) => (
                <button
                  key={i}
                  onClick={() => setSize(s)}
                  className={`border px-3 py-1 text-sm sm:text-base rounded ${
                    size === s
                      ? "border-orange-500"
                      : "bg-gray-100"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => addToCart(productData._id, size)}
            className="bg-black text-white px-6 py-3 mt-2 w-full sm:w-auto rounded"
          >
            ADD TO CART
          </button>

        </div>
      </div>

      {/* ================= TABS ================= */}
      <div className="mt-10 sm:mt-20">

        <div className="flex border-b overflow-x-auto">

          <button
            onClick={() => setActiveTab("description")}
            className={`px-4 sm:px-6 py-3 text-sm font-medium whitespace-nowrap ${
              activeTab === "description"
                ? "border-b-2 border-black text-black"
                : "text-gray-500"
            }`}
          >
            Description
          </button>

          <button
            onClick={() => setActiveTab("reviews")}
            className={`px-4 sm:px-6 py-3 text-sm font-medium whitespace-nowrap ${
              activeTab === "reviews"
                ? "border-b-2 border-black text-black"
                : "text-gray-500"
            }`}
          >
            Reviews ({total})
          </button>

        </div>

        <div className="border border-t-0 p-4 sm:p-6 bg-white">

          {/* DESCRIPTION */}
          {activeTab === "description" && (
            <p className="text-gray-600 whitespace-pre-line text-sm sm:text-base">
              {productData.longDescription ||
                productData.description}
            </p>
          )}

          {/* REVIEWS */}
          {activeTab === "reviews" && (
            <>
              {/* FORM */}
              <div className="mb-6 p-4 border rounded bg-gray-50">

                <h3 className="font-semibold mb-2 text-sm sm:text-base">
                  Write a Review
                </h3>

                {!user && (
                  <p className="text-red-500 text-sm mb-2">
                    Login required
                  </p>
                )}

                {hasUserReviewed() && (
                  <p className="text-green-600 text-sm mb-2">
                    Already reviewed ✔
                  </p>
                )}

                <select
                  value={reviewRating}
                  onChange={(e) =>
                    setReviewRating(Number(e.target.value))
                  }
                  className="border p-2 w-full mb-2 text-sm"
                >
                  {[5, 4, 3, 2, 1].map((n) => (
                    <option key={n} value={n}>
                      {"★".repeat(n) + "☆".repeat(5 - n)}
                    </option>
                  ))}
                </select>

                <textarea
                  value={reviewComment}
                  onChange={(e) =>
                    setReviewComment(e.target.value)
                  }
                  placeholder="Your review"
                  className="border p-2 w-full mb-2 text-sm"
                />

                <button
                  onClick={handleAddReview}
                  disabled={!user || submittingReview}
                  className={`px-4 py-2 text-white w-full sm:w-auto ${
                    !user || submittingReview
                      ? "bg-gray-400"
                      : "bg-black hover:bg-gray-800"
                  }`}
                >
                  {submittingReview
                    ? "Submitting..."
                    : "Submit Review"}
                </button>

              </div>

              {/* REVIEW LIST */}
              {reviews.map((r, i) => (
                <div
                  key={i}
                  className="border-b pb-3 mb-3 text-sm sm:text-base"
                >

                  <div className="flex items-center gap-2">
                    <img
                      src={assets.profile_icon}
                      alt=""
                      className="w-7 sm:w-8"
                    />
                    <p className="font-medium">
                      {r.userName || r.user}
                    </p>
                  </div>

                  <p className="text-yellow-500">
                    {"★".repeat(r.rating) +
                      "☆".repeat(5 - r.rating)}
                  </p>

                  <p className="text-gray-700">
                    {r.comment}
                  </p>

                </div>
              ))}
            </>
          )}

        </div>
      </div>

      <RelatedProduct
        category={productData.category}
        subCategory={productData.subCategory}
      />
    </div>
  );
};

export default Product;