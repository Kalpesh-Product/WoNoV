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
const Unit = require("../../models/locations/Unit");
const Attandance = require("../../models/hr/Attendance");
const Events = require("../../models/events/Events");
const Leaves = require("../../models/hr/Leaves");

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
  const { field } = req.query; // employeeTypes | workLocations | leaveTypes | shifts | selectedDepartments
  const companyId = req.company;

  try {
    if (!field) {
      return res.status(400).json({ message: "Field is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(companyId)) {
      return res.status(400).json({ message: "Invalid company ID provided" });
    }

    // Special case: workLocations from Unit collection
    if (field === "workLocations") {
      const workLocations = await Unit.find({ company: companyId })
        .populate({ path: "building", select: "buildingName" })
        .select("unitNo unitName isActive building");

      if (!workLocations || workLocations.length === 0) {
        return res.status(404).json({ message: "No work locations found" });
      }

      return res.status(200).json({ workLocations });
    }

    // Define which fields need to be populated
    const fieldsToPopulate = {
      selectedDepartments: {
        path: "selectedDepartments.department",
        select: "name",
      },
      employeeTypes: "", // No population
      leaveTypes: "", // No population
      shifts: "", // No population
    };

    // Build the query
    let query = Company.findById(companyId).select(field);
    if (fieldsToPopulate[field]) {
      query = query.populate(fieldsToPopulate[field]);
    }

    const company = await query.exec();

    if (!company || !company[field]) {
      return res
        .status(404)
        .json({ message: `Couldn't fetch the data for '${field}'` });
    }

    // Special case: selectedDepartments needs extra processing
    if (field === "selectedDepartments") {
      const departmentsWithManagers = await Promise.all(
        company.selectedDepartments.map(async (dep) => {
          if (!dep.admin) return { ...dep._doc, admin: null };

          const manager = await UserData.findOne({
            role: { $in: [dep.admin] },
            isActive: true,
          }).select("firstName lastName role");

          return {
            ...dep._doc,
            admin: manager ? `${manager.firstName} ${manager.lastName}` : null,
          };
        })
      );

      return res
        .status(200)
        .json({ selectedDepartments: departmentsWithManagers });
    }

    // Default return for other fields
    return res.status(200).json({ [field]: company[field] });
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

const getCompanyAttandances = async (req, res, next) => {
  try {
    const { company } = req;
    const companyAttandances = await Attandance.find({ company })
      .populate({ path: "user", select: "firstName lastName empId startDate" })
      .lean()
      .exec();

    let sundays = 0;
    let year = new Date().getFullYear().toString();
    for (let month = 0; month < 12; month++) {
      for (let day = 1; day <= 31; day++) {
        const date = new Date(year, month, day);
        if (date.getMonth() !== month) break; // invalid date
        if (date.getDay() === 0) sundays++; // 0 = Sunday
      }
    }
    const holidays = await Events.find({ company, type: "Holiday" })
      .lean()
      .exec();

    const allLeaves = await Leaves.find({ company })
      .populate({
        path: "takenBy",
        select: "firstName lastName startDate",
      })
      .lean()
      .exec();
    const workingDays = 365 - (holidays.length + sundays);
    res
      .status(200)
      .json({ companyAttandances, workingDays, holidays, allLeaves });
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

const updateCompanySubItem = async (req, res) => {
  const { user, company, ip } = req;
  const logPath = "hr/HrLog";
  const logAction = "Update Company Data";
  const logSourceKey = "companyData";
  try {
    const { type, itemId, name, isActive, startTime, endTime, isDeleted } =
      req.body;
    if (!type || !itemId)
      return res.status(400).json({ message: "type, and itemId are required" });

    if (!["policies", "sop", "shifts", "employeeTypes"].includes(type)) {
      throw new CustomError(
        "Invalid document type. Allowed values: sop, policies, shift,employeeTypes",
        logPath,
        logAction,
        logSourceKey
      );
    }

    const foundCompany = await Company.findById(company);
    if (!foundCompany)
      return res.status(404).json({ message: "Company not found" });

    let item,
      updated = false;

    const typeMap = {
      sop: "sop",
      policies: "policies",
      shifts: "shifts",
      employeeTypes: "employeeTypes",
    };

    const key = typeMap[type];

    item = foundCompany[key].id(itemId);
    if (item) {
      if (name !== undefined) item.name = name;
      if (isActive !== undefined) item.isActive = isActive;

      if (isDeleted !== undefined) item.isDeleted = isDeleted;
      if (type === "shifts") {
        if (startTime) {
          const parsedStartTime = new Date(startTime);
          item.startTime = parsedStartTime;
        }
        if (endTime) {
          const parsedEndTime = new Date(endTime);
          item.endTime = parsedEndTime;
        }
      }
      item.updatedAt = new Date();
      updated = true;
    }

    if (!updated)
      return res.status(404).json({ message: `${type} item not found` });

    await foundCompany.save({ validateBeforeSave: false });
    res.status(200).json({ message: `${type} updated successfully` });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
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
  getCompanyAttandances,
  updateCompanySubItem,
};
