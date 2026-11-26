const Log = require("../models/Log");
const modelMap = require("../config/modelMap");
const { getModulePathRegex } = require("../utils/logModule");
const mongoose = require("mongoose");

const modelSelectMap = {
  Department: "name",
};

// Some payload keys can point to different collections depending on the action.
// Example: `bookedBy` is a UserData id for internal meetings but a Visitor id
// for external meetings, so try both before giving up.
const payloadModelFallbacks = {
  bookedBy: ["UserData", "Visitor"],
  externalBookedBy: ["Visitor"],
  clientBookedBy: ["CoworkingMember"],
  client: ["CoworkingClient"],
  externalCompany: ["Visitor"],
  meetingId: ["Meeting"],
};

const pickName = (doc) =>
  doc?.visitorCompany || doc?.companyName || doc?.name || doc?.clientName || "-";

const getDateFilter = (req) => {
  const fromDate = req.query.fromDate || req.body?.fromDate;
  const toDate = req.query.toDate || req.body?.toDate;

  if (!fromDate && !toDate) return {};

  const createdAt = {};

  if (fromDate) {
    const from = new Date(fromDate);
    if (!Number.isNaN(from.getTime())) {
      from.setHours(0, 0, 0, 0);
      createdAt.$gte = from;
    }
  }

  if (toDate) {
    const to = new Date(toDate);
    if (!Number.isNaN(to.getTime())) {
      to.setHours(23, 59, 59, 999);
      createdAt.$lte = to;
    }
  }

  return Object.keys(createdAt).length ? { createdAt } : {};
};

const getLogFilter = (req) => {
  const filter = getDateFilter(req);
  const module = String(req.query.module || "").trim().toLowerCase();
  const performedBy = req.query.performedBy;
  const actions = String(req.query.actions || "")
    .split(",")
    .map((action) => action.trim().toLowerCase())
    .filter(Boolean);

  if (performedBy && mongoose.isValidObjectId(performedBy)) {
    filter.performedBy = performedBy;
  }

  if (actions.length) {
    filter.action = { $in: actions };
  }

  if (module) {
    filter.$or = [{ module }, { path: getModulePathRegex(module) }];
  }

  return filter;
};

const getLogs = async (req, res, next) => {
  try {
    // const logs = await Log.find().populate([
    //   { path: "performedBy", select: "firstName middleName lastName" },
    // ]);
    const logs = await Log.find(getLogFilter(req))
      .sort({ createdAt: -1 })
      .populate([
        { path: "performedBy", select: "firstName middleName lastName" },
      ]);

    const populatedLogs = await Promise.all(
      logs.map(async (log) => {
        const populatedPayload = { ...log.payload };

        for (const key of Object.keys(populatedPayload)) {
          const value = populatedPayload[key];

          if (!mongoose.isValidObjectId(value)) continue;

          const candidateModels = [
            ...(payloadModelFallbacks[key] || []),
            modelMap[key],
          ].filter((modelName, index, names) =>
            modelName ? names.indexOf(modelName) === index : false,
          );

          for (const modelName of candidateModels) {
            if (!mongoose.models[modelName]) continue;

            const query = mongoose.model(modelName).findById(value);
            const selectFields = modelSelectMap[modelName];

            if (selectFields) {
              query.select(selectFields);
            }

            const doc = await query.lean();
            if (!doc) continue;

            if (key === "externalCompany") {
              populatedPayload[key] = pickName(doc);
            } else {
              // The Logs modal shows Meeting Id as a compact block; the full
              // checklist belongs in the meeting module, not in log details.
              if (key === "meetingId") delete doc.housekeepingChecklist;
              populatedPayload[key] = doc;
            }

            // External meeting bookings send the visitor id as `bookedBy`.
            // Expose the same person under `externalBookedBy` so both labels
            // are populated in the Logs modal.
            if (
              key === "bookedBy" &&
              modelName === "Visitor" &&
              !populatedPayload.externalBookedBy
            ) {
              populatedPayload.externalBookedBy = doc;
            }
            break;
          }
        }

        return {
          ...log.toObject(),
          payload: populatedPayload,
        };
      }),
    );

    return res.status(200).json(populatedLogs);
  } catch (error) {
    next(error);
  }
};

module.exports = getLogs;

// const Log = require("../models/Log");

// const getLogs = async (req, res, next) => {
//   try {
//     const fetchedLogs = await Log.find().populate([
//       { path: "performedBy", select: "firstName middleName lastName" },
//     ]);

//     if (!fetchedLogs) {
//       return res.status(200).json([]);
//     }

//     return res.status(200).json(fetchedLogs);
//   } catch (error) {
//     next(error);
//   }
// };

// module.exports = getLogs;
