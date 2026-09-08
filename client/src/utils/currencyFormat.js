export const inrFormat = (money) => {
  const value = Number(money).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  });
  
  return value;
};

export const inrFormatExact = (money) =>
  Number(money || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  });
