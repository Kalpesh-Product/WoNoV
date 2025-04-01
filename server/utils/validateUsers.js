const mongoose = require("mongoose");
const User = require("../models/hr/UserData");

const validateUsers = async (users) => {
  const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

  const validAssignees = Array.isArray(users)
    ? users.filter((id) => isValidObjectId(id))
    : [];

  const existingUsers = await User.find({ _id: { $in: validAssignees } });

  return existingUsers;
};

module.exports = validateUsers;
