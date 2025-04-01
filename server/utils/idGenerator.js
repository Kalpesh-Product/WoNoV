const { randomInt } = require("crypto");

const idGenerator = (base) => {
  const timestamp = Date.now().toString(36); // Base-36 timestamp for compactness
  const randomPart = randomInt(0, 99999).toString().padStart(5, "0");
  return `${base}-${timestamp}-${randomPart}`;
};

module.exports = idGenerator;
