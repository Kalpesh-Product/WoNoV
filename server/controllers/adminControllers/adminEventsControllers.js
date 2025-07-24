const mongoose = require("mongoose");
const AdminEvent = require("../../models/administration/AdminEvents");
const CustomError = require("../../utils/customErrorlogs");
const { createLog } = require("../../utils/moduleLogs");
const { Readable } = require("stream");
const csvParser = require("csv-parser");
const CoworkingClient = require("../../models/sales/CoworkingClient");

// Create a new AdminEvent
const createAdminEvent = async (req, res, next) => {
  const logPath = "administration/AdministrationLog";
  const logAction = "Create Event";
  const logSourceKey = "adminEvent";

  try {
    const { title, type, description, start, end, unitId, clientId } = req.body;
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
      eventName: title,
      eventType: type,
      description,
      fromDate: start ? new Date(start) : null,
      toDate: end ? new Date(end) : null,
      location: unitId,
      clientId,
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
      adminEvents = await AdminEvent.findOne({ _id: id })
        .populate([{ path: "clientId" }])
        .lean()
        .exec();

      return res.status(200).json(adminEvents);
    }
    adminEvents = await AdminEvent.find()
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

const bulkInsertClientEvents = async (req, res, next) => {
  try {
    const file = req.file;
    if (!file) {
      return res
        .status(400)
        .json({ message: "Please upload a valid CSV file." });
    }

    const coworkingClients = await CoworkingClient.find().lean().exec();
    const clientNameToIdMap = new Map(
      coworkingClients.map((client) => [
        client.clientName.trim().toLowerCase(),
        client._id,
      ])
    );

    const stream = Readable.from(file.buffer.toString("utf-8").trim());
    const parsedEvents = [];
    const errors = [];

    let rowNumber = 1;

    stream
      .pipe(csvParser())
      .on("data", (row) => {
        rowNumber++;

        const rawClientName = row["Client Name"]?.trim();
        const clientName = rawClientName?.toLowerCase();
        const clientId = clientNameToIdMap.get(clientName);

        const eventName = row["Event Name"]?.trim();
        const eventType = row["Event Type (Holiday/Event)"]?.trim();
        const description = row["Description"]?.trim() || "";
        const fromDate = new Date(row["From Date"]);
        const toDate = new Date(row["To Date"]);

        // Basic validation
        if (!rawClientName || !clientId) {
          errors.push(
            `Row ${rowNumber}: Invalid or unknown client name: "${rawClientName}"`
          );
          return;
        }
        if (!eventName) {
          errors.push(`Row ${rowNumber}: Event Name is required.`);
          return;
        }
        if (!["Holiday", "Event"].includes(eventType)) {
          errors.push(`Row ${rowNumber}: Invalid Event Type: "${eventType}"`);
          return;
        }
        if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
          errors.push(`Row ${rowNumber}: Invalid From/To Date.`);
          return;
        }

        parsedEvents.push({
          clientId,
          eventName,
          eventType,
          description,
          fromDate,
          toDate,
        });
      })
      .on("end", async () => {
        if (parsedEvents.length === 0) {
          return res.status(400).json({
            message: "No valid client events found in the CSV file.",
            errors,
          });
        }

        try {
          await ClientEvents.insertMany(parsedEvents);
          return res.status(200).json({
            message: "Client events inserted successfully.",
            insertedCount: parsedEvents.length,
            errors: errors.length ? errors : undefined,
          });
        } catch (insertErr) {
          console.error("Insert error:", insertErr);
          return res.status(500).json({
            message: "Failed to insert events into the database.",
            error: insertErr.message,
          });
        }
      })
      .on("error", (parseErr) => {
        console.error("CSV parsing error:", parseErr);
        return res.status(500).json({
          message: "Failed to parse CSV file.",
          error: parseErr.message,
        });
      });
  } catch (error) {
    next(error);
  }
};
module.exports = {
  createAdminEvent,
  getAdminEvents,
  updateAdminEvent,
  bulkInsertClientEvents,
};
