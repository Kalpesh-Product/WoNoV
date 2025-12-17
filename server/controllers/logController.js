const Log = require("../models/Log");
const modelMap = require("../config/modelMap");
const mongoose = require("mongoose");

const getLogs = async (req, res, next) => {
  try {
    const logs = await Log.find().populate([
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
            populatedPayload[key] = await Model.findById(value).lean();
          }
        }

        return {
          ...log.toObject(),
          payload: populatedPayload,
        };
      })
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
