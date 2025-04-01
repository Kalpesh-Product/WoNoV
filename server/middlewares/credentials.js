const { allowedOrigins } = require("../config/corsConfig");

const credentials = (req, res, next) => {
  const { origin } = req.headers;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Controll-Allow-Credentials", true);
  }
  next();
};

module.exports = credentials;
