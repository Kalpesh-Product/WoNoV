const AlternateRevenue = require("../../models/sales/AlternateRevenue");
const transformRevenues = require("../../utils/revenueFormatter");
const { Readable } = require("stream");
const csvParser = require("csv-parser");
const { parseAmount } = require("../../utils/parseAmount");

const {
  fetchAlternateRevenueReportService,
} = require("../../services/reports/revenue");
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
    const { id } = req.query || {};
    if (id) {
      const record = await AlternateRevenue.findOne({}).lean().exec();

      if (!record) {
        return res.status(404).json({
          message: "Alternate revenue with the provided ID not found",
        });
      }
    }

    const payload = await fetchAlternateRevenueReportService({});

    return res.status(200).json(payload);
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
          taxableAmount: parseAmount(row["Taxable Amount"]) || 0,
          gst: parseAmount(row["GST"]) || 0,
          invoiceAmount: parseAmount(row["Invoice Amount"]) || 0,
          invoiceCreationDate: new Date(row["Invoice Creation Date"]),
          invoicePaidDate: new Date(row["Paid Date"]),
          company: company,
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
