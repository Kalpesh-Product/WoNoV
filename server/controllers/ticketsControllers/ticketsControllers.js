const Tickets = require("../../models/tickets/Tickets");
const User = require("../../models/hr/UserData");
const mongoose = require("mongoose");
const Department = require("../../models/Departments");
const NewTicketIssue = require("../../models/tickets/NewTicketIssue");
const { handleFileUpload } = require("../../config/cloudinaryConfig");
const sharp = require("sharp");
const {
  filterCloseTickets,
  filterAcceptedTickets,
  filterSupportTickets,
  filterEscalatedTickets,
  filterAssignedTickets,
  filterAcceptedAssignedTickets,
} = require("../../utils/filterTickets");
const Company = require("../../models/hr/Company");
const { createLog } = require("../../utils/moduleLogs");
const CustomError = require("../../utils/customErrorlogs");
const Ticket = require("../../models/tickets/Tickets");
const validateUsers = require("../../utils/validateUsers");

const raiseTicket = async (req, res, next) => {
  const logPath = "tickets/TicketLog";
  const logAction = "Raise Ticket";
  const logSourceKey = "ticket";
  const { departmentId, issueId, newIssue, description } = req.body;
  const image = req.file;
  const { user, ip, company } = req;

  try {
    if (!mongoose.Types.ObjectId.isValid(departmentId)) {
      throw new CustomError(
        "Invalid department ID provided",
        logPath,
        logAction,
        logSourceKey
      );
    }

    if (
      typeof description !== "string" ||
      !description.length ||
      description.replace(/\s/g, "").length > 100
    ) {
      throw new CustomError(
        "Invalid description provided",
        logPath,
        logAction,
        logSourceKey
      );
    }

    const foundCompany = await Company.findOne({ _id: company })
      .select("selectedDepartments companyName")
      .lean()
      .exec();

    if (!foundCompany) {
      throw new CustomError(
        "Company not found",
        logPath,
        logAction,
        logSourceKey
      );
    }

    const department = foundCompany.selectedDepartments.find(
      (dept) => dept.department.toString() === departmentId
    );

    if (!department) {
      throw new CustomError(
        "Invalid Department ID",
        logPath,
        logAction,
        logSourceKey
      );
    }

    const foundDepartment = await Department.findOne({
      _id: department.department,
    }).select("name");

    // *Handle optional file upload*
    let imageDetails = null;
    if (image) {
      try {
        const buffer = await sharp(image.buffer)
          .resize(1200, 800, { fit: "cover" })
          .webp({ quality: 80 })
          .toBuffer();
        const base64Image = `data:image/webp;base64,${buffer.toString(
          "base64"
        )}`;
        const uploadedImage = await handleFileUpload(
          base64Image,
          `${foundCompany.companyName}/tickets/${foundDepartment.name}`
        );

        imageDetails = {
          id: uploadedImage.public_id,
          url: uploadedImage.secure_url,
        };
      } catch (uploadError) {
        throw new CustomError(
          "Error uploading image",
          logPath,
          logAction,
          logSourceKey
        );
      }
    }

    let foundIssue;
    if (issueId) {
      if (!mongoose.Types.ObjectId.isValid(issueId)) {
        throw new CustomError(
          "Invalid issueId provided",
          logPath,
          logAction,
          logSourceKey
        );
      }

      foundIssue = department?.ticketIssues?.find(
        (ticketIssue) => ticketIssue._id.toString() === issueId
      );
      if (!foundIssue) {
        throw new CustomError(
          "Issue not found",
          logPath,
          logAction,
          logSourceKey
        );
      }
    }

    // Handle "Other" ticket issue case
    let ticketTitle;
    if (foundIssue && foundIssue.title === "Other") {
      if (!newIssue || typeof newIssue !== "string" || !newIssue.trim()) {
        throw new CustomError(
          "You must specify a title for the 'Other' issue",
          logPath,
          logAction,
          logSourceKey
        );
      }
      ticketTitle = newIssue;
      const newTicketIssue = new NewTicketIssue({
        company: req.company,
        raisedBy: user,
        departmentId,
        issueTitle: newIssue,
        status: "Pending",
      });
      await newTicketIssue.save();
    } else {
      ticketTitle = foundIssue ? foundIssue.title : newIssue;
    }

    const newTicket = new Ticket({
      ticket: ticketTitle,
      description,
      raisedToDepartment: departmentId,
      raisedBy: user,
      company: company,
      image: imageDetails
        ? {
            id: imageDetails.id,
            url: imageDetails.url,
          }
        : null, // Store image only if uploaded
    });

    const savedTicket = await newTicket.save();

    // Log the successful ticket creation
    await createLog({
      path: logPath,
      action: logAction,
      remarks: "Ticket raised successfully",
      status: "Success",
      user: user,
      ip: ip,
      company: company,
      sourceKey: logSourceKey,
      sourceId: savedTicket._id,
      changes: savedTicket,
    });

    return res.status(201).json({ message: "Ticket raised successfully" });
  } catch (error) {
    if (error instanceof CustomError) {
      next(error);
    } else {
      next(
        new CustomError(error.message, logPath, logAction, logSourceKey, 500)
      );
    }
  }
};

const getTickets = async (req, res, next) => {
  try {
    const { user, roles } = req;

    const loggedInUser = await User.findOne({ _id: user })
      .populate({ path: "role", select: "roleTitle" })
      .lean()
      .exec();

    if (!loggedInUser || !loggedInUser.departments) {
      return res.sendStatus(403);
    }

    // Fetch the company document to get selectedDepartments and ticketIssues
    const company = await Company.findOne({ _id: loggedInUser.company })
      .select("selectedDepartments")
      .lean()
      .exec();

    if (!company) {
      return res.status(400).json({ message: "Company not found" });
    }

    const userDepartments = loggedInUser.departments.map((dept) =>
      dept.toString()
    );

    let matchingTickets;

    if (roles.includes("Master Admin") || roles.includes("Super Admin")) {
      matchingTickets = await Tickets.find({
        acceptedBy: { $exists: false },
        raisedBy: { $ne: loggedInUser._id },
        status: "Open",
        company: loggedInUser.company,
      }).populate([
        { path: "raisedBy", select: "firstName lastName" },
        { path: "raisedToDepartment", select: "name" },
      ]);
    } else {
      // Department admins or users can view tickets in their departments
      matchingTickets = await Tickets.find({
        $or: [
          { raisedToDepartment: { $in: userDepartments } },
          { escalatedTo: { $in: userDepartments } },
        ],
        acceptedBy: { $exists: false },
        company: loggedInUser.company,
        status: "Open",
      })
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
        ])
        .lean()
        .exec();
    }

    if (!matchingTickets.length) {
      return res.status(200).json(matchingTickets);
    }

    // Attach ticket issueId title from Company.selectedDepartments.ticketIssues
    const ticketsWithIssueTitle = matchingTickets.map((ticket) => {
      const department = company.selectedDepartments.find(
        (dept) =>
          dept.department.toString() === ticket.raisedToDepartment.toString()
      );

      const ticketIssue = department?.ticketIssues.find(
        (issueId) => issueId._id.toString() === ticket.ticket.toString()
      );

      return {
        ...ticket,
        ticketIssueTitle: ticketIssue ? ticketIssue.title : "Issue not found",
      };
    });

    return res.status(200).json(ticketsWithIssueTitle);
  } catch (error) {
    next(error);
  }
};

const acceptTicket = async (req, res, next) => {
  const logPath = "tickets/TicketLog";
  const logAction = "Accept Ticket";
  const logSourceKey = "ticket";
  const { user, company, ip, departments } = req;
  const { ticketId } = req.params;

  try {
    if (!ticketId) {
      throw new CustomError(
        "Ticket ID is required",
        logPath,
        logAction,
        logSourceKey
      );
    }

    if (!mongoose.Types.ObjectId.isValid(ticketId)) {
      throw new CustomError(
        "Invalid ticket ID provided",
        logPath,
        logAction,
        logSourceKey
      );
    }

    const foundTicket = await Tickets.findOne({ _id: ticketId }).lean().exec();
    if (!foundTicket) {
      throw new CustomError(
        "Ticket not found",
        logPath,
        logAction,
        logSourceKey
      );
    }

    // Check if the ticket's raised department is among the user's departments
    const userDepartments = departments.map((dept) => dept._id.toString());

    const ticketInDepartment = userDepartments.some(
      (deptId) => foundTicket.raisedToDepartment.toString() === deptId
    );
    if (!ticketInDepartment) {
      throw new CustomError(
        "User does not have permission to accept this ticket",
        logPath,
        logAction,
        logSourceKey
      );
    }

    // Update the ticket by marking it as accepted and setting status to "In Progress"
    const updatedTicket = await Tickets.findByIdAndUpdate(
      ticketId,
      { acceptedBy: user, status: "In Progress", $unset: { rejectedBy: 1 } },
      { new: true }
    );
    if (!updatedTicket) {
      throw new CustomError(
        "Failed to accept ticket",
        logPath,
        logAction,
        logSourceKey
      );
    }

    // Log the successful ticket acceptance
    await createLog({
      path: logPath,
      action: logAction,
      remarks: "Ticket accepted successfully",
      status: "Success",
      user: user,
      ip: ip,
      company: company,
      sourceKey: logSourceKey,
      sourceId: updatedTicket._id,
      changes: { acceptedBy: user, status: "In Progress" },
    });

    return res.status(200).json({ message: "Ticket accepted successfully" });
  } catch (error) {
    if (error instanceof CustomError) {
      next(error);
    } else {
      next(
        new CustomError(error.message, logPath, logAction, logSourceKey, 500)
      );
    }
  }
};

const rejectTicket = async (req, res, next) => {
  const logPath = "tickets/TicketLog";
  const logAction = "Reject Ticket";
  const logSourceKey = "ticket";
  const { user, company, ip } = req;

  try {
    const { id: ticketId } = req.params;

    if (!ticketId) {
      throw new CustomError(
        "Ticket ID is required",
        logPath,
        logAction,
        logSourceKey
      );
    }

    if (!mongoose.Types.ObjectId.isValid(ticketId)) {
      throw new CustomError(
        "Invalid ticket ID provided",
        logPath,
        logAction,
        logSourceKey
      );
    }

    const foundTicket = await Tickets.findOne({ _id: ticketId }).lean().exec();
    if (!foundTicket) {
      throw new CustomError(
        "Ticket not found",
        logPath,
        logAction,
        logSourceKey
      );
    }

    // Update the ticket by marking it as accepted and setting status to "In Progress"
    const updatedTicket = await Tickets.findByIdAndUpdate(
      ticketId,
      { rejectedBy: user, status: "Closed", $unset: { acceptedBy: 1 } },
      { new: true }
    );

    if (!updatedTicket) {
      throw new CustomError(
        "Failed to reject ticket",
        logPath,
        logAction,
        logSourceKey
      );
    }

    // Log the successful ticket acceptance
    await createLog({
      path: logPath,
      action: logAction,
      remarks: "Ticket rejected successfully",
      status: "Success",
      user: user,
      ip: ip,
      company: company,
      sourceKey: logSourceKey,
      sourceId: updatedTicket._id,
      changes: { rejectedBy: user, status: "Closed" },
    });

    return res.status(200).json({ message: "Ticket rejected successfully" });
  } catch (error) {
    if (error instanceof CustomError) {
      next(error);
    } else {
      next(
        new CustomError(error.message, logPath, logAction, logSourceKey, 500)
      );
    }
  }
};

const assignTicket = async (req, res, next) => {
  const logPath = "tickets/TicketLog";
  const logAction = "Assign Ticket";
  const logSourceKey = "ticket";
  const { user, company, ip, departments } = req;

  try {
    const { ticketId } = req.params;
    const { assignees } = req.body;

    if (!ticketId) {
      throw new CustomError(
        "Ticket ID and assignees are required",
        logPath,
        logAction,
        logSourceKey
      );
    }

    if (!Array.isArray(assignees)) {
      throw new CustomError(
        "Assignees are required",
        logPath,
        logAction,
        logSourceKey
      );
    }

    const validAssignees = validateUsers(assignees);

    if (!validAssignees) {
      throw new CustomError(
        "Invalid one or many assignee IDs",
        logPath,
        logAction,
        logSourceKey
      );
    }

    // ✅ Find the ticket
    const foundTicket = await Tickets.findOne({ _id: ticketId }).lean().exec();
    if (!foundTicket) {
      throw new CustomError(
        "Ticket not found",
        logPath,
        logAction,
        logSourceKey
      );
    }

    // Check if the ticket's raised department is among the user's departments
    const userDepartments = departments.map((dept) => dept._id.toString());
    const ticketInDepartment = userDepartments.some(
      (deptId) => foundTicket.raisedToDepartment.toString() === deptId
    );
    if (!ticketInDepartment) {
      throw new CustomError(
        "User does not have permission to assign this ticket",
        logPath,
        logAction,
        logSourceKey
      );
    }

    // Update the ticket by adding the assignees and setting status to "In Progress"
    const updatedTicket = await Tickets.findOneAndUpdate(
      { _id: ticketId },
      { $addToSet: { assignees: assignees }, status: "In Progress" },
      { new: true }
    );

    if (!updatedTicket) {
      throw new CustomError(
        "Failed to assign ticket",
        logPath,
        logAction,
        logSourceKey
      );
    }

    // ✅ Log the successful ticket assignment
    await createLog({
      path: logPath,
      action: logAction,
      remarks: "Ticket assigned successfully",
      status: "Success",
      user: user,
      ip: ip,
      company: company,
      sourceKey: logSourceKey,
      sourceId: updatedTicket._id,
      changes: {
        assignedTo: assignees,
        assignedBy: user,
        status: "In Progress",
      },
    });

    return res.status(200).json({ message: "Ticket assigned successfully" });
  } catch (error) {
    next(
      error instanceof CustomError
        ? error
        : new CustomError(error.message, logPath, logAction, logSourceKey, 500)
    );
  }
};

const escalateTicket = async (req, res, next) => {
  const logPath = "tickets/TicketLog";
  const logAction = "Escalate Ticket";
  const logSourceKey = "ticket";
  const { user, company, ip } = req;
  const { ticketId, description, departmentId } = req.body;

  try {
    const foundUser = await User.findOne({ _id: user })
      .select("-refreshToken -password")
      .lean()
      .exec();
    if (!foundUser) {
      throw new CustomError("User not found", logPath, logAction, logSourceKey);
    }
    if (!description) {
      throw new CustomError(
        "Description not provided",
        logPath,
        logAction,
        logSourceKey
      );
    }

    if (!mongoose.Types.ObjectId.isValid(departmentId)) {
      throw new CustomError(
        "Invalid Department ID provided",
        logPath,
        logAction,
        logSourceKey
      );
    }
    const foundDepartment = await Department.findOne({ _id: departmentId })
      .lean()
      .exec();
    if (!foundDepartment) {
      throw new CustomError(
        "Department does not exist",
        logPath,
        logAction,
        logSourceKey
      );
    }

    if (!mongoose.Types.ObjectId.isValid(ticketId)) {
      throw new CustomError(
        "Invalid ticket ID provided",
        logPath,
        logAction,
        logSourceKey
      );
    }
    const foundTicket = await Tickets.findOne({ _id: ticketId }).lean().exec();
    if (!foundTicket) {
      throw new CustomError(
        "Ticket does not exist",
        logPath,
        logAction,
        logSourceKey
      );
    }

    // Check if the current user belongs to any department relevant to the ticket
    const userDepartments = foundUser.departments.map((dept) =>
      dept.toString()
    );
    const foundTickets = await Tickets.find({
      raisedToDepartment: {
        $in: userDepartments.map((id) => new mongoose.Types.ObjectId(id)),
      },
    });
    if (!foundTickets.length) {
      throw new CustomError(
        "User does not have permission to escalate this ticket",
        logPath,
        logAction,
        logSourceKey
      );
    }

    const newTicket = new Ticket({
      ticket: foundTicket.ticket,
      description,
      raisedToDepartment: departmentId,
      raisedBy: user,
      company: company,
      image: foundTicket.image ? foundTicket.image : null,
    });

    const savedTicket = await newTicket.save();

    // Update the ticket: add the departmentId to the escalatedTo array
    const updatedTicket = await Tickets.findByIdAndUpdate(
      ticketId,
      { $push: { escalatedTo: savedTicket._id } },
      { new: true }
    );

    if (!updatedTicket) {
      throw new CustomError(
        "Failed to escalate ticket",
        logPath,
        logAction,
        logSourceKey
      );
    }

    // Log the successful escalation
    await createLog({
      path: logPath,
      action: logAction,
      remarks: "Ticket escalated successfully",
      status: "Success",
      user: user,
      ip: ip,
      company: company,
      sourceKey: logSourceKey,
      sourceId: updatedTicket._id,
      changes: { escalatedTo: savedTicket._id, escalatedBy: user },
    });

    return res.status(200).json({ message: "Ticket escalated successfully" });
  } catch (error) {
    if (error instanceof CustomError) {
      next(error);
    } else {
      next(
        new CustomError(error.message, logPath, logAction, logSourceKey, 500)
      );
    }
  }
};

const closeTicket = async (req, res, next) => {
  const logPath = "tickets/TicketLog";
  const logAction = "Close Ticket";
  const logSourceKey = "ticket";
  const { user, company, ip } = req;

  try {
    const { ticketId } = req.body;

    if (!ticketId) {
      throw new CustomError(
        "Ticket ID is required",
        logPath,
        logAction,
        logSourceKey
      );
    }

    if (!mongoose.Types.ObjectId.isValid(ticketId)) {
      throw new CustomError(
        "Invalid ticket ID provided",
        logPath,
        logAction,
        logSourceKey
      );
    }

    const foundUser = await User.findOne({ _id: user })
      .select("-refreshToken -password")
      .lean()
      .exec();
    if (!foundUser) {
      throw new CustomError("User not found", logPath, logAction, logSourceKey);
    }

    const foundTicket = await Tickets.findOne({ _id: ticketId }).lean().exec();
    if (!foundTicket) {
      throw new CustomError(
        "Ticket does not exist",
        logPath,
        logAction,
        logSourceKey
      );
    }

    const userDepartments = foundUser.departments.map((dept) =>
      dept.toString()
    );
    const ticketInDepartment = userDepartments.some(
      (deptId) => foundTicket.raisedToDepartment.toString() === deptId
    );
    if (!ticketInDepartment && !foundTicket.assignees.includes(foundUser._id)) {
      throw new CustomError(
        "User does not have permission to close this ticket",
        logPath,
        logAction,
        logSourceKey
      );
    }

    const updatedTicket = await Tickets.findByIdAndUpdate(
      ticketId,
      { status: "Closed" },
      { new: true }
    );
    if (!updatedTicket) {
      throw new CustomError(
        "Failed to close ticket",
        logPath,
        logAction,
        logSourceKey
      );
    }

    // Log the successful ticket closure
    await createLog({
      path: logPath,
      action: logAction,
      remarks: "Ticket closed successfully",
      status: "Success",
      user: user,
      ip: ip,
      company: company,
      sourceKey: logSourceKey,
      sourceId: updatedTicket._id,
      changes: { closedBy: user, status: "Closed" },
    });

    return res.status(200).json({ message: "Ticket closed successfully" });
  } catch (error) {
    if (error instanceof CustomError) {
      next(error);
    } else {
      next(
        new CustomError(error.message, logPath, logAction, logSourceKey, 500)
      );
    }
  }
};

const getSingleUserTickets = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { company } = req;

    const tickets = await Ticket.find({
      company,
      $or: [
        { assignees: { $in: [new mongoose.Types.ObjectId(id)] } },
        { acceptedBy: new mongoose.Types.ObjectId(id) },
        { raisedBy: new mongoose.Types.ObjectId(id) },
      ],
    }).populate([
      { path: "raisedBy", select: "firstName lastName" },
      { path: "raisedToDepartment", select: "name" },
    ]);

    if (!tickets?.length) {
      return res.status(400).json({ message: "No tickets found" });
    }

    return res.status(200).json(tickets);
  } catch (error) {
    next(error);
  }
};

// Fetch assigned, accepted, escalated, supported, closed tickets of the department

const fetchFilteredTickets = async (req, res, next) => {
  try {
    const { user, roles, departments, company } = req;

    const { flag } = req.params;

    const userDepartments = departments.map((dept) => dept._id.toString());

    let filteredTickets = [];
    switch (flag) {
      case "accept-assign":
        filteredTickets = await filterAcceptedAssignedTickets(
          user,
          roles,
          userDepartments
        );

        break;
      case "accept":
        filteredTickets = await filterAcceptedTickets(
          user,
          roles,
          userDepartments
        );
        break;
      case "assign":
        filteredTickets = await filterAssignedTickets(
          user,
          roles,
          userDepartments
        );
        break;
      case "support":
        filteredTickets = await filterSupportTickets(
          user,
          roles,
          userDepartments
        );
        break;
      case "escalate":
        filteredTickets = await filterEscalatedTickets(roles, userDepartments);
        break;
      case "close":
        filteredTickets = await filterCloseTickets(
          user,
          roles,
          userDepartments
        );
        break;

      default:
        return res
          .status(404)
          .json({ message: "Provided a valid flag to fetch tickets" });
    }
    return res.status(200).json(filteredTickets);
  } catch (error) {
    next(error);
  }
};

const filterMyTickets = async (req, res, next) => {
  const { user } = req;

  try {
    const myTickets = await Ticket.find({ raisedBy: user })
      .select("raisedBy raisedToDepartment status ticket description")
      .populate([
        { path: "raisedBy", select: "firstName lastName" },
        { path: "raisedToDepartment", select: "name" },
      ])
      .lean()
      .exec();

    if (!myTickets.length) {
      return res.status(400).json({ message: "No tickets found" });
    }

    return res.status(200).json(myTickets);
  } catch (error) {
    next(error);
  }
};

const filterTodayTickets = async (req, res, next) => {
  const { user, company } = req;
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // Fetch today's tickets for the logged-in user
    const todayTickets = await Ticket.find({
      raisedBy: user,
      createdAt: { $gte: startOfDay, $lte: endOfDay },
    })
      .select("raisedBy raisedToDepartment status ticket description")
      .populate([
        { path: "raisedBy", select: "firstName lastName" },
        { path: "raisedToDepartment", select: "name" },
      ])
      .lean()
      .exec();

    if (!todayTickets.length) {
      return res.status(200).json([]);
    }

    // Fetch the company's selected departments with ticket issues
    const foundCompany = await Company.findOne({ _id: company })
      .select("selectedDepartments")
      .lean()
      .exec();

    if (!foundCompany) {
      return res.status(400).josn({ message: "Company not found" });
    }

    // Extract the ticket priority from the company's selected departments
    const updatedTickets = todayTickets.map((ticket) => {
      const department = foundCompany.selectedDepartments.find(
        (dept) =>
          dept.department.toString() ===
          ticket.raisedToDepartment?._id.toString()
      );

      let priority = "Low"; // Default priority

      if (department) {
        const issue = department.ticketIssues.find(
          (issue) => issue.title === ticket.ticket
        );

        priority = issue?.priority || "Low";
      }

      // If the issue is not found, check for "Other" and assign its priority
      if (!priority || priority === "Low") {
        const otherIssue = foundCompany.selectedDepartments
          .flatMap((dept) => dept.ticketIssues)
          .find((issue) => issue.title === "Other");

        priority = otherIssue?.priority || "Low";
      }

      return {
        ...ticket,
        priority,
      };
    });

    return res.status(200).json(updatedTickets);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  raiseTicket,
  getTickets,
  acceptTicket,
  rejectTicket,
  assignTicket,
  escalateTicket,
  closeTicket,
  fetchFilteredTickets,
  getSingleUserTickets,
  filterMyTickets,
  filterTodayTickets,
};
