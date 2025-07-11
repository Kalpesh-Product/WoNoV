const emitter = require("../utils/eventEmitter");
const Log = require("../models/Log");

emitter.on("storeLog", async (payload) => {
  try {
    if (
      !payload ||
      (payload.method === "POST" && Object.keys(payload).length === 0)
    )
      return;

    await Log.create(payload);
  } catch (error) {
    console.error("❌ Failed to save log:", error.message);
  }
});
