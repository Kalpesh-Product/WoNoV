const {
  handleDocumentUpload,
  handleDocumentDelete,
} = require("../../config/s3Config");
const Landlord = require("../../models/finance/Landlord");
const Company = require("../../models/hr/Company");
const User = require("../../models/hr/UserData");

const TECH_DEPARTMENT_ID = "6798ba9de469e809084e2494";

const isTechDepartmentUser = async (userId) => {
  const user = await User.findById(userId)
    .populate("departments", "name")
    .select("departments")
    .lean();

  return (user?.departments || []).some(
    (department) =>
      String(department?._id || department) === TECH_DEPARTMENT_ID ||
      ["tech", "tech department"].includes(
        department?.name?.trim().toLowerCase(),
      ),
  );
};

const escapeRegex = (value = "") => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const addLandlordDocument = async (req, res, next) => {
  try {
    const { landLordId, documentName } = req.body;
    const companyId = req.company;
    const file = req.file;

    if (!file || !landLordId || !documentName) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const company = await Company.findOne({ _id: companyId }).lean().exec();
    const foundLandlord = await Landlord.findOne({ _id: landLordId })
      .lean()
      .exec();

    if (!company || !foundLandlord || foundLandlord.isDeleted) {
      return res.status(404).json({ message: "Landlord not found" });
    }

    const uploadPath = `${company.companyName}/landlords/documents/${foundLandlord.name}`;

    const uploadResult = await handleDocumentUpload(
      file.buffer,
      uploadPath,
      file.originalname
    );

    const updatedLandlord = await Landlord.findByIdAndUpdate(
      landLordId,
      {
        $push: {
          documents: {
            name: documentName.trim(),
            url: uploadResult.secure_url,
            documentId: uploadResult.public_id,
          },
        },
      },
      { new: true }
    );

    res.status(200).json({
      message: "Document uploaded successfully",
      landlord: updatedLandlord,
    });
  } catch (error) {
    next(error);
  }
};

const updateLandlordDocument = async (req, res, next) => {
  try {
    const { landLordId, currentDocumentName, documentName } = req.body;
    const companyId = req.company;
    const file = req.file;

    if (!landLordId || !currentDocumentName?.trim() || !documentName?.trim()) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const [company, landlord] = await Promise.all([
      Company.findById(companyId).lean().exec(),
      Landlord.findById(landLordId).exec(),
    ]);

    if (!company || !landlord || landlord.isDeleted) {
      return res.status(404).json({ message: "Landlord not found" });
    }

    const existingDocument = landlord.documents.find(
      (doc) => doc.name?.trim() === currentDocumentName.trim()
    );

    if (!existingDocument) {
      return res.status(404).json({ message: "Document not found" });
    }

    let nextUrl = existingDocument.url;
    let nextDocumentId = existingDocument.documentId;

    if (file) {
      if (existingDocument.documentId) {
        await handleDocumentDelete(existingDocument.documentId);
      }

      const uploadPath = `${company.companyName}/landlords/documents/${landlord.name}`;
      const uploadResult = await handleDocumentUpload(
        file.buffer,
        uploadPath,
        file.originalname
      );

      nextUrl = uploadResult.secure_url;
      nextDocumentId = uploadResult.public_id;
    }

    existingDocument.name = documentName.trim();
    existingDocument.url = nextUrl;
    existingDocument.documentId = nextDocumentId;
    existingDocument.updatedAt = new Date();

    await landlord.save();

    return res.status(200).json({
      message: "Landlord document updated successfully",
      document: existingDocument,
    });
  } catch (error) {
    next(error);
  }
};

const getLandlordDocuments = async (req, res, next) => {
  try {
    const includeDeleted =
      req.query.includeDeleted === "true" &&
      (await isTechDepartmentUser(req.user));
    const query = includeDeleted ? {} : { isDeleted: { $ne: true } };
    const landlord = await Landlord.find(query)
      .populate(
        "deletedBy",
        "firstName lastName employeeName name email",
      )
      .lean();

    if (!landlord) {
      return res.status(404).json({ message: "Landlord not found" });
    }

    res.status(200).json(landlord);
  } catch (error) {
    next(error);
  }
};

const createLandlord = async (req, res, next) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Landlord name is required" });
    }

    const trimmedName = name.trim();
    const existingLandlord = await Landlord.findOne({
      name: { $regex: `^${escapeRegex(trimmedName)}$`, $options: "i" },
    })
      .lean()
      .exec();

    if (existingLandlord) {
      return res.status(409).json({ message: "Landlord already exists" });
    }

    const landlord = await Landlord.create({
      name: trimmedName,
      documents: [],
    });

    res.status(201).json({
      message: "Landlord created successfully",
      landlord,
    });
  } catch (error) {
    next(error);
  }
};

const updateLandlordName = async (req, res, next) => {
  try {
    const { landlordId, name } = req.body;

    if (!landlordId || !name?.trim()) {
      return res.status(400).json({ message: "Landlord id and name are required" });
    }

    const trimmedName = name.trim();
    const landlord = await Landlord.findById(landlordId).exec();

    if (!landlord || landlord.isDeleted) {
      return res.status(404).json({ message: "Landlord not found" });
    }

    const existingLandlord = await Landlord.findOne({
      _id: { $ne: landlordId },
      name: { $regex: `^${escapeRegex(trimmedName)}$`, $options: "i" },
    }).lean().exec();

    if (existingLandlord) {
      return res.status(409).json({ message: "Landlord already exists" });
    }

    landlord.name = trimmedName;
    await landlord.save();

    return res.status(200).json({
      message: "Landlord updated successfully",
      landlord,
    });
  } catch (error) {
    next(error);
  }
};

const manageLandlord = async (req, res, next) => {
  try {
    const { landlordId, action = "delete" } = req.body;

    if (!landlordId) {
      return res.status(400).json({ message: "Landlord id is required" });
    }
    if (!["delete", "restore", "permanent-delete"].includes(action)) {
      return res.status(400).json({ message: "Invalid landlord action" });
    }

    const isTechUser = await isTechDepartmentUser(req.user);
    const landlordAction =
      action === "delete" && isTechUser ? "permanent-delete" : action;

    if (
      ["restore", "permanent-delete"].includes(landlordAction) &&
      !isTechUser
    ) {
      return res.status(403).json({
        message:
          "Only Tech Department users can restore or permanently delete landlords",
      });
    }

    const landlord = await Landlord.findById(landlordId);
    if (!landlord) {
      return res.status(404).json({ message: "Landlord not found" });
    }

    if (landlordAction === "delete") {
      if (landlord.isDeleted) {
        return res.status(400).json({ message: "Landlord is already deleted" });
      }
      landlord.isDeleted = true;
      landlord.deletedAt = new Date();
      landlord.deletedBy = req.user;
      await landlord.save();

      return res.status(200).json({
        message: "Landlord deleted successfully",
        deletionType: "soft",
      });
    }

    if (landlordAction === "restore") {
      if (!landlord.isDeleted) {
        return res.status(400).json({ message: "Landlord is not deleted" });
      }
      landlord.isDeleted = false;
      landlord.deletedAt = undefined;
      landlord.deletedBy = undefined;
      await landlord.save();

      return res.status(200).json({ message: "Landlord restored successfully" });
    }

    await Promise.all(
      (landlord.documents || [])
        .filter((document) => document.documentId)
        .map((document) => handleDocumentDelete(document.documentId)),
    );
    await landlord.deleteOne();

    return res.status(200).json({
      message: "Landlord permanently deleted successfully",
      deletionType: "permanent",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLandlordDocuments,
  addLandlordDocument,
  createLandlord,
  updateLandlordDocument,
  updateLandlordName,
  manageLandlord,
};
