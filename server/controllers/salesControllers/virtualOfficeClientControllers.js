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

const bulkUpdateVirtualOfficeClients = async (req, res, next) => {
  try {
    const file = req.file;
    const company = req.company;

    if (!file) {
      return res.status(400).json({ message: "Please provide a CSV file" });
    }

    const stream = Readable.from(file.buffer.toString("utf-8").trim());

    // Fetch units for unit mapping (optional, but usually required)
    const units = await Unit.find({ company })
      .select("_id unitNo unitName")
      .lean();
    const unitMap = new Map(units.map((u) => [`${u.unitNo}`.trim(), u._id]));

    // Fetch existing VO clients for matching (by clientName)
    const existingClients = await VirtualOfficeClient.find({ company })
      .select("_id clientName")
      .lean();

    const normalizeClient = (name) =>
      name?.toLowerCase().replace(/\s+/g, "").trim();

    const existingClientMap = new Map(
      existingClients.map((c) => [normalizeClient(c.clientName), c._id]),
    );

    const updates = [];
    const notFoundClients = [];
    const unknownUnits = [];
    const csvDuplicates = [];

    stream
      .pipe(csvParser())
      .on("data", (row) => {
        // Adjust column headers to match your CSV
        const {
          "Client Name": clientName,
          Email: email,
          Phone: phone,
          Sector: sector,
          State: state,
          City: city,
          "Unit No": unitNo,

          "Cabin Desks": cabinDesks,
          "Cabin Desk Rate": cabinDeskRate,
          "Open Desks": openDesks,
          "Open Desk Rate": openDeskRate,

          "Per Desk Meeting Credits": perDeskMeetingCredits,
          "Annual Increment": annualIncrement,

          "Term Start Date": termStartDate,
          "Term End": termEnd,
          "Lock In Period Months": lockInPeriodMonths,

          "Rent Date": rentDate,
          "Next Increment Date": nextIncrementDate,

          "Rent Status": rentStatus,
          "Client Status": clientStatus,

          "Local POC Name": localPocName,
          "Local POC Email": localPocEmail,
          "Local POC Phone": localPocPhone,

          "HO POC Name": hoPocName,
          "HO POC Email": hoPocEmail,
          "HO POC Phone": hoPocPhone,
        } = row;

        if (!clientName || String(clientName).trim() === "") return;

        const normalized = normalizeClient(clientName);
        const clientId = existingClientMap.get(normalized);

        if (!clientId) {
          notFoundClients.push({
            clientName,
            reason: "Client not found in database",
          });
          return;
        }

        // Unit mapping (optional)
        let unitId;
        if (unitNo && String(unitNo).trim() !== "") {
          unitId = unitMap.get(String(unitNo).trim());
          if (!unitId) {
            unknownUnits.push({
              clientName,
              unitNo,
              reason: "Unit not found",
            });
            return;
          }
        }

        // Build $set only with provided values
        const $set = {};

        // Basic fields
        if (email?.trim()) $set.email = email.trim().toLowerCase();
        if (phone?.trim()) $set.phone = phone.trim();
        if (sector?.trim()) $set.sector = sector.trim();
        if (state?.trim()) $set.state = state.trim();
        if (city?.trim()) $set.city = city.trim();
        if (unitId) $set.unit = unitId;

        // Numbers (only if present)
        const toNum = (v) => {
          if (v === undefined || v === null) return undefined;
          const s = String(v).trim();
          if (!s) return undefined;
          // remove commas and non-numeric except dot/minus
          const cleaned = s.replace(/[^0-9.-]/g, "");
          if (!cleaned) return undefined;
          const n = Number(cleaned);
          return Number.isFinite(n) ? n : undefined;
        };

        const cabinDesksN = toNum(cabinDesks);
        const cabinDeskRateN = toNum(cabinDeskRate);
        const openDesksN = toNum(openDesks);
        const openDeskRateN = toNum(openDeskRate);
        const perDeskCreditsN = toNum(perDeskMeetingCredits);
        const annualIncrementN = toNum(annualIncrement);
        const lockInN = toNum(lockInPeriodMonths);

        if (cabinDesksN !== undefined) $set.cabinDesks = cabinDesksN;
        if (cabinDeskRateN !== undefined) $set.cabinDeskRate = cabinDeskRateN;
        if (openDesksN !== undefined) $set.openDesks = openDesksN;
        if (openDeskRateN !== undefined) $set.openDeskRate = openDeskRateN;
        if (perDeskCreditsN !== undefined)
          $set.perDeskMeetingCredits = perDeskCreditsN;
        if (annualIncrementN !== undefined)
          $set.annualIncrement = annualIncrementN;
        if (lockInN !== undefined) $set.lockInPeriodMonths = lockInN;

        // Totals (only if we have enough inputs)
        const nextCabinDesks =
          cabinDesksN !== undefined ? cabinDesksN : undefined;
        const nextCabinRate =
          cabinDeskRateN !== undefined ? cabinDeskRateN : undefined;
        const nextOpenDesks = openDesksN !== undefined ? openDesksN : undefined;
        const nextOpenRate =
          openDeskRateN !== undefined ? openDeskRateN : undefined;

        if (nextCabinDesks !== undefined && nextCabinRate !== undefined) {
          $set.cabinTotal = nextCabinDesks * nextCabinRate;
        }
        if (nextOpenDesks !== undefined && nextOpenRate !== undefined) {
          $set.openTotal = nextOpenDesks * nextOpenRate;
        }
        // totalMeetingCredits if both desk counts + perDesk credits are present
        if (
          (nextCabinDesks !== undefined || nextOpenDesks !== undefined) &&
          perDeskCreditsN !== undefined
        ) {
          const cd = nextCabinDesks ?? 0;
          const od = nextOpenDesks ?? 0;
          $set.totalMeetingCredits = (cd + od) * perDeskCreditsN;
        }

        // Dates (only if present and valid)
        const toDate = (v) => {
          if (!v) return undefined;
          const d = new Date(v);
          return Number.isNaN(d.getTime()) ? undefined : d;
        };

        const termStartD = toDate(termStartDate);
        const termEndD = toDate(termEnd);
        const rentDateD = toDate(rentDate);
        const nextIncD = toDate(nextIncrementDate);

        if (termStartD) $set.termStartDate = termStartD;
        if (termEndD) $set.termEnd = termEndD;
        if (rentDateD) $set.rentDate = rentDateD;
        if (nextIncD) $set.nextIncrementDate = nextIncD;

        // Rent status
        if (rentStatus?.trim()) $set.rentStatus = rentStatus.trim();

        // Client status (boolean in schema)
        if (clientStatus !== undefined && clientStatus !== null) {
          const s = String(clientStatus).trim().toLowerCase();
          if (s === "true" || s === "false") {
            $set.clientStatus = s === "true";
          }
        }

        // POCs (only set if at least one field present)
        const localAny = localPocName || localPocEmail || localPocPhone;
        if (localAny) {
          $set.localPoc = {
            name: localPocName ? String(localPocName).trim() : "",
            email: localPocEmail
              ? String(localPocEmail).trim().toLowerCase()
              : "",
            phone: localPocPhone ? String(localPocPhone).trim() : "",
          };
        }

        const hoAny = hoPocName || hoPocEmail || hoPocPhone;
        if (hoAny) {
          $set.hoPoc = {
            name: hoPocName ? String(hoPocName).trim() : "",
            email: hoPocEmail ? String(hoPocEmail).trim().toLowerCase() : "",
            phone: hoPocPhone ? String(hoPocPhone).trim() : "",
          };
        }

        // If nothing to update, skip
        if (Object.keys($set).length === 0) return;

        updates.push({
          key: normalized, // for CSV duplicate detection
          clientId,
          $set,
        });
      })
      .on("end", async () => {
        try {
          if (!updates.length) {
            return res.status(400).json({
              message: "No valid update records found",
              notFoundClients,
              unknownUnits,
            });
          }

          // 1) Remove CSV duplicates (same clientName repeated)
          const uniqueMap = new Map();
          for (const u of updates) {
            if (!uniqueMap.has(u.key)) uniqueMap.set(u.key, u);
            else {
              csvDuplicates.push({
                clientName: u.key,
                reason: "Duplicate client in CSV",
              });
            }
          }
          const uniqueUpdates = Array.from(uniqueMap.values());

          // 2) Prepare bulkWrite operations
          const bulkOps = uniqueUpdates.map((u) => ({
            updateOne: {
              filter: { _id: u.clientId, company },
              update: { $set: u.$set },
            },
          }));

          let bulkResult = null;
          if (bulkOps.length > 0) {
            bulkResult = await VirtualOfficeClient.bulkWrite(bulkOps, {
              ordered: false,
            });
          }

          const updatedCount =
            bulkResult?.modifiedCount ?? bulkResult?.nModified ?? 0;

          return res.status(200).json({
            message: `${updatedCount} virtual office clients updated successfully`,
            updatedCount,
            attemptedUpdates: bulkOps.length,
            skippedCount:
              notFoundClients.length +
              unknownUnits.length +
              csvDuplicates.length,
            notFoundClients,
            unknownUnits,
            csvDuplicates,
          });
        } catch (err) {
          next(err);
        }
      })
      .on("error", (err) => next(err));
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
  bulkUpdateVirtualOfficeClients,
};
