/* eslint-disable react-hooks/set-state-in-effect */
import React, { useEffect, useState } from "react";
import axios from "axios";

const backendUrl = "https://forver-backend.onrender.com";

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);

  const fetchReviews = async () => {
    const res = await axios.get(`${backendUrl}/api/products/reviews`);
    setReviews(res.data);
  };

  const handleAction = async (productId, reviewId, approve) => {
    await axios.put(
      `${backendUrl}/api/products/review/${productId}/${reviewId}`,
      { approve }
    );
    fetchReviews();
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Review Moderation</h2>

      {reviews.map(r => (
        <div key={r._id} className="border p-4 mb-3 rounded">
          <p><b>{r.productName}</b></p>
          <p>{r.user}</p>
          <p>{r.comment}</p>
          <p>⭐ {r.rating}</p>

          {!r.approved && (
            <button
              onClick={() => handleAction(r.productId, r._id, true)}
              className="bg-green-500 text-white px-3 py-1 mr-2"
            >
              Approve
            </button>
          )}

          <button
            onClick={() => handleAction(r.productId, r._id, false)}
            className="bg-red-500 text-white px-3 py-1"
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
};

export default AdminReviews;
