const mongoose = require("mongoose");

const amcSchema = new mongoose.Schema(
  {
    contactPersonName: {
      type: String,
      required: true,
      trim: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
    },
    companyName: {
      type: String,
      trim: true,
    },
    contactNumber: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    amcStartDate: {
      type: Date,
      required: true,
    },
    amcEndDate: {
      type: Date,
      required: true,
    },
    productOrServiceName: {
      type: String,
      required: true,
      trim: true,
    },
    productSerialNumberOrId: {
      type: String,
      required: true,
      trim: true,
    },
    amcCost: {
      type: Number,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["Paid", "Unpaid"],
      default: "Unpaid",
    },
    lastServiceDate: {
      type: Date,
    },
    nextServiceDueDate: {
      type: Date,
    },
    amcStatus: {
      type: String,
    },
    remarks: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const AmcReports = mongoose.model("Amcreport", amcSchema);
module.exports = AmcReports;
