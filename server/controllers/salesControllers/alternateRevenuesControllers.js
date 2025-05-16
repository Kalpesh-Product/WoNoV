const { inrFormat } = require("../../../client/src/utils/currencyFormat");
const AlternateRevenue = require("../../models/sales/AlternateRevenue");
const transformRevenues = require("../../utils/revenueFormatter");

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

    const transformRevenues = (revenues) => {
      const monthlyMap = new Map();

      revenues.forEach((item) => {
        const invoiceCreationDate = new Date(item.invoiceCreationDate);
        const monthKey = `${invoiceCreationDate.toLocaleString("default", {
          month: "short",
        })}-${invoiceCreationDate.getFullYear().toString().slice(-2)}`;

        const amount = item.taxableAmount;

        if (!monthlyMap.has(monthKey)) {
          monthlyMap.set(monthKey, {
            month: monthKey,
            actual: 0,
            revenue: [],
          });
        }

        const monthData = monthlyMap.get(monthKey);
        monthData.actual += amount;

        monthData.revenue.push({
          particulars: item.particulars,
          taxableAmount: inrFormat(item.taxableAmount),
          invoiceAmount: inrFormat(item.invoiceAmount),
          invoiceCreationDate: item.invoiceCreationDate,
          invoicePaidDate: item.invoicePaidDate,
          gst: item.gst,
          status: item.status || "Paid",
        });
      });

      return Array.from(monthlyMap.values()).map((monthData) => ({
        ...monthData,
        actual: inrFormat(monthData.actual),
      }));
    };

    const transformedRecords = transformRevenues(records);

    res.status(200).json(transformedRecords);
  } catch (error) {
    next(error);
  }
};

module.exports = { createAlternateRevenue, getAlternateRevenues };
