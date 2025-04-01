const mongoose = require("mongoose");
const payrollSchema = new mongoose.Schema(
  {
    empoloyee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserData",
    },
    totalSalary: {
      type: Number,
      required: true,
    },
    reimbursment: Number,
    status: {
      type: String,
      enum: ["Completed", "Pending", "Rejected"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

const Payroll = mongoose.model("Payroll", payrollSchema);
module.exports = Payroll;
