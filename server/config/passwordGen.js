// passwordGen.js
const bcrypt = require("bcryptjs");

const saltRounds = 10;

async function hashPassword(password) {
  return bcrypt.hash(password, saltRounds);
}

module.exports = {
  hashPassword,
};
