const WeeklySchedule = require("../../models/WeeklySchedule");
const HouseKeepingSchedule = require("../../models/HousekeepingSchedule");
const { hasDepartmentAdminAccess, hasGlobalReportAccess } = require("./access");
const Unit = require("../../models/locations/Unit");

const buildWeeklyScheduleQuery = ({
  company,
  dateFilter,
  departmentId,
  departments = [],
  roles = [],
  user,
}) => {
  const hasGlobalAccess = hasGlobalReportAccess(roles);
  const hasDepartmentAccess = hasDepartmentAdminAccess(roles);

  return {
    company,
    ...(departmentId && { department: departmentId }),
    ...(!departmentId &&
      !hasGlobalAccess &&
      departments?.length && { department: { $in: departments } }),
    ...(!hasGlobalAccess && !hasDepartmentAccess && { "employee.id": user }),
    ...(dateFilter?.startDate && { startDate: dateFilter.startDate }),
  };
};

const fetchWeeklyScheduleReportService = async ({
  company,
  dateFilter,
  departmentId,
  departments = [],
  roles = [],
  user,
}) => {
  const query = buildWeeklyScheduleQuery({
    company,
    dateFilter,
    departmentId,
    departments,
    roles,
    user,
  });

  const weeklySchedules = await WeeklySchedule.find(query)
    .populate({ path: "employee.id", select: "firstName lastName" })
    .populate({
      path: "substitutions.substitute",
      select: "firstName lastName",
    })
    .populate({
      path: "location",
      select: "unitNo unitName building",
      populate: { path: "building", select: "buildingName" },
    })
    .populate({ path: "department", select: "name" })
    .select(
      "-company -employee.isActive -employee.isReassigned -substitutions.isActive",
    )
    .lean();

  const result = weeklySchedules.map((schedule) => ({
    ...schedule,
    employee: schedule.employee?.id ?? null,
  }));

  return result;
};

const toObjectId = (value) =>
  mongoose.Types.ObjectId.isValid(value)
    ? new mongoose.Types.ObjectId(value)
    : null;

const buildScheduleFilter = async ({
  company,
  dateFilter = {},
  query = {},
}) => {
  const filter = { ...dateFilter };

  if (query.housekeepingMember || query.memberId) {
    const housekeepingMember = toObjectId(
      query.housekeepingMember || query.memberId,
    );
    if (housekeepingMember) {
      filter.housekeepingMember = housekeepingMember;
    }
  }

  if (company || query.unit || query.unitId) {
    const unitFilter = {};

    if (company) {
      unitFilter.company = company;
    }

    if (query.unit || query.unitId) {
      const unit = toObjectId(query.unit || query.unitId);
      if (unit) {
        unitFilter._id = unit;
      }
    }

    const companyUnits = await Unit.find(unitFilter)
      .select("_id")
      .lean()
      .exec();

    filter.unit = { $in: companyUnits.map((unit) => unit._id) };
  }

  return filter;
};

const fetchHousekeepingScheduleReportService = async ({
  company,
  dateFilter,
  query,
} = {}) => {
  const filter = await buildScheduleFilter({ company, dateFilter, query });

  return HouseKeepingSchedule.find(filter)
    .populate([
      {
        path: "housekeepingMember",
        select: "firstName lastName",
      },
      {
        path: "unit",
        select: "unitNo unitName building",
        populate: {
          path: "building",
          select: "buildingName",
        },
      },
      {
        path: "substitutions.substitute",
        select: "firstName lastName",
      },
    ])
    .sort({ startDate: 1, endDate: 1 })
    .lean()
    .exec();
};

module.exports = {
  fetchWeeklyScheduleReportService,
  fetchHousekeepingScheduleReportService,
};
