const Department = require("../models/Departments");
const Permission = require("../models/Permissions");
const { isValidObjectId } = require("mongoose");
const { createRequestBudgetGuard } = require("../utils/requestBudgetAccess");

module.exports = createRequestBudgetGuard({ Department, Permission, isValidObjectId });
