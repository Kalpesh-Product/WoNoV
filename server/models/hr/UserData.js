const mongoose = require("mongoose");

const userDataSchema = new mongoose.Schema({
  empId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
  },
  middleName: {
    type: String,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
  },
  gender: {
    type: String,
    enum: ["Male", "Female", "Other"],
    required: true,
  },
  dateOfBirth: {
    type: Date,
    required: true,
  },
  phone: {
    type: String,
    minlength: 7,
    maxlength: 20,
    match: [/^\+?[0-9]+$/, "Invalid phone number format"],
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
    required: true,
  },
  departments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
    },
  ],
  password: {
    type: String,
    required: true,
    minlength: 8,
  },
  profilePicture: {
    id: { type: String },
    url: { type: String, match: [/^https?:\/\//, "Invalid URL format"] },
  },
  role: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
      required: true,
    },
  ],
  permissions: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Permission",
  },
  assignedAsset: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Asset",
    },
  ],
  qualification: {
    type: String,
    trim: true,
  },
  employeeType: {
    name: { type: String, required: true },
    leavesCount: [
      {
        leaveType: { type: String, required: true },
        count: { type: Number, default: 0, min: 0 },
      },
    ],
  },
  designation: {
    type: String,
    required: true,
    trim: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  workLocation: {
    type: String,
    required: true,
    trim: true,
    // type: mongoose.Schema.Types.ObjectId,
    // ref: "Unit",
  },
  reportsTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Role",
  },
  refreshToken: { type: String },
  dateOfExit: { type: Date },
  policies: {
    shift: { type: String, required: true },
    workSchedulePolicy: { type: String, required: true },
    attendanceSource: { type: String },
    leavePolicy: { type: String },
    holidayPolicy: { type: String },
  },
  homeAddress: {
    addressLine1: { type: String },
    addressLine2: { type: String },
    city: { type: String },
    state: { type: String },
    pinCode: { type: String, match: [/^[0-9]{4,10}$/, "Invalid pin code"] },
    notes: { type: String },
  },
  bankInformation: {
    bankIFSC: { type: String },
    bankName: { type: String },
    branchName: { type: String },
    nameOnAccount: { type: String },
    accountNumber: {
      type: String,
      match: [/^[0-9]+$/, "Invalid account number"],
    },
  },
  panAadhaarDetails: {
    aadhaarId: {
      type: String,
      match: [/^[0-9]{12}$/, "Invalid Aadhaar number"],
    },
    pan: {
      type: String,
      match: [/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN format"],
    },
    pfAccountNumber: { type: String },
    pfUAN: { type: String },
    esiAccountNumber: { type: String },
  },
  payrollInformation: {
    includeInPayroll: { type: Boolean },
    payrollBatch: { type: String },
    professionTaxExemption: { type: Boolean },
    includePF: { type: Boolean },
    pfContributionRate: { type: String },
    employeePF: { type: String },
  },
  familyInformation: {
    fatherName: { type: String },
    motherName: { type: String },
    maritalStatus: {
      type: String,
      enum: ["Single", "Married", "Divorced", "Widowed"],
    },
  },
  isActive: {
    type: Boolean,
    default: false,
  },
});

const UserData = mongoose.model("UserData", userDataSchema);
module.exports = UserData;
