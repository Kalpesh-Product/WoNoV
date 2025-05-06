export const inrFormat = (money) => {
    return Number(money).toLocaleString("en-IN", {
      maximumFractionDigits: 0,
    });
  };
  