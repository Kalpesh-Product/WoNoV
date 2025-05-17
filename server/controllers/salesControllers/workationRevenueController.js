const VirtualOfficeRevenue = require("../../models/sales/VirtualOfficeRevenue");
const WorkationRevenue = require("../../models/sales/WorkationRevenue");
const createWorkationRevenue = async (req, res, next) => {
  try {
    const { nameOfClient, particulars, taxableAmount, gst, totalAmount } =
      req.body;

    const company = req.company;

    const newRevenue = new WorkationRevenue({
      company,
      nameOfClient,
      particulars,
      taxableAmount,
      gst,
      totalAmount,
    });

    await newRevenue.save();
    res
      .status(201)
      .json({ message: "Workation revenue created", data: newRevenue });
  } catch (error) {
    next(error);
  }
};

// Read all Workation Revenue entries (optionally filtered by company)
const getWorkationRevenues = async (req, res, next) => {
  try {
    const company = req.company;

    const revenues = await WorkationRevenue.find({ company })
      .lean()
      .exec();

    res.status(200).json(revenues);
  } catch (error) {
    next(error);
  }
};

module.exports = { getWorkationRevenues, createWorkationRevenue };
