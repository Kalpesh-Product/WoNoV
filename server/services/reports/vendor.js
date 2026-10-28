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
  if (!company) return [];
  let queryObj = { company };
  if (query && query.departmentId) {
    queryObj.departmentId = query.departmentId;
  }

  if (dateFilter) {
    queryObj.onboardingDate = dateFilter.onboardingDate;
    queryObj.departmentId = { $in: departmentId };
  }

  const vendors = await Vendor.find(queryObj)
    .populate({ path: "departmentId", select: "name" })
    .lean()
    .exec();

  return vendors || [];
};

module.exports = {
  fetchVendorReportService,
};
