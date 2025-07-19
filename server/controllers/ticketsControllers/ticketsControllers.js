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
const UserData = require("../../models/hr/UserData");
const emitter = require("../../utils/eventEmitter");

const raiseTicket = async (req, res, next) => {
  const logPath = "tickets/TicketLog";
  const logAction = "Raise Ticket";
  const logSourceKey = "ticket";
  const { departmentId, title, description } = req.body;
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
        "Description should not exceed 100 characters.",
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
    let ticketTitle = title;

    if (typeof title !== "string") {
      if (!mongoose.Types.ObjectId.isValid(title)) {
        throw new CustomError(
          "Invalid title Id provided",
          logPath,
          logAction,
          logSourceKey
        );
      }

      foundIssue = department?.ticketIssues?.find(
        (ticketIssue) => ticketIssue._id.toString() === title
      );

      if (!foundIssue) {
        throw new CustomError(
          "Issue not found",
          logPath,
          logAction,
          logSourceKey
        );
      }
      ticketTitle = foundIssue.title;
    }

    // Handle "Other" ticket issue case
    // let ticketTitle;
    // if (foundIssue && foundIssue.title === "Other") {
    //   // if (!newIssue || typeof newIssue !== "string" || !newIssue.trim()) {
    //   //   throw new CustomError(
    //   //     "You must specify a title for the 'Other' issue",
    //   //     logPath,
    //   //     logAction,
    //   //     logSourceKey
    //   //   );
    //   // }
    //   // ticketTitle = newIssue;
    //   const newTicketIssue = new NewTicketIssue({
    //     company: req.company,
    //     raisedBy: user,
    //     departmentId,
    //     issueTitle: newIssue,
    //     status: "Pending",
    //   });
    //   await newTicketIssue.save();
    // } else {
    //   ticketTitle = foundIssue ? foundIssue.title : newIssue;
    // }

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

    // Populate the user data

    const userDetails = await UserData.findById({
      _id: user,
    });

    const deptEmployees = await UserData.find({
      departments: { $in: departmentId },
    });
    console.log(departmentId);

    const employeeIds = deptEmployees.map((emp) => emp._id);

    // * Emit notification event for ticket creation *
    emitter.emit("notification", {
      initiatorData: user, // user._id is expected if used downstream
      users: deptEmployees.map((emp) => ({
        userActions: {
          whichUser: emp._id, // send to department admin or fallback to self
          hasRead: false,
        },
      })),
      type: "raise ticket",
      module: "Tickets",
      message: `A new ticket "${ticketTitle}" was raised by ${userDetails.firstName} ${userDetails.lastName} in ${foundDepartment.name} department.`,
    });

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

const updateOtherTicket = async (req, res, next) => {
  const logPath = "tickets/TicketLog";
  const logAction = "Update Ticket";
  const logSourceKey = "ticket";
  //Update other ticket title
  const { user, company, ip } = req;
  const { ticketId, ticketTitle } = req.body;
  try {
    if (!ticketId) {
      return res.status(200).json({ message: "ticket ID is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(ticketId)) {
      throw new CustomError(
        "Invalid ticket ID provided",
        logPath,
        logAction,
        logSourceKey
      );
    }

    const foundTicket = await Ticket.findById({ _id: ticketId });

    if (!foundTicket) {
      throw new CustomError(
        "Ticket not found",
        logPath,
        logAction,
        logSourceKey
      );
    }

    const updatedTicket = await Ticket.findByIdAndUpdate(
      { _id: ticketId },
      { ticket: ticketTitle },
      { new: true }
    );

    if (!updatedTicket) {
      throw new CustomError(
        "Failed to update ticket",
        logPath,
        logAction,
        logSourceKey
      );
    }

    await createLog({
      path: logPath,
      action: logAction,
      remarks: "Ticket updated successfully",
      status: "Success",
      user: user,
      ip: ip,
      company: company,
      sourceKey: logSourceKey,
      sourceId: updatedTicket._id,
      changes: {
        prevTicketTitle: foundTicket.ticket,
        currTicketTitle: ticketTitle,
      },
    });

    return res.status(200).json({ message: "Ticket updated successfully" });
  } catch (error) {
    error instanceof CustomError
      ? next(error)
      : next(
          new CustomError(error.message, logPath, logAction, logSourceKey, 500)
        );
  }
};

const getTickets = async (req, res, next) => {
  try {
    const { departmentId } = req.params;
    const { company } = req;

    if (!departmentId) {
      return res.status(400).json({ message: "Missing department ID" });
    }
    if (!mongoose.Types.ObjectId.isValid(departmentId)) {
      return res
        .status(400)
        .json({ message: "Invalid department ID provided" });
    }

    const foundDepartment = await Department.findById({ _id: departmentId });

    if (!foundDepartment) {
      return res.status(400).json({ message: "Department not found" });
    }

    const foundCompany = await Company.findOne({ _id: company })
      .select("selectedDepartments")
      .lean()
      .exec();

    if (!foundCompany) {
      return res.status(400).json({ message: "Company not found" });
    }

    let matchingTickets = await Tickets.find({
      $or: [
        { raisedToDepartment: { $in: departmentId } },
        { escalatedTo: { $in: departmentId } },
      ],
      acceptedBy: { $exists: false },
      company: company,
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

    if (!matchingTickets.length) {
      return res.status(200).json(matchingTickets);
    }

    // 🎯 Add priority logic here
    const ticketsWithPriority = matchingTickets.map((ticket) => {
      const department = foundCompany.selectedDepartments.find(
        (dept) =>
          dept.department.toString() ===
          ticket.raisedToDepartment?._id.toString()
      );

      let priority = "Low"; // Default

      if (department) {
        const issue = department?.ticketIssues?.find(
          (issue) => issue.title === ticket.ticket
        );
        priority = issue?.priority || "High";
      }

      // If still "Low" or no match, look for "Other"
      if (!priority || priority === "Low") {
        const otherIssue = foundCompany.selectedDepartments
          .flatMap((dept) => dept?.ticketIssues)
          .find((issue) => issue.title === "Other");

        priority = otherIssue?.priority || "Low";
      }

      return {
        ...ticket,
        priority,
      };
    });

    return res.status(200).json(ticketsWithPriority);
  } catch (error) {
    next(error);
  }
};

const getAllDeptTickets = async (req, res, next) => {
  try {
    const { roles, departments, company } = req;

    let departmentMap = new Map();

    const query = { company };

    if (!roles.includes("Master Admin") && !roles.includes("Super Admin")) {
      query.raisedToDepartment = { $in: departments };
    }

    const tickets = await Tickets.find(query)
      .populate([{ path: "raisedToDepartment", select: "name" }])
      .select("-company")
      .lean();

    tickets.forEach((ticket) => {
      const dept = ticket.raisedToDepartment || "Unknown";

      if (!departmentMap.has(dept)) {
        departmentMap.set(dept, {
          department: dept,
          totalTickets: 0,
          openTickets: 0,
          closedTickets: 0,
        });
      }

      const department = departmentMap.get(dept);
      department.totalTickets++;
      if (ticket.status === "Open") department.openTickets++;
      if (ticket.status === "Closed") department.closedTickets++;
    });

    const result = Array.from(departmentMap.values());

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const getTeamMemberTickets = async (req, res, next) => {
  try {
    const { company, departments, roles } = req;
    const { departmentId } = req.params;
    const query = { company };

    const allValid = departments.every((dept) =>
      mongoose.Types.ObjectId.isValid(dept._id)
    );

    if (!allValid) {
      return res
        .status(400)
        .json({ message: "One or more department IDs are invalid" });
    }

    const departmentIds = departments.map(
      (dept) => new mongoose.Types.ObjectId(dept._id)
    );

    const teamMembers = await UserData.find({
      departments: { $in: departmentIds },
      isActive: true,
    })
      .populate([
        { path: "role", select: "roleTitle" },
        { path: "departments", select: "name" },
      ])
      .select("firstName middleName lastName email");

    const teamMemberIds = teamMembers.map((member) => member._id);

    const tickets = await Tickets.find({
      company,
      raisedToDepartment: { $in: departmentIds },
    })
      .populate([
        { path: "raisedToDepartment", select: "name" },
        {
          path: "raisedBy",
          select: "firstName middleName lastName departments",
          populate: { path: "role", select: "roleTitle" },
        },
        {
          path: "assignees",
          select: "firstName middleName lastName",
          populate: { path: "role", select: "roleTitle" },
        },
        {
          path: "closedBy",
          select: "firstName middleName lastName",
          populate: { path: "role", select: "roleTitle" },
        },
      ])
      .select("-company")
      .lean();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const transformedDeptTickets = teamMembers.map((member, index) => {
      const memberId = member._id.toString();

      const relevantAssignedTickets = tickets.filter((ticket) =>
        ticket.assignees.some(
          (assignee) => assignee._id.toString() === memberId
        )
      );
      const relevantAcceptedTickets = tickets.filter(
        (ticket) =>
          ticket.acceptedBy &&
          ticket.acceptedBy.toString() === memberId &&
          ticket.status === "Closed"
      );

      const totalassigned = relevantAssignedTickets.length;

      const totalresolved =
        relevantAssignedTickets.filter((ticket) => ticket.status === "Closed")
          .length + relevantAcceptedTickets.length;

      const assignedToday = relevantAssignedTickets.filter((ticket) => {
        const createdAt = new Date(ticket.createdAt);
        return createdAt >= today;
      }).length;

      return {
        name: `${member.firstName} ${member.middleName || ""} ${
          member.lastName
        }`.trim(),
        _id: member._id,
        department: member.departments.map((dept) => dept.name),
        role: member.role.map((r) => r.roleTitle),
        email: member.email,
        assignedToday,
        totalassigned,
        totalresolved,
      };
    });

    return res.status(200).json(transformedDeptTickets);
  } catch (error) {
    next(error);
  }
};

const getAllTickets = async (req, res, next) => {
  try {
    const { user, roles, departments, company } = req;

    const query = { company };
    const departmentIds = departments.map(
      (dept) => new mongoose.Types.ObjectId(dept._id)
    );

    if (!roles.includes("Master Admin") && !roles.includes("Super Admin")) {
      query.raisedToDepartment = { $in: departmentIds };
    }

    matchingTickets = await Tickets.find(query)
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
        { path: "acceptedBy", select: "firstName middleName lastName" },
        { path: "closedBy", select: "firstName middleName lastName" },
        { path: "assignees", select: "firstName middleName lastName" },
      ])
      .lean()
      .exec();

    if (!matchingTickets.length) {
      return res.status(400).json({ message: "No tickets found" });
    }

    //Get pre-defined tickets
    const foundCompany = await Company.findOne({ _id: company })
      .select("selectedDepartments")
      .lean()
      .exec();

    if (!foundCompany) {
      return res.status(400).josn({ message: "Company not found" });
    }

    // Extract the ticket priority from the company's selected departments
    const updatedTickets = matchingTickets.map((ticket) => {
      let updatedTicket = { ...ticket };

      foundCompany.selectedDepartments.forEach((dept) => {
        dept?.ticketIssues?.forEach((issue) => {
          if (issue.title.toLowerCase() === ticket.ticket.toLowerCase()) {
            updatedTicket.priority = issue.priority;
          }
        });
      });

      return updatedTicket;
    });

    return res.status(200).json(updatedTickets);
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
      {
        acceptedBy: user,
        status: "In Progress",
        acceptedAt: new Date(),
      },
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
    const { reason } = req.body;

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

    // Update the ticket by marking it as rejected and storing reason
    const updatedTicket = await Tickets.findByIdAndUpdate(
      ticketId,
      {
        status: "Rejected",
        reject: {
          rejectedBy: user,
          reason: reason,
        },
      },
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

    // Log the successful ticket rejection
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
      changes: {
        status: "Rejected",
        reject: {
          rejectedBy: user,
          reason: reason,
        },
      },
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
      {
        $addToSet: { assignees: assignees },
        status: "In Progress",
        assignedAt: new Date(),
      },
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

const ticketData = async (req, res, next) => {
  try {
    const { company, departments, roles } = req;
    const { departmentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(departmentId)) {
      return res
        .status(400)
        .json({ message: "Invalid department ID provided" });
    }

    // Check if user has Master Admin role
    // const isMasterAdmin = roles?.includes("Master Admin");

    // const query = {
    //   company,
    //   ...(isMasterAdmin ? {} : { raisedToDepartment: { $in: [departmentId] } }),
    // };

    const tickets = await Ticket.find({
      company,
      raisedToDepartment: { $in: [departmentId] },
    })
      .populate([
        { path: "raisedBy", select: "firstName lastName" },
        { path: "raisedToDepartment", select: "name" },
        { path: "acceptedBy", select: "firstName lastName email" },
        { path: "closedBy", select: "firstName lastName email" },
        { path: "assignees", select: "firstName lastName email" },
        { path: "company", select: "companyName" },
        { path: "reject.rejectedBy", select: "firstName lastName email" },
      ])
      .lean()
      .exec();

    const foundCompany = await Company.findOne({ _id: company })
      .select("selectedDepartments")
      .lean()
      .exec();

    if (!foundCompany) {
      return res.status(400).json({ message: "Company not found" }); // fixed typo "josn" -> "json"
    }

    // Extract the ticket priority from the company's selected departments
    const updatedTickets = tickets.map((ticket) => {
      let updatedTicket = { ...ticket };

      foundCompany.selectedDepartments.forEach((dept) => {
        dept?.ticketIssues?.forEach((issue) => {
          if (issue.title.toLowerCase() === ticket.ticket.toLowerCase()) {
            updatedTicket.priority = issue.priority;
          }
        });
      });

      return updatedTicket;
    });

    res.status(200).json(updatedTickets);
  } catch (error) {
    next(error);
  }
};

const escalateTicket = async (req, res, next) => {
  const logPath = "tickets/TicketLog";
  const logAction = "Escalate Ticket";
  const logSourceKey = "ticket";
  const { user, company, ip } = req;
  const { ticketId, description, departmentIds } = req.body;

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

    if (!Array.isArray(departmentIds) || departmentIds.length === 0) {
      throw new CustomError(
        "At least one department ID must be provided",
        logPath,
        logAction,
        logSourceKey
      );
    }

    for (const deptId of departmentIds) {
      if (!mongoose.Types.ObjectId.isValid(deptId)) {
        throw new CustomError(
          "Invalid Department ID provided",
          logPath,
          logAction,
          logSourceKey
        );
      }
    }

    const foundDepartments = await Department.find({
      _id: { $in: departmentIds },
    })
      .lean()
      .exec();
    if (foundDepartments.length !== departmentIds.length) {
      throw new CustomError(
        "One or more departments do not exist",
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

    const escalatedTicketIds = [];

    for (const deptId of departmentIds) {
      const newTicket = new Ticket({
        ticket: foundTicket.ticket,
        description,
        raisedToDepartment: deptId,
        raisedBy: user,
        company,
        image: foundTicket.image || null,
      });

      const savedTicket = await newTicket.save();
      escalatedTicketIds.push(savedTicket._id);
    }

    const updatedTicket = await Tickets.findByIdAndUpdate(
      ticketId,
      {
        $push: { escalatedTo: { $each: escalatedTicketIds } },
        $set: { status: "Escalated", escalatededAt: new Date() },
      },
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

    await createLog({
      path: logPath,
      action: logAction,
      remarks: "Ticket escalated successfully",
      status: "Success",
      user,
      ip,
      company,
      sourceKey: logSourceKey,
      sourceId: updatedTicket._id,
      changes: { escalatedTo: escalatedTicketIds, escalatedBy: user },
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
      { status: "Closed", closedAt: new Date(), closedBy: user },
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

    // const { flag } = req.query;
    const { flag, dept } = req.params;

    if (!mongoose.Types.ObjectId.isValid(dept)) {
      return res.status(400).json({ error: "Invalid department ID" });
    }

    const department = dept;

    let filteredTickets = [];
    switch (flag) {
      case "accept-assign":
        filteredTickets = await filterAcceptedAssignedTickets(
          user,
          roles,
          department,
          company
        );

        break;
      case "accept":
        filteredTickets = await filterAcceptedTickets(
          user,
          roles,
          department,
          company
        );
        break;
      case "assign":
        filteredTickets = await filterAssignedTickets(
          user,
          roles,
          department,
          company
        );
        break;
      case "support":
        filteredTickets = await filterSupportTickets(
          user,
          roles,
          department,
          company
        );
        break;
      case "escalate":
        filteredTickets = await filterEscalatedTickets(
          roles,
          department,
          company
        );
        break;
      case "close":
        filteredTickets = await filterCloseTickets(
          user,
          roles,
          department,
          company
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
  const { user, company } = req;

  try {
    const myTickets = await Ticket.find({ raisedBy: user })
      .select(
        "raisedBy raisedToDepartment status ticket description reject acceptedAt image createdAt"
      )
      .populate([
        { path: "raisedBy", select: "firstName lastName" },
        { path: "raisedToDepartment", select: "name" },
        { path: "reject.rejectedBy", select: "firstName lastName email" },
        { path: "acceptedBy", select: "firstName lastName email" },
        { path: "closedBy", select: "firstName lastName email" },
      ])
      .lean()
      .exec();

    if (!myTickets.length) {
      return res.status(200).json([]);
    }

    const foundCompany = await Company.findOne({ _id: company })
      .select("selectedDepartments")
      .lean()
      .exec();

    if (!foundCompany) {
      return res.status(400).josn({ message: "Company not found" });
    }

    // Extract the ticket priority from the company's selected departments
    const updatedTickets = myTickets.map((ticket) => {
      const department = foundCompany.selectedDepartments.find(
        (dept) =>
          dept.department.toString() ===
          ticket.raisedToDepartment?._id.toString()
      );

      let priority = "Low"; // Default priority

      if (department) {
        const issue = department?.ticketIssues?.find(
          (issue) => issue.title === ticket.ticket
        );

        priority = issue?.priority || "High";
      }

      // If the issue is not found, check for "Other" and assign its priority
      if (!priority || priority === "Low") {
        const otherIssue = foundCompany.selectedDepartments
          .flatMap((dept) => dept?.ticketIssues)
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
        { path: "acceptedBy", select: "firstName middleName lastName" },
        { path: "closedBy", select: "firstName middleName lastName" },
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
        const issue = department?.ticketIssues?.find(
          (issue) => issue.title === ticket.ticket
        );

        priority = issue?.priority || "High";
      }

      // If the issue is not found, check for "Other" and assign its priority
      if (!priority || priority === "Low") {
        const otherIssue = foundCompany.selectedDepartments
          .flatMap((dept) => dept?.ticketIssues)
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

const getOtherTickets = async (req, res, next) => {
  const { user, company } = req;
  const { department } = req.params;
  try {
    // Fetch today's tickets for the logged-in user
    const tickets = await Ticket.find({
      company,
      raisedToDepartment: { $in: [department] },
      status: "Closed",
    })
      .select("raisedBy raisedToDepartment status ticket description")
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
        ,
        { path: "raisedToDepartment", select: "name" },
      ])
      .lean()
      .exec();

    if (!tickets.length) {
      return res.status(200).json([]);
    }

    const foundOtherTickets = tickets.filter(
      (ticket) => ticket.ticket === "Other"
    );

    return res.status(200).json(foundOtherTickets);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  raiseTicket,
  getTickets,
  getAllTickets,
  acceptTicket,
  rejectTicket,
  assignTicket,
  escalateTicket,
  closeTicket,
  fetchFilteredTickets,
  getSingleUserTickets,
  filterMyTickets,
  filterTodayTickets,
  ticketData,
  getOtherTickets,
  getAllDeptTickets,
  getTeamMemberTickets,
  updateOtherTicket,
};
