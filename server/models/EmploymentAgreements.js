const mongoose = require("mongoose");

const employmentAgreementSchema = new mongoose.Schema(
  {
    employmentAgreementId: {
      type: String,
      default: "EA-001",
    },
    employee: {
      type: String,
      default: "",
    },
    fileUrl: {
      type: String,
      default: "",
    },

    deletedStatus: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // Enable timestamps
  }
);

const EmploymentAgreement = mongoose.model(
  "EmploymentAgreement",
  employmentAgreementSchema
);
module.exports = EmploymentAgreement;
