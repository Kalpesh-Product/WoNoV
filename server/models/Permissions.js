const mongoose = require("mongoose");
const permissionsSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserData",
    },
    permissions: [
      {
        type: String,
      },
    ],
  },
  { timestamps: true }
);

const Permissions = mongoose.model("Permissions", permissionsSchema);
module.exports = Permissions;
