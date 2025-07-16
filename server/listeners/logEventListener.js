const emitter = require("../utils/eventEmitter");
const Log = require("../models/Log");
const Notification = require("../models/Notification");

emitter.on("storeLog", async (payload) => {
  try {
    await Log.create(payload);
  } catch (error) {
    console.error("❌ Failed to save log:", error.message);
  }
});

emitter.on("notification", async (data) => {
  try {
    const notification = await Notification.create(data);
  } catch (error) {
    console.log(error);
  }
});
