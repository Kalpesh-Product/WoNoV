const Company = require("../../models/hr/Company");
const User = require("../../models/hr/UserData");
const { handleDocumentUpload } = require("../../config/cloudinaryConfig");
const { PDFDocument } = require("pdf-lib");
const CustomError = require("../../utils/customErrorlogs");
const { createLog } = require("../../utils/moduleLogs");

const uploadCompanyDocument = async (req, res, next) => {
  const logPath = "hr/HrLog";
  const logAction = "Upload Company Document";
  const logSourceKey = "companyData";
  const { documentName, type } = req.body;
  const file = req.file;
  const user = req.user;
  const ip = req.ip;
  const company = req.company;

  if (!file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  try {
    if (!["template", "sop", "policy", "agreement"].includes(type)) {
      throw new CustomError(
        "Invalid document type. Allowed values: template, sop, policy, agreement",
        logPath,
        logAction,
        logSourceKey
      );
    }

    const foundUser = await User.findById(user)
      .select("company")
      .populate("company", "companyName")
      .lean();

    if (!foundUser?.company) {
      throw new CustomError(
        "Company not found",
        logPath,
        logAction,
        logSourceKey
      );
    }

    // Process the PDF document
    const pdfDoc = await PDFDocument.load(file.buffer);
    pdfDoc.setTitle(
      file.originalname ? file.originalname.split(".")[0] : "Untitled"
    );
    const processedBuffer = await pdfDoc.save();

    // Upload the processed PDF to storage
    const response = await handleDocumentUpload(
      processedBuffer,
      `${foundUser.company.companyName}/${type}s`,
      originalFilename
    );

    if (!response?.public_id) {
      throw new CustomError(
        "Failed to upload document",
        logPath,
        logAction,
        logSourceKey
      );
    }

    const updateField =
      type === "template"
        ? "templates"
        : type === "sop"
        ? "sop"
        : type === "policy"
        ? "policies"
        : "agreements";

    await Company.findByIdAndUpdate(foundUser.company._id, {
      $push: {
        [updateField]: {
          name: documentName,
          documentLink: response.secure_url,
          documentId: response.public_id,
        },
      },
    });

    // Log the successful upload
    await createLog({
      path: logPath,
      action: logAction,
      remarks: `${type.toUpperCase()} uploaded successfully`,
      status: "Success",
      user: user,
      ip: ip,
      company: company,
      sourceKey: logSourceKey,
      sourceId: foundUser.company._id,
      changes: {
        documentName,
        type,
        documentLink: response.secure_url,
        documentId: response.public_id,
      },
    });

    return res
      .status(200)
      .json({ message: `${type.toUpperCase()} uploaded successfully` });
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

const getCompanyDocuments = async (req, res, next) => {
  try {
    const { type } = req.params;
    const user = req.user;

    if (!["templates", "sop", "policies", "agreements"].includes(type)) {
      return res.status(400).json({ message: "Invalid document type" });
    }

    const foundUser = await User.findOne({ _id: user })
      .select("company")
      .populate(`company`, type)
      .lean()
      .exec();

    if (!foundUser || !foundUser.company) {
      return res.status(404).json({ message: "Company not found" });
    }

    return res.status(200).json({ [type]: foundUser.company[type] || [] });
  } catch (error) {
    next(error);
  }
};

const uploadDepartmentDocument = async (req, res, next) => {
  const logPath = "hr/HrLog";
  const logAction = "Upload Department Document";
  const logSourceKey = "department";
  const { documentName, type } = req.body;
  const file = req.file;
  const user = req.user;
  const { departmentId } = req.params;
  const ip = req.ip;
  const company = req.company;

  try {
    if (!["sop", "policy"].includes(type)) {
      throw new CustomError(
        "Invalid document type. Allowed values: sop, policy",
        logPath,
        logAction,
        logSourceKey
      );
    }

    const foundUser = await User.findOne({ _id: user })
      .select("company")
      .populate([{ path: "company", select: "companyName" }])
      .lean()
      .exec();

    if (!foundUser || !foundUser.company) {
      throw new CustomError(
        "User's company not found",
        logPath,
        logAction,
        logSourceKey
      );
    }

    const foundCompany = await Company.findOne({ _id: foundUser.company })
      .select("selectedDepartments")
      .populate([{ path: "selectedDepartments.department", select: "name" }])
      .lean()
      .exec();

    if (!foundCompany) {
      throw new CustomError(
        "Company not found",
        logPath,
        logAction,
        logSourceKey
      );
    }

    const department = foundCompany.selectedDepartments.find(
      (dept) => dept.department._id.toString() === departmentId
    );

    if (!department) {
      throw new CustomError(
        "Department not found in selectedDepartments",
        logPath,
        logAction,
        logSourceKey
      );
    }

    const pdfDoc = await PDFDocument.load(file.buffer);
    pdfDoc.setTitle(
      file.originalname ? file.originalname.split(".")[0] : "Untitled"
    );
    const processedBuffer = await pdfDoc.save();

    const originalFilename = file.originalname;

    const response = await handleDocumentUpload(
      processedBuffer,
      `${foundUser.company.companyName}/departments/${department.department.name}/documents/${type}`,
      originalFilename
    );

    if (!response.public_id) {
      throw new CustomError(
        "Failed to upload document",
        logPath,
        logAction,
        logSourceKey
      );
    }

    const updateField =
      type === "sop"
        ? "selectedDepartments.$.sop"
        : "selectedDepartments.$.policies";

    const updatedCompany = await Company.findOneAndUpdate(
      {
        _id: foundUser.company._id,
        "selectedDepartments.department": departmentId,
      },
      {
        $push: {
          [updateField]: {
            name: documentName,
            documentLink: response.secure_url,
            documentId: response.public_id,
            isActive: true,
          },
        },
      },
      { new: true }
    ).exec();

    if (!updatedCompany) {
      throw new CustomError(
        "Failed to update company document field",
        logPath,
        logAction,
        logSourceKey
      );
    }

    // Log the successful upload
    await createLog({
      path: logPath,
      action: logAction,
      remarks: `${type.toUpperCase()} uploaded successfully for ${
        department.department.name
      } department`,
      status: "Success",
      user: user,
      ip: ip,
      company: company,
      sourceKey: logSourceKey,
      sourceId: foundUser.company._id,
      changes: {
        documentName,
        type,
        documentLink: response.secure_url,
        documentId: response.public_id,
      },
    });

    return res.status(200).json({
      message: `${type.toUpperCase()} uploaded successfully for ${
        department.department.name
      } department`,
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

module.exports = {
  uploadCompanyDocument,
  getCompanyDocuments,
  uploadDepartmentDocument,
};
