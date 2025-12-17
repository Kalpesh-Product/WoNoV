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
  const { ip, company, user } = req;

  try {
    const {
      name,
      email,
      mobile,
      address,
      departmentId,
      state,
      country,
      city,
      pinCode,
      panIdNo,
      gstIn,
      partyType,
      ifscCode,
      bankName,
      branchName,
      nameOnAccount,
      accountNumber,
      companyName,
    } = req.body;

    if (!name || !email || !mobile || !departmentId) {
      throw new CustomError(
        "Missing required fields",
        logPath,
        logAction,
        logSourceKey
      );
    }

    const existingDetails = [
      email,
      panIdNo,
      gstIn,
      ifscCode,
      bankName,
      branchName,
      nameOnAccount,
      accountNumber,
    ];

    const emailExists = await Vendor.findOne({ email });

    if (emailExists) {
      throw new CustomError(
        "Email already exists",
        logPath,
        logAction,
        logSourceKey
      );
    }

    const currentUser = await User.findOne({ _id: user })
      .select("departments company role")
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

    const roleIds = currentUser.role.map((role) => role._id);

    const companyDoc = await Company.findOne({
      _id: currentUser.company,
      selectedDepartments: {
        $elemMatch: {
          department: departmentId,
          $or: [
            { admin: { $in: roleIds } },
            { admin: { $exists: false } },
            { admin: null },
            // { admin: "" },
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
      email,
      mobile,
      address,
      departmentId, // Validated department
      company, // Use the company from the companyDoc
      state,
      country,
      city,
      pinCode,
      panIdNo,
      gstIn,
      partyType,
      ifscCode,
      bankName,
      branchName,
      nameOnAccount,
      accountNumber,
      companyName,
      onboardingDate: new Date(),
    });

    await newVendor.save();

    // Log the successful vendor onboarding
    await createLog({
      path: logPath,
      action: logAction,
      remarks: "Vendor onboarded successfully",
      status: "Success",
      user: user,
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

const updateVendor = async (req, res, next) => {
  const logPath = "hr/HrLog";
  const logAction = "Update Vendor";
  const logSourceKey = "vendor";
  const { ip, company, user } = req;

  try {
    const { vendorId } = req.params;
    const updateData = req.body;

    if (!vendorId) {
      throw new CustomError(
        "Vendor ID is required",
        logPath,
        logAction,
        logSourceKey
      );
    }

    const currentUser = await User.findOne({ _id: user })
      .select("departments company role")
      .lean()
      .exec();

    if (!currentUser) {
      throw new CustomError("User not found", logPath, logAction, logSourceKey);
    }

    const vendor = await Vendor.findById({ _id: vendorId });
    if (!vendor) {
      throw new CustomError(
        "Vendor not found",
        logPath,
        logAction,
        logSourceKey
      );
    }

    // Check if the user is a member of the department the vendor belongs to
    const isMember = currentUser.departments.find(
      (dept) => dept._id.toString() === vendor.departmentId.toString()
    );
    if (!isMember) {
      throw new CustomError(
        "You are not a member of this department.",
        logPath,
        logAction,
        logSourceKey
      );
    }

    const roleIds = currentUser.role.map((role) => role._id);

    const companyDoc = await Company.findOne({
      _id: currentUser.company,
      selectedDepartments: {
        $elemMatch: {
          department: vendor.departmentId,
          $or: [
            { admin: { $in: roleIds } },
            { admin: { $exists: false } },
            { admin: null },
          ],
        },
      },
    })
      .lean()
      .exec();

    if (!companyDoc) {
      throw new CustomError(
        "You are not authorized to update this vendor.",
        logPath,
        logAction,
        logSourceKey
      );
    }

    // Update vendor
    const updatedVendor = await Vendor.findByIdAndUpdate(
      vendorId,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    // Log the vendor update
    await createLog({
      path: logPath,
      action: logAction,
      remarks: "Vendor updated successfully",
      status: "Success",
      user: user,
      ip: ip,
      company: company,
      sourceKey: logSourceKey,
      sourceId: vendorId,
      changes: updateData,
    });

    return res.status(200).json({
      message: "Vendor updated successfully",
    });
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

    if (!vendors) {
      return res.status(200).json([]);
    }
    return res.status(200).json(vendors);
  }
  vendors = await Vendor.find({ company })
    .populate({ path: "departmentId" })
    .lean()
    .exec();
  return res.status(200).json(vendors);
};

const bulkInsertVendors = async (req, res, next) => {
  try {
    const file = req.file;
    const { departmentId } = req.params;
    const company = req.company;

    if (!file) {
      return res.status(400).json({ message: "Please provide a csv file" });
    }

    const csvData = file.buffer.toString("utf-8").trim();
    const vendors = [];

    const parseCSV = () =>
      new Promise((resolve, reject) => {
        Readable.from(csvData)
          .pipe(csvParser())
          .on("data", (row) => {
            const vendor = {
              name: row["Vendor Name"]?.trim(),
              companyName: row["Company Name"]?.trim(),
              onboardingDate: row["Onboarding Date"]
                ? new Date(row["Onboarding Date"])
                : undefined,
              email: row["Email Id"]?.toLowerCase().trim(),
              mobile: row["Mobile No"]?.trim(),
              address: row["Address"]?.trim(),
              country: row["Country"]?.trim(),
              state: row["State"]?.trim(),
              city: row["City"]?.trim(),
              pinCode: row["Pin Code"]?.trim(),
              panIdNo: row["PAN"]?.trim(),
              gstIn: row["GSTIN"]?.trim(),
              partyType: row["Party Type (Domestic / International)"]?.trim(),
              status: row["Vendor Status (Active / Inactive)"]?.trim(),
              bankName: row["Bank Name"]?.trim(),
              branchName: row["Branch Name"]?.trim(),
              accountNumber: row["Account No"]?.trim(),
              ifscCode: row["IFSC Code"]?.trim(),
              departmentId,
              company,
            };

            vendors.push(vendor);
          })
          .on("end", resolve)
          .on("error", reject);
      });

    await parseCSV();

    // Optional: check for required fields and filter invalid rows
    const validVendors = vendors.filter(
      (v) => v.name && v.email && v.companyName && v.address
    );

    if (!validVendors.length) {
      return res
        .status(400)
        .json({ message: "No valid vendor records found in the file." });
    }

    const insertedVendors = await Vendor.insertMany(validVendors);


    res.status(201).json({
      message: `${insertedVendors.length} vendors inserted successfully.`,
      data: insertedVendors,
    });
  } catch (error) {
    if (error.name === "BulkWriteError") {
      return res
        .status(409)
        .json({ message: "Duplicate entries found", error: error.message });
    }
    next(error);
  }
};

module.exports = {
  onboardVendor,
  fetchVendors,
  updateVendor,
  bulkInsertVendors,
};
