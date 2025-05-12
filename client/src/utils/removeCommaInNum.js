// utils/parseRevenue.js
export const parseRevenue = (revenue) => {
    return parseFloat(revenue.replace(/,/g, ""));
  };
  