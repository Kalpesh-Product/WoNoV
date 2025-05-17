const VirtualOfficeRevenue = require("../../models/sales/VirtualOfficeRevenue");

const createVirtualOfficeRevenue = async (req, res, next) => {
  try {
    const { nameOfClient, particulars, taxableAmount, gst, totalAmount } =
      req.body;

    const company = req.company;

    const newRevenue = new VirtualOfficeRevenue({
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

const getVirtualOfficeRevenue = async (req, res, next) => {
  try {
    const { company } = req;

    const revenues = await VirtualOfficeRevenue.find({ company })
      .populate([
        { path: "clientName", select: "clientName" },
        { path: "company", select: "companyName" },
      ])
      .lean()
      .exec();

    res.status(200).json(revenues);
  } catch (error) {
    next(error);
  }
};

module.exports = { getVirtualOfficeRevenue, createVirtualOfficeRevenue };
