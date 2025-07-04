const mongoose = require("mongoose");

const houseKeepingStaffSchema = new mongoose.Schema(
  {
    // Basic Information
    firstName: { type: String, required: true },
    middleName: { type: String },
    lastName: { type: String },
    gender: { type: String, enum: ["Male", "Female"] },
    role: { type: String },
    companyEmail: { type: String },
    password: { type: String },
    phoneNumber: { type: String },
    dateOfBirth: { type: Date },
    employementType: { type: String },
    employeeLeaveAndCount: { type: String },
    department: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
    dateOfJoining: { type: Date },
    workBuilding: { type: String },
    manager: { type: mongoose.Schema.Types.ObjectId, ref: "Role" },
    designation: { type: String },
    qualification: { type: String },
    shiftPolicy: { type: String },
    workSchdulePolicy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WorkSchedulePolicy",
    },
    leavePolicy: { type: String },
    holidayPolicy: {
      type: String,
    },

    // Address Info
    address: { type: String },
    presentAddress: { type: String },
    city: { type: String },
    state: { type: String },
    pinCode: { type: String },

    // Bank Info
    bankISFC: { type: String },
    bankName: { type: String },
    branchName: { type: String },
    accountName: { type: String },
    accountNumber: { type: String },

    // Identity
    aadharNumber: { type: String },
    PANCardNumber: { type: String },
    pfAccountNumber: { type: String },
    pfUAN: { type: String },
    ESIAccountNumber: { type: String },

    // Payroll
    includeInPayroll: { type: Boolean, default: true },
    employeeGrid: { type: String },
    professionalTaxExemption: { type: Boolean },
    includePf: { type: Boolean },
    employeePfContribution: { type: Number },
    employeePf: { type: Number },

    // Family & Emergency
    fatherName: { type: String },
    motherName: { type: String },
    martialStatus: {
      type: String,
      enum: ["single", "married", "divorced", "widowed"],
    },
    primaryEmergencyContactName: { type: String },
    primaryEmergencyContactNumber: { type: String },
    secondayEmergencyContactName: { type: String },
    secondaryEmergencyContactNumber: { type: String },
    houseKeepingType: {
      type: String,
      enum: ["Self", "Third Party"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const HouseKeepingStaff = mongoose.model("Housekeepingstaff", houseKeepingStaffSchema);
module.exports = HouseKeepingStaff;
