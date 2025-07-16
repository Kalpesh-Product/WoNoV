const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  initiatorData: {
    initiator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserData",
    },
    hasRead: {
      type: Boolean,
      default: false,
    },
  },
  users: [
    {
      userActions: {
        whichUser: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "UserData",
        },
        hasRead: {
          type: Boolean,
          default: false,
        },
      },
    },
  ],
  type: String,
  message: String,
  module: String,
});
const Notification = mongoose.model("Notification", notificationSchema);
module.exports = Notification;
