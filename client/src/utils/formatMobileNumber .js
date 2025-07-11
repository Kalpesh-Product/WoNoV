export const formatMobileNumber = (input) => {
  if (!input) return "";

  // Ensure it's a string and remove any spaces, dashes, or parentheses
  const cleaned = String(input).replace(/[\s\-()]/g, "");

  // If it has 12 digits and starts with 91, format to +91
  if (/^91\d{10}$/.test(cleaned)) {
    return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 7)} ${cleaned.slice(7)}`;
  }

  // If it's already 10 digits (assume Indian local mobile), format nicely
  if (/^\d{10}$/.test(cleaned)) {
    return `${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  }

  // Return original if it doesn't match expected patterns
  return input;
};
