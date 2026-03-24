const {
  handleDocumentUpload,
  handleDocumentDelete,
} = require("../../config/s3Config");
const Landlord = require("../../models/finance/Landlord");
const Company = require("../../models/hr/Company");

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

    if (!company || !foundLandlord) {
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

    if (!company || !landlord) {
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
    const landlord = await Landlord.find();

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

    if (!landlord) {
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

module.exports = {
  getLandlordDocuments,
  addLandlordDocument,
  createLandlord,
  updateLandlordDocument,
  updateLandlordName,
};