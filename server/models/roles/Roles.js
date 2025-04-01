const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema({
  roleTitle: {
    type: String,
    required: true,
  },
  roleID: {
    type: String,
  },
});

const Role = mongoose.model("Role", roleSchema);

module.exports = Role;
