const mongoose = require("mongoose");

const houseKeepingSchema = new mongoose.Schema({
  name: { type: String, required: true },
  gender: {
    type: String,
    enum: ["male", "female"],
  },
  unit: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Unit",
  },
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Role",
  },
});

const HouseKeepingStaff = mongoose.model(
  "HouseKeepingStaff",
  houseKeepingSchema
);
module.exports = HouseKeepingStaff;
