const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema({
  departmentId: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
});

const Department = mongoose.model("Department", departmentSchema);

module.exports = Department;
