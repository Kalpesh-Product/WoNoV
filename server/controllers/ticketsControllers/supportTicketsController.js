const mongoose = require("mongoose");
const SupportTicket = require("../../models/tickets/supportTickets");
const User = require("../../models/hr/UserData");
const Ticket = require("../../models/tickets/Tickets");
const { createLog } = require("../../utils/moduleLogs");
const CustomError = require("../../utils/customErrorlogs");

const supportTicket = async (req, res, next) => {
  const logPath = "tickets/TicketLog";
  const logAction = "Support Ticket";
  const logSourceKey = "supportTicket";
  const { user, company, ip } = req;

  try {
    const { ticketId, reason } = req.body;

    // Validate user existence
    const foundUser = await User.findOne({ _id: user })
      .select("-refreshToken -password")
      .lean()
      .exec();
    if (!foundUser) {
      throw new CustomError("User not found", logPath, logAction, logSourceKey);
    }

    // Validate reason
    if (!reason || typeof reason !== "string" || reason.length > 150) {
      throw new CustomError(
        "Invalid reason provided",
        logPath,
        logAction,
        logSourceKey
      );
    }

    // Validate ticketId
    if (!mongoose.Types.ObjectId.isValid(ticketId)) {
      throw new CustomError(
        "Invalid ticket ID provided",
        logPath,
        logAction,
        logSourceKey
      );
    }
    const foundTicket = await Ticket.findOne({ _id: ticketId }).lean().exec();
    if (!foundTicket) {
      throw new CustomError(
        "Invalid ticket ID provided",
        logPath,
        logAction,
        logSourceKey
      );
    }

    // Verify the user belongs to a department that has tickets
    const userDepartments = foundUser.departments.map((dept) =>
      dept.toString()
    );
    const foundTickets = await Ticket.find({
      raisedToDepartment: { $in: userDepartments },
    });
    if (!foundTickets.length) {
      throw new CustomError(
        "Tickets not found",
        logPath,
        logAction,
        logSourceKey
      );
    }

    // Update the ticket's status to "Open"
    await Ticket.findByIdAndUpdate(ticketId, { status: "Open" });
    // Create a support ticket record
    const supportTicketDoc = new SupportTicket({
      ticket: ticketId,
      user: user,
      reason: reason,
    });
    await supportTicketDoc.save();

    // Log the successful support ticket creation
    await createLog({
      path: logPath,
      action: logAction,
      remarks: "Support request sent successfully",
      status: "Success",
      user: user,
      ip: ip,
      company: company,
      sourceKey: logSourceKey,
      sourceId: supportTicketDoc._id,
      changes: { reason },
    });

    return res.status(201).json({ message: "Support request sent" });
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

module.exports = { supportTicket };
