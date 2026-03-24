const {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");
require("dotenv").config();
const sharp = require("sharp");
const path = require("path");

// ---------------------------------------------------------------------------
// S3 Client
// ---------------------------------------------------------------------------
const s3 = new S3Client({
  region: process.env.PROJECT_AWS_REGION,
  credentials: {
    accessKeyId: process.env.PROJECT_AWS_ACCESS_KEY,
    secretAccessKey: process.env.PROJECT_AWS_SECRET_KEY,
  },
});

const BUCKET = process.env.PROJECT_S3_BUCKET_NAME;
const REGION = process.env.PROJECT_AWS_REGION;

/**
 * Build a public-accessible S3 URL for a given key.
 */
const buildUrl = (key) =>
  `https://${BUCKET}.s3.${REGION}.amazonaws.com/${key}`;

/**
 * Generate a unique S3 object key.
 * Mirrors Cloudinary's folder + public_id pattern.
 * @param {string} folder  - e.g. "company/logos"
 * @param {string} filename - original filename (optional)
 */
const buildKey = (folder, filename) => {
  const uid = require("crypto").randomUUID();
  const ext = filename ? path.extname(filename) : "";
  const base = filename
    ? path.basename(filename, ext).replace(/\s+/g, "_")
    : uid;
  return `wono/${folder.replace(/^\/|\/$/g, "")}/${base}_${uid}${ext}`;
};

// ---------------------------------------------------------------------------
// handleFileUpload — replacement for Cloudinary image upload
// Accepts a file path (string/base64 data URI) OR a Buffer.
// Returns { secure_url, public_id } to match Cloudinary shape.
// ---------------------------------------------------------------------------
const handleFileUpload = async (file, folder) => {
  try {
    let buffer;
    let originalName = "image";

    if (Buffer.isBuffer(file)) {
      buffer = file;
    } else if (typeof file === "string" && file.startsWith("data:")) {
      // base64 data URI
      const base64Data = file.replace(/^data:[^;]+;base64,/, "");
      buffer = Buffer.from(base64Data, "base64");
    } else if (typeof file === "string") {
      // file path on disk — read it
      const fs = require("fs");
      buffer = fs.readFileSync(file);
      originalName = path.basename(file);
    } else {
      throw new Error("handleFileUpload: unsupported file type");
    }

    // Convert to WebP with quality 80 (mirrors reference project)
    const webpBuffer = await sharp(buffer)
      .resize({ width: 1200, height: 800, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();

    const key = buildKey(folder, originalName.replace(/\.[^.]+$/, ".webp"));

    await s3.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: webpBuffer,
        ContentType: "image/webp",
        ACL: "public-read",
      })
    );

    return {
      secure_url: buildUrl(key),
      public_id: key, // use S3 key as the public_id for deletion
      url: buildUrl(key),
    };
  } catch (error) {
    throw new Error(`handleFileUpload S3 error: ${error.message}`);
  }
};

// ---------------------------------------------------------------------------
// handleFileDelete — replacement for Cloudinary image delete
// public_id is now the S3 object key.
// ---------------------------------------------------------------------------
const handleFileDelete = async (public_id) => {
  try {
    await s3.send(
      new DeleteObjectCommand({
        Bucket: BUCKET,
        Key: public_id,
      })
    );
    // Return Cloudinary-compatible shape so existing checks like `res.result !== 'ok'` still work
    return { result: "ok" };
  } catch (error) {
    throw new Error(`handleFileDelete S3 error: ${error.message}`);
  }
};

// ---------------------------------------------------------------------------
// handleDocumentUpload — replacement for Cloudinary raw/document upload
// Accepts a Buffer (PDF etc.), folder path, and original filename.
// Returns { secure_url, public_id } to match Cloudinary shape.
// ---------------------------------------------------------------------------
const handleDocumentUpload = async (buffer, folder, originalFilename) => {
  try {
    const ext = path.extname(originalFilename || "file.pdf");
    const key = buildKey(folder, originalFilename);

    // Detect content type
    const contentTypeMap = {
      ".pdf": "application/pdf",
      ".doc": "application/msword",
      ".docx":
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ".xls": "application/vnd.ms-excel",
      ".xlsx":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
    };
    const contentType =
      contentTypeMap[ext.toLowerCase()] || "application/octet-stream";

    await s3.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: buffer,
        ContentType: contentType,
        ACL: "public-read",
      })
    );

    return {
      secure_url: buildUrl(key),
      public_id: key, // S3 key used for deletion
      url: buildUrl(key),
    };
  } catch (error) {
    throw new Error(`handleDocumentUpload S3 error: ${error.message}`);
  }
};

// ---------------------------------------------------------------------------
// handleDocumentDelete — replacement for Cloudinary raw file delete
// ---------------------------------------------------------------------------
const handleDocumentDelete = async (public_id) => {
  try {
    await s3.send(
      new DeleteObjectCommand({
        Bucket: BUCKET,
        Key: public_id,
      })
    );
    // Return Cloudinary-compatible shape
    return { result: "ok" };
  } catch (error) {
    throw new Error(`handleDocumentDelete S3 error: ${error.message}`);
  }
};

module.exports = {
  handleFileUpload,
  handleFileDelete,
  handleDocumentUpload,
  handleDocumentDelete,
};
