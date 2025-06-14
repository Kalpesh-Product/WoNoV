const Company = require("../../models/hr/Company");
const User = require("../../models/hr/UserData");
const { handleDocumentUpload } = require("../../config/cloudinaryConfig");
const { PDFDocument } = require("pdf-lib");
const CustomError = require("../../utils/customErrorlogs");
const { createLog } = require("../../utils/moduleLogs");
const path = require("path");

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

    const allowedExtensions = [".pdf", ".doc", ".docx", ".xls", ".xlsx"];
    const extension = path.extname(file.originalname).toLowerCase();

    if (!allowedExtensions.includes(extension)) {
      throw new CustomError(
        `Unsupported file type. Allowed extensions: ${allowedExtensions.join(
          ", "
        )}`,
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

    let finalBuffer = file.buffer;

    // Process PDF only if file is a PDF
    if (extension === ".pdf") {
      const pdfDoc = await PDFDocument.load(file.buffer);
      pdfDoc.setTitle(
        file.originalname ? file.originalname.split(".")[0] : "Untitled"
      );
      finalBuffer = await pdfDoc.save();
    }

    const folderName = `${foundUser.company.companyName}/${type}s`;
    const sanitizedFileName = file.originalname.replace(/\s+/g, "_");

    const response = await handleDocumentUpload(
      finalBuffer,
      folderName,
      sanitizedFileName
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

    const allowedMimeTypes = [
      "application/pdf",
      "application/msword", // .doc
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new CustomError(
        "Invalid file type. Allowed types: PDF, DOC, DOCX",
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

    let processedBuffer = file.buffer;
    const originalFilename = file.originalname;

    // Process PDF: set document title
    if (file.mimetype === "application/pdf") {
      const pdfDoc = await PDFDocument.load(file.buffer);
      pdfDoc.setTitle(
        file.originalname ? file.originalname.split(".")[0] : "Untitled"
      );
      processedBuffer = await pdfDoc.save();
    }

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

const getDepartmentDocuments = async (req, res, next) => {
  try {
    const companyId = req.company;
    const { departmentId } = req.query;
    const { type } = req.query;

    if (!departmentId) {
      return res.status(400).json({ message: "Department ID is required" });
    }

    const companyData = await Company.findOne({ _id: companyId }).lean().exec();
    const department = companyData?.selectedDepartments?.find(
      (dept) => dept.department.toString() === departmentId
    );

    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    const hasSOP = Array.isArray(department.sop) && department.sop.length > 0;
    const hasPolicies =
      Array.isArray(department.policies) && department.policies.length > 0;

    // Check based on 'type'
    if (type) {
      if (type === "sop") {
        if (!hasSOP) {
          return res
            .status(404)
            .json({ message: "No SOP documents found for this department" });
        }
        return res
          .status(200)
          .json({ documents: { sopDocuments: department.sop } });
      } else if (type === "policies") {
        if (!hasPolicies) {
          return res
            .status(404)
            .json({ message: "No policy documents found for this department" });
        }
        return res
          .status(200)
          .json({ documents: { policyDocuments: department.policies } });
      } else {
        return res.status(400).json({
          message: "Invalid document type. Must be 'sop' or 'policies'",
        });
      }
    }

    // If no type provided, return both if available
    if (!hasSOP && !hasPolicies) {
      return res
        .status(404)
        .json({ message: "No documents found for this department" });
    }

    const response = {};
    if (hasSOP) response.sopDocuments = department.sop;
    if (hasPolicies) response.policyDocuments = department.policies;

    return res.status(200).json({ documents: response });
  } catch (error) {
    next(error);
  }
};

const addCompanyKyc = async (req, res, next) => {
  try {
    const { type, documentName, nameOfDirector } = req.body;
    const companyId = req.company;

    if (!companyId || !type) {
      return res
        .status(400)
        .json({ message: "companyId and type are required" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const { originalname, buffer } = req.file;
    const uploads = [];
    const company = await Company.findOne({ _id: companyId });

    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    const now = new Date(); // For timestamps
    let updatedFields = {};
    let uploadResult;

    if (type === "companyKyc") {
      let kycDocs = company.kycDetails.companyKyc || [];
      const existingIndex = kycDocs.findIndex(
        (doc) => doc.name === documentName
      );
      let createdDate = now;

      if (existingIndex !== -1) {
        const oldDoc = kycDocs[existingIndex];
        await handleDocumentDelete(oldDoc.documentId);
        createdDate = oldDoc.createdDate || now; // Preserve createdDate
        kycDocs.splice(existingIndex, 1);
      }

      uploadResult = await handleDocumentUpload(
        buffer,
        `${company.companyName}/kyc/${type}/${documentName?.trim()}`,
        originalname
      );

      const doc = {
        name: documentName,
        documentLink: uploadResult.secure_url,
        documentId: uploadResult.public_id,
        createdDate,
        updatedDate: now,
        isActive: true,
      };

      kycDocs.push(doc);
      uploads.push(doc);

      updatedFields["kycDetails.companyKyc"] = kycDocs;
    } else if (type === "directorKyc") {
      if (!nameOfDirector) {
        return res
          .status(400)
          .json({ message: "nameOfDirector is required for directorKyc" });
      }

      let directorKyc = company.kycDetails.directorKyc || [];
      let directorEntry = directorKyc.find(
        (d) => d.nameOfDirector === nameOfDirector
      );

      if (!directorEntry) {
        directorEntry = {
          nameOfDirector,
          documents: [],
          isActive: true,
        };
        directorKyc.push(directorEntry);
      }

      const existingDocIndex = directorEntry.documents.findIndex(
        (doc) => doc.name === documentName
      );

      let createdDate = now;

      if (existingDocIndex !== -1) {
        const oldDoc = directorEntry.documents[existingDocIndex];
        await handleDocumentDelete(oldDoc.documentId);
        createdDate = oldDoc.createdDate || now; // Preserve createdDate
        directorEntry.documents.splice(existingDocIndex, 1);
      }

      uploadResult = await handleDocumentUpload(
        buffer,
        `${company.companyName}/kyc/${type}/${nameOfDirector}/${documentName?.trim()}`,
        originalname
      );

      const newDoc = {
        name: documentName,
        documentLink: uploadResult.secure_url,
        documentId: uploadResult.public_id,
        createdDate,
        updatedDate: now,
      };

      directorEntry.documents.push(newDoc);
      uploads.push(newDoc);

      // Update the full directorKyc array
      const updatedDirectorKyc = directorKyc.map((d) =>
        d.nameOfDirector === nameOfDirector ? directorEntry : d
      );

      updatedFields["kycDetails.directorKyc"] = updatedDirectorKyc;
    } else {
      return res.status(400).json({
        message: "Invalid type: must be either 'companyKyc' or 'directorKyc'",
      });
    }

    await Company.findOneAndUpdate(
      { _id: companyId },
      { $set: updatedFields },
      { new: true }
    );

    res.status(200).json({
      message: "KYC details uploaded successfully",
      data: uploads,
    });
  } catch (error) {
    next(error);
  }
};

const getCompanyKyc = async (req, res, next) => {
  try {
    const companyId = req.company;

    if (!companyId) {
      return res.status(400).json({ message: "companyId is required" });
    }

    const company = await Company.findOne({ _id: companyId }).select(
      "kycDetails companyName"
    );
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    const companyKyc = (company.kycDetails.companyKyc || []).map((doc) => ({
      name: doc.name,
      documentLink: doc.documentLink,
      documentId: doc.documentId,
      createdDate: doc.createdDate,
      updatedDate: doc.updatedDate,
      isActive: doc.isActive,
    }));

    const directorKyc = (company.kycDetails.directorKyc || []).map(
      (director) => ({
        nameOfDirector: director.nameOfDirector,
        isActive: director.isActive,
        documents: (director.documents || []).map((doc) => ({
          name: doc.name,
          documentLink: doc.documentLink,
          documentId: doc.documentId,
          createdDate: doc.createdDate,
          updatedDate: doc.updatedDate,
        })),
      })
    );

    res.status(200).json({
      data: {
        companyName: company.companyName,
        companyKyc,
        directorKyc,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadCompanyDocument,
  getCompanyDocuments,
  uploadDepartmentDocument,
  getDepartmentDocuments,
  addCompanyKyc,
  getCompanyKyc,
};
