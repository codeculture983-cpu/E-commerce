import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import Title from "../Components/Title";
const backendUrl = "http://localhost:4000";

const defaultContent = {
  privacy: "We value your privacy...",
  terms: "Terms and conditions...",
  refund: "Refund policy...",
  shipping: "Shipping policy...",
};

const PolicyPage = ({ type }) => {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchPolicy = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        `${backendUrl}/api/cms/policy/${type}`
      );

      if (res.data.success && res.data.policy) {
        setContent(res.data.policy.content);
        setLastUpdated(res.data.policy.updatedAt);
      } else {
        setContent(defaultContent[type]);
      }
    } catch {
      toast.error("Failed to load policy");
      setContent(defaultContent[type]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicy();
  }, [type]);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Title text1={"POLICY"} text2={"PAGE"}/>
      {/* HEADER */}
      <div className="flex justify-between border-b pb-3 mb-6">
        

        {lastUpdated && (
          <p className="text-sm text-gray-500">
            Updated: {new Date(lastUpdated).toLocaleDateString()}
          </p>
        )}
      </div>

      {/* CONTENT */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div
          className="
            prose prose-lg max-w-none
            prose-h2:text-2xl prose-h2:font-bold prose-h2:text-gray-800
            prose-h3:text-lg prose-h3:font-semibold
            prose-p:text-gray-600
            prose-li:text-gray-600
            prose-ul:pl-5
            prose-strong:text-black
          "
          dangerouslySetInnerHTML={{ __html: content }}
        />
      )}

    </div>
  );
};

export default PolicyPage;