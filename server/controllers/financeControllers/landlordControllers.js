const { handleDocumentUpload } = require("../../config/cloudinaryConfig");
const Landlord = require("../../models/finance/Landlord");
const Company = require("../../models/hr/Company");

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

    // Define Cloudinary folder path
    const uploadPath = `${company.companyName}/landlords/documents/${foundLandlord.name}`;

    // Upload document to Cloudinary
    const uploadResult = await handleDocumentUpload(
      file.buffer,
      uploadPath,
      file.originalname
    );

    // Update landlord document with uploaded file info
    const updatedLandlord = await Landlord.findByIdAndUpdate(
      landLordId,
      {
        $push: {
          documents: {
            name: documentName,
            url: uploadResult.secure_url,
            documentId: uploadResult.public_id, // Storing public_id as documentId
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

module.exports = { getLandlordDocuments, addLandlordDocument };
