const Attendance = require("../../models/hr/Attendance");
const Leave = require("../../models/hr/Leaves");
const UserData = require("../../models/hr/UserData");

const fetchUsersReportService = async ({
  company,
  query = {},
  dateFilter,
  isReport = false,
} = {}) => {
  const { deptId, status = "true" } = query;

  if (status && !["true", "false"].includes(status)) {
    throw new Error("Status must be true/false");
  }

  const filter = {
    company,
    isActive: status === "true",
  };

  if (deptId) {
    filter.departments = deptId;
  }

  // Adjust this field if your report should filter on another date field
  if (dateFilter?.startDate) {
    filter.startDate = dateFilter.startDate;
  }

  const populateOptions = [
    { path: "reportsTo", select: "_id name email roleTitle" },
    { path: "departments", select: "name" },
    { path: "company", select: "name" },
    { path: "role", select: "roleTitle" },
    { path: "agreements", select: "name url isActive type" },
  ];

  const users = await UserData.find(filter)
    .select("-password -plainPassword")
    .populate(populateOptions)
    .sort({ startDate: 1 })
    .lean()
    .exec();

  const transformedUsers = users.map((user) => {
    if (!isReport) {
      return user;
    }

    const {
      clockInDetails,
      refreshToken,
      permissions,
      jobDescription,
      credits,
      attendanceSource,
      assignedAsset,
      agreements = [],
      ...rest
    } = user;

    const workSchedulePolicy =
      agreements.find((a) => a.name === "Work Schedule Policy")?.type || "";

    const leavePolicy =
      agreements.find((a) => a.name === "Leave Policy")?.url || "";

    const holidayPolicy =
      agreements.find((a) => a.name === "Holiday Policy")?.url || "";

    return {
      ...rest,
      workSchedulePolicy,
      leavePolicy,
      holidayPolicy,
    };
  });

  return transformedUsers || [];
};

const fetchLeavesReportService = async ({ company, dateFilter } = {}) => {
  const matchStage = {
    "takenBy.isActive": true,
  };

  if (dateFilter?.fromDate) {
    matchStage.fromDate = dateFilter.fromDate;
  }

  const leaves = await Leave.aggregate([
    {
      $lookup: {
        from: "userdatas",
        localField: "takenBy",
        foreignField: "_id",
        as: "takenBy",
      },
    },
    { $unwind: "$takenBy" },
    { $match: matchStage },

    {
      $lookup: {
        from: "userdatas",
        localField: "addedBy",
        foreignField: "_id",
        as: "addedBy",
      },
    },
    { $unwind: { path: "$addedBy", preserveNullAndEmptyArrays: true } },

    {
      $lookup: {
        from: "userdatas",
        localField: "approvedBy",
        foreignField: "_id",
        as: "approvedBy",
      },
    },
    { $unwind: { path: "$approvedBy", preserveNullAndEmptyArrays: true } },

    {
      $lookup: {
        from: "userdatas",
        localField: "rejectedBy",
        foreignField: "_id",
        as: "rejectedBy",
      },
    },
    { $unwind: { path: "$rejectedBy", preserveNullAndEmptyArrays: true } },
    {
      $addFields: {
        hours: {
          $cond: {
            if: { $eq: ["$leavePeriod", "Multiple"] },
            then: {
              $concat: [
                {
                  $toString: {
                    $floor: { $divide: ["$hours", 9] },
                  },
                },
                " days",
              ],
            },
            else: {
              $concat: [{ $toString: "$hours" }, " hrs"],
            },
          },
        },
      },
    },
    {
      $replaceRoot: {
        newRoot: {
          $mergeObjects: [
            "$$ROOT",
            {
              takenBy: {
                firstName: "$takenBy.firstName",
                lastName: "$takenBy.lastName",
                empId: "$takenBy.empId",
              },
              addedBy: {
                $cond: {
                  if: { $ifNull: ["$addedBy._id", false] },
                  then: {
                    firstName: "$addedBy.firstName",
                    lastName: "$addedBy.lastName",
                  },
                  else: null,
                },
              },
              approvedBy: {
                $cond: {
                  if: { $ifNull: ["$approvedBy._id", false] },
                  then: {
                    firstName: "$approvedBy.firstName",
                    lastName: "$approvedBy.lastName",
                  },
                  else: null,
                },
              },
              rejectedBy: {
                $cond: {
                  if: { $ifNull: ["$rejectedBy._id", false] },
                  then: {
                    firstName: "$rejectedBy.firstName",
                    lastName: "$rejectedBy.lastName",
                  },
                  else: null,
                },
              },
            },
          ],
        },
      },
    },
  ]);

  return leaves || [];
};

const fetchAttendanceReportService = async ({ company, dateFilter } = {}) => {
  const matchStage = {
    "user.isActive": true,
  };

  if (dateFilter?.inTime) {
    matchStage.inTime = dateFilter.inTime;
  }

  const attendances = await Attendance.aggregate([
    {
      $lookup: {
        from: "userdatas",
        localField: "user",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" },
    { $match: matchStage },

    // ── Step 0: normalize breaks to always be an array ────────────────────
    {
      $addFields: {
        breaks: {
          $cond: {
            if: { $isArray: "$breaks" },
            then: "$breaks",
            else: [],
          },
        },
      },
    },

    // ── Step 1: compute each break's duration in seconds ──────────────────
    {
      $addFields: {
        breaks: {
          $map: {
            input: "$breaks",
            as: "brk",
            in: {
              startBreak: "$$brk.startBreak",
              endBreak: "$$brk.endBreak",
              durationSecs: {
                $cond: {
                  if: {
                    $and: [
                      { $ifNull: ["$$brk.startBreak", false] },
                      { $ifNull: ["$$brk.endBreak", false] },
                    ],
                  },
                  then: {
                    $floor: {
                      $divide: [
                        { $subtract: ["$$brk.endBreak", "$$brk.startBreak"] },
                        1000,
                      ],
                    },
                  },
                  else: 0,
                },
              },
            },
          },
        },
      },
    },

    // ── Step 2: sum break durations & count valid pairs ───────────────────
    {
      $addFields: {
        totalBreakSecs: {
          $sum: {
            $map: {
              input: "$breaks",
              as: "brk",
              in: {
                $cond: [
                  {
                    $and: [
                      { $ifNull: ["$$brk.startBreak", false] },
                      { $ifNull: ["$$brk.endBreak", false] },
                    ],
                  },
                  "$$brk.durationSecs",
                  0,
                ],
              },
            },
          },
        },
        breakCount: {
          $size: {
            $filter: {
              input: "$breaks", // ✅ always an array now due to Step 0
              as: "brk",
              cond: {
                $and: [
                  { $ifNull: ["$$brk.startBreak", false] },
                  { $ifNull: ["$$brk.endBreak", false] },
                ],
              },
            },
          },
        },
      },
    },

    // ── Step 3: compute workDuration in seconds ───────────────────────────
    {
      $addFields: {
        workSecs: {
          $cond: {
            if: {
              $and: [
                { $ifNull: ["$inTime", false] },
                { $ifNull: ["$outTime", false] },
              ],
            },
            then: {
              $max: [
                0,
                {
                  $subtract: [
                    {
                      $floor: {
                        $divide: [{ $subtract: ["$outTime", "$inTime"] }, 1000],
                      },
                    },
                    "$totalBreakSecs",
                  ],
                },
              ],
            },
            else: null,
          },
        },
      },
    },

    // ── Step 4: keep only selected user fields ────────────────────────────
    {
      $replaceRoot: {
        newRoot: {
          $mergeObjects: [
            "$$ROOT",
            {
              user: {
                firstName: "$user.firstName",
                lastName: "$user.lastName",
                empId: "$user.empId",
              },
            },
          ],
        },
      },
    },
  ]);

  const formatDuration = (totalSecs) => {
    if (totalSecs === null || totalSecs === undefined) return "-";
    const secs = Math.floor(totalSecs);
    if (secs < 60) return `${secs}s`;
    if (secs < 3600) return `${Math.floor(secs / 60)}m ${secs % 60}s`;
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    return `${h}h ${m}m`;
  };

  const formatClockTime = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatBreakDuration = (totalSecs) => {
    if (totalSecs === null || totalSecs === undefined) return "-";
    const secs = Math.floor(totalSecs);
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s}s`;
  };

  const formatted = attendances.map((att, idx) => {
    const result = {
      ...att,
      breakDuration: formatDuration(att.totalBreakSecs),
      workDuration: formatDuration(att.workSecs),
      breakCount: att.breakCount ?? 0,
      breaks:
        att.breaks?.map((brk) => ({
          startBreak: formatClockTime(brk.startBreak),
          endBreak: formatClockTime(brk.endBreak),
          durationSecs: formatBreakDuration(brk.durationSecs),
        })) ?? [],
    };

    delete result.totalBreakSecs;
    delete result.workSecs;

    return result;
  });
  return formatted;
};

module.exports = {
  fetchUsersReportService,
  fetchLeavesReportService,
  fetchAttendanceReportService,
};
