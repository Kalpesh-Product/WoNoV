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
      const MONTHS_SHORT = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];

      revenues.forEach((item) => {
        const invoiceCreationDate = new Date(item.invoiceCreationDate);
        const month = MONTHS_SHORT[invoiceCreationDate.getMonth()];
        const year = invoiceCreationDate.getFullYear().toString().slice(-2);
        const monthKey = `${month}-${year}`;
        const amount = item.taxableAmount;

        if (!monthlyMap.has(monthKey)) {
          monthlyMap.set(monthKey, {
            month: monthKey,
            taxable: 0,
            revenue: [],
          });
        }

        const monthData = monthlyMap.get(monthKey);
        monthData.taxable += amount;

        monthData.revenue.push({
          particulars: item.particulars,
          taxableAmount: item.taxableAmount,
          invoiceAmount: item.invoiceAmount,
          invoiceCreationDate: item.invoiceCreationDate,
          invoicePaidDate: item.invoicePaidDate,
          gst: item.gst,
          status: item.status || "Paid",
        });
      });

      // Sort month-wise in ascending order (Apr-24, May-24, etc.)
      return Array.from(monthlyMap.values()).sort((a, b) => {
        const parseKey = (key) => {
          const [month, year] = key.split("-");
          const monthIndex = MONTHS_SHORT.indexOf(month);
          return parseInt(
            `20${year}${String(monthIndex + 1).padStart(2, "0")}`
          );
        };
        return parseKey(a.month) - parseKey(b.month); // Ascending
      });
    };

    const transformedRecords = transformRevenues(records);

    res.status(200).json(transformedRecords);
  } catch (error) {
    next(error);
  }
};

module.exports = { createAlternateRevenue, getAlternateRevenues };
