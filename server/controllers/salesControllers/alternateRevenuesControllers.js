const AlternateRevenue = require("../../models/sales/AlternateRevenue");

const createAlternateRevenue = async (req, res, next) => {
  try {
    const company = req.company;
    const { particulars, name, taxableAmount, gst, invoiceAmount } = req.body;

    const newRecord = await AlternateRevenue.create({
      company,
      particulars,
      name,
      taxableAmount,
      gst,
      invoiceAmount,
    });

    res.status(201).json({ success: true, data: newRecord });
  } catch (error) {
    next(error);
  }
};

const getAlternateRevenues = async (req, res, next) => {
  try {
    const company = req.company;
    const { id } = req.query;

    if (id) {
      const record = await AlternateRevenue.findOne({ _id: id, company })
        .lean()
        .exec();

      if (!record) {
        return res
          .status(404)
          .json({ success: false, message: "Record not found" });
      }

      return res.status(200).json({ success: true, data: record });
    }

    const records = await AlternateRevenue.find({ company })
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    res.status(200).json({ success: true, data: records });
  } catch (error) {
    next(error);
  }
};

module.exports = { createAlternateRevenue, getAlternateRevenues };
