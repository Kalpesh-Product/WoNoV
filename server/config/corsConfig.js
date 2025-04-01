const allowedOrigins = [
  "http://localhost:3000",
  "https://wono-admin-panel.vercel.app",
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
