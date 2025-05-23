const VirtualOfficeRevenue = require("../../models/sales/VirtualOfficeRevenue");

const createVirtualOfficeRevenue = async (req, res, next) => {
  try {
    const {
      client,
      location,
      channel,
      taxableAmount,
      revenue,
      totalTerm,
      dueTerm,
      rentDate,
      rentStatus,
      pastDueDate,
      annualIncrement,
      nextIncrementDate,
      service,
    } = req.body;

    const company = req.company;

    const newRevenue = new VirtualOfficeRevenue({
      client,
      location,
      channel,
      taxableAmount,
      revenue,
      totalTerm,
      dueTerm,
      rentDate,
      rentStatus,
      pastDueDate,
      annualIncrement,
      nextIncrementDate,
      company,
      service,
    });

    await newRevenue.save();

    res.status(201).json({
      message: "Virtual office revenue created",
      data: newRevenue,
    });
  } catch (error) {
    next(error);
  }
};

const getVirtualOfficeRevenue = async (req, res, next) => {
  try {
    const { company } = req;

    const revenues = await VirtualOfficeRevenue.find({ company })
      .populate([{ path: "client", select: "clientName" }])
      .lean()
      .exec();

    res.status(200).json(revenues);
  } catch (error) {
    next(error);
  }
};

module.exports = { getVirtualOfficeRevenue, createVirtualOfficeRevenue };
