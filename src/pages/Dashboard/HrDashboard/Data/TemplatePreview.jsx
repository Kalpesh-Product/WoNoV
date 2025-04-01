import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import DocxPreview from "../../../../components/HrTemplate/DocxPreview";

const TemplatePreview = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { fileUrl, title } = location.state || {};

  if (!fileUrl) {
    return <div className="text-center mt-10 text-red-500">No document selected</div>;
  }

  return (
    <div className="max-w-5xl mx-auto py-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">{title}</h1>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
        >
          Back
        </button>
      </div>

      <div className="border p-4 bg-white shadow-md">
        <DocxPreview fileUrl={fileUrl} />
      </div>
    </div>
  );
};

export default TemplatePreview;
