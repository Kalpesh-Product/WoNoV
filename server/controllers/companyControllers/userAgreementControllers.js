const Agreements = require("../../models/hr/Agreements");
const { handleDocumentUpload } = require("../../config/cloudinaryConfig");
const { PDFDocument } = require("pdf-lib");
const { default: mongoose } = require("mongoose");
const UserData = require("../../models/hr/UserData");

const getAgreements = async (req, res, next) => {
  try {
    const { user } = req.params;
    if (user) {
      const agreements = await Agreements.find({ user }).lean().exec();
      return res.status(200).json(agreements);
    }
    const agreements = await Agreements.find().lean().exec();
    return res.status(200).json(agreements);
  } catch (error) {
    next(error);
  }
};

const addAgreement = async (req, res, next) => {
  try {
    const { user, company } = req;
    const { agreementName, userId } = req.body;
    const documentFile = req.file;

    if (!agreementName) {
      return res.status(400).json({ message: "Agreement name is required" });
    }

    const foundUser = await UserData.findById({ _id: userId });

    if (!foundUser) {
      return res.status(400).json({ message: "User not found" });
    }

    if (!documentFile) {
      return res
        .status(400)
        .json({ message: "Agreement document is required" });
    }

    const allowedMimeTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedMimeTypes.includes(documentFile.mimetype)) {
      return res.status(400).json({ message: "Invalid document file type" });
    }

    let processedBuffer = documentFile.buffer;
    const originalFilename = documentFile.originalname;

    if (documentFile.mimetype === "application/pdf") {
      const pdfDoc = await PDFDocument.load(documentFile.buffer);
      pdfDoc.setTitle(originalFilename.split(".")[0] || "Untitled");
      processedBuffer = await pdfDoc.save();
    }

    const response = await handleDocumentUpload(
      processedBuffer,
      `${company}/${foundUser.firstName}-${foundUser.firstName}/agreements`,
      originalFilename
    );

    if (!response.public_id) {
      return res
        .status(500)
        .json({ message: "Failed to upload agreement document" });
    }

    const agreement = new Agreements({
      name: agreementName,
      user: userId,
      url: response.secure_url,
      id: response.public_id,
      isActive: true,
    });

    await agreement.save();

    return res.status(201).json({
      message: "Agreement uploaded successfully",
      agreementId: agreement._id,
    });
  } catch (error) {
    console.error("Add Agreement Error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

//toggle active status
const updateAgreementStatus = async (req, res, next) => {
  try {
    const { agreementId, status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(agreementId)) {
      return res.status(400).json({ message: "Invalid agreement ID provided" });
    }

    const agreement = await Agreements.findByIdAndUpdate(
      { _id: agreementId },
      {
        isActive: status,
      }
    );

    if (!agreement) {
      return res
        .status(400)
        .json({ message: "Failed to update the agreement status" });
    }

    return res.status(200).json({ message: "Agreement status updated" });
  } catch (error) {
    next(error);
  }
};

//soft delete
const deleteAgreement = async (req, res, next) => {
  try {
    const { agreementId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(agreementId)) {
      return res.status(400).json({ message: "Invalid agreement ID provided" });
    }

    const agreement = await Agreements.findByIdAndUpdate(
      { _id: agreementId },
      {
        isDeleted: true,
      }
    );

    if (!agreement) {
      return res
        .status(400)
        .json({ message: "Failed to delete the agreement" });
    }

    return res.status(200).json({ message: "Agreement deleted successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addAgreement,
  getAgreements,
  updateAgreementStatus,
  deleteAgreement,
};
