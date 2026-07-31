const Attandance = require("../models/hr/Attendance");
const Events = require("../models/events/Events");
const Leaves = require("../models/hr/Leaves");
const UserData = require("../models/hr/UserData");
const { getPagination } = require("../utils/pagination");

const getCompanyAttandancesService = async ({
  company,
  dateFilter,
  page,
  limit,
}) => {
  const {
    shouldPaginate,
    page: parsedPage,
    limit: parsedLimit,
    skip,
  } = getPagination({ page, limit });

  const activeEmployees = await UserData.find({ company, isActive: true })
    .select("firstName lastName empId startDate isActive")
    .lean()
    .exec();
  const activeEmployeeIds = activeEmployees.map((employee) => employee._id);
  const attendanceQuery = {
    company,
    user: { $in: activeEmployeeIds },
    ...(dateFilter?.inTime && { inTime: dateFilter.inTime }),
  };
  let attendanceFindQuery = Attandance.find(attendanceQuery).populate({
    path: "user",
    select: "firstName lastName empId startDate isActive",
  });

  if (shouldPaginate) {
    attendanceFindQuery = attendanceFindQuery
      .sort({ inTime: -1, _id: -1 })
      .skip(skip)
      .limit(parsedLimit);
  }

  const [companyAttandances, total, holidays, allLeaves] = await Promise.all([
    attendanceFindQuery.lean().exec(),
    shouldPaginate
      ? Attandance.countDocuments(attendanceQuery)
      : Promise.resolve(0),
    Events.find({ company, type: "Holiday" }).lean().exec(),
    Leaves.find({ company, takenBy: { $in: activeEmployeeIds } })
      .populate({
        path: "takenBy",
        select: "firstName lastName empId startDate isActive",
      })
      .lean()
      .exec(),
  ]);

  const year = new Date().getFullYear();
  let sundays = 0;

  for (let month = 0; month < 12; month += 1) {
    for (let day = 1; day <= 31; day += 1) {
      const date = new Date(year, month, day);

      if (date.getMonth() !== month) break;
      if (date.getDay() === 0) sundays += 1;
    }
  }

  const response = {
    activeEmployees,
    companyAttandances,
    workingDays: 365 - (holidays.length + sundays),
    holidays,
    allLeaves,
  };

  if (shouldPaginate) {
    response.pagination = {
      page: parsedPage,
      limit: parsedLimit,
      total,
      totalPages: Math.ceil(total / parsedLimit),
    };
  }

  return response;
};

module.exports = { getCompanyAttandancesService };
