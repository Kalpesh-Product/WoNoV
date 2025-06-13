const Budget = require("../../models/budget/Budget");
const MeetingRevenue = require("../../models/sales/MeetingRevenue");
const AlternateRevenues = require("../../models/sales/AlternateRevenue");
const VirtualOfficeRevenues = require("../../models/sales/VirtualOfficeRevenue");
const WorkationRevenues = require("../../models/sales/WorkationRevenue");
const CoworkingRevenue = require("../../models/sales/CoworkingRevenue");
const Unit = require("../../models/locations/Unit");
const Company = require("../../models/hr/Company");
const { PDFDocument } = require("pdf-lib");
const {
  handleDocumentUpload,
  handleFileDelete,
} = require("../../config/cloudinaryConfig");
const Invoice = require("../../models/finance/Invoice");
const CustomError = require("../../utils/customErrorlogs");
const { createLog } = require("../../utils/moduleLogs");
const { default: mongoose } = require("mongoose");
const CoworkingClient = require("../../models/sales/CoworkingClient");

const getIncomeAndExpanse = async (req, res, next) => {
  try {
    const company = req.company;

    const [
      budgets,
      meetingRevenue,
      alternateRevenues,
      virtualOfficeRevenues,
      workationRevenues,
      coworkingRevenues,
      units,
    ] = await Promise.all([
      Budget.find({ company, status: "Approved" })
        .populate([
          {
            path: "unit",
            populate: {
              path: "building",
              select: "buildingName",
              model: "Building",
            },
          },
          { path: "department", select: "name" },
        ])
        .lean()
        .exec(),
      MeetingRevenue.find({ company }).lean().exec(),
      AlternateRevenues.find({ company }).lean().exec(),
      VirtualOfficeRevenues.find({ company }).lean().exec(),
      WorkationRevenues.find({ company }).lean().exec(),
      CoworkingRevenue.find({ company }).lean().exec(),
      Unit.find({ company })
        .populate([{ path: "building", select: "buildingName" }])
        .lean()
        .exec(),
    ]);

    const response = [
      {
        expense: [...budgets],
      },
      {
        income: {
          meetingRevenue: [
            ...meetingRevenue.map((m) => ({ ...m, status: "paid" })),
          ],
          alternateRevenues: [
            ...alternateRevenues.map((m) => ({ ...m, status: "paid" })),
          ],
          virtualOfficeRevenues: [
            ...virtualOfficeRevenues.map((m) => ({ ...m, status: "paid" })),
          ],
          workationRevenues: [
            ...workationRevenues.map((m) => ({ ...m, status: "paid" })),
          ],
          coworkingRevenues: [
            ...coworkingRevenues.map((m) => ({ ...m, status: "paid" })),
          ],
        },
      },
      {
        units: [...units],
      },
    ];

    return res.status(200).json({ response });
  } catch (error) {
    next(error);
  }
};

const uploadClientInvoice = async (req, res, next) => {
  const logPath = "finance/FinanceLog";
  const logAction = "Upload Invoice";
  const logSourceKey = "invoice";
  const { client, invoiceUploadedAt } = req.body;
  const file = req.file;
  const { user, ip, company } = req;

  try {
    const allowedMimeTypes = [
      "application/pdf",
      "application/msword", // .doc
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
    ];

    if (!mongoose.Types.ObjectId.isValid(client)) {
      throw new CustomError(
        "Invalid client Id provided",
        logPath,
        logAction,
        logSourceKey
      );
    }

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new CustomError(
        "Invalid file type. Allowed types: PDF, DOC, DOCX",
        logPath,
        logAction,
        logSourceKey
      );
    }

    const foundClient = await CoworkingClient.findById({ _id: client });

    if (!foundClient) {
      throw new CustomError(
        "Client not found",
        logPath,
        logAction,
        logSourceKey
      );
    }

    const foundCompany = await Company.findById(company);

    if (!foundCompany) {
      throw new CustomError(
        "Company not found",
        logPath,
        logAction,
        logSourceKey
      );
    }

    let processedBuffer = file.buffer;
    const originalFilename = file.originalname;

    // Process PDF: set document title
    if (file.mimetype === "application/pdf") {
      const pdfDoc = await PDFDocument.load(file.buffer);
      pdfDoc.setTitle(
        file.originalname ? file.originalname.split(".")[0] : "Untitled"
      );
      processedBuffer = await pdfDoc.save();
    }

    const response = await handleDocumentUpload(
      processedBuffer,
      `${foundCompany.companyName}/clients/${foundClient.clientName}/invoice`,
      originalFilename
    );

    if (!response.public_id) {
      throw new CustomError(
        "Failed to upload document",
        logPath,
        logAction,
        logSourceKey
      );
    }

    const invoiceExists = await Invoice.findOne({
      "invoice.id": response.public_id,
    });

    if (invoiceExists) {
      await handleFileDelete(invoiceExists.invoice.id);
    }

    const newInvoice = new Invoice({
      client,
      invoice: {
        name: originalFilename,
        link: response.secure_url,
        id: response.public_id,
        date: new Date(),
      },
      invoiceUploadedAt: invoiceUploadedAt ? invoiceUploadedAt : new Date(),
      company,
    });

    const savedInvoice = await newInvoice.save();

    if (!savedInvoice) {
      throw new CustomError(
        "Failed to save invoice",
        logPath,
        logAction,
        logSourceKey
      );
    }

    await createLog({
      path: logPath,
      action: logAction,
      remarks: `Invoice uploaded successfully`,
      status: "Success",
      user: user,
      ip: ip,
      company: company,
      sourceKey: logSourceKey,
      sourceId: savedInvoice._id,
      changes: {
        invoiceName: originalFilename,
        invoiceLink: response.secure_url,
        invoiceId: response.public_id,
      },
    });

    return res.status(200).json({
      message: `Invoice uploaded successfully`,
    });
  } catch (error) {
    if (error instanceof CustomError) {
      next(error);
    } else {
      next(
        new CustomError(error.message, logPath, logAction, logSourceKey, 500)
      );
    }
  }
};

const uploadClientVoucher = async (req, res, next) => {
  const logPath = "finance/FinanceLog";
  const logAction = "Upload Voucher";
  const logSourceKey = "voucher";
  const { client, voucherUploadedAt } = req.body;
  const file = req.file;
  const { user, ip, company } = req;

  try {
    const allowedMimeTypes = [
      "application/pdf",
      "application/msword", // .doc
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
    ];

    if (!mongoose.Types.ObjectId.isValid(client)) {
      throw new CustomError(
        "Invalid client Id provided",
        logPath,
        logAction,
        logSourceKey
      );
    }

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new CustomError(
        "Invalid file type. Allowed types: PDF, DOC, DOCX",
        logPath,
        logAction,
        logSourceKey
      );
    }

    const foundClient = await CoworkingClient.findById({ _id: client });

    if (!foundClient) {
      throw new CustomError(
        "Client not found",
        logPath,
        logAction,
        logSourceKey
      );
    }

    const foundCompany = await Company.findById(company);

    if (!foundCompany) {
      throw new CustomError(
        "Company not found",
        logPath,
        logAction,
        logSourceKey
      );
    }

    let processedBuffer = file.buffer;
    const originalFilename = file.originalname;

    // Process PDF: set document title
    if (file.mimetype === "application/pdf") {
      const pdfDoc = await PDFDocument.load(file.buffer);
      pdfDoc.setTitle(
        file.originalname ? file.originalname.split(".")[0] : "Untitled"
      );
      processedBuffer = await pdfDoc.save();
    }

    const response = await handleDocumentUpload(
      processedBuffer,
      `${foundCompany.companyName}/clients/${foundClient.clientName}/voucher`,
      originalFilename
    );

    if (!response.public_id) {
      throw new CustomError(
        "Failed to upload document",
        logPath,
        logAction,
        logSourceKey
      );
    }

    const voucherExists = await Invoice.findOne({
      "invoice.id": response.public_id,
    });

    if (voucherExists) {
      await handleFileDelete(voucherExists.invoice.id);
    }

    const newVoucher = new Invoice({
      client,
      voucher: {
        name: originalFilename,
        link: response.secure_url,
        id: response.public_id,
        date: new Date(),
      },
      voucherUploadedAt: voucherUploadedAt ? voucherUploadedAt : new Date(),
      company,
    });

    const savedVoucher = await newVoucher.save();

    if (!savedVoucher) {
      throw new CustomError(
        "Failed to save invoice",
        logPath,
        logAction,
        logSourceKey
      );
    }

    await createLog({
      path: logPath,
      action: logAction,
      remarks: `Invoice uploaded successfully`,
      status: "Success",
      user: user,
      ip: ip,
      company: company,
      sourceKey: logSourceKey,
      sourceId: savedVoucher._id,
      changes: {
        invoiceName: originalFilename,
        invoiceLink: response.secure_url,
        invoiceId: response.public_id,
      },
    });

    return res.status(200).json({
      message: `Voucher uploaded successfully`,
    });
  } catch (error) {
    if (error instanceof CustomError) {
      next(error);
    } else {
      next(
        new CustomError(error.message, logPath, logAction, logSourceKey, 500)
      );
    }
  }
};

const getInvoices = async (req, res, next) => {
  try {
    const { company } = req;

    const invoices = await Invoice.find({ company }).populate({
      path: "client",
      select: "clientName",
    });

    if (!invoices) {
      return res.status(400).json({ message: "No invoices found" });
    }

    return res.status(200).json(invoices);
  } catch (error) {
    next(error);
  }
};

const updatePaymentStatus = async (req, res, next) => {
  const logPath = "finance/FinanceLog";
  const logAction = "Update Payment Status";
  const logSourceKey = "invoice";
  const { user, ip, company } = req;

  try {
    const { invoiceId } = req.params;

    const updateInvoice = await Invoice.findByIdAndUpdate(
      { _id: invoiceId },
      { paymentStatus: true },
      { new: true }
    );

    if (!updateInvoice) {
      throw new CustomError(
        "Failed to update payment status",
        logPath,
        logAction,
        logSourceKey
      );
    }

    await createLog({
      path: logPath,
      action: logAction,
      remarks: "Payment status updated successfully",
      status: "Success",
      user: user,
      ip: ip,
      company: company,
      sourceKey: logSourceKey,
      sourceId: updateInvoice._id,
      changes: { paymentStatus: true },
    });

    res.status(200).json({ message: "Payment status updated successfully" });
  } catch (error) {
    next(
      error instanceof CustomError
        ? error
        : new CustomError(error.message, logPath, logAction, logSourceKey, 500)
    );
  }
};

module.exports = {
  getIncomeAndExpanse,
  uploadClientInvoice,
  getInvoices,
  updatePaymentStatus,
};
