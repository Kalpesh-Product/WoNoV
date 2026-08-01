const buildDateFilter = ({
  startDate,
  endDate,
  field = "createdAt",
  endExclusive = false,
}) => {
  if (!startDate && !endDate) return {};

  const filter = {};

  if (startDate) {
    filter.$gte = new Date(startDate);
  }

  if (endDate) {
    filter[endExclusive ? "$lt" : "$lte"] = new Date(endDate);
  }

  return { [field]: filter };
};

module.exports = buildDateFilter;
