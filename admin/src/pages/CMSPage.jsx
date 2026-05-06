import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Editor } from "@tinymce/tinymce-react";

const backendUrl = "https://forver-backend.onrender.com";
const API = `${backendUrl}/api/cms`;

const CMSPage = () => {
  const [tab, setTab] = useState("policies");

  const [reviews, setReviews] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");

  const [policies, setPolicies] = useState([]);
  const [type, setType] = useState("terms");
  const [content, setContent] = useState("");

  const [activePolicy, setActivePolicy] = useState(null);

  const token = localStorage.getItem("adminToken");

  const config = {
    headers: { Authorization: `Bearer ${token}` },
  };

  const prevReviewsRef = useRef([]);

  // ================= FETCH =================
  useEffect(() => {
    fetchPolicies();
    fetchReviews();
  }, [statusFilter]);

  // ================= REVIEWS =================
  const fetchReviews = async () => {
    try {
      const url =
        statusFilter === "all"
          ? `${API}/reviews/all`
          : `${API}/reviews/all?status=${statusFilter}`;

      const res = await axios.get(url, config);
      const newReviews = res.data.reviews || [];

      const prevIds = prevReviewsRef.current.map((r) => r._id);
      const newOnes = newReviews.filter((r) => !prevIds.includes(r._id));

      if (prevReviewsRef.current.length > 0 && newOnes.length > 0) {
        toast.info(`🆕 ${newOnes.length} new review(s) received`);
      }

      prevReviewsRef.current = newReviews;
      setReviews(newReviews);
    } catch (err) {
      console.log(err);
      toast.error("Failed to load reviews");
    }
  };

  const updateReview = async (id, status) => {
    try {
      await axios.patch(
        `${API}/reviews/status`,
        { reviewId: id, status },
        config
      );

      toast.success("Review updated");
      fetchReviews();
    } catch {
      toast.error("Update failed");
    }
  };

  // ================= POLICIES =================
  const fetchPolicies = async () => {
    try {
      const res = await axios.get(`${API}/texts`, config);
      setPolicies(res.data.policies || []);
    } catch {
      toast.error("Failed to load policies");
    }
  };

  const savePolicy = async () => {
    if (!content || content === "<p><br></p>") {
      return toast.error("Policy cannot be empty");
    }

    try {
      const exist = policies.find((p) => p.type === type);

      if (exist) {
        await axios.patch(
          `${API}/update`,
          { policyId: exist._id, content },
          config
        );
        toast.success("Policy updated");
      } else {
        await axios.post(`${API}/add`, { type, content }, config);
        toast.success("Policy created");
      }

      setContent("");
      fetchPolicies();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Error");
    }
  };

  const sortedReviews = [...reviews].sort((a, b) => {
    if (a.status === "pending" && b.status !== "pending") return -1;
    if (a.status !== "pending" && b.status === "pending") return 1;
    return 0;
  });

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">

      <h1 className="text-2xl font-bold mb-4">
        CMS Enterprise Dashboard
      </h1>

      <div className="flex gap-3 mb-6">
        <button
          onClick={() => setTab("policies")}
          className={`px-4 py-2 rounded ${
            tab === "policies" ? "bg-black text-white" : "bg-white"
          }`}
        >
          Policies
        </button>

        <button
          onClick={() => setTab("reviews")}
          className={`px-4 py-2 rounded ${
            tab === "reviews" ? "bg-black text-white" : "bg-white"
          }`}
        >
          Reviews
        </button>
      </div>

      {/* POLICIES */}
      {tab === "policies" && (
        <div className="space-y-6">

          <div className="bg-white p-4 rounded shadow">
            <h2 className="font-bold mb-3">Policies Editor</h2>

            <select
              className="border p-2 mb-3"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="terms">Terms</option>
              <option value="privacy">Privacy</option>
              <option value="refund">Refund</option>
              <option value="shipping">Shipping</option>
            </select>

            <Editor
              apiKey="n4yp1rgiowdjauxn73pz20wi2ho50hax73t0p4osbqcinms8"
              value={content}
              onEditorChange={setContent}
              init={{
                height: 300,
                menubar: false,
                plugins: "lists link code",
                toolbar: "bold italic | bullist numlist | link | code",
              }}
            />

            <button
              onClick={savePolicy}
              className="mt-3 bg-black text-white px-4 py-2 rounded"
            >
              Save Policy
            </button>
          </div>

          <div className="bg-white p-4 rounded shadow">
            <h2 className="font-bold mb-3">Existing Policies</h2>

            {policies.map((p) => (
              <div key={p._id} className="border p-3 mb-3 rounded">
                <div className="flex justify-between">
                  <h3 className="font-bold capitalize">{p.type}</h3>

                  <button
                    onClick={() => setActivePolicy(p)}
                    className="text-blue-600 text-sm"
                  >
                    See More
                  </button>
                </div>
              </div>
            ))}
          </div>

          {activePolicy && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
              <div className="bg-white max-w-3xl w-full p-5 rounded">
                <h2 className="font-bold text-xl mb-3 capitalize">
                  {activePolicy.type}
                </h2>

                <div
                  className="prose max-h-[60vh] overflow-auto border p-3"
                  dangerouslySetInnerHTML={{ __html: activePolicy.content }}
                />

                <button
                  onClick={() => setActivePolicy(null)}
                  className="mt-4 bg-red-600 text-white px-4 py-2 rounded"
                >
                  Close
                </button>
              </div>
            </div>
          )}

        </div>
      )}

      {/* REVIEWS */}
      {tab === "reviews" && (
        <div className="bg-white p-4 rounded shadow">

          <h2 className="font-bold mb-3">Reviews Management</h2>

          <div className="flex gap-2 mb-4 flex-wrap">
            {["all", "pending", "approved", "rejected"].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1 border rounded ${
                  statusFilter === s ? "bg-black text-white" : ""
                }`}
              >
                {s.toUpperCase()}
              </button>
            ))}
          </div>

          {sortedReviews.map((r) => (
            <div key={r._id} className="border p-3 mb-3 rounded">

              <p><b>Product:</b> {r.product?.name}</p>
              <p><b>User:</b> {r.userName}</p>
              <p><b>Rating:</b> ⭐ {r.rating}</p>
              <p><b>Comment:</b> {r.comment}</p>

              <p className="mt-2 font-bold">{r.status}</p>

              {r.status === "pending" && (
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => updateReview(r._id, "approved")}
                    className="bg-green-600 text-white px-3 py-1 rounded"
                  >
                    Approve
                  </button>

                  <button
                    onClick={() => updateReview(r._id, "rejected")}
                    className="bg-red-600 text-white px-3 py-1 rounded"
                  >
                    Reject
                  </button>
                </div>
              )}

            </div>
          ))}

        </div>
      )}

    </div>
  );
};

export default CMSPage;
