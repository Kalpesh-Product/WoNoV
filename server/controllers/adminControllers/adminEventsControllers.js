const mongoose = require("mongoose");
const AdminEvent = require("../../models/administration/AdminEvents");
const CustomError = require("../../utils/customErrorlogs");
const { createLog } = require("../../utils/moduleLogs");

// Create a new AdminEvent
const createAdminEvent = async (req, res, next) => {
  const logPath = "administration/AdministrationLog";
  const logAction = "Create Event";
  const logSourceKey = "adminEvent";

  try {
    const { title, type, description, start, end, unitId } = req.body;
    const company = req.company;
    const user = req.user;

    const ip = req.ip;

    // Validate required fields
    if (
      !title ||
      !type ||
      !description ||
      isNaN(new Date(start).getTime()) ||
      isNaN(new Date(end).getTime()) ||
      !mongoose.Types.ObjectId.isValid(unitId)
    ) {
      throw new CustomError(
        "Missing or invalid required fields",
        logPath,
        logAction,
        logSourceKey
      );
    }

    // Create the AdminEvent
    const adminEvent = new AdminEvent({
      title,
      type,
      description,
      start: new Date(start),
      end: new Date(end),
      location: unitId,
      company,
    });

    await adminEvent.save();

    // Log the creation event
    await createLog({
      path: logPath,
      action: logAction,
      remarks: "Admin event created successfully",
      status: "Success",
      user,
      ip,
      company,
      sourceKey: logSourceKey,
      sourceId: adminEvent._id,
      changes: req.body,
    });

    return res.status(201).json({
      message: "Admin event created successfully",
      adminEvent,
    });
  } catch (error) {
    next(
      error instanceof CustomError
        ? error
        : new CustomError(error.message, logPath, logAction, logSourceKey, 500)
    );
  }
};

// Get all AdminEvents for the company
const getAdminEvents = async (req, res, next) => {
  const { id } = req.params;
  const company = req.company;
  let adminEvents;
  try {
    if (id) {
      adminEvents = await AdminEvent.findOne({ _id: id, company })
        .lean()
        .exec();

      return res.status(200).json(adminEvents);
    }
    adminEvents = await AdminEvent.find({ company })
      .sort({
        createdAt: -1,
      })
      .lean()
      .exec();
    return res.status(200).json({
      message: "Admin events fetched successfully",
      adminEvents,
    });
  } catch (error) {
    next(error);
  }
};

// Update an AdminEvent by ID
const updateAdminEvent = async (req, res, next) => {
  const logPath = "administration/AdministrationLog";
  const logAction = "Update Event";
  const logSourceKey = "adminEvent";

  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new CustomError(
        "Invalid event Id provided",
        logPath,
        logAction,
        logSourceKey
      );
    }

    // Prepare update data
    const updateData = { ...req.body };
    if (updateData.start) {
      updateData.start = new Date(updateData.start);
    }
    if (updateData.end) {
      updateData.end = new Date(updateData.end);
    }
    if (
      updateData.unitId &&
      !mongoose.Types.ObjectId.isValid(updateData.unitId)
    ) {
      throw new CustomError(
        "Invalid unit Id provided",
        logPath,
        logAction,
        logSourceKey
      );
    }
    if (updateData.unitId) {
      updateData.location = updateData.unitId;
      delete updateData.unitId;
    }

    const adminEvent = await AdminEvent.findByIdAndUpdate(id, updateData, {
      new: true,
    });
    if (!adminEvent) {
      throw new CustomError(
        "Admin event not found",
        logPath,
        logAction,
        logSourceKey
      );
    }

    // Log the update event
    await createLog({
      path: logPath,
      action: logAction,
      remarks: "Admin event updated successfully",
      status: "Success",
      user: req.user,
      ip: req.ip,
      company: req.company,
      sourceKey: logSourceKey,
      sourceId: adminEvent._id,
      changes: updateData,
    });

    return res.status(200).json({
      message: "Admin event updated successfully",
      adminEvent,
    });
  } catch (error) {
    next(
      error instanceof CustomError
        ? error
        : new CustomError(error.message, logPath, logAction, logSourceKey, 500)
    );
  }
};

module.exports = {
  createAdminEvent,
  getAdminEvents,
  updateAdminEvent,
};
