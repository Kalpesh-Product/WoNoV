const mongoose = require("mongoose");
const workationClientSchema = new mongoose.Schema({
  clientName: {
    type: String,
    required: true,
  },
  startDate: {
    type: Date,
  },
});

const WorkationClient = mongoose.model(
  "WorkationClient",
  workationClientSchema,
);
module.exports = WorkationClient;
