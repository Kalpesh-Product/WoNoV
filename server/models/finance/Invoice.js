const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema(
  {
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CoworkingClient",
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
      date: {
        type: Date,
      },
    },
    invoiceUploadedAt: {
      type: Date,
      //   required: true,
    },
    paymentStatus: {
      type: Boolean,
      default: false,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
  },
  { timestamps: true }
);

const Invoice = mongoose.model("Invoice", invoiceSchema);
module.exports = Invoice;
