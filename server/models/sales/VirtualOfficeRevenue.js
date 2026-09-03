const mongoose = require("mongoose");

const virtualOfficeRevenueSchema = new mongoose.Schema(
  {
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "VirtualOfficeClient",
      required: true,
    },
    location: {
      type: String,
      // required: true,
    },

    channel: {
      type: String,
      enum: ["Direct", "SPV"],
      // required: true,
    },
    taxableAmount: {
      type: Number,
      required: true,
    },
    revenue: {
      type: Number,
      required: true,
    },
    receivedAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalTerm: {
      type: Number, // Assuming in months
      // required: true,
    },
    dueTerm: {
      type: Date, // Assuming in months
      // required: true,
    },
    rentDate: {
      type: Date,
      // required: true,
    },
     invoice: {
      name: String,
      link: String,
      id: String,
      date: Date,
    },
    invoiceUploadedAt: Date,
    invoiceUploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserData",
    },
    status: {
      type: Boolean,
      default: true,
    },
    rentStatus: {
      type: String,
    },
    isManualInvoice: {
      type: Boolean,
      default: false,
    },
    pastDueDate: {
      type: Date,
    },
    annualIncrement: {
      type: Number, // Represented in percentage or amount depending on use-case
    },
    nextIncrementDate: {
      type: Date,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ClientService",
    },
  },
  { timestamps: true },
);

virtualOfficeRevenueSchema.index({ company: 1 });
// virtualOfficeRevenueSchema.index({ company: 1, rentDate: 1 });

const VirtualOfficeRevenue = mongoose.model(
  "VirtualOfficeRevenue",
  virtualOfficeRevenueSchema,
);

module.exports = VirtualOfficeRevenue;
