export const inrFormat = (money) => {
  const value = Number(money).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  });
  
  return value;
};
