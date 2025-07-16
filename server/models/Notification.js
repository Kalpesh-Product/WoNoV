const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    initiatorData: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserData",
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
  },
  { timestamps: true }
);
const Notification = mongoose.model("Notification", notificationSchema);
module.exports = Notification;
