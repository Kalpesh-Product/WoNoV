const mongoose = require("mongoose");
const Ticket = require("../../models/tickets/Tickets");
const Company = require("../../models/hr/Company");

const fetchTicketReportService = async ({
  dateFilter,
  departmentId,
  roles,
  departments,
  company,
  isReport = true,
  page,
  limit,
}) => {
  let query = {};

  try {
    const shouldPaginate = page !== undefined && limit !== undefined;
    const parsedPage = Math.max(Number.parseInt(page, 10) || 1, 1);
    const parsedLimit = Math.max(Number.parseInt(limit, 10) || 10, 1);
    const skip = (parsedPage - 1) * parsedLimit;

    if (departmentId && !mongoose.Types.ObjectId.isValid(departmentId)) {
      throw new Error("Invalid department ID provided");
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
        select: isReport
          ? "firstName lastName"
          : "firstName lastName email",
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

    const foundCompany = await Company.findOne(company ? { _id: company } : {})
      .select("selectedDepartments")
      .lean()
      .exec();

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
