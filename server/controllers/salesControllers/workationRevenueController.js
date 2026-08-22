//const VirtualOfficeRevenue = require("../../models/sales/VirtualOfficeRevenue");
const WorkationRevenue = require("../../models/sales/WorkationRevenue");
const WorkationClients = require("../../models/sales/WorkationClients");
const Company = require("../../models/hr/Company");
const mongoose = require("mongoose");
const { Readable } = require("stream");
const csvParser = require("csv-parser");
const { PDFDocument } = require("pdf-lib");
const {
  handleDocumentUpload,
  handleFileDelete,
} = require("../../config/s3Config");
const {
  fetchWorkationRevenueReportService,
} = require("../../services/reports/revenue");

const escapeRegExp = (value = "") =>
  value.toString().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const findOrCreateWorkationClient = async ({
  clientId,
  clientName,
}) => {
  if (clientId && mongoose.Types.ObjectId.isValid(clientId)) {
    const existingById = await WorkationClients.findById(clientId).lean();
    if (existingById) {
      return existingById;
    }
  }

  const normalizedName = clientName?.toString().trim();
  if (!normalizedName) {
    return null;
  }

  const existingByName = await WorkationClients.findOne({
    clientName: { $regex: new RegExp(`^${escapeRegExp(normalizedName)}$`, "i") },
  }).lean();

  if (existingByName) {
    return existingByName;
  }

  return WorkationClients.create({ clientName: normalizedName });
};

const createWorkationRevenue = async (req, res, next) => {
  try {
    const {
      nameOfClient,
      clientInvoiceName,
      particulars,
      taxableAmount,
      gst,
      totalAmount,
      clientId,
    } = req.body;

    const company = req.company;
    const client = await findOrCreateWorkationClient({
      clientId,
      clientName: nameOfClient,
    });

    const newRevenue = new WorkationRevenue({
      company,
      nameOfClient,
      clientInvoiceName,
      particulars,
      taxableAmount,
      gst,
      totalAmount,
      client: client?._id || clientId || null,
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
    const payload = await fetchWorkationRevenueReportService({ company });

    return res.status(200).json(payload);
  } catch (error) {
    next(error);
  }
};

const getWorkationClients = async (req, res, next) => {
  try {
    const [existingClients, revenueNames] = await Promise.all([
      WorkationClients.find().sort({ clientName: 1 }).lean().exec(),
      WorkationRevenue.find({}, { nameOfClient: 1 }).lean().exec(),
    ]);

    const mergedClients = [];
    const seenNames = new Set();

    existingClients.forEach((client) => {
      const normalizedName = client.clientName?.toString().trim().toLowerCase();
      if (!normalizedName || seenNames.has(normalizedName)) {
        return;
      }

      seenNames.add(normalizedName);
      mergedClients.push({
        _id: client._id,
        clientName: client.clientName,
      });
    });

    revenueNames.forEach((row) => {
      const clientName = row.nameOfClient?.toString().trim();
      const normalizedName = clientName?.toLowerCase();
      if (!normalizedName || seenNames.has(normalizedName)) {
        return;
      }

      seenNames.add(normalizedName);
      mergedClients.push({
        _id: null,
        clientName,
      });
    });

    return res.status(200).json(mergedClients);
  } catch (error) {
    next(error);
  }
};

const updateWorkationRevenueInvoice = async (req, res, next) => {
  let uploadedInvoiceId = null;

  try {
    const { revenueId, isProjectedInvoice, ...updates } = req.body;
    const isProjected = String(isProjectedInvoice).toLowerCase() === "true";

    const company = await Company.findById(req.company).lean();
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    const hasValidRevenueId =
      revenueId && mongoose.Types.ObjectId.isValid(revenueId);

    const existingRevenue = hasValidRevenueId
      ? await WorkationRevenue.findOne({
          _id: revenueId,
          company: req.company,
        }).lean()
      : null;

    const previousInvoiceId = existingRevenue?.invoice?.id || null;

    const allowedFields = [
      "nameOfClient",
      "clientInvoiceName",
      "particulars",
      "taxableAmount",
      "gst",
      "totalAmount",
      "date",
      "status",
      "invoiceUploadedAt",
      "clientId",
      "client",
    ];

    const payload = allowedFields.reduce((result, field) => {
      if (updates[field] !== undefined) {
        result[field] = updates[field];
      }
      return result;
    }, {});

    const client = await findOrCreateWorkationClient({
      clientId: updates.clientId || payload.client,
      clientName: payload.nameOfClient || existingRevenue?.nameOfClient,
    });

    if (payload.date) payload.date = new Date(payload.date);
    if (payload.invoiceUploadedAt) {
      payload.invoiceUploadedAt = new Date(payload.invoiceUploadedAt);
    }

    if (client?._id) {
      payload.client = client._id;
    } else if (payload.clientId && mongoose.Types.ObjectId.isValid(payload.clientId)) {
      payload.client = payload.clientId;
    }
    delete payload.clientId;

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
        payload.nameOfClient ||
        existingRevenue?.nameOfClient ||
        existingRevenue?.client?.clientName ||
        "client";

      const uploadResult = await handleDocumentUpload(
        processedBuffer,
        `${company.companyName}/workation-revenues/${ownerName}`,
        req.file.originalname,
      );

      if (!uploadResult?.public_id) {
        return res
          .status(500)
          .json({ message: "Failed to upload document" });
      }

      uploadedInvoiceId = uploadResult.public_id;
      const invoiceDate = payload.invoiceUploadedAt || new Date();

      payload.invoice = {
        name: req.file.originalname,
        link: uploadResult.secure_url,
        id: uploadResult.public_id,
        date: invoiceDate,
      };
      payload.invoiceUploadedAt = invoiceDate;
    }

    let revenue;

    if (hasValidRevenueId && !isProjected) {
      revenue = await WorkationRevenue.findOneAndUpdate(
        { _id: revenueId, company: req.company },
        payload,
        { new: true, runValidators: true },
      );
    } else {
      revenue = await WorkationRevenue.create({
        ...payload,
        company: req.company,
      });
    }

    if (!revenue) {
      return res.status(404).json({ message: "Revenue not found" });
    }

    if (
      uploadedInvoiceId &&
      previousInvoiceId &&
      previousInvoiceId !== uploadedInvoiceId
    ) {
      await handleFileDelete(previousInvoiceId).catch(() => null);
    }

    return res.status(hasValidRevenueId && !isProjected ? 200 : 201).json({
      message: "Workation invoice updated successfully",
      revenue,
    });
  } catch (error) {
    if (uploadedInvoiceId) {
      await handleFileDelete(uploadedInvoiceId).catch(() => null);
    }
    next(error);
  }
};

const normalizeCsvHeader = (header = "") =>
  header
    .replace(/^\uFEFF/, "")
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

const normalizeClientName = (name = "") =>
  name.toString().trim().replace(/\s+/g, " ").toLowerCase();

const getCsvValue = (row, aliases) => {
  const normalizedRow = Object.entries(row).reduce((acc, [key, value]) => {
    acc[normalizeCsvHeader(key)] = value;
    return acc;
  }, {});

  for (const alias of aliases) {
    const value = normalizedRow[normalizeCsvHeader(alias)];
    if (
      value !== undefined &&
      value !== null &&
      value.toString().trim() !== ""
    ) {
      return value.toString().trim();
    }
  }

  return "";
};

const parseAmount = (value) => {
  if (value === undefined || value === null || value === "") return 0;
  const sanitizedValue = value.toString().replace(/,/g, "").trim();
  const parsedValue = parseFloat(sanitizedValue);
  return Number.isNaN(parsedValue) ? 0 : parsedValue;
};

const parseCsvDate = (value) => {
  if (!value) return null;

  const trimmedValue = value.toString().trim();
  const parsedDate = new Date(trimmedValue);

  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
};

const bulkInsertWorkationRevenue = async (req, res, next) => {
  try {
    const file = req.file;
    if (!file) {
      return res
        .status(400)
        .json({ message: "Please provide a valid CSV file" });
    }

    const workationClients = await WorkationClients.find().lean().exec();
    const workationClientsMap = new Map(
      workationClients.map((client) => [
        normalizeClientName(client.clientName),
        client._id,
      ]),
    );

    const rows = [];
    const skippedRows = [];
    const stream = Readable.from(file.buffer.toString("utf-8").trim());

    stream
      .pipe(csvParser())
      .on("data", (row) => {
        // const nameOfClient = row["Name Of Client"]?.trim();
        // const workationClientId = workationClientsMap.get(
        //   nameOfClient?.toLowerCase(),
        const nameOfClient = getCsvValue(row, [
          "Name Of Client",
          "NAME OF CLIENT",
          "Client Name",
          "Client",
        ]);
        const clientInvoiceName = getCsvValue(row, [
          "Client Invoice Name",
          "Invoice Name",
          "clientInvoiceName",
        ]);
        const particulars = getCsvValue(row, ["Particulars", "PARTCULARS"]);
        const paidDate = parseCsvDate(
          getCsvValue(row, ["Paid Date", "PAYMENT DATE", "Date"]),
        );

        // if (!workationClientId) return;

        // const parseAmount = (value) =>
        //   parseFloat(value?.replace(/,/g, "")) || 0;
        // const revenueEntry = {
        //   company: req.company,
        //   client: workationClientId,
        //   nameOfClient: nameOfClient,
        //   status: row["Status"]?.trim() || "",
        //   particulars: row["Particulars"]?.trim(),
        //   taxableAmount: parseAmount(row["Taxable Amount"]),
        //   gst: parseAmount(row["GST"]),
        //   totalAmount: parseAmount(row["Total Amount"]),
        //   date: new Date(row["Paid Date"]),
        // };

        // results.push(revenueEntry);
         if (!nameOfClient || !particulars || !paidDate) {
          skippedRows.push({ nameOfClient, reason: "Missing required fields" });
          return;
        }

        rows.push({
          nameOfClient,
          clientInvoiceName,
          normalizedName: normalizeClientName(nameOfClient),
          status: getCsvValue(row, ["Status"]),
          particulars,
          taxableAmount: parseAmount(
            getCsvValue(row, ["Taxable Amount", "Taxable"]),
          ),
          gst: parseAmount(getCsvValue(row, ["GST"])),
          totalAmount: parseAmount(
            getCsvValue(row, ["Total Amount", "Revenue", "Amount"]),
          ),
          date: paidDate,
        });
      })
      .on("end", async () => {
        try {
          if (!rows.length) {
            return res.status(400).json({
              message:
                "No valid rows to insert. Please check client name, particulars, and paid date columns.",
              skippedRows,
            });
          }

     const newClients = [];
          const seenNewClients = new Set();

          rows.forEach((row) => {
            if (
              !workationClientsMap.has(row.normalizedName) &&
              !seenNewClients.has(row.normalizedName)
            ) {
              seenNewClients.add(row.normalizedName);
              newClients.push({
                clientName: row.nameOfClient,
                startDate: row.date,
              });
            }
          });

          if (newClients.length) {
            const createdClients = await WorkationClients.insertMany(newClients);
            createdClients.forEach((client) => {
              workationClientsMap.set(
                normalizeClientName(client.clientName),
                client._id,
              );
            });
          }

          const results = rows.map(({ normalizedName, ...row }) => ({
            company: req.company,
            client: workationClientsMap.get(normalizedName),
            ...row,
          }));

          await WorkationRevenue.insertMany(results);
          res.status(200).json({
            message: `${results.length} records inserted successfully`,
            insertedCount: results.length,
            createdClients: newClients.length,
            skippedRows: skippedRows.length,
          });
        } catch (error) {
          next(error);
        }
      })
      .on("error", (err) => {
        console.error("CSV parsing error:", err);
        next(err);
      });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWorkationRevenues,
  getWorkationClients,
  createWorkationRevenue,
  bulkInsertWorkationRevenue,
  updateWorkationRevenueInvoice,
};
