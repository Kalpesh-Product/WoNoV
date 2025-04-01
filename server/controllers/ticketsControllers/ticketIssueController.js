const mongoose = require("mongoose");
const Company = require("../../models/hr/Company");
const User = require("../../models/hr/UserData");
const { createLog } = require("../../utils/moduleLogs");
const CustomError = require("../../utils/customErrorlogs");
const NewTicketIssue = require("../../models/tickets/NewTicketIssue");

const addTicketIssue = async (req, res, next) => {
  const logPath = "hr/HrLog";
  const logAction = "Add Ticket Issue";
  const logSourceKey = "companyData";
  const { user, company, ip } = req;

  try {
    const { title, department, priority = "Low" } = req.body;

    if (!title) {
      throw new CustomError(
        "Title is required",
        logPath,
        logAction,
        logSourceKey
      );
    }

    // Retrieve the user to get company info
    const foundUser = await User.findOne({ _id: user })
      .select("company")
      .lean()
      .exec();

    if (!mongoose.Types.ObjectId.isValid(department)) {
      throw new CustomError(
        "Invalid department ID provided",
        logPath,
        logAction,
        logSourceKey
      );
    }

    // Update the department's ticketIssues array atomically
    const updatedCompany = await Company.findOneAndUpdate(
      {
        $and: [
          { _id: foundUser.company },
          { "selectedDepartments.department": department },
        ],
      },
      {
        $push: {
          "selectedDepartments.$.ticketIssues": { title, priority },
        },
      },
      { new: true }
    );

    if (!updatedCompany) {
      throw new CustomError(
        "Department not found in any company",
        logPath,
        logAction,
        logSourceKey
      );
    }

    await createLog({
      path: logPath,
      action: logAction,
      remarks: "New issue added successfully",
      status: "Success",
      user: user,
      ip: ip,
      company: company,
      sourceKey: logSourceKey,
      sourceId: null,
      changes: { title, priority, department },
    });

    return res.status(201).json({ message: "New issue added successfully" });
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

const getTicketIssues = async (req, res, next) => {
  try {
    const { department } = req.params;

    if (!mongoose.Types.ObjectId.isValid(department)) {
      return res
        .status(400)
        .json({ message: "Invalid department ID provided" });
    }

    // Find the company containing the department and retrieve the ticket issues
    const company = await Company.findOne(
      { "selectedDepartments.department": department },
      { "selectedDepartments.$": 1 }
    ).lean();

    if (!company || !company.selectedDepartments.length) {
      return res
        .status(404)
        .json({ message: "Department not found in any company" });
    }

    const ticketIssues = company.selectedDepartments[0].ticketIssues || [];

    if (ticketIssues.length === 0) {
      return res.status(204).send();
    }

    return res.status(200).json(ticketIssues);
  } catch (error) {
    next(error);
  }
};

const getNewTicketIssues = async (req, res, next) => {
  try {
    const { department } = req.params;

    if (!mongoose.Types.ObjectId.isValid(department)) {
      return res
        .status(400)
        .json({ message: "Invalid department ID provided" });
    }

    const newTicketIssues = await NewTicketIssue.find({
      departmentId: department,
    })
      .populate("raisedBy", "firstName lastName _id")
      .populate("departmentId", "name");

    if (!newTicketIssues) {
      return res.status(400).json({ message: "No new ticket issues found" });
    }

    const transformNewTicketIssues = newTicketIssues.map((issue) => {
      return {
        raisedBy: `${issue.raisedBy.firstName} ${issue.raisedBy.lastName}`,
        department: issue.departmentId.name,
        title: issue.issueTitle,
        status: issue.status,
      };
    });

    return res.status(200).json(transformNewTicketIssues);
  } catch (error) {
    next(error);
  }
};

const rejectTicketIssue = async (req, res, n) => {
  const logPath = "tickets/TicketLog";
  const logAction = "Reject New Ticket";
  const logSourceKey = "newTicket";

  try {
    const { id: ticketId } = req.params;
    const { user, company, ip } = req;

    if (!mongoose.Types.ObjectId.isValid(ticketId)) {
      throw new CustomError(
        "Invalid ticket ID provided",
        logPath,
        logAction,
        logSourceKey
      );
    }

    const rejectedTicket = await NewTicketIssue.findByIdAndDelete({
      _id: ticketId,
    });

    if (!rejectedTicket) {
      throw new CustomError(
        "Faield to reject ticket",
        logPath,
        logAction,
        logSourceKey
      );
    }

    await createLog({
      path: logPath,
      action: logAction,
      remarks: "Ticket rejected successfully",
      status: "Success",
      user: user,
      ip: ip,
      company: company,
      sourceKey: logSourceKey,
      sourceId: rejectedTicket._id,
      changes: rejectedTicket,
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

module.exports = {
  addTicketIssue,
  getTicketIssues,
  getNewTicketIssues,
  rejectTicketIssue,
};
