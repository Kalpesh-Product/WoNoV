const Log = require("../models/Log");
const modelMap = require("../config/modelMap");
const mongoose = require("mongoose");

const modelSelectMap = {
  Department: "name",
};

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

const getLogs = async (req, res, next) => {
  try {
    // const logs = await Log.find().populate([
    //   { path: "performedBy", select: "firstName middleName lastName" },
    // ]);
    const logs = await Log.find(getDateFilter(req))
      .sort({ createdAt: -1 })
      .populate([
        { path: "performedBy", select: "firstName middleName lastName" },
      ]);

    const populatedLogs = await Promise.all(
      logs.map(async (log) => {
        const populatedPayload = { ...log.payload };

        for (const key of Object.keys(populatedPayload)) {
          const modelName = modelMap[key];
          const value = populatedPayload[key];

          if (modelName && mongoose.isValidObjectId(value)) {
            const Model = mongoose.model(modelName);
            const selectFields = modelSelectMap[modelName];
            const query = Model.findById(value);

            if (selectFields) {
              query.select(selectFields);
            }

            populatedPayload[key] = await query.lean();
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
