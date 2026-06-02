const Vendor = require("../../models/hr/Vendor");

const fetchVendorReportService = async ({
  dateFilter,
  departmentId,
  departments = [],
  roles = [],
  company,
  user,
  query,
}) => {
  let queryObj = {};
  if (query && query.departmentId) {
    queryObj.departmentId = query.departmentId;
  }

  if (dateFilter) {
    queryObj.onboardingDate = dateFilter.onboardingDate;
    queryObj.departmentId = { $in: departmentId };
  }

  console.log("vendor query", queryObj);
  const vendors = await Vendor.find(queryObj)
    .populate({ path: "departmentId", select: "name" })
    .lean()
    .exec();

  if (!vendors) {
    return res.status(200).json([]);
  }

  return vendors;
};

module.exports = {
  fetchVendorReportService,
};
