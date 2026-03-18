export const normalizeClientName = (name) =>
  name?.toLowerCase().replace(/\s+/g, "");

export const normalizeName = (name) =>
  name?.toLowerCase().replace(/\s+/g, "").trim();

export const normalizeAmount = (amount) =>
  amount ? Number(amount.toString().replace(/,/g, "")) : 0;
