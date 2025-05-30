require("dotenv").config();

const allowedOrigins = [
  "http://localhost:3000",
  process.env.CORS_FRONTEND_URL,
  "http://localhost:4173",
];

const corsConfig = {
  origin: function (origin, callback) {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  optionsSuccessStatus: 200,
  credentials: true,
};

module.exports = { corsConfig, allowedOrigins };
