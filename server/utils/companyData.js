const Company = require("../models/hr/Company");

async function UpdateEmployeeTypeStatus(companyId, name, status) {
  const updatedStatus = await Company.findOneAndUpdate(
    { _id: companyId, "employeeTypes.name": name },
    { $set: { "employeeTypes.$.status": status } },
    { new: true }
  );
  return updatedStatus;
}

async function updateWorkLocationStatus(companyId, name, status) {
  const updatedStatus = await Company.findOneAndUpdate(
    { _id: companyId, "workLocations.name": name },
    { $set: { "workLocations.$.status": status } },
    { new: true }
  );

  return updatedStatus;
}

async function updateLeaveTypeStatus(companyId, name, status) {
  const updatedStatus = await Company.findOneAndUpdate(
    { _id: companyId, "leaveTypes.name": name },
    { $set: { "leaveTypes.$.status": status } },
    { new: true }
  );
  return updatedStatus;
}

async function updateShiftStatus(companyId, name, status) {
  const updatedStatus = await Company.findOneAndUpdate(
    { _id: companyId, "shifts.name": name },
    { $set: { "shifts.$.status": status } },
    { new: true }
  );
  return updatedStatus;
}

module.exports = {
  UpdateEmployeeTypeStatus,
  updateWorkLocationStatus,
  updateLeaveTypeStatus,
  updateShiftStatus,
};
