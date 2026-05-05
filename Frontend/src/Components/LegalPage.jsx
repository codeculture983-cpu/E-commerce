import React from "react";

const LegalPage = ({ title, content }) => {
  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        {title}
      </h1>

      <div className="bg-white p-6 rounded-2xl shadow-sm border">
        <p className="text-gray-600 leading-relaxed whitespace-pre-line">
          {content}
        </p>
      </div>

    </div>
  );
};

export default LegalPage;