const mongoose = require("mongoose");
const Ticket = require("../../models/tickets/Tickets");
const Company = require("../../models/hr/Company");
const { getPagination } = require("../../utils/pagination");
const {
  buildSearchRegex,
  resolveReferenceIds,
} = require("../../utils/referenceSearch");

// ADDED
const uniqueObjectIds = (ids = []) =>
  Array.from(
    new Map(ids.filter(Boolean).map((id) => [String(id), id])).values(),
  );

const buildTicketSearchConditions = async ({
  company,
  search,
  selectedDepartments = [],
}) => {
  const searchRegex = buildSearchRegex(search);

  if (!searchRegex) return [];

  /*
   * These models are already registered because Ticket uses them
   * in populate operations.
   */
  const UserData = Ticket.db.model("UserData");
  const Department = Ticket.db.model("Department");

  const { users, departments, companies } = await resolveReferenceIds(
    searchRegex,
    [
      {
        key: "users",
        model: UserData,
        fields: ["firstName", "middleName", "lastName", "email"],
        extraFilter: company ? { company } : {},
      },
      {
        key: "departments",
        model: Department,
        fields: ["name"],
      },
      {
        key: "companies",
        model: Company,
        fields: ["companyName", "name"],
        extraFilter: company ? { _id: company } : {},
      },
    ],
  );

  /*
   * resolveReferenceIds searches individual name fields.
   * This additional query supports a complete name such as "John Doe".
   */
  const fullNameUsers = await UserData.find({
    ...(company ? { company } : {}),
    $expr: {
      $regexMatch: {
        input: {
          $trim: {
            input: {
              $concat: [
                { $ifNull: ["$firstName", ""] },
                " ",
                { $ifNull: ["$middleName", ""] },
                " ",
                { $ifNull: ["$lastName", ""] },
              ],
            },
          },
        },
        regex: searchRegex.source,
        options: "i",
      },
    },
  })
    .select("_id")
    .lean();

  const directlyMatchedUserIds = uniqueObjectIds([
    ...users,
    ...fullNameUsers.map(({ _id }) => _id),
  ]);

  /*
   * "From Department" is not stored directly on Ticket.
   * It comes from raisedBy.departments, so resolve users belonging
   * to departments whose names match the search.
   */
  const usersFromMatchingDepartments = departments.length
    ? await UserData.find({
        ...(company ? { company } : {}),
        departments: { $in: departments },
      })
        .select("_id")
        .lean()
    : [];

  const raisedByIds = uniqueObjectIds([
    ...directlyMatchedUserIds,
    ...usersFromMatchingDepartments.map(({ _id }) => _id),
  ]);

  /*
   * Priority is added later from Company.selectedDepartments.
   * Resolve matching priorities into their corresponding ticket titles
   * so priority search still works before pagination.
   */
  const priorityTicketTitles = selectedDepartments.flatMap((department) =>
    Array.isArray(department?.ticketIssues)
      ? department.ticketIssues
          .filter((issue) => searchRegex.test(String(issue?.priority || "")))
          .map((issue) => issue?.title)
          .filter(Boolean)
      : [],
  );

  const stringifiedFieldCondition = (field) => ({
    $expr: {
      $regexMatch: {
        input: {
          $convert: {
            input: `$${field}`,
            to: "string",
            onError: "",
            onNull: "",
          },
        },
        regex: searchRegex.source,
        options: "i",
      },
    },
  });

  return [
    // Direct string fields
    { ticket: searchRegex },
    { description: searchRegex },
    { status: searchRegex },
    { closingRemark: searchRegex },
    { "reject.reason": searchRegex },
    { "escalatedTo.status": searchRegex },
    { "escalatedTo.description": searchRegex },

    // Priority is computed from company settings
    ...(priorityTicketTitles.length
      ? [{ ticket: { $in: priorityTicketTitles } }]
      : []),

    // Direct ObjectId and date fields
    stringifiedFieldCondition("_id"),
    stringifiedFieldCondition("createdAt"),
    stringifiedFieldCondition("updatedAt"),
    stringifiedFieldCondition("acceptedAt"),
    stringifiedFieldCondition("assignedAt"),
    stringifiedFieldCondition("closedAt"),
    stringifiedFieldCondition("reject.rejectedAt"),

    // Raised By and From Department
    ...(raisedByIds.length ? [{ raisedBy: { $in: raisedByIds } }] : []),

    // Other user reference fields
    ...(directlyMatchedUserIds.length
      ? [
          { acceptedBy: { $in: directlyMatchedUserIds } },
          { closedBy: { $in: directlyMatchedUserIds } },
          { assignees: { $in: directlyMatchedUserIds } },
          {
            "assignedTo.assignee": {
              $in: directlyMatchedUserIds,
            },
          },
          {
            "reject.rejectedBy": {
              $in: directlyMatchedUserIds,
            },
          },
        ]
      : []),

    // Department reference fields
    ...(departments.length
      ? [
          {
            raisedToDepartment: {
              $in: departments,
            },
          },
          {
            "escalatedTo.raisedToDepartment": {
              $in: departments,
            },
          },
        ]
      : []),

    // Company reference
    ...(companies.length ? [{ company: { $in: companies } }] : []),
  ];
};

const fetchTicketReportService = async ({
  dateFilter,
  departmentId,
  roles,
  departments,
  company,
  isReport = true,
  page,
  limit,
  search,
}) => {
  let query = {};

  try {
    const {
      shouldPaginate,
      page: parsedPage,
      limit: parsedLimit,
      skip,
    } = getPagination({ page, limit });

    if (departmentId && !mongoose.Types.ObjectId.isValid(departmentId)) {
      throw new Error("Invalid department ID provided");
    }

    const foundCompany = await Company.findOne(company ? { _id: company } : {})
      .select("selectedDepartments")
      .lean()
      .exec();

    if (!foundCompany) {
      throw new Error("Company not found");
    }

    // Check if user has Master Admin role
    const isMasterAdmin =
      roles?.includes("Master Admin") || roles?.includes("Super Admin");

    const safeDepartments = Array.isArray(departments) ? departments : [];

    const departmentIds = safeDepartments.map(
      (dept) => new mongoose.Types.ObjectId(dept._id),
    );

    const selectedDepartments = departmentIds.length
      ? departmentIds
      : departmentId
        ? [new mongoose.Types.ObjectId(departmentId)]
        : [];

    query = {
      ...(company ? { company } : {}),
      ...(isMasterAdmin
        ? {}
        : { raisedToDepartment: { $in: selectedDepartments } }),
    };

    if (dateFilter?.createdAt) {
      const { $gte, $lte } = dateFilter.createdAt;

      if ($gte && Number.isNaN(new Date($gte).getTime())) {
        throw new Error("Invalid start date provided");
      }

      if ($lte && Number.isNaN(new Date($lte).getTime())) {
        throw new Error("Invalid end date provided");
      }

      query.createdAt = {
        ...(dateFilter.createdAt.$gte ? { $gte: new Date($gte) } : {}),
        ...(dateFilter.createdAt.$lte ? { $lte: new Date($lte) } : {}),
      };
    }

    const searchConditions = await buildTicketSearchConditions({
      company,
      search,
      selectedDepartments: foundCompany.selectedDepartments || [],
    });

    if (searchConditions.length) {
      query.$or = searchConditions;
    }

    let ticketsQuery = Ticket.find(query).populate([
      {
        path: "raisedBy",
        select: "firstName lastName departments",
        populate: {
          path: "departments",
          select: "name",
          model: "Department",
        },
      },
      { path: "raisedToDepartment", select: "name" },
      {
        path: "acceptedBy",
        select: isReport
          ? "firstName lastName email"
          : "firstName middleName lastName",
      },
      {
        path: "closedBy",
        select: isReport
          ? "firstName lastName email"
          : "firstName middleName lastName",
      },
      {
        path: "assignees",
        select: isReport
          ? "firstName lastName"
          : "firstName middleName lastName",
      },
      { path: "assignedTo.assignee", select: "firstName lastName" },
      {
        path: "escalatedTo",
        select: isReport
          ? "status raisedToDepartment createdAt"
          : "status raisedToDepartment createdAt description",
        populate: {
          path: "raisedToDepartment",
          select: "name",
        },
      },
      ...(isReport ? [{ path: "company", select: "companyName" }] : []),
      {
        path: "reject.rejectedBy",
        select: isReport ? "firstName lastName" : "firstName lastName email",
      },
    ]);

    if (shouldPaginate) {
      ticketsQuery = ticketsQuery
        .sort({ _id: 1 })
        .skip(skip)
        .limit(parsedLimit);
    }

    const [tickets, total] = await Promise.all([
      ticketsQuery.lean().exec(),
      shouldPaginate
        ? Ticket.countDocuments(query).exec()
        : Promise.resolve(null),
    ]);

    if (!foundCompany) throw new Error("Company not found");

    // Extract the ticket priority from the company's selected departments
    const updatedTickets = tickets.map((ticket) => {
      let updatedTicket = { ...ticket };

      if (!isReport && updatedTicket.status === "Rejected") {
        updatedTicket.reject = {
          ...(updatedTicket.reject || {}),
          rejectedAt:
            updatedTicket.reject?.rejectedAt || updatedTicket.updatedAt,
        };
      }

      (foundCompany.selectedDepartments || []).forEach((dept) => {
        dept?.ticketIssues?.forEach((issue) => {
          if (issue.title.toLowerCase() === ticket.ticket.toLowerCase()) {
            updatedTicket.priority = issue.priority;
          }
        });
      });

      return updatedTicket;
    });

    return shouldPaginate
      ? {
          data: updatedTickets,
          pagination: {
            page: parsedPage,
            limit: parsedLimit,
            total,
            totalPages: Math.ceil(total / parsedLimit),
          },
        }
      : updatedTickets || [];
  } catch (error) {
    throw error;
  }
};

module.exports = {
  fetchTicketReportService,
};
