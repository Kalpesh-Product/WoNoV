// utils/validators.js

// No only whitespace
export const noOnlyWhitespace = (value) =>
  value.trim().length > 0 || "Field cannot be only whitespace";

// Alphanumeric with space, underscore, hyphen
export const isAlphanumeric = (value) =>
  /^[a-zA-Z0-9 _-]+$/.test(value) ||
  "Only alphanumeric characters, spaces, underscores, and hyphens are allowed.";
