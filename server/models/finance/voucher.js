const mongoose = require("mongoose");

const voucherSchema = new mongoose.Schema(
  {
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CoworkingClient",
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
    voucherUploadedAt: {
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

const Voucher = mongoose.model("Voucher", voucherSchema);
module.exports = Voucher;
