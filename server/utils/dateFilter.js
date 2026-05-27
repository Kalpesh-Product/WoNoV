const buildDateFilter = ({ startDate, endDate, field = "createdAt" }) => {
  if (!startDate && !endDate) return {};

  const filter = {};

  if (startDate) {
    filter.$gte = new Date(startDate);
  }

  if (endDate) {
    filter.$lte = new Date(endDate);
  }

  return { [field]: filter };
};

module.exports = buildDateFilter;
