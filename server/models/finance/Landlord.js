const mongoose = require("mongoose");
const landlordSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  documents: [
    {
      name: String,
      url: String,
      documentId: String,
    },
  ],
});

const Landlord = mongoose.model("Landlord", landlordSchema);
module.exports = Landlord;
