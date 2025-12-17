const AlternateRevenue = require("../../models/sales/AlternateRevenue");
const transformRevenues = require("../../utils/revenueFormatter");
const { Readable } = require("stream");
const csvParser = require("csv-parser");

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

const bulkInsertAlternateRevenue = async (req, res, next) => {
  try {
    const file = req.file;
    const company = req.company;

    if (!file) {
      return res
        .status(400)
        .json({ message: "Please provide a valid CSV file" });
    }

    const records = [];
    const stream = Readable.from(file.buffer.toString("utf-8").trim());

    stream
      .pipe(csvParser())
      .on("data", (row) => {
        // Push transformed and validated row into records array
        const record = {
          particulars: row["PARTICULARS"],
          name: row["Name"],
          taxableAmount: parseFloat(row["Taxable Amount"]) || 0,
          gst: parseFloat(row["GST"]) || 0,
          invoiceAmount: parseFloat(row["Invoice Amount"]) || 0,
          invoiceCreationDate: new Date(row["Invoice Creation Date"]),
          invoicePaidDate: new Date(row["Paid Date"]),
          company: company._id,
        };
        records.push(record);
      })
      .on("end", async () => {
        try {
          const inserted = await AlternateRevenue.insertMany(records);
          res.status(201).json({
            message: "Bulk insert successful",
            insertedCount: inserted.length,
          });
        } catch (insertError) {
          next(insertError);
        }
      })
      .on("error", (parseError) => {
        next(parseError);
      });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createAlternateRevenue,
  getAlternateRevenues,
  bulkInsertAlternateRevenue,
};
