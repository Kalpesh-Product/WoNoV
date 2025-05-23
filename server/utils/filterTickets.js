const mongoose = require("mongoose");
const SupportTicket = require("../models/tickets/supportTickets");
const Ticket = require("../models/tickets/Tickets");

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

async function fetchTickets(query) {
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

    return tickets;
  } catch (error) {
    return [];
  }
}

async function filterAcceptedAssignedTickets(user, roles, userDepartments) {
  // Role-based query mapping
  const queryMapping = {
    "Master Admin": {
      $or: [
        {
          $and: [
            { acceptedBy: { $exists: true } },
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
            { acceptedBy: { $exists: true } },
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
      $or: [
        {
          $and: [
            { acceptedBy: { $exists: true } },
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
    Employee: {
      $or: [{ acceptedBy: user }, { assignees: { $in: [user] } }],
      status: "In Progress",
    },
  };

  const query = generateQuery(queryMapping, roles);
  if (!Object.keys(query).length) {
    return [];
  }
  return await fetchTickets(query);
}

async function filterAcceptedTickets(user, roles, userDepartments) {
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
  return await fetchTickets(query);
}

async function filterAssignedTickets(user, roles, userDepartments) {
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

  const query = generateQuery(queryMapping, roles);
  if (!Object.keys(query).length) {
    return [];
  }
  return await fetchTickets(query);
}

async function filterSupportTickets(user, roles, userDepartments) {
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
    if (matchedRole.endsWith("Admin")) {
      let adminTickets = supportTickets.filter((ticket) => {
        return userDepartments.some((dept) => {
          return ticket.ticket.raisedToDepartment._id.equals(
            new mongoose.Types.ObjectId(dept)
          );
        });
      });

      return adminTickets;
    } else if (matchedRole === "Employee") {
      let employeeTickets = supportTickets.filter((ticket) =>
        ticket.user._id.equals(new mongoose.Types.ObjectId(user))
      );

      return employeeTickets;
    }
  } catch (error) {
    return [];
  }
}

async function filterEscalatedTickets(roles, userDepartments) {
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

  const query = generateQuery(queryMapping, roles);

  if (!Object.keys(query).length) {
    return [];
  }

  return await fetchTickets(query);
}

async function filterCloseTickets(user, roles, userDepartments) {
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

  const query = generateQuery(queryMapping, roles);
  if (!Object.keys(query).length) {
    return [];
  }
  return await fetchTickets(query);
}

module.exports = {
  filterCloseTickets,
  filterAcceptedTickets,
  filterAcceptedAssignedTickets,
  filterSupportTickets,
  filterEscalatedTickets,
  filterAssignedTickets,
};
