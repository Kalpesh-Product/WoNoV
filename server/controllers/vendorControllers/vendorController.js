const Vendor = require("../../models/hr/Vendor");
const User = require("../../models/hr/UserData");
const Company = require("../../models/hr/Company");
const csvParser = require("csv-parser");
const { Readable } = require("stream");
const mongoose = require("mongoose");
const CustomError = require("../../utils/customErrorlogs");
const { createLog } = require("../../utils/moduleLogs");

const onboardVendor = async (req, res, next) => {
  const logPath = "hr/HrLog";
  const logAction = "Onboard Vendor";
  const logSourceKey = "vendor";
  const { ip, company, user: userId } = req;

  try {
    const {
      name,
      address,
      departmentId,
      state,
      country,
      pinCode,
      panItNo,
      gstUin,
      registrationType,
      assesseeOfOtherTerritory,
      isEcommerceOperator,
      isDeemedExporter,
      partyType,
      gstinUin,
      isTransporter,
    } = req.body;

    const currentUser = await User.findOne({ _id: userId })
      .select("departments company")
      .lean()
      .exec();

    if (!currentUser) {
      throw new CustomError("User not found", logPath, logAction, logSourceKey);
    }

    // Check if the user is part of the given department
    const isMember = currentUser.departments.find(
      (dept) => dept._id.toString() === departmentId
    );
    if (!isMember) {
      throw new CustomError(
        "You are not a member of this department.",
        logPath,
        logAction,
        logSourceKey
      );
    }

    const companyDoc = await Company.findOne({
      _id: currentUser.company,
      selectedDepartments: {
        $elemMatch: {
          department: departmentId,
          $or: [
            { admin: { $in: currentUser.role } },
            { admin: { $exists: false } },
            { admin: null },
            { admin: "" },
          ],
        },
      },
    })
      .lean()
      .exec();

    if (!companyDoc) {
      throw new CustomError(
        "You are not authorized to onboard a vendor for this department.",
        logPath,
        logAction,
        logSourceKey
      );
    }

    // Create and save the vendor
    const newVendor = new Vendor({
      name,
      address,
      departmentId, // Validated department
      company: companyDoc._id, // Use the company from the companyDoc
      state,
      country,
      pinCode,
      panItNo,
      gstUin,
      registrationType,
      assesseeOfOtherTerritory,
      isEcommerceOperator,
      isDeemedExporter,
      partyType,
      gstinUin,
      isTransporter,
    });

    await newVendor.save();

    // Log the successful vendor onboarding
    await createLog({
      path: logPath,
      action: logAction,
      remarks: "Vendor onboarded successfully",
      status: "Success",
      user: userId,
      ip: ip,
      company: company,
      sourceKey: logSourceKey,
      sourceId: newVendor._id,
      changes: newVendor,
    });

    return res
      .status(201)
      .json({ message: "Vendor onboarded successfully", vendor: newVendor });
  } catch (error) {
    if (error instanceof CustomError) {
      next(error);
    } else {
      next(
        new CustomError(error.message, logPath, logAction, logSourceKey, 500)
      );
    }
  }
};

const fetchVendors = async (req, res, next) => {
  const company = req.company;
  const { departmentId } = req.params;
  let vendors;
  if (departmentId) {
    vendors = await Vendor.find({ company, departmentId }).lean().exec();
    return res.status(200).json(vendors);
  }
  vendors = await Vendor.find({ company }).lean().exec();
  return res.status(200).json(vendors);
};

module.exports = { onboardVendor, fetchVendors };
