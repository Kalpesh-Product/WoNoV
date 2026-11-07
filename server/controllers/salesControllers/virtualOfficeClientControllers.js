const VirtualOfficeClient = require("../../models/sales/VirtualOfficeClient");
const VirtualOfficeRevenue = require("../../models/sales/VirtualOfficeRevenue");
const { Readable } = require("stream");
const csvParser = require("csv-parser");
const CustomError = require("../../utils/customErrorlogs");
const { createLog } = require("../../utils/moduleLogs");
const Unit = require("../../models/locations/Unit");
const ClientService = require("../../models/sales/ClientService");
const Company = require("../../models/hr/Company");
const User = require("../../models/hr/UserData");
const { default: mongoose } = require("mongoose");

const DEFAULT_VIRTUAL_OFFICE_SOURCING_OPTIONS = [
  "Google",
  "LinkedIn",
  "Referral",
  "IPC",
  "Walk-IN",
  "WhatsApp",
];
const VIRTUAL_OFFICE_CURRENT_STATUSES = [
  "In Progress",
  "Yet to start",
  "On Hold",
];

const SOURCING_MANAGER_DEPARTMENT_IDS = new Set([
  "67b2cf85b9b6ed5cedeb9a2e",
  "6798ba9de469e809084e2494",
]);

const canCreateVirtualOfficeSourcingOption = async (userId) => {
  const user = await User.findById(userId)
    .populate("departments", "name")
    .populate("role", "roleTitle")
    .select("departments role")
    .lean();

  const hasAllowedDepartment = (user?.departments || []).some((department) => {
    const departmentId = String(department?._id || department);
    const departmentName = String(department?.name || "")
      .trim()
      .toLowerCase();

    return (
      SOURCING_MANAGER_DEPARTMENT_IDS.has(departmentId) ||
      ["top management", "tech", "tech department"].includes(departmentName)
    );
  });

  const hasAllowedRole = (user?.role || []).some((role) => {
    const roleTitle = String(role?.roleTitle || role || "")
      .trim()
      .toLowerCase();
    return (
      roleTitle.includes("top management") ||
      roleTitle.includes("tech department")
    );
  });

  return hasAllowedDepartment || hasAllowedRole;
};

const normalizeSourcingOptions = (options = []) => {
  const uniqueOptions = new Map();

  [...DEFAULT_VIRTUAL_OFFICE_SOURCING_OPTIONS, ...options].forEach((option) => {
    const normalizedOption = String(option || "").trim();
    if (!normalizedOption) return;

    const displayOption =
      normalizedOption.toLowerCase() === "bfc" ? "IPC" : normalizedOption;
    uniqueOptions.set(displayOption.toLowerCase(), displayOption);
  });

  return Array.from(uniqueOptions.values()).sort((first, second) =>
    first.localeCompare(second, undefined, { sensitivity: "base" }),
  );
};

const getVirtualOfficeSourcingOptions = async (req, res, next) => {
  try {
    const company = await Company.findById(req.company)
      .select("virtualOfficeSourcingOptions")
      .lean();

    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    const options = normalizeSourcingOptions(
      company.virtualOfficeSourcingOptions,
    );

    return res.status(200).json(options);
  } catch (error) {
    next(error);
  }
};

const addVirtualOfficeSourcingOption = async (req, res, next) => {
  try {
    if (!(await canCreateVirtualOfficeSourcingOption(req.user))) {
      return res.status(403).json({
        message:
          "Only Tech Department or Top Management can add sourcing options",
      });
    }

    const requestedOption = String(req.body?.option || "").trim();
    const option =
      requestedOption.toLowerCase() === "bfc" ? "IPC" : requestedOption;

    if (!option) {
      return res.status(400).json({ message: "Sourcing name is required" });
    }

    if (option.length > 60) {
      return res
        .status(400)
        .json({ message: "Sourcing name cannot exceed 60 characters" });
    }

    const company = await Company.findById(req.company).select(
      "virtualOfficeSourcingOptions",
    );

    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    const currentOptions = normalizeSourcingOptions(
      company.virtualOfficeSourcingOptions,
    );
    const existingOption = currentOptions.find(
      (item) => item.toLowerCase() === option.toLowerCase(),
    );
    const selectedOption = existingOption || option;

    company.virtualOfficeSourcingOptions = normalizeSourcingOptions([
      ...currentOptions,
      selectedOption,
    ]);
    await company.save();

    return res.status(existingOption ? 200 : 201).json({
      message: existingOption
        ? "Sourcing already available"
        : "Sourcing added successfully",
      option: selectedOption,
      options: company.virtualOfficeSourcingOptions,
    });
  } catch (error) {
    next(error);
  }
};

const {
  fetchVirtualOfficeClientsReportService,
} = require("../../services/reports/client");
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

const toUtcDayTimestamp = (date) =>
  Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());

const calculateTotalTermMonths = (startDate, endDate) => {
  if (!startDate || !endDate) return 0;

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime()) ||
    end <= start
  ) {
    return 0;
  }

  let months =
    (end.getFullYear() - start.getFullYear()) * 12 +
    (end.getMonth() - start.getMonth());

  if (end.getDate() < start.getDate()) {
    months -= 1;
  }

  return Math.max(months, 0);
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
      "building",
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

    if (!mongoose.Types.ObjectId.isValid(data.building)) {
      return res.status(400).json({ message: "Invalid building ID" });
    }

    if (!mongoose.Types.ObjectId.isValid(data.unit)) {
      return res.status(400).json({ message: "Invalid unit ID" });
    }

    const unit = await Unit.findById(data.unit).lean().exec();

    if (!unit) {
      return res.status(404).json({ message: "Selected unit not found" });
    }

    if (String(unit.building) !== String(data.building)) {
      return res.status(400).json({
        message: "Selected building does not match the selected unit",
      });
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

    if (toUtcDayTimestamp(rentDate) < toUtcDayTimestamp(termStartDate)) {
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
    const securityDeposit = Number(data.securityDeposit || 0);
    const cabinDeskRate = Number(data.cabinDeskRate || 0);
    const openDesks = Number(data.openDesks || 0);
    const openDeskRate = Number(data.openDeskRate || 0);
    const brokerage = Number(data.brokerage || 0);
    const receivedAmount = Number(data.receivedAmount || 0);
    const totalReceivedAmount = Number(
      data.totalReceivedAmount !== undefined
        ? data.totalReceivedAmount
        : receivedAmount,
    );
    const perDeskMeetingCredits = Number(data.perDeskMeetingCredits || 0);
    const annualIncrement = Number(data.annualIncrement || 0);

    const numericFields = [
      ["cabinDesks", cabinDesks],
      ["cabinDeskRate", cabinDeskRate],
      ["securityDeposit", securityDeposit],
      ["openDesks", openDesks],
      ["openDeskRate", openDeskRate],
      ["brokerage", brokerage],
      ["receivedAmount", receivedAmount],
      ["totalReceivedAmount", totalReceivedAmount],
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
    const hoProvided = Boolean(
      hoPoc.name || hoPoc.email || hoPoc.phone || hoPoc.address,
    );
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
      if (!hoPoc.address || !String(hoPoc.address).trim()) {
        return res.status(400).json({ message: "hoPoc.address is required" });
      }
    }

    // Auto totals
    const cabinTotal = cabinDesks * cabinDeskRate;
    const openTotal = openDesks * openDeskRate;
    const totalDesks = cabinDesks + openDesks;
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
      building: unit.building,
      cabinDesks,
      securityDeposit,
      cabinDeskRate,
      cabinTotal,
      openDesks,
      openDeskRate,
      openTotal,
      brokerage,
      internalLead: String(data.internalLead || "").trim(),
      receivedAmount,
      totalReceivedAmount,
      annualIncrement,
      perDeskMeetingCredits,
      totalMeetingCredits,
      totalDesks,
      totalTerm: calculateTotalTermMonths(termStartDate, termEnd),
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
    const payload = await fetchVirtualOfficeClientsReportService({
      query: { ...req.query },
      params: req.params || {},
    });

    return res.status(200).json(payload);
  } catch (error) {
    next(error);
  }
};

//  try {
//     const { company } = req;
//     const { virtualofficeclientid, unitId, active, rentStatus } = req.query;

//     // Validate IDs
//     if (
//       virtualofficeclientid &&
//       !mongoose.Types.ObjectId.isValid(virtualofficeclientid)
//     ) {
//       return res.status(400).json({ message: "Invalid client ID format" });
//     }

//     if (unitId && !mongoose.Types.ObjectId.isValid(unitId)) {
//       return res.status(400).json({ message: "Invalid unit ID format" });
//     }

//     // Optional: if you still want to ensure units exist like coworking controller
//     const units = await Unit.find({ company }).populate({
//       path: "building",
//       select: "buildingName",
//     });

//     if (!units?.length) {
//       return res.status(400).json({ message: "No unit found" });
//     }

//     // Base query must always include company (multi-tenant sanity)
//     let query = { company };

//     if (virtualofficeclientid) {
//       query._id = virtualofficeclientid;
//     } else {
//       if (unitId) query.unit = unitId;

//       if (active !== undefined) {
//         // active=true/false maps to clientStatus boolean
//         query.clientStatus = active === "true";
//       }

//       if (rentStatus) {
//         query.rentStatus = rentStatus; // "Active" | "Expired" | "Terminated" | "Not Active"
//       }
//     }

//     const populateOptions = [
//       {
//         path: "unit",
//         select: "_id unitName unitNo cabinDesks openDesks",
//         populate: {
//           path: "building",
//           select: "_id buildingName fullAddress",
//         },
//       },
//     ];

//     const clients = await VirtualOfficeClient.find(query)
//       .populate(populateOptions)
//       .lean()
//       .exec();

//     if (!clients?.length) {
//       return res.status(404).json({ message: "No clients found" });
//     }

//     return res.status(200).json(clients);
//   } catch (error) {
//     next(error);
//   }

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
    const hasField = (key) =>
      Object.prototype.hasOwnProperty.call(updates, key);

    if (hasField("channel")) {
      updates.channel = String(updates.channel || "").trim();
    }

    if (
      hasField("currentStatus") &&
      !VIRTUAL_OFFICE_CURRENT_STATUSES.includes(updates.currentStatus)
    ) {
      return res.status(400).json({ message: "Invalid current status" });
    }

    const existing = await VirtualOfficeClient.findById(id).lean();
    if (!existing) {
      return res
        .status(404)
        .json({ message: "Virtual Office client not found" });
    }

    if (
      hasField("unit") &&
      (updates.unit === null || String(updates.unit).trim() === "")
    ) {
      return res.status(400).json({ message: "unit is required" });
    }

    if (
      hasField("building") &&
      (updates.building === null || String(updates.building).trim() === "")
    ) {
      return res.status(400).json({ message: "building is required" });
    }

    const clientExists = await VirtualOfficeClient.findOne({
      clientName: updates.clientName,
      _id: { $ne: id },
    });

    if (clientExists) {
      return res.status(400).json({ message: "Client already exists" });
    }
    let selectedUnit = null;
    //if (updates.unit || updates.building) {
    if (hasField("unit") || hasField("building")) {
      const nextUnitId = updates.unit || existing.unit;
      const nextBuildingId = updates.building || existing.building;

      if (!mongoose.Types.ObjectId.isValid(nextUnitId)) {
        return res.status(400).json({ message: "Invalid unit ID" });
      }

      if (!mongoose.Types.ObjectId.isValid(nextBuildingId)) {
        return res.status(400).json({ message: "Invalid building ID" });
      }

      selectedUnit = await Unit.findById(nextUnitId).lean().exec();

      if (!selectedUnit) {
        return res.status(404).json({ message: "Selected unit not found" });
      }

      if (String(selectedUnit.building) !== String(nextBuildingId)) {
        return res.status(400).json({
          message: "Selected building does not match the selected unit",
        });
      }

      updates.unit = selectedUnit._id;
      updates.building = selectedUnit.building;
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

    if (toUtcDayTimestamp(rentDate) < toUtcDayTimestamp(termStartDate)) {
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

    if (hasField("alternateAdmin")) {
      const alternateAdmin = updates.alternateAdmin;
      if (!alternateAdmin || typeof alternateAdmin !== "object" || Array.isArray(alternateAdmin)) {
        return res.status(400).json({ message: "alternateAdmin must be an object" });
      }
      updates.alternateAdmin = {
        ...(existing.alternateAdmin || {}),
        name: String(alternateAdmin.name || "").trim(),
        phone: String(alternateAdmin.phone || "").trim(),
      };
    }

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
      address:
        typeof incomingPoc.address !== "undefined"
          ? incomingPoc.address
          : existingPoc.address,
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
        Boolean(finalHo.phone) ||
        Boolean(finalHo.address);

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
        if (!finalHo.address || !String(finalHo.address).trim()) {
          return res.status(400).json({ message: "hoPoc.address is required" });
        }
      }

      updates.hoPoc = {
        name: String(finalHo.name || "").trim(),
        email: String(finalHo.email || "")
          .trim()
          .toLowerCase(),
        phone: String(finalHo.phone || "").trim(),
        address: String(finalHo.address || "").trim(),
      };
    }

    // ✅ Desk recalculations (only if desk/rate/credits touched, but safe to always recalc)
    const cabinDesks = Number(
      typeof updates.cabinDesks !== "undefined"
        ? updates.cabinDesks
        : existing.cabinDesks || 0,
    );
    const securityDeposit = Number(
      typeof updates.securityDeposit !== "undefined"
        ? updates.securityDeposit
        : existing.securityDeposit || 0,
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
    const brokerage = Number(
      typeof updates.brokerage !== "undefined"
        ? updates.brokerage
        : existing.brokerage || 0,
    );
    const monthlyFee = Number(
      typeof updates.monthlyFee !== "undefined"
        ? updates.monthlyFee
        : existing.monthlyFee || 0,
    );
    const deskRate = Number(
      typeof updates.deskRate !== "undefined"
        ? updates.deskRate
        : existing.deskRate || 0,
    );
    const receivedAmount = Number(
      typeof updates.receivedAmount !== "undefined"
        ? updates.receivedAmount
        : existing.receivedAmount || 0,
    );
    const totalReceivedAmount = Number(
      typeof updates.totalReceivedAmount !== "undefined"
        ? updates.totalReceivedAmount
        : existing.totalReceivedAmount || 0,
    );
    const perDeskMeetingCredits = Number(
      typeof updates.perDeskMeetingCredits !== "undefined"
        ? updates.perDeskMeetingCredits
        : existing.perDeskMeetingCredits || 0,
    );

    const numericChecks = [
      ["cabinDesks", cabinDesks],
      ["securityDeposit", securityDeposit],
      ["cabinDeskRate", cabinDeskRate],
      ["openDesks", openDesks],
      ["receivedAmount", receivedAmount],
      ["totalReceivedAmount", totalReceivedAmount],
      ["openDeskRate", openDeskRate],
      ["brokerage", brokerage],
      ["monthlyFee", monthlyFee],
      ["deskRate", deskRate],
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
    updates.securityDeposit = securityDeposit;
    updates.cabinDeskRate = cabinDeskRate;
    updates.openDesks = openDesks;
    updates.openDeskRate = openDeskRate;
    updates.brokerage = brokerage;
    updates.monthlyFee = monthlyFee;
    updates.deskRate = deskRate;
    if (hasField("internalLead")) {
      updates.internalLead = String(updates.internalLead || "").trim();
    }
    updates.receivedAmount = receivedAmount;
    updates.totalReceivedAmount = totalReceivedAmount;
    updates.perDeskMeetingCredits = perDeskMeetingCredits;

    updates.cabinTotal = cabinDesks * cabinDeskRate;
    updates.openTotal = openDesks * openDeskRate;
    updates.totalDesks = cabinDesks + openDesks;
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
    updates.totalTerm = calculateTotalTermMonths(termStartDate, termEnd);

    const updated = await VirtualOfficeClient.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Client changes affect current/future billing rows only.
    await VirtualOfficeRevenue.updateMany(
      {
        client: id,
        company: existing.company,
        $or: [
          { rentDate: { $gte: currentMonthStart } },
          {
            rentDate: { $in: [null, ""] },
            invoiceUploadedAt: { $gte: currentMonthStart },
          },
        ],
      },
      { $set: { receivedAmount } },
    );

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
    const { isActive } = req.body;

    // Validate boolean explicitly

    if (typeof isActive !== "boolean") {
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
    if (existing.clientStatus === isActive) {
      return res.status(200).json({
        message: "Client status is already updated",
        data: existing,
      });
    }

    existing.clientStatus = isActive;
    await existing.save();

    return res.status(200).json({
      message: `Client marked as${isActive ? "active" : "inactive"} successfully`,
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

    const service = await ClientService.findOne({
      serviceName: "Virtual Office",
    });

    if (!service) {
      return res
        .status(404)
        .json({ message: "Virtual office service doesn't exists" });
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
              channel: row["Channel"],
              unit: row["Unit"] || null,
              location: row["Location"],
              totalTerm: row["Total Term"],
              termStartDate: row["Term Start Date"],
              termEnd: row["Term End Date"],
              rentDate: row["Rent Date"] ? new Date(row["Rent Date"]) : null,
              rentStatus: row["Rent Status"],
              pastDueDate: row["Past Due Date"]
                ? new Date(row["Past Due Date"])
                : null,
              nextIncrementDate: row["Next Increment Date"]
                ? new Date(row["Next Increment Date"])
                : null,
              annualIncrement: row["Annual Increment"] || null,
              clientStatus: row["Rent Status"] === "Not Active" ? false : true,
              service: service._id,
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

    // ---------------- FILE VALIDATION ----------------

    if (!file) {
      return res.status(400).json({
        message: "Please provide a CSV file",
      });
    }

    if (!/\.csv$/i.test(file.originalname || "")) {
      return res.status(400).json({
        message: "Only CSV files are allowed",
      });
    }

    const csvContent = file.buffer
      .toString("utf8")
      .replace(/^\uFEFF/, "")
      .trim();

    if (!csvContent) {
      return res.status(400).json({
        message: "CSV file is empty",
      });
    }

    // ---------------- HELPERS ----------------

    const normalizeHeader = (value) =>
      String(value || "")
        .replace(/^\uFEFF/, "")
        .trim()
        .toLowerCase()
        .replace(/[\s_-]+/g, "");

    const normalizeClient = (value) =>
      String(value || "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "");

    const hasValue = (value) =>
      value !== undefined && value !== null && String(value).trim() !== "";

    const getCell = (row, header) => {
      const key = Object.keys(row).find(
        (key) => normalizeHeader(key) === normalizeHeader(header),
      );

      return key ? String(row[key] ?? "").trim() : "";
    };

    const parseNumber = (value) => {
      if (!hasValue(value)) return undefined;

      const cleaned = String(value).trim().replace(/,/g, "");

      if (!/^-?(?:\d+\.?\d*|\.\d+)$/.test(cleaned)) {
        return null;
      }

      const number = Number(cleaned);

      return Number.isFinite(number) ? number : null;
    };

    const parseBoolean = (value) => {
      if (!hasValue(value)) return undefined;

      const normalized = String(value).trim().toLowerCase();

      if (["true", "yes", "1", "active"].includes(normalized)) {
        return true;
      }

      if (["false", "no", "0", "inactive"].includes(normalized)) {
        return false;
      }

      return null;
    };

    // ---------------- DATE PARSING ----------------

    const monthMap = {
      jan: 1,
      january: 1,
      feb: 2,
      february: 2,
      mar: 3,
      march: 3,
      apr: 4,
      april: 4,
      may: 5,
      jun: 6,
      june: 6,
      jul: 7,
      july: 7,
      aug: 8,
      august: 8,
      sep: 9,
      september: 9,
      oct: 10,
      october: 10,
      nov: 11,
      november: 11,
      dec: 12,
      december: 12,
    };

    const parseDate = (value) => {
      if (!hasValue(value)) return undefined;

      const input = String(value).trim();

      let day;
      let month;
      let year;

      // YYYY-MM-DD
      const isoMatch = input.match(/^(\d{4})-(\d{2})-(\d{2})$/);

      if (isoMatch) {
        year = Number(isoMatch[1]);
        month = Number(isoMatch[2]);
        day = Number(isoMatch[3]);
      } else {
        // DD-MM-YYYY
        // DD-MM-YY
        // DD-MMM-YYYY
        // DD-MMM-YY
        // DD-MMMM-YYYY
        // DD-MMMM-YY

        const match = input.match(/^(\d{2})-(\d{2}|[A-Za-z]+)-(\d{2}|\d{4})$/);

        if (!match) return null;

        day = Number(match[1]);

        month = /^\d{2}$/.test(match[2])
          ? Number(match[2])
          : monthMap[match[2].toLowerCase()];

        year = Number(match[3]);

        // YY is interpreted as 20YY
        if (match[3].length === 2) {
          year += 2000;
        }
      }

      if (
        !Number.isInteger(day) ||
        !Number.isInteger(month) ||
        !Number.isInteger(year) ||
        day < 1 ||
        day > 31 ||
        month < 1 ||
        month > 12 ||
        year < 1 ||
        year > 9999
      ) {
        return null;
      }

      const date = new Date(0);

      date.setUTCHours(0, 0, 0, 0);
      date.setUTCFullYear(year, month - 1, day);

      // Reject invalid calendar dates
      if (
        date.getUTCFullYear() !== year ||
        date.getUTCMonth() + 1 !== month ||
        date.getUTCDate() !== day
      ) {
        return null;
      }

      return date;
    };

    // ---------------- PARSE CSV ----------------

    const rows = [];

    await new Promise((resolve, reject) => {
      Readable.from([csvContent])
        .pipe(csvParser())
        .on("data", (row) => rows.push(row))
        .on("end", resolve)
        .on("error", reject);
    });

    if (!rows.length) {
      return res.status(400).json({
        message: "No records found in CSV",
      });
    }

    // ---------------- FETCH EXISTING DATA ----------------

    // No VirtualOfficeRevenue queries or updates.

    const [units, existingClients] = await Promise.all([
      Unit.find({ company }).select("_id unitNo unitName building").lean(),

      VirtualOfficeClient.find({ company }).lean(),
    ]);

    // ---------------- UNIT MAPPING ----------------

    const unitMap = new Map();

    units.forEach((unit) => {
      const key = String(unit.unitNo || "")
        .trim()
        .toLowerCase();

      if (!key) return;

      if (!unitMap.has(key)) {
        unitMap.set(key, []);
      }

      unitMap.get(key).push(unit);
    });

    // ---------------- CLIENT MAPPING ----------------

    const existingClientMap = new Map();

    existingClients.forEach((client) => {
      const key = normalizeClient(client.clientName);

      if (!existingClientMap.has(key)) {
        existingClientMap.set(key, []);
      }

      existingClientMap.get(key).push(client);
    });

    // ---------------- TRACK RESULTS ----------------

    const updates = [];

    const notFoundClients = [];
    const unknownUnits = [];
    const csvDuplicates = [];
    const validationErrors = [];
    const skippedRows = [];

    const seenClients = new Set();

    // ---------------- PROCESS CSV ----------------

    rows.forEach((row, index) => {
      const rowNumber = index + 2;

      // Ignore fully empty rows
      const isEmptyRow = Object.values(row).every((value) => !hasValue(value));

      if (isEmptyRow) return;

      const clientName = getCell(row, "Client Name");

      // ---------------- CLIENT NAME VALIDATION ----------------

      if (!clientName) {
        skippedRows.push({
          row: rowNumber,
          clientName: "",
          reason: "Client Name is required",
        });

        return;
      }

      const clientKey = normalizeClient(clientName);

      // ---------------- CSV DUPLICATE CHECK ----------------

      if (seenClients.has(clientKey)) {
        csvDuplicates.push({
          row: rowNumber,
          clientName,
          reason: "Duplicate client in CSV",
        });

        return;
      }

      seenClients.add(clientKey);

      // ---------------- FIND EXISTING CLIENT ----------------

      const matches = existingClientMap.get(clientKey) || [];

      if (!matches.length) {
        notFoundClients.push({
          row: rowNumber,
          clientName,
          reason: "Client not found in VirtualOfficeClient collection",
        });

        return;
      }

      // ---------------- DUPLICATE CLIENT HANDLING ----------------

      let existingClient;

      if (matches.length === 1) {
        // Preserve existing behavior when there is
        // only one matching database record.
        existingClient = matches[0];
      } else {
        // Multiple clients have the same name.
        // Find records with clientStatus === true.

        const activeClients = matches.filter(
          (client) => client.clientStatus === true,
        );

        if (activeClients.length === 1) {
          // Exactly one active client.
          // Update only that active record.
          existingClient = activeClients[0];
        } else if (activeClients.length > 1) {
          // Multiple active clients.
          // Cannot uniquely identify the correct one.

          validationErrors.push({
            row: rowNumber,
            clientName,
            field: "Client Name",
            message:
              `Multiple active clients (${activeClients.length}) ` +
              "have this name. Cannot determine which record to update.",
          });

          return;
        } else {
          // Duplicate clients exist, but none is active.

          validationErrors.push({
            row: rowNumber,
            clientName,
            field: "Client Name",
            message: "Multiple clients have this name, but none is active.",
          });

          return;
        }
      }

      // ---------------- PREPARE UPDATE ----------------

      const $set = {};
      const rowErrors = [];

      const addError = (field, message) => {
        rowErrors.push({
          row: rowNumber,
          clientName,
          field,
          message,
        });
      };

      // ---------------- STRING FIELDS ----------------

      const stringFields = {
        "Brand Name": "brandName",
        Source: "source",
        "Booking Type": "bookingType",
        Email: "email",
        Phone: "phone",
        Sector: "sector",
        State: "state",
        City: "city",
        Channel: "channel",
        "Internal Lead": "internalLead",
        "Rent Status": "rentStatus",
        Location: "location",
      };

      Object.entries(stringFields).forEach(([csvHeader, schemaField]) => {
        const value = getCell(row, csvHeader);

        if (!hasValue(value)) return;

        $set[schemaField] =
          schemaField === "email" ? value.toLowerCase() : value;
      });

      // ---------------- ENUM FIELDS ----------------

      const enumFields = {
        "Current Status": {
          field: "currentStatus",
          options: ["In Progress", "Yet to start", "On Hold"],
        },

        "Billing Frequency": {
          field: "billingFrequency",
          options: ["Monthly", "Yearly"],
        },
      };

      Object.entries(enumFields).forEach(([csvHeader, config]) => {
        const value = getCell(row, csvHeader);

        if (!hasValue(value)) return;

        const matched = config.options.find(
          (option) => option.toLowerCase() === value.toLowerCase(),
        );

        if (!matched) {
          addError(csvHeader, `Must be one of: ${config.options.join(", ")}`);

          return;
        }

        $set[config.field] = matched;
      });

      // ---------------- NUMBER FIELDS ----------------

      const numberFields = {
        "Total Desks": "totalDesks",
        "Cabin Desks": "cabinDesks",
        "Cabin Desk Rate": "cabinDeskRate",
        "Cabin Total": "cabinTotal",
        "Open Desks": "openDesks",
        "Open Desk Rate": "openDeskRate",
        "Open Total": "openTotal",
        "Desk Rate": "deskRate",
        "Monthly Fee": "monthlyFee",
        "Security Deposit": "securityDeposit",
        Brokerage: "brokerage",
        "Annual Increment": "annualIncrement",
        "Total Term": "totalTerm",
        "LockIn Periods": "lockInPeriodMonths",
        "Lock In Period Months": "lockInPeriodMonths",
        "Received Amount": "receivedAmount",
        "Total Received Amount": "totalReceivedAmount",
        "Per Desk Meeting Credits": "perDeskMeetingCredits",
        "Total Meeting Credits": "totalMeetingCredits",
      };

      Object.entries(numberFields).forEach(([csvHeader, schemaField]) => {
        const value = getCell(row, csvHeader);

        if (!hasValue(value)) return;

        const number = parseNumber(value);

        if (number === null) {
          addError(csvHeader, "Invalid numeric value");

          return;
        }

        if (
          [
            "brokerage",
            "deskRate",
            "monthlyFee",
            "receivedAmount",
            "totalReceivedAmount",
          ].includes(schemaField) &&
          number < 0
        ) {
          addError(csvHeader, "Cannot be negative");

          return;
        }

        if (
          schemaField === "lockInPeriodMonths" &&
          (!Number.isInteger(number) || number < 1)
        ) {
          addError(csvHeader, "Must be a positive integer");

          return;
        }

        if (
          schemaField === "totalDesks" &&
          (!Number.isInteger(number) || number < 0)
        ) {
          addError(csvHeader, "Total Desks must be a non-negative integer");

          return;
        }

        $set[schemaField] = number;
      });

      // ---------------- DATE FIELDS ----------------

      const dateFields = {
        "Term Start Date": "termStartDate",
        "Term End Date": "termEnd",
        "Term End": "termEnd",
        "Rent Date": "rentDate",
        "Next Increment Date": "nextIncrementDate",
      };

      Object.entries(dateFields).forEach(([csvHeader, schemaField]) => {
        const value = getCell(row, csvHeader);

        if (!hasValue(value)) return;

        const date = parseDate(value);

        if (!date) {
          addError(csvHeader, "Invalid date format or calendar date");

          return;
        }

        $set[schemaField] = date;
      });

      // ---------------- CLIENT STATUS ----------------

      const clientStatus = getCell(row, "Client Status");

      if (hasValue(clientStatus)) {
        const parsedStatus = parseBoolean(clientStatus);

        if (parsedStatus === null) {
          addError(
            "Client Status",
            "Must be true/false, yes/no, or active/inactive",
          );
        } else {
          $set.clientStatus = parsedStatus;
        }
      }

      // ---------------- UNIT + BUILDING ----------------

      const unitNo = getCell(row, "Unit No");

      if (hasValue(unitNo)) {
        const matchedUnits = unitMap.get(unitNo.toLowerCase()) || [];

        if (!matchedUnits.length) {
          unknownUnits.push({
            row: rowNumber,
            clientName,
            unitNo,
            reason: "Unit not found",
          });

          return;
        }

        if (matchedUnits.length > 1) {
          addError("Unit No", "Multiple units have this Unit No");
        } else {
          const unit = matchedUnits[0];

          $set.unit = unit._id;

          if (unit.building) {
            $set.building = unit.building;
          }
        }
      }

      // ---------------- POC FIELDS ----------------

      // Shared POC values apply to both Local and HO POC.
      // Specific POC columns override shared values.

      const pocName = getCell(row, "POC Name");
      const pocNumber = getCell(row, "POC Number");

      for (const schemaField of ["localPoc", "hoPoc"]) {
        if (hasValue(pocName)) {
          $set[`${schemaField}.name`] = pocName;
        }

        if (hasValue(pocNumber)) {
          $set[`${schemaField}.phone`] = pocNumber;
        }
      }

      const pocFields = [
        {
          prefix: "Local POC",
          schemaField: "localPoc",
        },
        {
          prefix: "HO POC",
          schemaField: "hoPoc",
        },
      ];

      pocFields.forEach(({ prefix, schemaField }) => {
        const fields = {
          Name: "name",
          Email: "email",
          Phone: "phone",
          Address: "address",
        };

        Object.entries(fields).forEach(([csvSuffix, field]) => {
          const value = getCell(row, `${prefix} ${csvSuffix}`);

          if (!hasValue(value)) return;

          $set[`${schemaField}.${field}`] =
            field === "email" ? value.toLowerCase() : value;
        });
      });

      const getFirstCell = (headers) =>
        headers.map((header) => getCell(row, header)).find(hasValue) || "";
      const alternateAdminName = getFirstCell([
        "Alternate Admin Name",
        "Alt Admin Name",
        "Alt/Admin Name",
      ]);
      const alternateAdminPhone = getFirstCell([
        "Alternate Admin Phone Number",
        "Alternate Admin Phone",
        "Alternate Admin Number",
        "Alt Admin Phone Number",
        "Alt/Admin Phone Number",
        "Alt/Admin No",
      ]);

      if (hasValue(alternateAdminName)) {
        $set["alternateAdmin.name"] = alternateAdminName;
      }
      if (hasValue(alternateAdminPhone)) {
        $set["alternateAdmin.phone"] = alternateAdminPhone;
      }

      // ---------------- CALCULATED VALUES ----------------

      const cabinDesks = $set.cabinDesks ?? existingClient.cabinDesks ?? 0;

      const cabinRate = $set.cabinDeskRate ?? existingClient.cabinDeskRate ?? 0;

      const openDesks = $set.openDesks ?? existingClient.openDesks ?? 0;

      const openRate = $set.openDeskRate ?? existingClient.openDeskRate ?? 0;

      const perDeskCredits =
        $set.perDeskMeetingCredits ?? existingClient.perDeskMeetingCredits ?? 0;

      // Recalculate cabin total
      if ($set.cabinDesks !== undefined || $set.cabinDeskRate !== undefined) {
        $set.cabinTotal = cabinDesks * cabinRate;
      }

      // Recalculate open desk total
      if ($set.openDesks !== undefined || $set.openDeskRate !== undefined) {
        $set.openTotal = openDesks * openRate;
      }

      // Recalculate meeting credits
      if (
        $set.cabinDesks !== undefined ||
        $set.openDesks !== undefined ||
        $set.perDeskMeetingCredits !== undefined
      ) {
        $set.totalMeetingCredits = (cabinDesks + openDesks) * perDeskCredits;
      }

      // Recalculate total desks
      if ($set.cabinDesks !== undefined || $set.openDesks !== undefined) {
        $set.totalDesks = cabinDesks + openDesks;
      }

      // ---------------- DATE RANGE VALIDATION ----------------

      const finalTermStart = $set.termStartDate ?? existingClient.termStartDate;

      const finalTermEnd = $set.termEnd ?? existingClient.termEnd;

      if (
        finalTermStart &&
        finalTermEnd &&
        new Date(finalTermStart) > new Date(finalTermEnd)
      ) {
        addError("Term End", "Term End cannot be before Term Start Date");
      }

      // ---------------- SKIP INVALID ROW ----------------

      if (rowErrors.length) {
        validationErrors.push(...rowErrors);
        return;
      }

      if (Object.keys($set).length === 0) {
        skippedRows.push({
          row: rowNumber,
          clientName,
          reason: "No valid fields provided for update",
        });

        return;
      }

      // ---------------- PREPARE CLIENT UPDATE ----------------

      updates.push({
        clientId: existingClient._id,
        clientName,
        $set,
      });
    });

    // ---------------- VALIDATION SUMMARY ----------------

    const skippedCount =
      notFoundClients.length +
      unknownUnits.length +
      csvDuplicates.length +
      skippedRows.length +
      new Set(validationErrors.map((error) => error.row)).size;

    const unmatchedSummary = [
      notFoundClients.length &&
        `${notFoundClients.length} client(s) not found in VirtualOfficeClient`,
    ]
      .filter(Boolean)
      .join("; ");

    // ---------------- ALL-OR-NONE VALIDATION ----------------

    if (skippedCount || !updates.length) {
      return res.status(400).json({
        message: skippedCount
          ? `Bulk update cancelled: ${skippedCount} CSV row(s) could not be updated${
              unmatchedSummary ? ` (${unmatchedSummary})` : ""
            }. Fix all rows and upload again. No records were changed.`
          : "No valid update records found. No records were changed.",

        updatedCount: 0,
        skippedCount,
        notFoundClients,
        unknownUnits,
        csvDuplicates,
        validationErrors,
        skippedRows,
      });
    }

    // ---------------- PREPARE BULK OPERATIONS ----------------

    const bulkOps = updates.map((item) => ({
      updateOne: {
        filter: {
          _id: item.clientId,
          company,
        },
        update: {
          $set: item.$set,
        },
      },
    }));

    // ---------------- BULK WRITE ----------------

    // Only VirtualOfficeClient is updated.
    // VirtualOfficeRevenue is not accessed.

    const result = await VirtualOfficeClient.bulkWrite(bulkOps, {
      ordered: false,
    });

    const updatedCount = result.modifiedCount || 0;
    const matchedCount = result.matchedCount || 0;

    // ---------------- SUCCESS RESPONSE ----------------

    return res.status(200).json({
      message: `${updatedCount} virtual office clients updated successfully`,
      updatedCount,
      matchedCount,
      attemptedUpdates: bulkOps.length,
      skippedCount: 0,
      notFoundClients: [],
      unknownUnits: [],
      csvDuplicates: [],
      validationErrors: [],
      skippedRows: [],
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
  bulkUpdateVirtualOfficeClients,
  getVirtualOfficeSourcingOptions,
  addVirtualOfficeSourcingOption,
};
