const multer = require("multer");
const path = require("path");

const MAX_TICKET_FILES = 5;
const MAX_TICKET_FILE_SIZE = 5 * 1024 * 1024;
const allowedExtensions = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".pdf",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
  ".csv",
]);

const ticketUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    files: MAX_TICKET_FILES,
    fileSize: MAX_TICKET_FILE_SIZE,
  },
  fileFilter: (_req, file, callback) => {
    const extension = path.extname(file.originalname || "").toLowerCase();

    if (!allowedExtensions.has(extension)) {
      return callback(
        new multer.MulterError(
          "LIMIT_UNEXPECTED_FILE",
          "Only images, PDF, Word, Excel, and CSV files are allowed",
        ),
      );
    }

    callback(null, true);
  },
});

module.exports = {
  ticketUpload,
  MAX_TICKET_FILES,
  MAX_TICKET_FILE_SIZE,
};
