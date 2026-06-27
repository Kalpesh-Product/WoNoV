const AlternateRevenue = require("../../models/sales/AlternateRevenue");
const transformRevenues = require("../../utils/revenueFormatter");
const { Readable } = require("stream");
const csvParser = require("csv-parser");
const { parseAmount } = require("../../utils/parseAmount");
const normalizeHeader = (value = "") =>
  value.toString().trim().toLowerCase().replace(/[^a-z0-9]/g, "");

const getRowValue = (row, aliases) => {
  const normalizedRow = Object.entries(row).reduce((acc, [key, value]) => {
    acc[normalizeHeader(key)] = value;
    return acc;
  }, {});

  for (const alias of aliases) {
    const value = normalizedRow[normalizeHeader(alias)];
    if (
      value !== undefined &&
      value !== null &&
      value.toString().trim() !== ""
    ) {
      return value.toString().trim();
    }
  }

  return undefined;
};

const parseCsvDate = (value) => {
  if (value === undefined || value === null || value.toString().trim() === "") {
    return undefined;
  }

  const dateValue = value.toString().trim();

  if (/^\d+(\.\d+)?$/.test(dateValue)) {
    const excelSerialDate = Number(dateValue);
    if (excelSerialDate > 0) {
      const excelEpoch = Date.UTC(1899, 11, 30);
      const parsedDate = new Date(
        excelEpoch + excelSerialDate * 24 * 60 * 60 * 1000,
      );
      if (!Number.isNaN(parsedDate.getTime())) return parsedDate;
    }
  }

  const slashDateParts = dateValue.match(
    /^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/,
  );
  if (slashDateParts) {
    const [, first, second, yearValue] = slashDateParts;
    const year = Number(yearValue.length === 2 ? `20${yearValue}` : yearValue);
    const firstNumber = Number(first);
    const secondNumber = Number(second);
    const day = secondNumber > 12 ? secondNumber : firstNumber;
    const month = secondNumber > 12 ? firstNumber : secondNumber;
    const parsedDate = new Date(Date.UTC(year, month - 1, day));

    if (
      parsedDate.getUTCFullYear() === year &&
      parsedDate.getUTCMonth() === month - 1 &&
      parsedDate.getUTCDate() === day
    ) {
      return parsedDate;
    }
  }

  const parsedDate = new Date(dateValue);
  return Number.isNaN(parsedDate.getTime()) ? undefined : parsedDate;
};

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
    // t;
    const records = [];
    const stream = Readable.from(file.buffer.toString("utf-8").trim());

    stream
      .pipe(csvParser())
      .on("data", (row) => {
        // Push transformed and validated row into records array
         const particulars = getRowValue(row, [
          "PARTICULARS",
          "Particulars",
          "Particular",
        ]);
        const name = getRowValue(row, ["Name", "NAME", "Client Name", "Client"]);
        const invoiceCreationDate = parseCsvDate(
          getRowValue(row, [
            "Invoice Creation Date",
            "Invoice Date",
            "Creation Date",
          ]),
        );
        const invoicePaidDate = parseCsvDate(
          getRowValue(row, ["Paid Date", "Invoice Paid Date", "Payment Date"]),
        );
        const record = {
          // particulars: row["PARTICULARS"],
          // name: row["Name"],
          // taxableAmount: parseAmount(row["Taxable Amount"]) || 0,
          // gst: parseAmount(row["GST"]) || 0,
          // invoiceAmount: parseAmount(row["Invoice Amount"]) || 0,
          // invoiceCreationDate: new Date(row["Invoice Creation Date"]),
          // invoicePaidDate: new Date(row["Paid Date"]),
          // status: new Date(row["Paid Date"]) ? "Paid" : "Unpaid",
           particulars,
          name,
          taxableAmount:
            parseAmount(getRowValue(row, ["Taxable Amount", "Taxable"])) || 0,
          gst: parseAmount(getRowValue(row, ["GST", "GST Amount"])) || 0,
          invoiceAmount:
            parseAmount(getRowValue(row, ["Invoice Amount", "Amount"])) || 0,
          invoiceCreationDate,
          status: invoicePaidDate ? "Paid" : "Unpaid",
          company: company,
        };
         if (invoicePaidDate) {
          record.invoicePaidDate = invoicePaidDate;
        }

        records.push(record);
      })
      .on("end", async () => {
        try {
           const invalidRecords = records.reduce((errors, record, index) => {
            const missingFields = [];

            if (!record.particulars) missingFields.push("particulars");
            if (!record.name) missingFields.push("name");
            if (!record.invoiceCreationDate) {
              missingFields.push("invoiceCreationDate");
            }

            if (missingFields.length) {
              errors.push({ row: index + 2, missingFields });
            }

            return errors;
          }, []);

          if (invalidRecords.length) {
            return res.status(400).json({
              message: "Alternate revenue CSV contains invalid or missing data",
              errors: invalidRecords,
            });
          }

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