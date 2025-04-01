const sharp = require("sharp");
const mongoose = require("mongoose");
const {
  handleFileUpload,
  handleFileDelete,
} = require("../../config/cloudinaryConfig");
const Company = require("../../models/hr/Company");
const {
  updateWorkLocationStatus,
  updateShiftStatus,
  updateLeaveTypeStatus,
  UpdateEmployeeTypeStatus,
} = require("../../utils/companyData");
const { createLog } = require("../../utils/moduleLogs");
const CustomError = require("../../utils/customErrorlogs");
const buildHierarchy = require("../../utils/generateHierarchy");
const UserData = require("../../models/hr/UserData");

const addCompany = async (req, res, next) => {
  const logPath = "hr/HrLog";
  const logAction = "Add Company";
  const logSourceKey = "companyData";
  const { user, ip, company } = req;

  try {
    const {
      companyId,
      selectedDepartments,
      companyName,
      industry,
      companySize,
      companyCity,
      companyState,
      websiteURL,
      linkedinURL,
      employeeType,
    } = req.body;

    // Validate required fields
    if (
      !companyId ||
      !companyName ||
      !industry ||
      !companySize ||
      !companyCity ||
      !companyState
    ) {
      throw new CustomError(
        "Missing required fields",
        logPath,
        logAction,
        logSourceKey
      );
    }

    // Create a new company instance
    const newCompany = new Company({
      companyId,
      selectedDepartments,
      companyName,
      industry,
      companySize,
      companyCity,
      companyState,
      websiteURL,
      linkedinURL,
      employeeType,
    });

    // Save the company to the database
    await newCompany.save();

    // Log the successful creation of a company
    await createLog({
      path: logPath,
      action: logAction,
      remarks: "Company added successfully",
      status: "Success",
      user: user,
      ip: ip,
      company: company,
      sourceKey: logSourceKey,
      sourceId: newCompany._id,
      changes: newCompany,
    });

    return res.status(201).json({
      message: "Company added successfully",
      company: newCompany,
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

const getCompanies = async (req, res, next) => {
  try {
    const companies = await Company.find();
    return res.status(200).json(companies);
  } catch (error) {
    next(error);
  }
};

const addCompanyLogo = async (req, res, next) => {
  const logPath = "hr/HrLog";
  const logAction = "Add Company Logo";
  const logSourceKey = "companyData";
  const { company } = req.userData;
  const { user } = req;
  const ip = req.ip;

  try {
    let imageId;
    let imageUrl;

    if (req.file) {
      const file = req.file;

      const buffer = await sharp(file.buffer)
        .resize(1262, 284, { fit: "contain" })
        .webp({ quality: 80 })
        .toBuffer();

      const foundCompany = await Company.findOne({ _id: company })
        .lean()
        .exec();

      if (foundCompany.companyLogo.logoId) {
        const response = await handleFileDelete(
          foundCompany.companyLogo.logoId
        );

        if (response?.result !== "ok") {
          return res
            .status(500)
            .json({ message: "Failed to delete existing logo" });
        }
        await Company.findOneAndUpdate(
          { _id: company },
          {
            $unset: {
              "companyLogo.logoId": "",
              "companyLogo.logoUrl": "",
            },
          }
        )
          .lean()
          .exec();
      }

      const base64Image = `data:image/webp;base64,${buffer.toString("base64")}`;
      const uploadResult = await handleFileUpload(
        base64Image,
        `${foundCompany.companyName}/logo`
      );

      imageId = uploadResult.public_id;
      imageUrl = uploadResult.secure_url;
    }

    const companyLogo = { logoId: imageId, logoUrl: imageUrl };

    const newCompanyLogo = await Company.findByIdAndUpdate(
      { _id: company },
      { companyLogo },
      { new: true }
    );

    if (!newCompanyLogo) {
      throw new CustomError(
        "Couldn't add company logo",
        logPath,
        logAction,
        logSourceKey
      );
    }

    await createLog({
      path: logPath,
      action: logAction,
      remarks: "Logo added successfully",
      status: "Success",
      user: user,
      ip: ip,
      company: company,
      sourceKey: logSourceKey,
      sourceId: newCompanyLogo._id,
      changes: { companyLogo },
    });

    return res.status(201).json({
      message: "Logo added successfully",
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

const getCompanyLogo = async (req, res, next) => {
  try {
    const companyId = req.userData.company;

    const company = await Company.findById({ _id: companyId }).select(
      "companyLogo"
    );

    if (!company) {
      return res.status(400).json({ message: "Couldn't fetch company logo" });
    }

    return res.status(200).json(company.companyLogo);
  } catch (error) {
    next(error);
  }
};

const getCompanyData = async (req, res, next) => {
  const { field } = req.query; // employeeTypes | workLocations | leaveTypes | shifts
  const companyId = req.company;

  try {
    if (!field) {
      return res.status(400).json({ message: "Field is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(companyId)) {
      return res.status(400).json({ message: "Invalid company ID provided" });
    }

    // Define fields that require population
    const fieldsToPopulate = {
      selectedDepartments: "selectedDepartments.department",
      employeeTypes: "",
      workLocations: "",
      leaveTypes: "",
      shifts: "",
    };

    let query = Company.findOne({ _id: companyId })
      .populate(fieldsToPopulate[field])
      .select(field);

    // Populate if the field is in the fieldsToPopulate map
    if (field === "workLocations") {
      query = query.populate({ path: "workLocations", select: "-company" });
    }

    const fetchedData = await query.exec();

    if (!fetchedData || !fetchedData[field]) {
      return res.status(400).json({ message: "Couldn't fetch the data" });
    }

    return res.status(200).json({ [field]: fetchedData[field] });
  } catch (error) {
    next(error);
  }
};

const updateActiveStatus = async (req, res, next) => {
  const { status, name } = req.body;
  const { field } = req.params;
  const companyId = req.userData.company;
  const user = req.user;
  const ip = req.ip;
  const logPath = "hr/HrLog";
  const logAction = "Update Active Status";
  const logSourceKey = "companyData";

  try {
    if (!field) {
      throw new CustomError(
        "Missing required field: field",
        logPath,
        logAction,
        logSourceKey
      );
    }

    if (typeof status !== "boolean") {
      throw new CustomError(
        "Status should be a boolean",
        logPath,
        logAction,
        logSourceKey
      );
    }

    if (!mongoose.Types.ObjectId.isValid(companyId)) {
      throw new CustomError(
        "Invalid company ID provided",
        logPath,
        logAction,
        logSourceKey
      );
    }

    const updateHandlers = {
      workLocations: updateWorkLocationStatus,
      employeeTypes: UpdateEmployeeTypeStatus,
      shifts: updateShiftStatus,
      leaveTypes: updateLeaveTypeStatus,
    };

    const updatedFunction = updateHandlers[field];
    if (!updatedFunction) {
      throw new CustomError(
        "Invalid field provided",
        logPath,
        logAction,
        logSourceKey
      );
    }

    const updatedStatus = await updatedFunction(companyId, name, status);
    if (!updatedStatus) {
      throw new CustomError(
        "Couldn't update status",
        logPath,
        logAction,
        logSourceKey
      );
    }

    // Log the successful status update
    await createLog({
      path: logPath,
      action: logAction,
      remarks: "Status updated successfully",
      status: "Success",
      user: user,
      ip: ip,
      company: companyId,
      sourceKey: logSourceKey,
      sourceId: updatedStatus._id,
      changes: { field, status },
    });

    return res.status(200).json({
      message: "Status updated successfully",
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

const getHierarchy = async (req, res, next) => {
  try {
    const company = req.company;
    if (!company) {
      return res
        .status(400)
        .json({ message: "User does not belong to any company" });
    }

    const users = await UserData.find({ company, isActive: true })
      .populate({ path: "role", select: "roleTitle roleID" }) // Fetch roles
      .populate({ path: "departments", select: "name" }) // Fetch departments
      .populate({ path: "reportsTo", select: "roleTitle roleID" }) // Get reportsTo as roleTitle
      .lean()
      .exec();

    const generateHierarchy = buildHierarchy(users);
    if (!generateHierarchy) {
      return res.status(400).json({ message: "No hierarchy found" });
    }
    res.status(200).json({ generateHierarchy });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addCompany,
  addCompanyLogo,
  getCompanies,
  updateActiveStatus,
  getCompanyData,
  getCompanyLogo,
  getHierarchy,
};
