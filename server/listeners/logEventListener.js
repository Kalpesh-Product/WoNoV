const emitter = require("../utils/eventEmitter");
const Log = require("../models/Log");
const Notification = require("../models/Notification");
const UserData = require("../models/hr/UserData");

emitter.on("notification", async (data) => {
  try {
    const notification = await Notification.create(data);
  } catch (error) {
    console.log(error);
  }
});

async function retryOperation(operation, maxRetries = 3, delay = 500) {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      return await operation();
    } catch (error) {
      attempt++;
      if (attempt >= maxRetries) throw error;
      await new Promise((res) => setTimeout(res, delay * attempt)); // Exponential backoff
    }
  }
}

emitter.on("storeLog", async (payload) => {
  try {
    await retryOperation(() => Log.create(payload));
  } catch (error) {
    const techAdmin = await UserData.aggregate([
      {
        $lookup: {
          from: "roles",
          localField: "role",
          foreignField: "_id",
          as: "roleInfo",
        },
      },
      {
        $match: {
          "roleInfo.roleTitle": "Tech Admin",
        },
      },
    ]);

    const user = await UserData.findById(payload.performedBy);
    const fullName = user ? `${user.firstName} ${user.lastName}` : "Unknown";

    console.error({
      message: "❌ Failed to save log",
      error: error.message,
      path: payload?.path || "",
    });

    const techAdminIds = techAdmin.map((tech) => tech._id);

    emitter.emit("notification", {
      initiatorData: payload.performedBy,
      users: techAdminIds.map((userId) => ({
        userActions: {
          whichUser: userId,
          hasRead: false,
        },
      })),
      type: "store log",
      module: "Logs",
      message: `Log failure: System couldn't save ${payload.action} activity performed by ${fullName}`,
    });
  }
});
