const mongoose = require("mongoose");

const moduleSchema = new mongoose.Schema({
  moduleTitle: {
    type: String,
    required: true,
    unique: true, // Ensures the title is unique
  },
  subModules: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubModule",
    },
  ],
});

const Module = mongoose.model("Module", moduleSchema);

module.exports = Module;
