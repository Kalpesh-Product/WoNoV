const { v2: cloudinary } = require("cloudinary");
require("dotenv").config();
const { PassThrough } = require("stream"); // Correctly import PassThrough from the stream module

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const handleFileUpload = async (file, path) => {
  try {
    const res = await cloudinary.uploader.upload(file, {
      timeout: 65000,
      transformation: [
        { width: 1200, height: 800, crop: "limit" },
        { quality: "auto" },
        { fetch_format: "auto" },
      ],
      folder: path,
    });
    return res;
  } catch (error) {
    error;
    throw new Error(error.message);
  }
};

const handleFileDelete = async (public_id) => {
  try {
    const res = await cloudinary.uploader.destroy(public_id);
    return res;
  } catch (error) {
    throw new Error(error);
  }
};

const handleDocumentUpload = async (buffer, path, originalFilename) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "raw",
        folder: path,
        public_id: originalFilename,
        use_filename: true,
        unique_filename: false,
        format: undefined,
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary Upload Error:", error);
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    const bufferStream = new PassThrough();
    bufferStream.end(buffer);
    bufferStream.pipe(uploadStream);
  });
};

// Function to delete PDF files
const handleDocumentDelete = async (public_id) => {
  try {
    const res = await cloudinary.uploader.destroy(public_id, {
      resource_type: "raw", // Specify "raw" for non-image files
    });
    return res;
  } catch (error) {
    console.error("Error deleting document:", error);
    throw new Error(error.message);
  }
};

module.exports = {
  handleFileUpload,
  handleFileDelete,
  handleDocumentDelete,
  handleDocumentUpload,
};
