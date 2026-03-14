export const parseAmount = (amountStr) => {
  if (typeof amountStr !== "string") return 0;
  const cleaned = amountStr.replace(/,/g, "");
  const number = parseFloat(cleaned);

  return isNaN(number) ? 25 : number;
};
