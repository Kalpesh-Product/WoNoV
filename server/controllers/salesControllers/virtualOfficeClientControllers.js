const VirtualOfficeClient = require("../../models/sales/VirtualOfficeClient");
const { Readable } = require("stream");
const csvParser = require("csv-parser");
const CustomError = require("../../utils/customErrorlogs");
const { createLog } = require("../../utils/moduleLogs");
const Unit = require("../../models/locations/Unit");
const ClientService = require("../../models/sales/ClientService");

const createVirtualOfficeClient = async (req, res, next) => {
  const logPath = "sales/SalesLog";
  const logAction = "Onboard VirtualOfficeClient";
  const logSourceKey = "client";
  const { user, ip, company } = req;

  try {
    const {
      clientName,
      unit,
      totalTerm,
      termEnd,
      rentStatus,
      pastDueDate,
      annualIncrement,
      nextIncrementDate,
    } = req.body;

    const clientExists = await VirtualOfficeClient.findOne({ clientName });
    if (clientExists) {
      throw new CustomError(
        "VirtualOfficeClient already exists",
        logPath,
        logAction,
        logSourceKey
      );
    }

    if (!mongoose.Types.ObjectId.isValid(service)) {
      throw new CustomError(
        "Invalid service ID provided",
        logPath,
        logAction,
        logSourceKey
      );
    }

    const coworkingService = await ClientService.findOne({ _id: service });

    if (!coworkingService) {
      throw new CustomError(
        "Provide co-working service ID",
        logPath,
        logAction,
        logSourceKey
      );
    }

    if (
      !clientName ||
      !unit ||
      !totalTerm ||
      !termEnd ||
      !rentStatus ||
      !pastDueDate ||
      !annualIncrement ||
      !nextIncrementDate
    ) {
      throw new CustomError(
        "All required fields must be provided",
        logPath,
        logAction,
        logSourceKey
      );
    }

    // if (new Date(startDate) >= new Date(endDate)) {
    //   throw new CustomError(
    //     "Start date must be before end date",
    //     logPath,
    //     logAction,
    //     logSourceKey
    //   );
    // }

    const client = new VirtualOfficeClient({
      company,
      clientName,
      unit,
      totalTerm,
      termEnd,
      rentStatus,
      pastDueDate,
      annualIncrement,
      nextIncrementDate,
    });

    const savedClient = await client.save();
    await createLog({
      path: logPath,
      action: logAction,
      remarks: "VirtualOfficeClient onboarded successfully",
      status: "Success",
      user: user,
      ip: ip,
      company: company,
      sourceKey: logSourceKey,
      sourceId: savedClient._id,
      changes: {
        client: savedClient,
        desks: {
          deskId: newbooking ? newbooking._id : bookingExists._id,
          unit,
        },
      },
    });

    return res
      .status(201)
      .json({ message: "VirtualOffice client onboarded successfully" });
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

const getVirtualOfficeClients = async (req, res, next) => {
  try {
    const { company } = req;
    const { virtualOfficeClientId, unitId } = req.query;

    if (
      virtualOfficeClientId &&
      !mongoose.Types.ObjectId.isValid(virtualOfficeClientId)
    ) {
      return res.status(400).json({ message: "Invalid client ID format" });
    }

    if (unitId && !mongoose.Types.ObjectId.isValid(unitId)) {
      return res.status(400).json({ message: "Invalid unit ID format" });
    }

    let query = { company };

    if (virtualOfficeClientId) {
      query = { _id: virtualOfficeClientId };
    }

    const populateOptions = [
      { path: "service", select: "_id serviceName description" },
    ];

    const clients = await VirtualOfficeClient.find(query)
      .populate(populateOptions)
      .lean()
      .exec();

    if (!clients?.length) {
      return res.status(404).json({ message: "No clients found" });
    }

    const MONTHS_SHORT = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    const groupByMonth = (clients) => {
      const monthMap = new Map();

      clients.forEach(client => {
        const date = new Date(client.createdAt); // or use client.registrationDate
        const month = MONTHS_SHORT[date.getMonth()];
        const year = date.getFullYear().toString().slice(-2);
        const key = `${month}-${year}`;
        const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);

        if (!monthMap.has(key)) {
          monthMap.set(key, {
            month: key,
            date: monthStart,
            clients: []
          });
        }

        monthMap.get(key).clients.push(client);
      });

      return Array.from(monthMap.values())
        .sort((a, b) => a.date - b.date)
        .map(({ date, ...rest }) => rest); // remove internal date before returning
    };

    const transformed = groupByMonth(clients);

    res.status(200).json(transformed);
  } catch (error) {
    next(error);
  }
};


const updateVirtualOfficeClient = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid client ID format" });
    }
    const client = await VirtualOfficeClient.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    }).populate("company unit");
    if (!client) {
      return res
        .status(404)
        .json({ message: "Virtual Office client not found" });
    }
    res
      .status(200)
      .json({ message: "Virtual Office client updated successfully", client });
  } catch (error) {
    next(error);
  }
};

const bulkInsertVirtualOfficeClients = async (req, res, next) => {
  const logPath = "sales/SalesLog";
  const logAction = "Bulk Insert Virtual Office Clients";
  const logSourceKey = "virtualOfficeClient";
  const { company: companyId, user, ip } = req;

  try {
    if (!req.file) {
      throw new Error("No file found");
    }

    const newClients = [];

    await new Promise((resolve, reject) => {
      const stream = Readable.from(req.file.buffer.toString("utf-8").trim());
      stream
        .pipe(csvParser())
        .on("data", (row) => {
          try {
            const clientObj = {
              clientName: row["Client Name"],
              unit: row["Unit"] || null,
              totalTerm: row["Total Term"],
              termEnd: row["Term End"],
              rentDate: new Date(row["Rent Date"]),
              rentStatus: row["Rent Status"],
              pastDueDate: row["Past Due Date"]
                ? new Date(row["Past Due Date"])
                : null,
              nextIncrementDate: row["Next Increment Date"]
                ? new Date(row["Next Increment Date"])
                : null,
              company: companyId,
            };

            newClients.push(clientObj);
          } catch (error) {
            reject(
              new CustomError(error.message, logPath, logAction, logSourceKey)
            );
          }
        })
        .on("end", () => {
          resolve();
        })
        .on("error", (error) => {
          reject(
            new CustomError(error.message, logPath, logAction, logSourceKey)
          );
        });
    });

    if (newClients.length === 0) {
      throw new Error("No valid data found in CSV");
    }

    await VirtualOfficeClient.insertMany(newClients);

    return res.status(201).json({
      message: "Bulk data inserted successfully",
      insertedCount: newClients.length,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createVirtualOfficeClient,
  getVirtualOfficeClients,
  updateVirtualOfficeClient,
  bulkInsertVirtualOfficeClients,
};
