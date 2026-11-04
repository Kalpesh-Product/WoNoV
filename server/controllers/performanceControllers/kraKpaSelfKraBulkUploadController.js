const mongoose = require("mongoose");
const csvParser = require("csv-parser");
const { Readable } = require("stream");
const Permission = require("../../models/Permissions");
const UserData = require("../../models/hr/UserData");
const Department = require("../../models/Departments");
const SelfKra = require("../../models/performances/KraKpaSelfKra");
const KraCategory = require("../../models/performances/KraCategory");

const BULK_UPLOAD_PERMISSION = "kra_kpa_self_kra_bulk_upload";
const MAX_BULK_KRA_ROWS = 500;

const normalizeHeader = (value = "") =>
  String(value)
    .replace(/^\uFEFF/, "")
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "");

const normalizeCategoryName = (value = "") =>
  String(value).trim().replace(/\s+/g, " ").toLowerCase();

const getCell = (row, acceptedHeaders) => {
  const normalizedAccepted = new Set(acceptedHeaders.map(normalizeHeader));
  const matchingHeader = Object.keys(row).find((header) =>
    normalizedAccepted.has(normalizeHeader(header)),
  );
  return matchingHeader ? String(row[matchingHeader] ?? "").trim() : "";
};

const getTodayDate = () =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

const hasDepartmentAccess = async (req, departmentId, roleNames) => {
  const departmentIds = (req.departments || [])
    .map((department) => String(department?._id || department))
    .filter((id) => mongoose.isValidObjectId(id));
  const isHr = roleNames.some((role) => /^hr(?:\s|$)/.test(role));
  const isTopManagement =
    roleNames.includes("top management") ||
    Boolean(
      departmentIds.length &&
        (await Department.exists({
          _id: { $in: departmentIds },
          name: /^top management$/i,
        })),
    );
  const isAdmin = roleNames.some((role) =>
    ["master admin", "super admin"].includes(role),
  );
  const canViewOthers =
    isHr || isTopManagement || isAdmin || roleNames.some((role) =>
      role.includes("manager") || role.endsWith("admin"),
    );
  const hasAccess =
    isHr ||
    isTopManagement ||
    isAdmin ||
    departmentIds.includes(String(departmentId));

  return { hasAccess, canViewOthers };
};

const requireSelfKraBulkUploadPermission = async (req, res, next) => {
  try {
    const userPermissions = await Permission.findOne({ user: req.user })
      .select("permissions")
      .lean();
    if (!userPermissions?.permissions?.includes(BULK_UPLOAD_PERMISSION)) {
      return res.status(403).json({
        message: "You do not have permission to bulk upload Self KRAs",
      });
    }
    return next();
  } catch (error) {
    return next(error);
  }
};

const bulkUploadSelfKra = async (req, res, next) => {
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
      return res.status(400).json({ message: "The CSV file has no KRA rows." });
    }
    if (nonEmptyRows.length > MAX_BULK_KRA_ROWS) {
      return res.status(400).json({
        message: `Upload no more than ${MAX_BULK_KRA_ROWS} KRA rows at a time.`,
      });
    }

    const departmentId = String(req.body.department || "");
    const employeeId = String(req.body.employee || "");
    if (
      !mongoose.isValidObjectId(departmentId) ||
      !mongoose.isValidObjectId(employeeId)
    ) {
      return res.status(400).json({
        message: "A valid department and employee are required.",
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

    const roleNames = (req.roles || []).map((role) => String(role).toLowerCase());
    const access = await hasDepartmentAccess(req, departmentId, roleNames);
    if (!access.hasAccess) {
      return res.status(403).json({ message: "Department access denied." });
    }
    if (!access.canViewOthers && employeeId !== String(req.user)) {
      return res.status(403).json({ message: "Employee access denied." });
    }

    const employee = await UserData.findOne({
      _id: employeeId,
      company: req.company,
      departments: departmentId,
      isActive: { $ne: false },
    })
      .select("_id")
      .lean();
    if (!employee) {
      return res.status(400).json({
        message: "Employee must be active and belong to the selected department.",
      });
    }

    if (employeeId !== String(req.user)) {
      const loggedInUserIsDepartmentLead = await UserData.exists({
        _id: req.user,
        company: req.company,
        departments: departmentId,
        isActive: { $ne: false },
      });
      if (!loggedInUserIsDepartmentLead) {
        return res.status(400).json({
          message: "The logged-in user must be active in the selected department to be assigned as Lead.",
        });
      }
    }

    let categories = await KraCategory.find({
      company: req.company,
      department: departmentId,
      isActive: true,
      isDeleted: { $ne: true },
    })
      .select("categoryName normalizedName")
      .lean();
    const validationErrors = [];
    const parsedRows = nonEmptyRows.map((row, index) => {
      const rowNumber = index + 2;
      const title = getCell(row, ["KRA", "KRA Title"]);
      const categoryName = getCell(row, ["Category"]);
      const errors = [];

      if (!title) {
        errors.push({ row: rowNumber, field: "KRA", message: "KRA is required." });
      } else if (title.length > 300) {
        errors.push({
          row: rowNumber,
          field: "KRA",
          message: "KRA must be at most 300 characters.",
        });
      }
      if (!categoryName) {
        errors.push({
          row: rowNumber,
          field: "Category",
          message: "Category is required.",
        });
      } else if (categoryName.length > 200) {
        errors.push({
          row: rowNumber,
          field: "Category",
          message: "Category must be at most 200 characters.",
        });
      }

      validationErrors.push(...errors);
      return errors.length ? null : { title, categoryName };
    });

    if (validationErrors.length) {
      return res.status(400).json({
        message: "Self KRA CSV validation failed. No rows were imported.",
        errors: validationErrors,
      });
    }

    const categoryByName = new Map(
      categories.map((category) => [
        normalizeCategoryName(category.normalizedName || category.categoryName),
        category,
      ]),
    );
    const missingCategories = new Map();
    parsedRows.forEach(({ categoryName }) => {
      const normalizedName = normalizeCategoryName(categoryName);
      if (!categoryByName.has(normalizedName) && !missingCategories.has(normalizedName)) {
        missingCategories.set(normalizedName, categoryName.trim().replace(/\s+/g, " "));
      }
    });

    if (missingCategories.size) {
      const categoryOperations = [...missingCategories.entries()].map(
        ([normalizedName, categoryName]) => ({
          updateOne: {
            filter: {
              company: req.company,
              department: departmentId,
              normalizedName,
            },
            update: {
              $set: { isActive: true, updatedBy: req.user },
              $setOnInsert: {
                company: req.company,
                department: departmentId,
                categoryName,
                normalizedName,
                isDeleted: false,
                createdBy: req.user,
              },
            },
            upsert: true,
          },
        }),
      );

      try {
        await KraCategory.bulkWrite(categoryOperations, { ordered: true });
      } catch (error) {
        // A concurrent upload may have inserted the same unique category.
        if (error?.code !== 11000) throw error;
      }

      categories = await KraCategory.find({
        company: req.company,
        department: departmentId,
        isActive: true,
        isDeleted: { $ne: true },
      })
        .select("categoryName normalizedName")
        .lean();
      categories.forEach((category) =>
        categoryByName.set(
          normalizeCategoryName(category.normalizedName || category.categoryName),
          category,
        ),
      );
    }

    const kraRecords = parsedRows.map(({ title, categoryName }) => ({
      company: req.company,
      department: departmentId,
      employee: employeeId,
      title,
      description: "",
      category: categoryByName.get(normalizeCategoryName(categoryName))._id,
      lead: req.user,
      status: "Pending",
      closingDate: null,
      startsOn: getTodayDate(),
      isActive: true,
      isDeleted: false,
      createdBy: req.user,
      updatedBy: req.user,
    }));

    await SelfKra.insertMany(kraRecords, { ordered: true });
    return res.status(201).json({
      message: "Self KRAs uploaded successfully.",
      count: kraRecords.length,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  bulkUploadSelfKra,
  requireSelfKraBulkUploadPermission,
};
