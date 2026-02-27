const VirtualOfficeClient = require("../../models/sales/VirtualOfficeClient");
const { Readable } = require("stream");
const csvParser = require("csv-parser");
const CustomError = require("../../utils/customErrorlogs");
const { createLog } = require("../../utils/moduleLogs");
const Unit = require("../../models/locations/Unit");
const ClientService = require("../../models/sales/ClientService");
const { default: mongoose } = require("mongoose");

const isValidEmail = (email = "") => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isValidPhone = (phone = "") => {
  const p = String(phone).trim();
  return /^[0-9+\-\s()]{8,20}$/.test(p);
};

const toDateOrNull = (v) => {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
};

const createVirtualOfficeClient = async (req, res) => {
  try {
    const data = req.body;
    const { company } = req;
    // Required core fields
    const requiredFields = [
      "clientName",
      "email",
      "phone",
      "sector",
      "state",
      "city",
      "unit",
      "termStartDate",
      "termEnd",
      "lockInPeriodMonths",
      "rentDate",
    ];

    for (const f of requiredFields) {
      if (
        data[f] === undefined ||
        data[f] === null ||
        String(data[f]).trim() === ""
      ) {
        return res.status(400).json({ message: `${f} is required` });
      }
    }

    const clientExists = await VirtualOfficeClient.findOne({
      clientName: data.clientName,
    });

    if (clientExists) {
      return res.status(400).json({ message: "Client already exists" });
    }

    const service = await ClientService.findOne({
      serviceName: "Virtual Office",
    });

    if (!service) {
      return res
        .status(404)
        .json({ message: "Virtual office service doesn't exists" });
    }

    // Client email/phone validation
    if (!isValidEmail(data.email)) {
      return res.status(400).json({ message: "Invalid client email format" });
    }
    if (!isValidPhone(data.phone)) {
      return res.status(400).json({ message: "Invalid client phone number" });
    }

    // Dates validation
    const termStartDate = toDateOrNull(data.termStartDate);
    const termEnd = toDateOrNull(data.termEnd);
    const rentDate = toDateOrNull(data.rentDate);
    const nextIncrementDateFromBody = toDateOrNull(data.nextIncrementDate);

    if (!termStartDate)
      return res.status(400).json({ message: "Invalid termStartDate" });
    if (!termEnd) return res.status(400).json({ message: "Invalid termEnd" });
    if (!rentDate) return res.status(400).json({ message: "Invalid rentDate" });

    if (termStartDate >= termEnd) {
      return res.status(400).json({
        message: "termEnd must be after termStartDate",
      });
    }

    if (rentDate < termStartDate) {
      return res.status(400).json({
        message: "rentDate cannot be before termStartDate",
      });
    }

    const lockIn = Number(data.lockInPeriodMonths);
    if (!Number.isFinite(lockIn) || lockIn < 1) {
      return res
        .status(400)
        .json({ message: "lockInPeriodMonths must be >= 1" });
    }

    // Desk numbers validation
    const cabinDesks = Number(data.cabinDesks || 0);
    const cabinDeskRate = Number(data.cabinDeskRate || 0);
    const openDesks = Number(data.openDesks || 0);
    const openDeskRate = Number(data.openDeskRate || 0);
    const perDeskMeetingCredits = Number(data.perDeskMeetingCredits || 0);
    const annualIncrement = Number(data.annualIncrement || 0);

    const numericFields = [
      ["cabinDesks", cabinDesks],
      ["cabinDeskRate", cabinDeskRate],
      ["openDesks", openDesks],
      ["openDeskRate", openDeskRate],
      ["perDeskMeetingCredits", perDeskMeetingCredits],
      ["annualIncrement", annualIncrement],
    ];

    for (const [name, val] of numericFields) {
      if (!Number.isFinite(val) || val < 0) {
        return res
          .status(400)
          .json({ message: `${name} must be a number >= 0` });
      }
    }

    // ✅ POC validations (Local + HO)
    const localPoc = data.localPoc || {};
    const hoPoc = data.hoPoc || {};

    // If any localPoc field provided, require name+email+phone to be valid
    const localProvided = Boolean(
      localPoc.name || localPoc.email || localPoc.phone,
    );
    if (localProvided) {
      if (!localPoc.name || String(localPoc.name).trim().length < 2) {
        return res
          .status(400)
          .json({ message: "localPoc.name is required (min 2 chars)" });
      }
      if (!localPoc.email || !isValidEmail(localPoc.email)) {
        return res.status(400).json({ message: "localPoc.email is invalid" });
      }
      if (!localPoc.phone || !isValidPhone(localPoc.phone)) {
        return res.status(400).json({ message: "localPoc.phone is invalid" });
      }
    }

    // If any hoPoc field provided, require name+email+phone to be valid
    const hoProvided = Boolean(hoPoc.name || hoPoc.email || hoPoc.phone);
    if (hoProvided) {
      if (!hoPoc.name || String(hoPoc.name).trim().length < 2) {
        return res
          .status(400)
          .json({ message: "hoPoc.name is required (min 2 chars)" });
      }
      if (!hoPoc.email || !isValidEmail(hoPoc.email)) {
        return res.status(400).json({ message: "hoPoc.email is invalid" });
      }
      if (!hoPoc.phone || !isValidPhone(hoPoc.phone)) {
        return res.status(400).json({ message: "hoPoc.phone is invalid" });
      }
    }

    // Auto totals
    const cabinTotal = cabinDesks * cabinDeskRate;
    const openTotal = openDesks * openDeskRate;
    const totalMeetingCredits =
      (cabinDesks + openDesks) * perDeskMeetingCredits;

    // Next increment date logic:
    // - if annualIncrement > 0 and nextIncrementDate not provided, set +1 year from rentDate
    // - if provided, validate it is >= rentDate
    let nextIncrementDate = nextIncrementDateFromBody;

    if (!nextIncrementDate && annualIncrement > 0) {
      nextIncrementDate = new Date(rentDate);
      nextIncrementDate.setFullYear(nextIncrementDate.getFullYear() + 1);
    }

    if (nextIncrementDate && nextIncrementDate < rentDate) {
      return res.status(400).json({
        message: "nextIncrementDate cannot be before rentDate",
      });
    }

    const doc = await VirtualOfficeClient.create({
      ...data,
      cabinDesks,
      cabinDeskRate,
      cabinTotal,
      openDesks,
      openDeskRate,
      openTotal,
      annualIncrement,
      perDeskMeetingCredits,
      totalMeetingCredits,
      termStartDate,
      termEnd,
      rentDate,
      nextIncrementDate,
      localPoc: localProvided ? localPoc : undefined,
      hoPoc: hoProvided ? hoPoc : undefined,
      service: service._id,
      company,
    });

    return res.status(201).json({
      message: "Virtual Office Client created successfully",
      data: doc,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Server Error",
      error: err.message,
    });
  }
};

const getVirtualOfficeClients = async (req, res, next) => {
  try {
    const { company } = req;
    const { virtualofficeclientid, unitId, active, rentStatus } = req.query;

    // Validate IDs
    if (
      virtualofficeclientid &&
      !mongoose.Types.ObjectId.isValid(virtualofficeclientid)
    ) {
      return res.status(400).json({ message: "Invalid client ID format" });
    }

    if (unitId && !mongoose.Types.ObjectId.isValid(unitId)) {
      return res.status(400).json({ message: "Invalid unit ID format" });
    }

    // Optional: if you still want to ensure units exist like coworking controller
    const units = await Unit.find({ company }).populate({
      path: "building",
      select: "buildingName",
    });

    if (!units?.length) {
      return res.status(400).json({ message: "No unit found" });
    }

    // Base query must always include company (multi-tenant sanity)
    let query = { company };

    if (virtualofficeclientid) {
      query._id = virtualofficeclientid;
    } else {
      if (unitId) query.unit = unitId;

      if (active !== undefined) {
        // active=true/false maps to clientStatus boolean
        query.clientStatus = active === "true";
      }

      if (rentStatus) {
        query.rentStatus = rentStatus; // "Active" | "Expired" | "Terminated" | "Not Active"
      }
    }

    const populateOptions = [
      {
        path: "unit",
        select: "_id unitName unitNo cabinDesks openDesks",
        populate: {
          path: "building",
          select: "_id buildingName fullAddress",
        },
      },
    ];

    const clients = await VirtualOfficeClient.find(query)
      .populate(populateOptions)
      .lean()
      .exec();

    if (!clients?.length) {
      return res.status(404).json({ message: "No clients found" });
    }

    return res.status(200).json(clients);
  } catch (error) {
    next(error);
  }
};

const getVirtualOfficeClientsByMonth = async (req, res, next) => {
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
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const groupByMonth = (clients) => {
      const monthMap = new Map();

      clients.forEach((client) => {
        const date = new Date(client.createdAt); // or use client.registrationDate
        const month = MONTHS_SHORT[date.getMonth()];
        const year = date.getFullYear().toString().slice(-2);
        const key = `${month}-${year}`;
        const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);

        if (!monthMap.has(key)) {
          monthMap.set(key, {
            month: key,
            date: monthStart,
            clients: [],
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

const updateVirtualOfficeClient = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    const existing = await VirtualOfficeClient.findById(id).lean();
    if (!existing) {
      return res
        .status(404)
        .json({ message: "Virtual Office client not found" });
    }

    const clientExists = await VirtualOfficeClient.findOne({
      clientName: updates.clientName,
      _id: { $ne: id },
    });

    if (clientExists) {
      return res.status(400).json({ message: "Client already exists" });
    }

    // ✅ Basic validations if provided
    if (updates.email && !isValidEmail(updates.email)) {
      return res.status(400).json({ message: "Invalid client email format" });
    }
    if (updates.phone && !isValidPhone(updates.phone)) {
      return res.status(400).json({ message: "Invalid client phone number" });
    }

    // ✅ Date validations (only if relevant fields are being updated)
    const termStartDate = updates.termStartDate
      ? toDateOrNull(updates.termStartDate)
      : toDateOrNull(existing.termStartDate);

    const termEnd = updates.termEnd
      ? toDateOrNull(updates.termEnd)
      : toDateOrNull(existing.termEnd);

    const rentDate = updates.rentDate
      ? toDateOrNull(updates.rentDate)
      : toDateOrNull(existing.rentDate);

    if (!termStartDate)
      return res.status(400).json({ message: "Invalid termStartDate" });
    if (!termEnd) return res.status(400).json({ message: "Invalid termEnd" });
    if (!rentDate) return res.status(400).json({ message: "Invalid rentDate" });

    if (termStartDate >= termEnd) {
      return res
        .status(400)
        .json({ message: "termEnd must be after termStartDate" });
    }

    if (rentDate < termStartDate) {
      return res
        .status(400)
        .json({ message: "rentDate cannot be before termStartDate" });
    }

    // ✅ lockInPeriodMonths if updated
    if (typeof updates.lockInPeriodMonths !== "undefined") {
      const lockIn = Number(updates.lockInPeriodMonths);
      if (!Number.isFinite(lockIn) || lockIn < 1) {
        return res
          .status(400)
          .json({ message: "lockInPeriodMonths must be >= 1" });
      }
      updates.lockInPeriodMonths = lockIn;
    }

    // ✅ POC validations (Local + HO) (conditional but strict)
    const incomingLocalPoc = updates.localPoc;
    const incomingHoPoc = updates.hoPoc;

    // Helper to merge partial nested updates safely
    const mergePoc = (existingPoc = {}, incomingPoc = {}) => ({
      name:
        typeof incomingPoc.name !== "undefined"
          ? incomingPoc.name
          : existingPoc.name,
      email:
        typeof incomingPoc.email !== "undefined"
          ? incomingPoc.email
          : existingPoc.email,
      phone:
        typeof incomingPoc.phone !== "undefined"
          ? incomingPoc.phone
          : existingPoc.phone,
    });

    // Determine final POC objects (after merge), only if POC update requested
    if (incomingLocalPoc) {
      const finalLocal = mergePoc(existing.localPoc || {}, incomingLocalPoc);

      const localProvided =
        Boolean(finalLocal.name) ||
        Boolean(finalLocal.email) ||
        Boolean(finalLocal.phone);

      // If user is trying to set/keep any POC data, enforce full validity
      if (localProvided) {
        if (!finalLocal.name || String(finalLocal.name).trim().length < 2) {
          return res
            .status(400)
            .json({ message: "localPoc.name is required (min 2 chars)" });
        }
        if (!finalLocal.email || !isValidEmail(finalLocal.email)) {
          return res.status(400).json({ message: "localPoc.email is invalid" });
        }
        if (!finalLocal.phone || !isValidPhone(finalLocal.phone)) {
          return res.status(400).json({ message: "localPoc.phone is invalid" });
        }
      }

      updates.localPoc = {
        name: String(finalLocal.name || "").trim(),
        email: String(finalLocal.email || "")
          .trim()
          .toLowerCase(),
        phone: String(finalLocal.phone || "").trim(),
      };
    }

    if (incomingHoPoc) {
      const finalHo = mergePoc(existing.hoPoc || {}, incomingHoPoc);

      const hoProvided =
        Boolean(finalHo.name) ||
        Boolean(finalHo.email) ||
        Boolean(finalHo.phone);

      if (hoProvided) {
        if (!finalHo.name || String(finalHo.name).trim().length < 2) {
          return res
            .status(400)
            .json({ message: "hoPoc.name is required (min 2 chars)" });
        }
        if (!finalHo.email || !isValidEmail(finalHo.email)) {
          return res.status(400).json({ message: "hoPoc.email is invalid" });
        }
        if (!finalHo.phone || !isValidPhone(finalHo.phone)) {
          return res.status(400).json({ message: "hoPoc.phone is invalid" });
        }
      }

      updates.hoPoc = {
        name: String(finalHo.name || "").trim(),
        email: String(finalHo.email || "")
          .trim()
          .toLowerCase(),
        phone: String(finalHo.phone || "").trim(),
      };
    }

    // ✅ Desk recalculations (only if desk/rate/credits touched, but safe to always recalc)
    const cabinDesks = Number(
      typeof updates.cabinDesks !== "undefined"
        ? updates.cabinDesks
        : existing.cabinDesks || 0,
    );
    const cabinDeskRate = Number(
      typeof updates.cabinDeskRate !== "undefined"
        ? updates.cabinDeskRate
        : existing.cabinDeskRate || 0,
    );
    const openDesks = Number(
      typeof updates.openDesks !== "undefined"
        ? updates.openDesks
        : existing.openDesks || 0,
    );
    const openDeskRate = Number(
      typeof updates.openDeskRate !== "undefined"
        ? updates.openDeskRate
        : existing.openDeskRate || 0,
    );
    const perDeskMeetingCredits = Number(
      typeof updates.perDeskMeetingCredits !== "undefined"
        ? updates.perDeskMeetingCredits
        : existing.perDeskMeetingCredits || 0,
    );

    const numericChecks = [
      ["cabinDesks", cabinDesks],
      ["cabinDeskRate", cabinDeskRate],
      ["openDesks", openDesks],
      ["openDeskRate", openDeskRate],
      ["perDeskMeetingCredits", perDeskMeetingCredits],
    ];

    for (const [name, val] of numericChecks) {
      if (!Number.isFinite(val) || val < 0) {
        return res
          .status(400)
          .json({ message: `${name} must be a number >= 0` });
      }
    }

    updates.cabinDesks = cabinDesks;
    updates.cabinDeskRate = cabinDeskRate;
    updates.openDesks = openDesks;
    updates.openDeskRate = openDeskRate;
    updates.perDeskMeetingCredits = perDeskMeetingCredits;

    updates.cabinTotal = cabinDesks * cabinDeskRate;
    updates.openTotal = openDesks * openDeskRate;
    updates.totalMeetingCredits =
      (cabinDesks + openDesks) * perDeskMeetingCredits;

    // ✅ Next increment logic
    const annualIncrement = Number(
      typeof updates.annualIncrement !== "undefined"
        ? updates.annualIncrement
        : existing.annualIncrement || 0,
    );

    if (!Number.isFinite(annualIncrement) || annualIncrement < 0) {
      return res
        .status(400)
        .json({ message: "annualIncrement must be a number >= 0" });
    }
    updates.annualIncrement = annualIncrement;

    const nextIncrementDateFromBody = toDateOrNull(updates.nextIncrementDate);

    let nextIncrementDate =
      nextIncrementDateFromBody || toDateOrNull(existing.nextIncrementDate);

    // If increment > 0 and nextIncrementDate not provided, set +1 year from rentDate
    if (!nextIncrementDateFromBody && annualIncrement > 0) {
      nextIncrementDate = new Date(rentDate);
      nextIncrementDate.setFullYear(nextIncrementDate.getFullYear() + 1);
    }

    // If provided, ensure it isn't before rentDate
    if (nextIncrementDate && nextIncrementDate < rentDate) {
      return res.status(400).json({
        message: "nextIncrementDate cannot be before rentDate",
      });
    }

    updates.nextIncrementDate = nextIncrementDate || null;

    const updated = await VirtualOfficeClient.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({
      message: "Virtual Office client updated successfully",
      data: updated,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const updateVirtualOfficeStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { clientStatus } = req.body;

    // Validate boolean explicitly
    if (typeof clientStatus !== "boolean") {
      return res.status(400).json({
        message: "clientStatus must be a boolean value (true or false)",
      });
    }

    const existing = await VirtualOfficeClient.findById(id);
    if (!existing) {
      return res.status(404).json({
        message: "Virtual Office client not found",
      });
    }

    // Optional: Prevent unnecessary DB write
    if (existing.clientStatus === clientStatus) {
      return res.status(200).json({
        message: "Client status is already updated",
        data: existing,
      });
    }

    existing.clientStatus = clientStatus;
    await existing.save();

    return res.status(200).json({
      message: `Client ${
        clientStatus ? "activated" : "deactivated"
      } successfully`,
      data: existing,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
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
              new CustomError(error.message, logPath, logAction, logSourceKey),
            );
          }
        })
        .on("end", () => {
          resolve();
        })
        .on("error", (error) => {
          reject(
            new CustomError(error.message, logPath, logAction, logSourceKey),
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
  getVirtualOfficeClientsByMonth,
  updateVirtualOfficeClient,
  updateVirtualOfficeStatus,
  bulkInsertVirtualOfficeClients,
};
