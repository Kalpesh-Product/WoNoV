const mongoose = require("mongoose");

const userDataSchema = new mongoose.Schema(
  {
    empId: {
      type: String,

      unique: true,
      trim: true,
      required: true,
    },
    firstName: {
      type: String,

      trim: true,
      minlength: 2,
      required: true,
    },
    middleName: {
      type: String,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
      minlength: 2,
      required: true,
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
      required: true,
    },
    email: {
      type: String,

      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
      required: true,
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
        required: true,
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
    attendanceSource: {
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

      trim: true,
      required: true,
    },
    jobDescription: {
      type: String,
      trim: true,
    },
    clockInDetails: {
      hasClockedIn: {
        type: Boolean,
        default: false,
      },
      clockInTime: {
        type: Date,
        default: null,
      },
      clockOutTime: {
        type: Date,
        default: null,
      },
      breaks: [
        {
          start: {
            type: Date,
          },
          end: {
            type: Date,
          },
        },
      ],
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
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
      required: true,
    },
    refreshToken: { type: String },
    dateOfExit: { type: Date, default: null },
    shift: { type: String },

    // homeAddress: {
    //   addressLine1: { type: String, required: true },
    //   addressLine2: { type: String },
    //   city: { type: String, required: true },
    //   country: { type: String, required: true },
    //   state: { type: String, required: true },
    //   pinCode: { type: String, required: true },
    //   notes: { type: String },
    // },
    // bankInformation: {
    //   bankIFSC: { type: String, required: true },
    //   bankName: { type: String, required: true },
    //   branchName: { type: String, required: true },
    //   nameOnAccount: { type: String, required: true },
    //   accountNumber: {
    //     type: String,
    //     required: true,
    //   },
    // },
    // panAadhaarDetails: {
    //   aadhaarId: {
    //     type: String,
    //     required: true,
    //   },
    //   pan: {
    //     type: String,
    //     required: true,
    //   },
    //   pfAccountNumber: { type: String, required: true },
    //   pfUAN: { type: String, required: true },
    //   esiAccountNumber: { type: String, required: true },
    // },
    // payrollInformation: {
    //   includeInPayroll: { type: Boolean, required: true },
    //   payrollBatch: { type: String, required: true },
    //   professionTaxExemption: { type: Boolean, required: true },
    //   includePF: { type: Boolean, required: true },
    //   pfContributionRate: { type: String, required: true },
    //   employeePF: { type: String, required: true },
    //   employerPf: { type: String, required: true },
    //   includeEsi: { type: Boolean, required: true },
    //   esiContribution: { type: String, required: true },
    //   hraType: { type: String, required: true },
    //   tdsCalculationBasedOn: { type: String, required: true },
    //   incomeTaxRegime: { type: String, required: true },
    // },
    // familyInformation: {
    //   fatherName: { type: String, required: true },
    //   motherName: { type: String, required: true },
    //   maritalStatus: {
    //     type: String,
    //     required: true,
    //   },
    //   emergencyPhone: {
    //     type: String,
    //     minlength: 7,
    //     maxlength: 20,
    //   },
    // },

    homeAddress: {
      addressLine1: { type: String },
      addressLine2: { type: String },
      city: { type: String },
      country: { type: String },
      state: { type: String },
      pinCode: { type: String },
      notes: { type: String },
    },

    bankInformation: {
      bankIFSC: { type: String },
      bankName: { type: String },
      branchName: { type: String },
      nameOnAccount: { type: String },
      accountNumber: { type: String },
    },

    panAadhaarDetails: {
      aadhaarId: { type: String },
      pan: { type: String },
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
      employerPf: { type: String },
      includeEsi: { type: Boolean },
      esiContribution: { type: String },
      hraType: { type: String },
      tdsCalculationBasedOn: { type: String },
      incomeTaxRegime: { type: String },
    },

    familyInformation: {
      fatherName: { type: String },
      motherName: { type: String },
      maritalStatus: { type: String },
      emergencyPhone: {
        type: String,
        minlength: 7,
        maxlength: 20,
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
  {
    timestamps: true,
  },
);

const UserData = mongoose.model("UserData", userDataSchema);
module.exports = UserData;
