const AlternateRevenue = require("../../models/sales/AlternateRevenue");
const Company = require("../../models/hr/Company");
const mongoose = require("mongoose");
const transformRevenues = require("../../utils/revenueFormatter");
const { Readable } = require("stream");
const csvParser = require("csv-parser");
const { PDFDocument } = require("pdf-lib");
const { parseAmount } = require("../../utils/parseAmount");
const {
  handleDocumentUpload,
  handleFileDelete,
} = require("../../config/s3Config");

const GST_RATE = 0.18;

const calculateRevenueAmounts = (taxableAmount) => {
  const taxable = parseAmount(taxableAmount);
  const gst = Number((taxable * GST_RATE).toFixed(2));
  const invoiceAmount = Number((taxable + gst).toFixed(2));

  return { taxableAmount: taxable, gst, invoiceAmount };
};

const getInvoiceDate = (value) => {
  if (!value) return null;

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};
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
const saveAlternateRevenueRecord = async (req, res, next) => {
  let uploadedInvoiceId = null;

  try {
    const company = await Company.findById(req.company).lean();
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    const { revenueId, ...updates } = req.body;
    const hasValidRevenueId =
      revenueId && mongoose.Types.ObjectId.isValid(revenueId);

    const existingRevenue = hasValidRevenueId
      ? await AlternateRevenue.findOne({
          _id: revenueId,
          company: req.company,
        }).lean()
      : null;

    const allowedFields = [
      "name",
      "clientInvoiceName",
      "particulars",
      "taxableAmount",
      "gst",
      "invoiceAmount",
      "invoiceCreationDate",
      "invoicePaidDate",
      "status",
    ];

    const payload = allowedFields.reduce((result, field) => {
      if (updates[field] !== undefined && updates[field] !== null) {
        result[field] = updates[field];
      }
      return result;
    }, {});

    if (payload.invoiceCreationDate) {
      payload.invoiceCreationDate = new Date(payload.invoiceCreationDate);
    }
    if (payload.invoicePaidDate) {
      payload.invoicePaidDate = new Date(payload.invoicePaidDate);
    }

    if (payload.taxableAmount !== undefined) {
      const calculatedAmounts = calculateRevenueAmounts(payload.taxableAmount);
      payload.taxableAmount = calculatedAmounts.taxableAmount;
      payload.gst = calculatedAmounts.gst;
      payload.invoiceAmount = calculatedAmounts.invoiceAmount;
    }

    if (req.file) {
      const allowedMimeTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];

      if (!allowedMimeTypes.includes(req.file.mimetype)) {
        return res.status(400).json({
          message: "Invalid file type. Allowed types: PDF, DOC, DOCX",
        });
      }

      let processedBuffer = req.file.buffer;
      if (req.file.mimetype === "application/pdf") {
        const pdfDoc = await PDFDocument.load(req.file.buffer);
        pdfDoc.setTitle(
          req.file.originalname
            ? req.file.originalname.split(".")[0]
            : "Invoice",
        );
        processedBuffer = await pdfDoc.save();
      }

      const ownerName =
        payload.name ||
        existingRevenue?.name ||
        "alternate-revenue";

      const uploadResult = await handleDocumentUpload(
        processedBuffer,
        `${company.companyName}/alternate-revenues/${ownerName}`,
        req.file.originalname,
      );

      if (!uploadResult?.public_id) {
        return res
          .status(500)
          .json({ message: "Failed to upload document" });
      }

      uploadedInvoiceId = uploadResult.public_id;
      const invoiceDate =
        payload.invoicePaidDate ||
        existingRevenue?.invoicePaidDate ||
        new Date();

      payload.invoice = {
        name: req.file.originalname,
        link: uploadResult.secure_url,
        id: uploadResult.public_id,
        date: invoiceDate,
      };
      payload.invoicePaidDate = invoiceDate;
    } else if (payload.invoicePaidDate && existingRevenue?.invoice) {
      payload.invoice = {
        ...existingRevenue.invoice,
        date: payload.invoicePaidDate,
      };
    }

    let record;

    if (hasValidRevenueId && existingRevenue) {
      record = await AlternateRevenue.findOneAndUpdate(
        { _id: revenueId, company: req.company },
        payload,
        { new: true, runValidators: true },
      );
    } else {
      record = await AlternateRevenue.create({
        ...payload,
        company: req.company,
      });
    }

    if (!record) {
      return res.status(404).json({ message: "Alternate revenue not found" });
    }

    if (
      uploadedInvoiceId &&
      existingRevenue?.invoice?.id &&
      existingRevenue.invoice.id !== uploadedInvoiceId
    ) {
      await handleFileDelete(existingRevenue.invoice.id).catch(() => null);
    }

    return res
      .status(hasValidRevenueId && existingRevenue ? 200 : 201)
      .json({
        success: true,
        data: record,
      });
  } catch (error) {
    if (uploadedInvoiceId) {
      await handleFileDelete(uploadedInvoiceId).catch(() => null);
    }
    next(error);
  }
};

const createAlternateRevenue = async (req, res, next) =>
  saveAlternateRevenueRecord(req, res, next);

const getAlternateRevenues = async (req, res, next) => {
  try {
    const payload = await fetchAlternateRevenueReportService({
      company: req.company,
    });

    return res.status(200).json(payload);
  } catch (error) {
    next(error);
  }
};

const updateAlternateRevenueInvoice = async (req, res, next) =>
  saveAlternateRevenueRecord(req, res, next);

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
  updateAlternateRevenueInvoice,
  bulkInsertAlternateRevenue,
};
