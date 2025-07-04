// No only whitespace
export const noOnlyWhitespace = (value) =>
  value.trim().length > 0 || "Field cannot be only whitespace";

// Alphanumeric with space, underscore, hyphen
export const isAlphanumeric = (value) =>
  /^[a-zA-Z0-9 _-]+$/.test(value) ||
  "Only alphanumeric characters, spaces, underscores, and hyphens are allowed.";

// Valid email
export const isValidEmail = (value) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || "Enter a valid email address.";

// Valid 10-digit phone number (India, no start digit check)
export const isValidPhoneNumber = (value) =>
  /^\d{10}$/.test(value) || "Enter a valid 10-digit phone number.";
// Valid 6-digit Indian pincode (does not start with 0)
export const isValidPinCode = (value) =>
  /^[1-9][0-9]{5}$/.test(value) || "Enter a valid 6-digit pin code.";

