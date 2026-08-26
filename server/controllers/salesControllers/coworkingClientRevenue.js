const CoworkingRevenue = require("../../models/sales/CoworkingRevenue");
const CoworkingClient = require("../../models/sales/CoworkingClient");
const Service = require("../../models/sales/ClientService");
const Company = require("../../models/hr/Company");
const CustomError = require("../../utils/customErrorlogs");
const { createLog } = require("../../utils/moduleLogs");
const {
  handleDocumentUpload,
  handleFileDelete,
} = require("../../config/s3Config");
const { Readable } = require("stream");
const csvParser = require("csv-parser");
const { PDFDocument } = require("pdf-lib");
const {
  normalizeClientName,
  normalizeAmount,
} = require("../../utils/dataSheetFormatters");
const {
  fetchCoworkingRevenueService,
} = require("../../services/reports/revenue");

const normalizeHeaderKey = (value = "") =>
  String(value)
    .trim()
    .toLowerCase()
    .replace(/[\s_.()-]+/g, "");

const getRowValue = (row, keys = []) => {
  const rowEntries = Object.entries(row || {});

  for (const key of keys) {
    const normalizedKey = normalizeHeaderKey(key);
    const matchedEntry = rowEntries.find(
      ([rowKey]) => normalizeHeaderKey(rowKey) === normalizedKey,
    );
    const value = matchedEntry?.[1];

    if (value !== undefined && value !== null && String(value).trim() !== "") {
      return typeof value === "string" ? value.trim() : value;
    }
  }

  return "";
};

const parseCsvAmount = (value) => {
  if (value === undefined || value === null || value === "") return 0;

  const cleaned = String(value)
    .replace(/,/g, "")
    .replace(/[^\d.-]/g, "");
  const parsed = Number(cleaned);

  return Number.isNaN(parsed) ? 0 : parsed;
};

const addRevenue = async (req, res, next) => {
  const logPath = "sales/SalesLog";
  const logAction = "Add CoworkingRevenue";
  const logSourceKey = "revenue";
  const { company, user, ip } = req;

  try {
    const {
      serviceId,
      clientId,
      projectedRevenue,
      month,

      // New fields
      clientName,
      channel,
      noOfDesks,
      deskRate,
      occupation,
      revenue,
      totalTerm,
      dueTerm,
      rentDate,
      invoiceUploadedAt,
      rentStatus,
      pastDueDate,
      annualIncrement,
      nextIncrementDate,
    } = req.body;

    if (!serviceId || !clientId || !projectedRevenue || !month) {
      throw new CustomError(
        "All fields are required.",
        logPath,
        logAction,
        logSourceKey,
      );
    }

    // Validate client and service existence
    const clientExists = await CoworkingClient.findById(clientId);
    const serviceExists = await Service.findById(serviceId);

    if (!clientExists) {
      throw new CustomError(
        "CoworkingClient not found.",
        logPath,
        logAction,
        logSourceKey,
      );
    }

    if (!serviceExists) {
      throw new CustomError(
        "Service not found.",
        logPath,
        logAction,
        logSourceKey,
      );
    }

    // Create new revenue entry
    const revenueDoc = new CoworkingRevenue({
      projectedRevenue,
      month: new Date(month),
      client: clientId,
      service: serviceId,
      company: company._id,

      // Save new fields
      clientName,
      channel,
      noOfDesks,
      deskRate,
      occupation,
      revenue,
      totalTerm,
      dueTerm,
      rentDate,
      invoiceUploadedAt,
      rentStatus,
      pastDueDate,
      annualIncrement,
      nextIncrementDate,
    });

    const savedRevenue = await revenueDoc.save();

    await createLog({
      path: logPath,
      action: logAction,
      remarks: "CoworkingRevenue added successfully",
      status: "Success",
      user,
      ip,
      company,
      sourceKey: logSourceKey,
      sourceId: savedRevenue._id,
      changes: {
        revenue: savedRevenue,
      },
    });

    res.status(201).json({
      message: "CoworkingRevenue added successfully",
      revenue: savedRevenue,
    });
  } catch (error) {
    if (error instanceof CustomError) {
      next(error);
    } else {
      next(
        new CustomError(error.message, logPath, logAction, logSourceKey, 500),
      );
    }
  }
};

const getRevenues = async (req, res, next) => {
  // try {
  //   const company = req.company;
  //   const { serviceId } = req.query;

  //   const filter = { company };
  //   if (serviceId) {
  //     filter.service = serviceId;
  //   }

  //   const revenues = await CoworkingRevenue.find(filter).lean().exec();

  //   const MONTHS_SHORT = [
  //     "Jan",
  //     "Feb",
  //     "Mar",
  //     "Apr",
  //     "May",
  //     "Jun",
  //     "Jul",
  //     "Aug",
  //     "Sep",
  //     "Oct",
  //     "Nov",
  //     "Dec",
  //   ];

  //   const monthlyMap = new Map();

  //   revenues.forEach((item) => {
  //     const referenceDate = item.rentDate || item.createdAt;
  //     const dateObj = new Date(referenceDate);
  //     const month = MONTHS_SHORT[dateObj.getMonth()];
  //     const year = dateObj.getFullYear().toString().slice(-2);
  //     const monthKey = `${month}-${year}`;

  //     if (!monthlyMap.has(monthKey)) {
  //       monthlyMap.set(monthKey, {
  //         month: monthKey,
  //         totalRevenue: 0,
  //         clients: [],
  //       });
  //     }

  //     const monthData = monthlyMap.get(monthKey);
  //     monthData.totalRevenue += item.revenue || 0;

  //     monthData.clients.push({
  //       clientName: item.clientName || item.client?.clientName,
  //       channel: item.channel,
  //       noOfDesks: item.noOfDesks,
  //       deskRate: item.deskRate,
  //       occupation: item.occupation,
  //       revenue: item.revenue,
  //       totalTerm: item.totalTerm,
  //       dueTerm: item.dueTerm,
  //       rentDate: item.rentDate,
  //       rentStatus: item.rentStatus,
  //       pastDueDate: item.pastDueDate,
  //       annualIncrement: item.annualIncrement,
  //       nextIncrementDate: item.nextIncrementDate,
  //       serviceName: item.service?.serviceName,
  //     });
  //   });

  //   const transformedData = Array.from(monthlyMap.values());

  //   res.status(200).json(transformedData);
  // } catch (error) {
  //   next(error);
  // }
  try {
    const result = await fetchCoworkingRevenueService({
      query: req.query,
      company: req.company,
    });

    return res.status(200).json(result);
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    return next(error);
  }
};
const updateRevenueInvoice = async (req, res, next) => {
  let uploadedInvoiceId = null;
  let previousInvoiceId = null;

  try {
    const { revenueId, isProjectedInvoice, ...updates } = req.body;
    const isProjected = String(isProjectedInvoice).toLowerCase() === "true";
    const file = req.file;
    const companyId = req.company;
    const foundCompany = await Company.findById(companyId).lean().exec();
    if (!foundCompany) {
      throw new CustomError(
        "Company not found",
        "sales/SalesLog",
        "Update Coworking Revenue Invoice",
        "revenue",
      );
    }

    const existingRevenue = revenueId
      ? await CoworkingRevenue.findOne({
          _id: revenueId,
          company: companyId,
        })
          .lean()
          .exec()
      : null;

    previousInvoiceId = existingRevenue?.invoice?.id || null;

    const allowedFields = [
      "clients",
      "service",
      "clientName",
      "clientInvoiceName",
      "channel",
      "noOfDesks", "deskRate", "occupation", "revenue", "totalTerm",
      "dueTerm", "rentDate", "invoiceUploadedAt", "rentStatus", "pastDueDate",
      "annualIncrement", "nextIncrementDate", "invoiceUploadedBy",
    ];
    const payload = allowedFields.reduce((result, field) => {
      if (updates[field] !== undefined) result[field] = updates[field];
      return result;
    }, {});

    if (payload.invoiceUploadedAt) {
      payload.invoiceUploadedAt = new Date(payload.invoiceUploadedAt);
    }

    if (!payload.invoiceUploadedBy) {
      payload.invoiceUploadedBy = existingRevenue?.invoiceUploadedBy || req.user || null;
    }

    if (file) {
      const allowedMimeTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];

      if (!allowedMimeTypes.includes(file.mimetype)) {
        throw new CustomError(
          "Invalid file type. Allowed types: PDF, DOC, DOCX",
          "sales/SalesLog",
          "Update Coworking Revenue Invoice",
          "revenue",
        );
      }

      let processedBuffer = file.buffer;
      const originalFilename = file.originalname;

      if (file.mimetype === "application/pdf") {
        const pdfDoc = await PDFDocument.load(file.buffer);
        pdfDoc.setTitle(
          file.originalname ? file.originalname.split(".")[0] : "Untitled",
        );
        processedBuffer = await pdfDoc.save();
      }

      const uploadResult = await handleDocumentUpload(
        processedBuffer,
        `${foundCompany.companyName}/coworking-revenues/${
          payload.clientName || existingRevenue?.clientName || "client"
        }`,
        originalFilename,
      );

      if (!uploadResult?.public_id) {
        throw new CustomError(
          "Failed to upload document",
          "sales/SalesLog",
          "Update Coworking Revenue Invoice",
          "revenue",
        );
      }

      uploadedInvoiceId = uploadResult.public_id;
      payload.invoice = {
        name: originalFilename,
        link: uploadResult.secure_url,
        id: uploadResult.public_id,
        date: payload.invoiceUploadedAt || new Date(),
      };
      payload.invoiceUploadedAt = payload.invoice.date;
      payload.invoiceUploadedBy = req.user || existingRevenue?.invoiceUploadedBy || null;
    }

    let revenue;
    if (revenueId && !isProjected) {
      revenue = await CoworkingRevenue.findOneAndUpdate(
        { _id: revenueId, company: companyId },
        payload,
        { new: true, runValidators: true },
      );
    } else {
      revenue = await CoworkingRevenue.create({
        ...payload,
        company: companyId,
      });
    }

    if (!revenue) {
      if (uploadedInvoiceId) {
        await handleFileDelete(uploadedInvoiceId).catch(() => null);
      }
      return res.status(404).json({ message: "Revenue not found" });
    }

    if (previousInvoiceId && previousInvoiceId !== uploadedInvoiceId) {
      await handleFileDelete(previousInvoiceId).catch(() => null);
    }

    return res.status(isProjected ? 201 : 200).json({
      message: "Co-working invoice updated successfully",
      revenue,
    });
  } catch (error) {
    if (uploadedInvoiceId) {
      await handleFileDelete(uploadedInvoiceId).catch(() => null);
    }
    next(error);
  }
};

const bulkInsertCoworkingClientRevenues = async (req, res, next) => {
  try {
    const file = req.file;
    const company = req.company;

    if (!file) {
      return res.status(400).json({ message: "Please provide a CSV file" });
    }

    const stream = Readable.from(file.buffer.toString("utf-8").trim());
    const revenues = [];
    let skippedClients = [];

    const coworkingClients = await CoworkingClient.find({ company }).lean();
    const clientMap = new Map();
    coworkingClients.forEach((client) => {
      if (client.clientName) {
        clientMap.set(normalizeClientName(client.clientName), client._id);
      }
      if (client.clientInvoiceName) {
        clientMap.set(
          normalizeClientName(client.clientInvoiceName),
          client._id,
        );
      }
    });

    stream
      .pipe(csvParser())
      .on("data", (row) => {
        const clientName = getRowValue(row, ["Client Name", "clientName"]);
        const clientInvoiceName = getRowValue(row, [
          "Invoice Name",
          "Client Invoice Name",
          "invoiceName",
        ]);
        const channel = getRowValue(row, ["Channel"]);
        const revenue = getRowValue(row, ["Revenue", "Revenue (INR)"]);
        const rentDate = getRowValue(row, ["Rent Date"]);
        const rentStatus = getRowValue(row, ["Rent Status", "Status"]);
        const noOfDesks = getRowValue(row, [
          "No. Of Desks",
          "No. of Desks",
          "No Of Desks",
          "No of Desks",
        ]);
        const deskRate = getRowValue(row, ["Desk Rate", "Desk Rate (INR)"]);
        const totalTerm = getRowValue(row, ["Total Term"]);
        const pastDueDate = getRowValue(row, ["Past Due Date"]);
        const annualIncrement = getRowValue(row, [
          "Annual Increment",
          "Annual Increment (%)",
        ]);
        const nextIncrementDate = getRowValue(row, ["Next Increment Date"]);

        if (
          !clientName &&
          !clientInvoiceName &&
          !channel &&
          !revenue &&
          !rentDate &&
          !rentStatus &&
          !noOfDesks &&
          !deskRate
        ) {
          return;
        }

        const lookupName = clientName || clientInvoiceName;
        const clientId = clientMap.get(normalizeClientName(lookupName));

        if (!clientId) {
          skippedClients.push(lookupName);
        }

        const parsedRevenue = parseCsvAmount(revenue);
        const parsedRate = parseCsvAmount(deskRate);
        const parsedDesks = parseInt(noOfDesks, 10) || 0;
        const parsedTotalTerm = parseInt(totalTerm, 10) || 0;

        const revenueEntry = {
          ...(clientId ? { clients: clientId } : {}),
          clientName: clientInvoiceName || clientName,
          clientInvoiceName: clientInvoiceName || clientName,
          channel: channel?.trim(),
          noOfDesks: parsedDesks,
          deskRate: parsedRate,
          revenue: parsedRevenue,
          totalTerm: parsedTotalTerm,
          dueTerm: 0, // Optional: You can derive logic here if needed
          rentDate: rentDate ? new Date(rentDate) : null,
          rentStatus: rentStatus?.trim(),
          pastDueDate: pastDueDate ? new Date(pastDueDate) : null,
          annualIncrement: isNaN(parseFloat(annualIncrement))
            ? null
            : parseFloat(annualIncrement),
          nextIncrementDate: nextIncrementDate
            ? new Date(nextIncrementDate)
            : null,
          company,
        };

        revenues.push(revenueEntry);
      })
      .on("end", async () => {
        try {
          if (revenues.length === 0) {
            return res
              .status(400)
              .json({ message: "No valid revenue records found" });
          }

          await CoworkingRevenue.insertMany(revenues);

          res.status(201).json({
            message: `${revenues.length} revenue records inserted successfully`,
            skippedClients,
          });
        } catch (err) {
          next(err);
        }
      })
      .on("error", (error) => {
        console.error("CSV parse error:", error);
        next(error);
      });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addRevenue,
  getRevenues,
  updateRevenueInvoice,
  bulkInsertCoworkingClientRevenues,
};
