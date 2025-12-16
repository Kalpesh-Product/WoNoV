// corsConfig.js
require("dotenv").config();

const allowedOrigins = [
  "http://localhost:3008",
  "http://localhost:3001",
  "http://localhost:4173",
  "https://wonomasterfe.vercel.app",
  process.env.CORS_FRONTEND_URL,
];

// regex rules for subdomains
const regexAllowedOrigins = [
  /\.wono\.co$/, // any subdomain of wono.co
  /\.localhost:5173$/, // any subdomain of localhost:5173 (vite tenant sites)
];

const corsConfig = {
  origin: function (origin, callback) {
    if (
      !origin || // allow server-to-server or curl
      allowedOrigins.includes(origin) || // exact matches
      regexAllowedOrigins.some((regex) => regex.test(origin)) // regex matches
    ) {
      callback(null, true);
    } else {
      callback(new Error(`Not allowed by CORS: ${origin}`));
    }
  },
  optionsSuccessStatus: 200,
  credentials: true,
};

module.exports = { corsConfig, allowedOrigins };

// require("dotenv").config();

// const allowedOrigins = [
//   "http://localhost:3008",
//   process.env.CORS_FRONTEND_URL,
//   "http://localhost:4173",
// ];

// const corsConfig = {
//   origin: function (origin, callback) {
//     if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
//       callback(null, true);
//     } else {
//       callback(new Error("Not allowed by CORS"));
//     }
//   },
//   optionsSuccessStatus: 200,
//   credentials: true,
// };

// module.exports = { corsConfig, allowedOrigins };
