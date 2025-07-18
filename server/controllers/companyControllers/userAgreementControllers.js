const Agreements = require("../../models/hr/Agreements");
const { handleDocumentUpload } = require("../../config/cloudinaryConfig");

const getAgreements = async (req, res, next) => {
  try {
    const user = req.params;
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
    const {agreementName}=req.body;
  } catch (error) {
    next(error);
  }
};
