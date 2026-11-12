const mongoose = require("mongoose");
const csvParser = require("csv-parser");
const { Readable } = require("stream");
const Permission = require("../../models/Permissions");
const UserData = require("../../models/hr/UserData");
const IndividualMonthlyKpa = require("../../models/performances/KraKpaIndividualMonthlyKpa");
const parseKraKpaBulkDate = require("../../utils/parseKraKpaBulkDate");

const BULK_UPLOAD_PERMISSION = "kra_kpa_self_kpa_bulk_upload";
const MAX_BULK_KPA_ROWS = 500;

const normalizeHeader = (value = "") =>
  String(value)
    .replace(/^\uFEFF/, "")
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "");

const getCell = (row, acceptedHeaders) => {
  const normalizedAccepted = new Set(acceptedHeaders.map(normalizeHeader));
  const matchingHeader = Object.keys(row).find((header) =>
    normalizedAccepted.has(normalizeHeader(header)),
  );
  return matchingHeader ? String(row[matchingHeader] ?? "").trim() : "";
};

const getFiscalYear = (monthKey) => {
  const [year, month] = monthKey.split("-").map(Number);
  const fiscalStartYear = month >= 4 ? year : year - 1;
  return `${fiscalStartYear}-${String(fiscalStartYear + 1).slice(-2)}`;
};

const requireSelfKpaBulkUploadPermission = async (req, res, next) => {
  try {
    const userPermissions = await Permission.findOne({ user: req.user })
      .select("permissions")
      .lean();
    if (!userPermissions?.permissions?.includes(BULK_UPLOAD_PERMISSION)) {
      return res.status(403).json({
        message: "You do not have permission to bulk upload Self KPAs",
      });
    }
    return next();
  } catch (error) {
    return next(error);
  }
};

const bulkUploadSelfKpa = async (req, res, next) => {
  try {
    const file = req.file;
    if (!file || !/\.csv$/i.test(file.originalname || "")) {
      return res.status(400).json({ message: "Please upload a CSV file." });
    }

    const csv = file.buffer?.toString("utf8").replace(/^\uFEFF/, "").trim();
    if (!csv) {
      return res.status(400).json({ message: "The CSV file is empty." });
    }

    const rows = [];
    await new Promise((resolve, reject) => {
      Readable.from([csv])
        .pipe(csvParser())
        .on("data", (row) => rows.push(row))
        .on("end", resolve)
        .on("error", reject);
    });

    const nonEmptyRows = rows.filter((row) =>
      Object.values(row).some((value) => String(value ?? "").trim()),
    );
    if (!nonEmptyRows.length) {
      return res.status(400).json({ message: "The CSV file has no KPA rows." });
    }
    if (nonEmptyRows.length > MAX_BULK_KPA_ROWS) {
      return res.status(400).json({
        message: `Upload no more than ${MAX_BULK_KPA_ROWS} KPA rows at a time.`,
      });
    }

    const user = await UserData.findOne({
      _id: req.user,
      company: req.company,
      isActive: { $ne: false },
    })
      .select("departments")
      .lean();
    if (!user) {
      return res.status(404).json({ message: "Active logged-in user not found." });
    }

    const departmentId = String(req.body.department || user.departments?.[0] || "");
    if (
      !mongoose.isValidObjectId(departmentId) ||
      !user.departments?.some((department) => String(department) === departmentId)
    ) {
      return res.status(400).json({
        message: "Select a valid department assigned to your account.",
      });
    }

    const validationErrors = [];
    const pendingKpas = nonEmptyRows.flatMap((row, index) => {
      const rowNumber = index + 2;
      const target = getCell(row, ["KPA", "Target", "KPA Target"]);
      const deadlineText = getCell(row, ["Deadline"]);
      const deadline = deadlineText ? parseKraKpaBulkDate(deadlineText) : null;
      const errors = [];

      if (!target) {
        errors.push({ row: rowNumber, field: "KPA", message: "KPA is required." });
      } else if (target.length > 2000) {
        errors.push({
          row: rowNumber,
          field: "KPA",
          message: "KPA must be at most 2000 characters.",
        });
      }
      if (!deadlineText) {
        errors.push({
          row: rowNumber,
          field: "Deadline",
          message: "Deadline is required.",
        });
      } else if (!deadline) {
        errors.push({
          row: rowNumber,
          field: "Deadline",
          message:
            "Use YYYY-MM-DD, DD-MM-YY/YYYY, DD-MMM-YY/YYYY, or DD-MMMM-YY/YYYY (for example, 2026-11-30, 01-11-26, 01-Nov-26, or 01-Nov-2026).",
        });
      }
      validationErrors.push(...errors);
      if (errors.length) return [];

      const month = deadline.toISOString().slice(0, 7);
      return [{
        company: req.company,
        department: departmentId,
        employee: req.user,
        month,
        fiscalYear: getFiscalYear(month),
        target,
        deadline,
        status: "Pending",
        approvalStatus: "Pending Approval",
        approvedBy: null,
        approvedAt: null,
        rejectedBy: null,
        rejectedAt: null,
        createdBy: req.user,
        updatedBy: req.user,
      }];
    });

    if (validationErrors.length) {
      return res.status(400).json({
        message: "KPA CSV validation failed. No rows were imported.",
        errors: validationErrors,
      });
    }

    await IndividualMonthlyKpa.insertMany(pendingKpas, { ordered: true });
    return res.status(201).json({
      message: "Self KPAs uploaded and sent for approval.",
      count: pendingKpas.length,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  bulkUploadSelfKpa,
  requireSelfKpaBulkUploadPermission,
};
