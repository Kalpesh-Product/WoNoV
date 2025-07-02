export const inrFormat = (money) => {
  const value = Number(money).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  });
  if (isNaN(value)) {
    return 0;
  }
  return value;
};
