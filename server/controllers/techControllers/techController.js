const Company = require("../../models/hr/Company");

const saveWebsite = async (req, res, next) => {
  try {
    const { components, style, assets, id } = req.body;
    const { company } = req;

    const foundCompany = await Company.findOne({ _id: company }).exec();

    if (!foundCompany) {
      return res.status(404).json({ message: "Company not found" });
    }

    let websiteIndex = foundCompany.companyWebsite.findIndex(
      (website) => website.id === id
    );

    if (websiteIndex !== -1) {
      // Update existing website entry
      foundCompany.companyWebsite[websiteIndex] = {
        id,
        components,
        style,
        assets,
      };
    } else {
      // Create new website entry
      foundCompany.companyWebsite.push({
        id,
        components,
        style,
        assets,
      });
    }

    // Save the updated document
    await foundCompany.save();

    res.status(200).json({ message: "Website saved successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = { saveWebsite };
