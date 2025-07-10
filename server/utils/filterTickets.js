const mongoose = require("mongoose");
const SupportTicket = require("../models/tickets/supportTickets");
const Ticket = require("../models/tickets/Tickets");
const Company = require("../models/hr/Company");

function generateQuery(queryMapping, roles) {
  const roleHierarchy = ["Master Admin", "Super Admin", "Admin", "Employee"]; // For users with multiple roles, use query of higher entity

  const matchedRole =
    roleHierarchy.find((roleTitle) =>
      roles.some(
        (userRole) => userRole === roleTitle || userRole.endsWith(roleTitle)
      )
    ) || "None";

  return queryMapping[matchedRole] || {};
}

async function fetchTickets(query, companyId) {
  try {
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
        {
          path: "acceptedBy",
          select: "firstName lastName",
          populate: {
            path: "departments",
            select: "name",
            model: "Department",
          },
        },
        {
          path: "closedBy",
          select: "firstName lastName",
          populate: {
            path: "departments",
            select: "name",
            model: "Department",
          },
        },
        {
          path: "assignees",
          select: "firstName lastName",
          populate: {
            path: "departments",
            select: "name",
            model: "Department",
          },
        },
        { path: "raisedToDepartment", select: "name" },
        {
          path: "escalatedTo",
          populate: [
            {
              path: "raisedBy",
              select: "firstName lastName departments",
              populate: {
                path: "departments",
                select: "name",
                model: "Department",
              },
            },
            {
              path: "raisedToDepartment",
              model: "Department",
            },
          ],
        },
      ])
      .lean()
      .exec();

    if (!tickets.length) return [];

    const company = await Company.findById(companyId)
      .select("selectedDepartments")
      .lean()
      .exec();

    if (!company) return tickets; // or [] if you want to skip all in case of no company

    const updatedTickets = tickets.map((ticket) => {
      const department = company.selectedDepartments.find(
        (dept) =>
          dept.department.toString() ===
          ticket.raisedToDepartment?._id.toString()
      );

      let priority = "Low"; // Default priority

      if (department) {
        const issue = department.ticketIssues.find(
          (issue) => issue.title === ticket.ticket
        );
        priority = issue?.priority || "High";
      }

      // If no match found or still Low, look for "Other"
      if (!priority || priority === "Low") {
        const otherIssue = company.selectedDepartments
          .flatMap((dept) => dept.ticketIssues)
          .find((issue) => issue.title === "Other");

        priority = otherIssue?.priority || "Low";
      }

      return {
        ...ticket,
        priority,
      };
    });

    return updatedTickets;
  } catch (error) {
    return [];
  }
}

async function filterAcceptedAssignedTickets(
  user,
  roles,
  userDepartments,
  companyId
) {
  // Role-based query mapping
  const queryMapping = {
    "Master Admin": {
      $or: [
        {
          $and: [
            { acceptedBy: { $exists: true, $ne: null } },
            { raisedToDepartment: { $in: userDepartments } },
            { status: "In Progress" },
          ],
        },
        {
          $and: [
            { assignees: { $exists: true, $ne: [] } },
            { raisedToDepartment: { $in: userDepartments } },
            { status: "In Progress" },
          ],
        },
      ],
    },
    "Super Admin": {
      $or: [
        {
          $and: [
            { acceptedBy: { $exists: true, $ne: null } },
            { raisedToDepartment: { $in: userDepartments } },
            { status: "In Progress" },
          ],
        },
        {
          $and: [
            { assignees: { $exists: true, $ne: [] } },
            { raisedToDepartment: { $in: userDepartments } },
            { status: "In Progress" },
          ],
        },
      ],
    },
    Admin: {
      $and: [
        {
          $or: [
            { acceptedBy: { $exists: true, $ne: null } },
            { assignees: { $in: [user] } },
          ],
        },
        { raisedToDepartment: { $in: userDepartments } },
        { status: "In Progress" },
      ],
    },
    Employee: {
      $or: [{ acceptedBy: user }, { assignees: { $in: [user] } }],
      status: "In Progress",
    },
  };

  const query = generateQuery(queryMapping, roles);
  if (!Object.keys(query).length) {
    return [];
  }
  return await fetchTickets(query, companyId);
}

async function filterAcceptedTickets(user, roles, userDepartments, companyId) {
  const queryMapping = {
    "Master Admin": {
      $and: [
        { acceptedBy: { $exists: true } },
        { raisedToDepartment: { $in: userDepartments } },
        { status: "In Progress" },
      ],
    },
    "Super Admin": {
      $and: [
        { acceptedBy: { $exists: true } },
        { raisedToDepartment: { $in: userDepartments } },
        { status: "In Progress" },
      ],
    },
    Admin: {
      $and: [
        { acceptedBy: { $exists: true } },
        { raisedToDepartment: { $in: userDepartments } },
        { status: "In Progress" },
      ],
    },
    Employee: { acceptedBy: user, status: "In Progress" },
  };

  const query = generateQuery(queryMapping, roles);
  if (!Object.keys(query).length) {
    return [];
  }
  return await fetchTickets(query, companyId);
}

async function filterAssignedTickets(user, roles, userDepartments, companyId) {
  const queryMapping = {
    "Master Admin": {
      $and: [
        { assignees: { $exists: true, $ne: [] } },
        { raisedToDepartment: { $in: userDepartments } },
        { status: "In Progress" },
      ],
    },
    "Super Admin": {
      $and: [
        { assignees: { $exists: true, $ne: [] } },
        { raisedToDepartment: { $in: userDepartments } },
        { status: "In Progress" },
      ],
    },
    Admin: {
      $and: [
        { assignees: { $exists: true, $ne: [] } },
        { raisedToDepartment: { $in: userDepartments } },
        { status: "In Progress" },
      ],
    },
    Employee: { assignees: { $in: [user] }, status: "In Progress" },
  };

  const query = generateQuery(queryMapping, roles, companyId);
  if (!Object.keys(query).length) {
    return [];
  }
  return await fetchTickets(query, companyId);
}

async function filterSupportTickets(user, roles, userDepartments, companyId) {
  const roleHierarchy = ["Master Admin", "Super Admin", "Admin", "Employee"]; // For users with multiple roles, use query of higher entity

  const matchedRole =
    roleHierarchy.find((roleTitle) =>
      roles.some(
        (userRole) => userRole === roleTitle || userRole.endsWith(roleTitle)
      )
    ) || "None";

  try {
    const supportTickets = await SupportTicket.find({
      ticket: {
        $in: await Ticket.find().distinct("_id"),
      },
    })
      .populate({
        path: "ticket",
        select: "status acceptedBy assignees image raisedBy raisedToDepartment",
        populate: [
          {
            path: "raisedBy",
            select: "firstName lastName departments",
            populate: {
              path: "departments",
              select: "name",
            },
          },
          {
            path: "raisedToDepartment",
            select: "name",
          },
          {
            path: "acceptedBy",
            select: "firstName lastName",
          },
          {
            path: "assignees",
            select: "firstName lastName",
          },
        ],
      })
      .populate({
        path: "user",
        select: "firstName lastName",
      })
      .select("-company");

    // if (matchedRole === "Master Admin" || matchedRole === "Super Admin") {
    //   return supportTickets;
    // }
    // if (matchedRole.endsWith("Admin")) {
    //   let adminTickets = supportTickets.filter((ticket) => {
    //     return userDepartments.some((dept) => {
    //       return ticket.ticket.raisedToDepartment._id.equals(
    //         new mongoose.Types.ObjectId(dept)
    //       );
    //     });
    //   });

    //   return adminTickets;
    // }
    if (matchedRole.endsWith("Admin") || matchedRole === "Employee") {
      let employeeTickets = supportTickets.filter((ticket) =>
        ticket.user._id.equals(new mongoose.Types.ObjectId(user))
      );

      if (!employeeTickets) return [];
      const tickets = employeeTickets;

      const company = await Company.findById(companyId)
        .select("selectedDepartments")
        .lean()
        .exec();

      if (!company) return tickets; // or [] if you want to skip all in case of no company

      const updatedTickets = tickets.map((ticket) => {
        const department = company.selectedDepartments.find(
          (dept) =>
            dept.department.toString() ===
            ticket.ticket.raisedToDepartment?._id.toString()
        );

        let priority = "Low"; // Default priority

        if (department) {
          const issue = department.ticketIssues.find(
            (issue) => issue.title === ticket.ticket.ticket
          );

          priority = issue?.priority || "High";
        }

        // If no match found or still Low, look for "Other"
        if (!priority || priority === "Low") {
          const otherIssue = company.selectedDepartments
            .flatMap((dept) => dept.ticketIssues)
            .find((issue) => issue.title === "Other");

          priority = otherIssue?.priority || "Low";
        }

        return {
          ...ticket._doc,
          priority,
        };
      });

      // console.log("updatedTickets", updatedTickets);
      return updatedTickets;
      // return employeeTickets;
    }
  } catch (error) {
    return [];
  }
}

async function filterEscalatedTickets(roles, userDepartments, companyId) {
  const queryMapping = {
    "Master Admin": {
      $and: [
        { raisedToDepartment: { $in: userDepartments }, status: "Escalated" },
      ],
    },
    "Super Admin": {
      $and: [
        { raisedToDepartment: { $in: userDepartments }, status: "Escalated" },
      ],
    },
    Admin: {
      $and: [
        {
          raisedToDepartment: { $in: userDepartments },
          status: { $ne: "Closed" },
        },
        { status: "Escalated" },
      ],
    },
  };

  const query = generateQuery(queryMapping, roles, companyId);

  if (!Object.keys(query).length) {
    return [];
  }

  return await fetchTickets(query, companyId);
}

async function filterCloseTickets(user, roles, userDepartments, companyId) {
  const queryMapping = {
    "Master Admin": {
      $and: [
        { status: "Closed" },
        { raisedToDepartment: { $in: userDepartments } },
      ],
    },
    "Super Admin": {
      $and: [
        { status: "Closed" },
        { raisedToDepartment: { $in: userDepartments } },
      ],
    },
    Admin: {
      $and: [
        { status: "Closed" },
        { raisedToDepartment: { $in: userDepartments } },
      ],
      // $or: [
      //   {
      //     $and: [
      //       { status: "Closed" },
      //       { raisedToDepartment: { $in: userDepartments } },
      //       { acceptedBy: user },
      //     ],
      //   },
      //   {
      //     $and: [
      //       { status: "Closed" },
      //       { assignees: [user] },
      //       { raisedToDepartment: { $in: userDepartments } },
      //     ],
      //   },
      // ],
    },
    Employee: {
      $or: [
        {
          $and: [
            { status: "Closed" },
            { raisedToDepartment: { $in: userDepartments } },
            { acceptedBy: user },
          ],
        },
        {
          $and: [
            { status: "Closed" },
            { assignees: [user] },
            { raisedToDepartment: { $in: userDepartments } },
          ],
        },
      ],
    },
  };

  const query = generateQuery(queryMapping, roles, companyId);
  if (!Object.keys(query).length) {
    return [];
  }
  return await fetchTickets(query, companyId);
}

module.exports = {
  filterCloseTickets,
  filterAcceptedTickets,
  filterAcceptedAssignedTickets,
  filterSupportTickets,
  filterEscalatedTickets,
  filterAssignedTickets,
};
