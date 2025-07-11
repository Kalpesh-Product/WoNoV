const mongoose = require("mongoose");

const logSchema = new mongoose.Schema(
  {
    departments: [
      {
        _id: {
          type: String,
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
      },
    ],
    // module: {
    //   type: String,
    //   required: true,
    // },
    // submodule: {
    //   type: String,
    //   required: true,
    // },
    action: {
      type: String,
      required: true,
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserData",
      required: true,
    },
    payload: {
      type: Object,
    },
    ipAddress: {
      type: String,
    },
    statusCode: {
      type: String,
    },
    path: {
      type: String,
    },
    method: {
      type: String,
    },
    success: {
      type: Boolean,
    },
    responseTime: {
      type: Number, //milliseconds
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Log = mongoose.model("Log", logSchema);
module.exports = Log;
