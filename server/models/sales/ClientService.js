const mongoose = require("mongoose");

const clientServiceSchema = new mongoose.Schema(
  {
    serviceName: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
    },
  },
  { timestamps: true }
);

const ClientService = mongoose.model("ClientService", clientServiceSchema);
module.exports = ClientService;
