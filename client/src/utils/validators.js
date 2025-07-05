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

// Valid GSTIN (15 characters, alphanumeric, India)
export const isValidGSTIN = (value) =>
  /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(value) ||
  "Enter a valid GSTIN. Example: 27AAPFU0939F1ZV";

// Valid IFSC Code (Indian bank code: 4 letters + 0 + 6 digits)
export const isValidIFSC = (value) =>
  /^[A-Z]{4}0[A-Z0-9]{6}$/.test(value) ||
  "Enter a valid IFSC code. Example: SBIN0005943";

// Valid Bank Account Number (typically 9 to 18 digits)
export const isValidBankAccount = (value) =>
  /^\d{9,18}$/.test(value) ||
  "Enter a valid bank account number (9–18 digits). Example: 123456789012";
