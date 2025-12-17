const mongoose = require("mongoose");

const testDataSchema = new mongoose.Schema(
  {
    empId: {
      type: String,

      unique: true,
      trim: true,
    },
    firstName: {
      type: String,

      trim: true,
      minlength: 2,
    },
    middleName: {
      type: String,
      trim: true,
    },
    lastName: {
      type: String,

      trim: true,
      minlength: 2,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
    },
    dateOfBirth: {
      type: Date,
    },
    phone: {
      type: String,
      minlength: 7,
      maxlength: 20,
    },
    email: {
      type: String,

      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
    },
    departments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Department",
      },
    ],
    password: {
      type: String,

      minlength: 8,
    },
    profilePicture: {
      id: { type: String },
      url: { type: String },
    },
    role: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Role",
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
      name: { type: String },
      leavesCount: [
        {
          leaveType: { type: String, required: true },
          count: { type: Number, default: 0, min: 0 },
        },
      ],
    },
    designation: {
      type: String,

      trim: true,
    },
    //   clockInDetails: {
    //     hasClockedIn: {
    //       type: Boolean,
    //       default: false,
    //     },
    //     clockInTime: {
    //       type: Date,
    //       default: null,
    //     },
    //     clockOutTime: {
    //       type: Date,
    //       default: null,
    //     },
    //     breaks: [
    //       {
    //         start: {
    //           type: Date,
    //         },
    //         end: {
    //           type: Date,
    //         },
    //       },
    //     ],
    //   },
    startDate: {
      type: Date,
    },
    workLocation: {
      type: String,

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
    shift: { type: String, required: true },
    homeAddress: {
      addressLine1: { type: String },
      addressLine2: { type: String },
      city: { type: String },
      state: { type: String },
      pinCode: { type: String },
      notes: { type: String },
    },
    bankInformation: {
      bankIFSC: { type: String },
      bankName: { type: String },
      branchName: { type: String },
      nameOnAccount: { type: String },
      accountNumber: {
        type: String,
      },
    },
    panAadhaarDetails: {
      aadhaarId: {
        type: String,
      },
      pan: {
        type: String,
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
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    credits: {
      type: Number,
      default: 10,
    },
  },
  { timestamps: true }
);

const TestUserData = mongoose.model("TestUserData", testDataSchema);
module.exports = TestUserData;
