const mongoose = require("mongoose");
const landlordDocumentSchema = new mongoose.Schema(
  {
    name: String,
    url: String,
    documentId: String,
  },
  { timestamps: true }
);

const landlordSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  documents: [landlordDocumentSchema],
  isDeleted: {
    type: Boolean,
    default: false,
  },
  deletedAt: {
    type: Date,
    default: null,
  },
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UserData",
    default: null,
  },
});

const Landlord = mongoose.model("Landlord", landlordSchema);
module.exports = Landlord;
