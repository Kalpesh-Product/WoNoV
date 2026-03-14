const parseAmount = (amountStr) => {
  if (typeof amountStr !== "string") return 0;

  const cleaned = amountStr.replace(/,/g, "");
  const number = parseFloat(cleaned);

  return Number.isNaN(number) ? 0 : number;
};

module.exports = { parseAmount };
