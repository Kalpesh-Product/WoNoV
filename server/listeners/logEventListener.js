const emitter = require("../utils/eventEmitter");
const Log = require("../models/Log");

const logEmitHandler = (storeLog, payload) => {
  try {
    emitter.on(storeLog, async (payload) => {
      try {
        await Log.create(payload);
      } catch (error) {
        console.error("❌ Failed to save log:", error.message);
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = logEmitHandler;

// emitter.on("storeLog", async (payload) => {
//   try {
//     await Log.create(payload);
//   } catch (error) {
//     console.error("❌ Failed to save log:", error.message);
//   }
// });
