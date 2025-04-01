const mongoose = require("mongoose");

const designationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
    required: true,
  },
  responsibilities: {
    type: [String],
    required: true,
    validate: {
      validator: function (v) {
        return v && v.length > 0;
      },
      message: "At least one responsibility must be specified.",
    },
  },
});

const Designation = mongoose.model("Designation", designationSchema);

module.exports = Designation;
