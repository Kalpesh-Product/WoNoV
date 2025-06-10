const mongoose = require("mongoose");

const budgetSchema = new mongoose.Schema({
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
  },
  expanseName: {
    type: String,
    required: true,
  },
  expanseType: {
    type: String,
    // required: true,
    // enum: ["Internal", "External"],
  },
  paymentType: {
    type: String,
    // required: true,
    enum: ["One Time", "Recurring"],
  },
  projectedAmount: {
    type: Number,
  },
  actualAmount: {
    type: Number,
  },
  unit: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Unit",
  },
  category: {
    type: String,
  },
  status: {
    type: String,
    default: "Pending",
    enum: ["Pending", "Approved", "Rejected"],
  },
  isPaid: {
    type: String,
    default: "Unpaid",
    enum: ["Paid", "Unpaid"],
  },
  isExtraBudget: {
    type: Boolean,
    default: false,
  },
  dueDate: {
    type: Date,
    required: true,
  },
  // typeOfBudget: {
  //   type: String,
  //   required: true,
  // },
  invoice: {
    name: {
      type: String,
    },
    link: {
      type: String,
    },
    id: {
      type: String,
    },
    date: {
      type: Date,
    },
  },
  invoiceAttached: {
    type: String,
    default: false,
  },
  preApproved: {
    type: String,
    default: false,
  },
  emergencyApproval: {
    type: String,
    default: false,
  },
  budgetApproval: {
    type: String,
    default: false,
  },
  l1Approval: {
    type: String,
    default: false,
  },
  invoiceDate: {
    type: Date, //Invoice received date
  },
  reimbursementDate: {
    //Reimbursement request date
    type: Date,
  },
  srNo: {
    type: String,
  },
  particulars: [
    {
      particularName: {
        type: String,
      },
      particularAmount: {
        type: Number,
      },
    },
  ],
});

const Budget = mongoose.model("Budget", budgetSchema);
module.exports = Budget;
