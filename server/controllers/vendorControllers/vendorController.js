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
  try {
    const userId = req.user;

    // Fetch user details along with role and department information
    const user = await User.findOne({ _id: userId })
      .select("company departments role")
      .populate([{ path: "role", select: "roleTitle" }])
      .lean()
      .exec();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the user is a Master Admin or Super Admin
    if (
      user.role.some(
        (role) =>
          role.roleTitle === "Master Admin" || role.roleTitle === "Super Admin"
      )
    ) {
      // Fetch all vendors for the company
      const vendors = await Vendor.find({ company: user.company })
        .lean()
        .exec();
      return res.status(200).json(vendors);
    }

    // Fetch the company and check if the user is an admin of any department
    const company = await Company.findOne({ _id: user.company })
      .populate([
        {
          path: "selectedDepartments.department",
          select: "name",
        },
        {
          path: "selectedDepartments.admin",
          select: "name email", // Select relevant fields
        },
      ])
      .lean()
      .exec();

    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    // Get departments where the user is an admin
    const adminDepartments = company.selectedDepartments.filter((dept) =>
      dept.admin.some((adminId) => adminId.toString() === user._id.toString())
    );

    if (adminDepartments.length === 0) {
      return res
        .status(403)
        .json({ message: "User is not an admin of any department" });
    }

    // Get department IDs

    const adminDepartmentIds = adminDepartments.map(
      (dept) => dept.department._id
    );

    // Fetch vendors belonging to those departments
    const vendors = await Vendor.find({
      departmentId: { $in: adminDepartmentIds },
    })
      .lean()
      .exec();

    return res.status(200).json(vendors);
  } catch (error) {
    next(error);
  }
};

const bulkInsertVendor = async (req, res, next) => {
  try {
    const vendorCsv = req.file;
    if (!req.file) {
      return res
        .status(400)
        .json({ message: "please provide a valid csv file" });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = { onboardVendor, fetchVendors };
