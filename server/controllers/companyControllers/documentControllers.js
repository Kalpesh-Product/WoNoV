const Company = require("../../models/hr/Company");
const User = require("../../models/hr/UserData");
const {
  handleDocumentUpload,
  handleDocumentDelete,
} = require("../../config/cloudinaryConfig");
const { PDFDocument } = require("pdf-lib");
const path = require("path");
const Department = require("../../models/Departments");

const uploadCompanyDocument = async (req, res, next) => {
  const { documentName, type } = req.body;
  const file = req.file;
  const user = req.user;

  if (!file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  try {
    if (!["template", "sop", "policy", "agreement"].includes(type)) {
      return res.status(400).json({
        message:
          "Invalid document type. Allowed values: template, sop, policy, agreement",
      });
    }

    const allowedExtensions = [".pdf", ".doc", ".docx", ".xls", ".xlsx"];
    const extension = path.extname(file.originalname).toLowerCase();

    if (!allowedExtensions.includes(extension)) {
      return res.status(400).json({
        message: `Unsupported file type. Allowed extensions: ${allowedExtensions.join(
          ", "
        )}`,
      });
    }

    const foundUser = await User.findById(user)
      .select("company")
      .populate("company", "companyName")
      .lean();

    if (!foundUser?.company) {
      return res.status(404).json({ message: "Company not found" });
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
      return res.status(500).json({ message: "Failed to upload document" });
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

    return res
      .status(200)
      .json({ message: `${type.toUpperCase()} uploaded successfully` });
  } catch (error) {
    next(error);
  }
};
const updateCompanyDocument = async (req, res, next) => {
  const { newName, documentId } = req.body; // updated: use _id
  const user = req.user;

  try {
    const foundUser = await User.findById(user)
      .select("company")
      .populate("company", "companyName")
      .lean();

    if (!foundUser?.company) {
      return res.status(404).json({ message: "Company not found" });
    }

    const companyId = foundUser.company._id;

    const tryUpdate = async (path) => {
      const result = await Company.updateOne(
        {
          _id: companyId,
          [`${path}._id`]: documentId, // match using the ObjectId of the embedded doc
        },
        {
          $set: {
            [`${path}.$.name`]: newName,
            [`${path}.$.updatedAt`]: new Date(),
          },
        }
      );
      return result;
    };

    const sections = ["templates", "sop", "policies", "agreements"];
    for (const section of sections) {
      const result = await tryUpdate(section);
      if (result.modifiedCount > 0) {
        return res.status(200).json({
          message: `Document name updated successfully in ${section}`,
        });
      }
    }

    return res.status(404).json({ message: "Document not found" });
  } catch (error) {
    return next(error);
  }
};

const toggleCompanyDocumentStatus = async (req, res, next) => {
  const user = req.user;
  const { documentId } = req.body; // Use MongoDB _id

  try {
    const foundUser = await User.findById(user)
      .select("company")
      .populate("company", "companyName")
      .lean();

    if (!foundUser?.company) {
      return res.status(404).json({ message: "Company not found" });
    }

    const docFields = ["templates", "sop", "policies", "agreements"];
    const company = await Company.findById(foundUser.company._id);

    let found = false;
    let targetDocumentId = null;
    let newStatus = null;

    for (const field of docFields) {
      const docArray = company[field];

      const doc = docArray.find((doc) => doc._id.toString() === documentId);
      if (doc) {
        doc.isActive = !doc.isActive; // Toggle status
        found = true;
        targetDocumentId = doc.documentId;
        newStatus = doc.isActive;
        break;
      }
    }

    if (!found) {
      return res
        .status(404)
        .json({ message: "Document not found in company records" });
    }

    await company.save();

    // If the document is being toggled *off*, delete it from Cloudinary
    if (!newStatus && targetDocumentId) {
      const cloudRes = await handleDocumentDelete(targetDocumentId);
      if (cloudRes.result !== "ok") {
        return res
          .status(500)
          .json({ message: "Failed to delete from cloud storage" });
      }
    }

    return res.status(200).json({
      message: `Document ${
        newStatus ? "activated" : "deactivated"
      } successfully`,
    });
  } catch (error) {
    next(error);
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
  const { documentName, type } = req.body;
  const file = req.file;
  const user = req.user;
  const { departmentId } = req.params;

  if (!file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  try {
    if (!["sop", "policy"].includes(type)) {
      return res.status(400).json({
        message: "Invalid document type. Allowed values: sop, policy",
      });
    }

    const allowedMimeTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      return res.status(400).json({
        message: "Invalid file type. Allowed types: PDF, DOC, DOCX",
      });
    }

    const foundUser = await User.findOne({ _id: user })
      .select("company")
      .populate([{ path: "company", select: "companyName" }])
      .lean()
      .exec();

    if (!foundUser || !foundUser.company) {
      return res.status(404).json({ message: "User's company not found" });
    }

    const foundCompany = await Company.findOne({ _id: foundUser.company })
      .select("selectedDepartments")
      .populate([{ path: "selectedDepartments.department", select: "name" }])
      .lean()
      .exec();

    if (!foundCompany) {
      return res.status(404).json({ message: "Company not found" });
    }

    const department = foundCompany.selectedDepartments.find(
      (dept) => dept.department._id.toString() === departmentId
    );

    if (!department) {
      return res
        .status(404)
        .json({ message: "Department not found in selectedDepartments" });
    }

    let processedBuffer = file.buffer;
    const originalFilename = file.originalname;

    if (file.mimetype === "application/pdf") {
      const pdfDoc = await PDFDocument.load(file.buffer);
      pdfDoc.setTitle(
        originalFilename ? originalFilename.split(".")[0] : "Untitled"
      );
      processedBuffer = await pdfDoc.save();
    }

    const response = await handleDocumentUpload(
      processedBuffer,
      `${foundUser.company.companyName}/departments/${department.department.name}/documents/${type}`,
      originalFilename
    );

    if (!response.public_id) {
      return res.status(500).json({ message: "Failed to upload document" });
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
      return res
        .status(500)
        .json({ message: "Failed to update document field" });
    }

    return res.status(200).json({
      message: `${type.toUpperCase()} uploaded successfully for ${
        department.department.name
      } department`,
    });
  } catch (error) {
    next(error);
  }
};

const updateDepartmentDocument = async (req, res, next) => {
  const { newName, documentId } = req.body;
  const userId = req.user;

  try {
    // 1) Fetch the user's company reference
    const foundUser = await User.findById(userId).select("company").lean();
    if (!foundUser?.company) {
      return res.status(404).json({ message: "Company not found" });
    }

    // 2) Load the full Company document
    const company = await Company.findById(foundUser.company);
    if (!company) {
      return res.status(404).json({ message: "Company data missing" });
    }

    let updated = false;

    // 3) Loop through each department
    for (const dept of company.selectedDepartments) {
      // Try to find a matching SOP
      const sopDoc = dept.sop?.find((doc) => doc._id.toString() === documentId);
      if (sopDoc) {
        sopDoc.name = newName;
        sopDoc.updatedAt = new Date();
        updated = true;
        break;
      }

      // Try to find a matching Policy
      const policyDoc = dept.policies?.find(
        (doc) => doc._id.toString() === documentId
      );
      if (policyDoc) {
        policyDoc.name = newName;
        policyDoc.updatedAt = new Date();
        updated = true;
        break;
      }
    }

    // 4) If nothing was updated, return 404
    if (!updated) {
      return res.status(404).json({ message: "Document not found" });
    }

    // 5) Save the company and respond
    await company.save({ validateBeforeSave: false });
    return res
      .status(200)
      .json({ message: "Document name updated successfully" });
  } catch (error) {
    next(error);
  }
};

const deleteDepartmentDocument = async (req, res, next) => {
  const userId = req.user;
  const { documentId } = req.body;

  try {
    // 1) Fetch the user's company reference
    const foundUser = await User.findById(userId).select("company").lean();
    if (!foundUser?.company) {
      return res.status(404).json({ message: "Company not found" });
    }

    // 2) Load the full Company document
    const company = await Company.findById(foundUser.company);
    if (!company || !company.selectedDepartments?.length) {
      return res
        .status(404)
        .json({ message: "Company or departments not found" });
    }

    let updated = false;

    // 3) Loop through each department
    for (const dept of company.selectedDepartments) {
      // Try to find and mark SOP doc as inactive
      const sopDoc = dept.sop?.find((doc) => doc._id.toString() === documentId);
      if (sopDoc) {
        sopDoc.isActive = false;
        sopDoc.updatedAt = new Date();
        updated = true;
        break;
      }

      // Try to find and mark Policy doc as inactive
      const policyDoc = dept.policies?.find(
        (doc) => doc._id.toString() === documentId
      );
      if (policyDoc) {
        policyDoc.isActive = false;
        policyDoc.updatedAt = new Date();
        updated = true;
        break;
      }
    }

    // 4) If not updated, return error
    if (!updated) {
      return res
        .status(404)
        .json({ message: "Document not found in departments" });
    }

    // 5) Save and return success
    await company.save({ validateBeforeSave: false });

    return res
      .status(200)
      .json({ message: "Document marked as inactive successfully" });
  } catch (error) {
    next(error);
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
        `${
          company.companyName
        }/kyc/${type}/${nameOfDirector}/${documentName?.trim()}`,
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

const getComplianceDocuments = async (req, res, next) => {
  try {
    const companyId = req.company;

    if (!companyId) {
      return res.status(400).json({ message: "companyId is required" });
    }

    const company = await Company.findById(companyId).select(
      "complianceDocuments"
    );
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    res.status(200).json({ data: company.complianceDocuments });
  } catch (error) {
    next(error);
  }
};

const uploadComplianceDocument = async (req, res, next) => {
  try {
    const { documentName } = req.body;
    const companyId = req.company;

    if (!companyId || !documentName) {
      return res.status(400).json({
        message: "companyId and documentName are required",
      });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const { originalname, buffer } = req.file;
    const now = new Date();
    let createdDate = now;

    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    let docs = company.complianceDocuments || [];

    // Check if document with same name exists
    const existingIndex = docs.findIndex((doc) => doc.name === documentName);

    if (existingIndex !== -1) {
      const oldDoc = docs[existingIndex];
      if (oldDoc.documentId) {
        await handleDocumentDelete(oldDoc.documentId);
      }
      createdDate = oldDoc.createdDate || now;
      docs.splice(existingIndex, 1); // remove old
    }

    // Upload to Cloudinary
    const uploadResult = await handleDocumentUpload(
      buffer,
      `${company.companyName?.trim()}/compliance/${documentName?.trim()}`,
      originalname
    );

    const newDoc = {
      name: documentName,
      documentLink: uploadResult.secure_url,
      documentId: uploadResult.public_id,
      createdDate,
      updatedDate: now,
      isActive: true,
    };

    docs.push(newDoc);

    await Company.findByIdAndUpdate(
      companyId,
      { $set: { complianceDocuments: docs } },
      { new: true }
    );

    res.status(200).json({
      message: "Compliance document uploaded successfully",
      data: newDoc,
    });
  } catch (error) {
    next(error);
  }
};

const handleDepartmentTemplateUpload = async (req, res, next) => {
  try {
    const { departmentId } = req.params;
    const file = req.file;
    const { company } = req;
    const { documentName } = req.body;

    // Check if file is present
    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Validate company
    const foundCompany = await Company.findOne({ _id: company }).lean().exec();
    if (!foundCompany) {
      return res.status(404).json({ message: "Company not found" });
    }

    const foundDepartment = await Department.findOne({ _id: departmentId })
      .lean()
      .exec();

    // Upload to Cloudinary
    const uploadPath = `${foundCompany.companyName}/departments/${foundDepartment.name}/templates`;
    const uploadedFile = await handleDocumentUpload(
      file.buffer,
      uploadPath,
      file.originalname
    );

    // Construct template object
    const newTemplate = {
      name: documentName,
      documentLink: uploadedFile.secure_url,
      documentId: uploadedFile.public_id,
      isActive: true,
      createdAt: new Date(),
      updatedAt: null,
    };

    // Update the department
    const updatedDepartment = await Department.findOneAndUpdate(
      { _id: departmentId },
      { $push: { templates: newTemplate } },
      { new: true }
    );

    if (!updatedDepartment) {
      return res.status(404).json({ message: "Department not found" });
    }

    return res.status(200).json({
      message: "Template uploaded successfully",
    });
  } catch (error) {
    next(error);
  }
};

const getDepartmentTemplates = async (req, res, next) => {
  try {
    const { departmentId } = req.params;
    const foundDepartment = await Department.findOne({ _id: departmentId })
      .lean()
      .exec();
    if (!foundDepartment) {
      return res.status(404).json({ message: "Department not found" });
    }
    const templates = foundDepartment.templates;
    return res.status(200).json({ templates });
  } catch (error) {
    next(error);
  }
};

const deleteDepartmentTemplate = async (req, res, next) => {
  try {
    const { departmentId, documentId } = req.query;

    // Find the department
    const department = await Department.findOne({ departmentId });
    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    // Find the specific template
    const template = department.templates.find(
      (t) => t.documentId === documentId
    );

    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }

    // Toggle active status
    template.isActive = !template.isActive;
    template.updatedAt = new Date();

    await department.save({ validateBeforeSave: false });

    res.status(200).json({
      message: `Template ${
        template.isActive ? "activated" : "deactivated"
      } successfully`,
    });
  } catch (error) {
    next(error);
  }
};

const updateDepartmentTemplate = async (req, res, next) => {
  try {
    const { departmentId, templateId } = req.query;
    const { documentName } = req.body;
    const file = req.file;
    const { company } = req;

    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Fetch company
    const foundCompany = await Company.findById(company).lean().exec();
    if (!foundCompany) {
      return res.status(404).json({ message: "Company not found" });
    }

    // Fetch department
    const department = await Department.findById(departmentId);
    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    // Find template by _id
    const template = department.templates.id(templateId);
    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }

    // Delete old document from Cloudinary
    await handleDocumentDelete(template.documentId);

    // Upload new document
    const uploadPath = `${foundCompany.companyName}/departments/${department.name}/templates`;
    const uploadedFile = await handleDocumentUpload(
      file.buffer,
      uploadPath,
      file.originalname
    );

    // Update template fields
    template.name = documentName;
    template.documentLink = uploadedFile.secure_url;
    template.documentId = uploadedFile.public_id;
    template.updatedAt = new Date();

    // Save updated department
    await department.save();

    return res.status(200).json({
      message: "Template updated successfully",
      updatedTemplate: template,
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
  getComplianceDocuments,
  uploadComplianceDocument,
  updateCompanyDocument,
  toggleCompanyDocumentStatus,
  updateDepartmentDocument,
  deleteDepartmentDocument,
  handleDepartmentTemplateUpload,
  getDepartmentTemplates,
  deleteDepartmentTemplate,
  updateDepartmentTemplate,
};
