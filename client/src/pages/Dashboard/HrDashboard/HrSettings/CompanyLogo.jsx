import React, { useState } from "react";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";

const CompanyLogo = () => {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const axios = useAxiosPrivate()

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile)); // Generate preview URL
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file before uploading.");
      return;
    }

    setUploading(true);

    const formData = new FormData();
    formData.append("logo", file);

    try {
      const response = await axios.post("/api/company/add-company-logo", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert(response.data.message || "Image uploaded successfully!");
    } catch (error) {
      console.error("Upload Error:", error);
      alert("Failed to upload image.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex justify-center items-center">
      <div className="flex justify-center rounded-md w-[50%] items-center h-[60vh] bg-gray-200">
        <div className="bg-gray-200 p-8 rounded-lg shadow-md w-[400px]">
          <div className="flex flex-col gap-2">
            <span className="text-subtitle font-bold text-gray-700 text-center mb-2">
              Upload Your Company Logo
            </span>
            <span className="text-content text-gray-500 text-center mb-4">
              PNG, JPG & JPEG files are allowed
            </span>
          </div>

          {/* File Input & Preview */}
          <label
            htmlFor="fileUpload"
            className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 p-6 rounded-md cursor-pointer transition"
          >
            {previewUrl ? (
              <img src={previewUrl} alt="Company Logo Preview" className="w-32 h-32 object-cover rounded-md" />
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 text-gray-400 mb-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12l-4.5 4.5m0 0L7.5 12m4.5 4.5V3"
                  />
                </svg>
                <span className="text-content text-gray-500">
                  Drag and drop or browse to choose a file
                </span>
              </>
            )}
            <input
              id="fileUpload"
              type="file"
              accept=".png, .jpg, .jpeg"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>

          {/* Buttons: Change File & Upload */}
          {previewUrl && (
            <div className="mt-4 flex flex-col items-center gap-2">
              <button
                onClick={handleUpload}
                disabled={uploading}
                className={`px-4 py-2 rounded-md text-white ${
                  uploading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {uploading ? "Uploading..." : "Upload Image"}
              </button>
              <label
                htmlFor="fileUpload"
                className="text-blue-600 cursor-pointer underline"
              >
                Change Image
              </label>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyLogo;
