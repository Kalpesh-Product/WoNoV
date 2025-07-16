const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  userId: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserData",
    },
  ],
  type: String,
  message: String,
  module: String,
});
const Notification = mongoose.model("Notification", notificationSchema);
module.exports = Notification;
