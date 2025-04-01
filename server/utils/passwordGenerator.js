const generatePassword = (
  length = 12,
  options = { upper: true, lower: true, number: true, symbol: true }
) => {
  const upperChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowerChars = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const symbols = "!@#$%^&*()_+[]{}|;:',.<>?/~`";

  let allChars = "";
  if (options.upper) allChars += upperChars;
  if (options.lower) allChars += lowerChars;
  if (options.number) allChars += numbers;
  if (options.symbol) allChars += symbols;

  if (allChars === "") return "Select at least one character type.";

  let password = "";
  for (let i = 0; i < length; i++) {
    password += allChars.charAt(Math.floor(Math.random() * allChars.length));
  }

  return password;
};

// Usage example:
// (
//   generatePassword(16, { upper: true, lower: true, number: true, symbol: true })
// );

module.exports = generatePassword;
