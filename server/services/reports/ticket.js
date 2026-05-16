const mongoose = require("mongoose");
const Ticket = require("../../models/tickets/Tickets");
const Company = require("../../models/hr/Company");

const fetchTicketReportService = async ({
  dateFilter,
  departmentId,
  roles,
  departments,
}) => {
  let query = {};

  try {
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
      ...(isMasterAdmin
        ? {}
        : { raisedToDepartment: { $in: selectedDepartments } }),
    };

    if (dateFilter) {
      query.createdAt = {
        $gte: new Date(dateFilter.startDate),
        $lte: new Date(dateFilter.endDate),
      };
    }

    console.log("date filter:", dateFilter);
    console.log("Constructed query:", query);
    const tickets = await Ticket.find(query)
      .populate([
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
        { path: "acceptedBy", select: "firstName lastName email" },
        { path: "closedBy", select: "firstName lastName email" },
        { path: "assignees", select: "firstName lastName email" },
        { path: "assignedTo.assignee", select: "firstName lastName email" },
        {
          path: "escalatedTo",
          select: "status raisedToDepartment createdAt",
          populate: {
            path: "raisedToDepartment",
            select: "name",
          },
        },
        { path: "company", select: "companyName" },
        { path: "reject.rejectedBy", select: "firstName lastName email" },
      ])
      .lean()
      .exec();

    const foundCompany = await Company.findOne()
      .select("selectedDepartments")
      .lean()
      .exec();

    if (!foundCompany) throw new Error("Company not found");

    // Extract the ticket priority from the company's selected departments
    const updatedTickets = tickets.map((ticket) => {
      let updatedTicket = { ...ticket };

      (foundCompany.selectedDepartments || []).forEach((dept) => {
        dept?.ticketIssues?.forEach((issue) => {
          if (issue.title.toLowerCase() === ticket.ticket.toLowerCase()) {
            updatedTicket.priority = issue.priority;
          }
        });
      });

      return updatedTicket;
    });

    console.log("Fetched tickets:", updatedTickets.length);
    return updatedTickets || [];
  } catch (error) {
    throw error;
  }
};

module.exports = {
  fetchTicketReportService,
};
