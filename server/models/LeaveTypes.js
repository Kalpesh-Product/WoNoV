const mongoose = require("mongoose");

const leaveTypeSchema = new mongoose.Schema(
  {
    leaveTypeId: {
      type: String,
      default: "LT-001",
    },
    company:{
          type:mongoose.Schema.Types.ObjectId,
          ref:"CompanyData"
        },
    leaveType: {
      type: String,
      default: "",
    },

    noOfDays: {
      type: Number,
      default: 3,
    },
    status: {
      type: Boolean,
      default: true,  
    },    
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,  
  }
);

const LeaveType = mongoose.model("LeaveType", leaveTypeSchema);
module.exports = LeaveType;
