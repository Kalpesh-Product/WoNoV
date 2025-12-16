const mongoose = require("mongoose");
const workationClientSchema = new mongoose.Schema({
  clientName: {
    type: String,
    required: true,
  },
});

const WorkationClient = mongoose.model(
  "WorkationClient",
  workationClientSchema
);
module.exports = WorkationClient;
