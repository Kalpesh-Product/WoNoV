const mongoose = require("mongoose");

//Company budget
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
    type: String
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
    type: Date
  },
  // typeOfBudget: {
  //   type: String,
  //   required: true,
  // },
  voucher: {
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
    invoiceNo: {
      type: String,
    },
    date: {
      type: Date,
    },
  },
  gstIn: {
    type: String,
    match: [/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/],
  },
  invoiceAttached: {
    type: Boolean,
    default: false,
  },
  preApproved: {
    type: Boolean,
    default: false,
  },
  emergencyApproval: {
    type: Boolean,
    default: false,
  },
  isOnlyBudget: {
    type: Boolean,
  },
  includesBudget: Boolean,
  budgetApproval: {
    type: Boolean,
    default: false,
  },
  l1Approval: {
    type: Boolean,
    default: false,
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
  //Finance dept approving budget
  finance: {
    fSrNo: {
      type: String,
    },
    voucher: {
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
    particulars: [
      {
        particularName: { type: String },
        particularAmount: { type: Number },
      },
    ],
    modeOfPayment: {
      type: String,
      enum: ["Cash", "Cheque", "NEFT", "RTGS", "IMPS", "Credit Card", "ETC"],
    },
    chequeNo: {
      type: String,
      match: [/^[0-9]{6,9}$/],
    },
    chequeDate: Date,
    // Advance payment section
    advanceAmount: Number,
    expectedDateInvoice: Date,
    approvedAt: {
      type: Date,
    },
  },
});

const Budget = mongoose.model("Budget", budgetSchema);
module.exports = Budget;
