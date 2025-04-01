import { useState } from "react";

const CompanyLogo = () => {
  const [fileName, setFileName] = useState("");

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFileName(file.name);
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

          <label
            htmlFor="fileUpload"
            className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 p-6 rounded-md cursor-pointer transition"
          >
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
            <input
              id="fileUpload"
              type="file"
              accept=".png, .jpg, .jpeg"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>

          {fileName && (
            <span className="text-center text-content text-gray-600 mt-4">
              Selected File: <strong>{fileName}</strong>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyLogo;
