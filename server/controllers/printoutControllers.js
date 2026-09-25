const mongoose = require("mongoose");
const Printout = require("./../models/Printout");
const Company = require("../models/hr/Company");
const User = require("../models/hr/UserData");
const Department = require("../models/Departments");
const buildDateFilter = require("../utils/dateFilter");
const {
  fetchPrintoutReportService,
  populatePrintout,
  sanitizePrintout,
} = require("../services/printoutService");

const clientModels = ["CoworkingClient", "Company"];
const requestedByModels = ["CoworkingMember", "UserData"];
const TECH_DEPARTMENT_ID = "6798ba9de469e809084e2494";
const PERMANENT_DELETE_DEPARTMENTS = new Set([
  "top management",
  "tech department",
]);

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);
const belongsToPermanentDeleteDepartment = (departments = []) =>
  departments.some(
    (department) =>
      String(department?._id || department) === TECH_DEPARTMENT_ID ||
      PERMANENT_DELETE_DEPARTMENTS.has(
        department?.name?.trim().toLowerCase(),
      ),
  );

const validatePrintoutPayload = (payload, { isUpdate = false } = {}) => {
  const errors = [];
  const requiredFields = [
    "takenAt",
    "location",
    "unit",
    "client",
    "requestedBy",
    "printoutCount",
  ];

  if (!isUpdate) {
    requiredFields.forEach((field) => {
      if (
        payload[field] === undefined ||
        payload[field] === null ||
        payload[field] === ""
      ) {
        errors.push(`${field} is required`);
      }
    });
  }

  [
    "takenBy",
    "location",
    "unit",
    "client",
    "requestedBy",
    "department",
  ].forEach((field) => {
    if (
      payload[field] !== undefined &&
      payload[field] !== null &&
      payload[field] !== "" &&
      !isValidObjectId(payload[field])
    ) {
      errors.push(`Invalid ${field} ID provided`);
    }
  });

  if (
    payload.takenAt !== undefined &&
    isNaN(new Date(payload.takenAt).getTime())
  ) {
    errors.push("Invalid takenAt provided");
  }

  if (payload.printoutCount !== undefined) {
    const printoutCount = Number(payload.printoutCount);
    if (!Number.isInteger(printoutCount) || printoutCount < 1) {
      errors.push("printoutCount must be a positive integer");
    }
  }

  return errors;
};

const buildPrintoutPayload = (body, company, { isUpdate = false } = {}) => {
  const allowedFields = [
    "takenBy",
    "takenAt",
    "location",
    "unit",
    "client",
    "clientModel",
    "requestedByModel",
    "requestedBy",
    "department",
    "printoutCount",
    "remark",
  ];

  const payload = {};

  if (body.client !== undefined && body.client !== null && body.client !== "") {
    const isClient = company.toString() !== body.client.toString();
    payload.clientModel = isClient ? "CoworkingClient" : "Company";
    payload.requestedByModel = isClient ? "CoworkingMember" : "UserData";
  }

  allowedFields.forEach((field) => {
    if (body[field] !== undefined) {
      payload[field] = body[field];
    }
  });

  if (payload.takenAt !== undefined) {
    payload.takenAt = new Date(payload.takenAt);
  }
  if (payload.printoutCount !== undefined) {
    payload.printoutCount = Number(payload.printoutCount);
  }
  if (!isUpdate && payload.department === undefined) {
    payload.department = null;
  }

  return payload;
};

const addPrintout = async (req, res) => {
  try {
    const { user, company } = req;
    const errors = validatePrintoutPayload(req.body);
    if (errors.length) {
      return res.status(400).json({
        message: "Missing or invalid required fields",
        errors,
      });
    }

    const printoutPayload = buildPrintoutPayload(
      {
        ...req.body,
        takenBy: user,
      },
      company,
    );

    const printout = await Printout.create(printoutPayload);
    const populatedPrintout = await Printout.findById(printout._id)
      .populate(populatePrintout)
      .lean()
      .exec();

    return res.status(201).json({
      message: "Printout added successfully",
      printout: sanitizePrintout(populatedPrintout),
    });
  } catch (error) {
    return res.status(500).json({
      message: "An error occurred while adding the printout",
      error: error.message,
    });
  }
};

const editPrintout = async (req, res) => {
  try {
    const { id } = req.params;
    const { company } = req;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid printout ID provided" });
    }

    const printoutPayload = buildPrintoutPayload(req.body, company, {
      isUpdate: true,
    });
    if (!Object.keys(printoutPayload).length) {
      return res.status(400).json({
        message: "At least one editable field is required",
      });
    }

    const errors = validatePrintoutPayload(printoutPayload, { isUpdate: true });
    if (errors.length) {
      return res.status(400).json({
        message: "Invalid printout update payload",
        errors,
      });
    }

    // const printout = await Printout.findByIdAndUpdate(id, printoutPayload, {
    //   new: true,
    //   runValidators: true,
    // })
      const printout = await Printout.findOneAndUpdate(
      { _id: id, isDeleted: { $ne: true } },
      printoutPayload,
      {
        new: true,
        runValidators: true,
      },
    )
      .populate(populatePrintout)
      .lean()
      .exec();

    if (!printout) {
      return res.status(404).json({ message: "Printout not found" });
    }

    return res.status(200).json({
      message: "Printout updated successfully",
      printout: sanitizePrintout(printout),
    });
  } catch (error) {
    return res.status(500).json({
      message: "An error occurred while updating the printout",
      error: error.message,
    });
  }
};

const deletePrintout = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid printout ID provided" });
    }

    const [printout, user] = await Promise.all([
      Printout.findById(id).populate("department", "name").exec(),
      User.findById(req.user).populate("departments", "name").lean().exec(),
    ]);

    if (!printout) {
      return res.status(404).json({ message: "Printout not found" });
    }

    const canPermanentlyDelete = belongsToPermanentDeleteDepartment(
      user?.departments,
    );
    const isProtectedPrintout = belongsToPermanentDeleteDepartment([
      printout.department,
    ]);

    if (!canPermanentlyDelete && isProtectedPrintout) {
      return res.status(403).json({
        message:
          "Only Top Management or Tech Department users can delete this printout",
      });
    }

    if (canPermanentlyDelete) {
      await printout.deleteOne();
      return res.status(200).json({
        message: "Printout permanently deleted successfully",
        deletionType: "permanent",
      });
    }

    if (printout.isDeleted) {
      return res.status(403).json({
        message:
          "Only Top Management or Tech Department users can permanently delete this printout",
      });
    }

    printout.isDeleted = true;
    printout.deletedAt = new Date();
    printout.deletedBy = req.user;
    printout.deletedByPrivilegedDepartment = false;
    await printout.save();

    return res.status(200).json({
      message: "Printout deleted successfully",
      deletionType: "soft",
    });
  } catch (error) {
    return res.status(500).json({
      message: "An error occurred while deleting the printout",
      error: error.message,
    });
  }
};

const restorePrintout = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid printout ID provided" });
    }

    const user = await User.findById(req.user)
      .populate("departments", "name")
      .lean()
      .exec();

    if (!belongsToPermanentDeleteDepartment(user?.departments)) {
      return res.status(403).json({
        message:
          "Only Top Management or Tech Department users can restore this printout",
      });
    }

    const printout = await Printout.findOneAndUpdate(
      { _id: id, isDeleted: true },
      {
        $set: { isDeleted: false },
        $unset: {
          deletedAt: 1,
          deletedBy: 1,
          deletedByPrivilegedDepartment: 1,
        },
      },
      { new: true },
    )
      .populate(populatePrintout)
      .lean()
      .exec();

    if (!printout) {
      return res.status(404).json({
        message: "Deleted printout entry not found",
      });
    }

    return res.status(200).json({
      message: "Printout restored successfully",
      printout: sanitizePrintout(printout),
    });
  } catch (error) {
    return res.status(500).json({
      message: "An error occurred while restoring the printout",
      error: error.message,
    });
  }
};

const getPrintouts = async (req, res) => {
  try {
    const { id } = req.params;
    if (id) {
      if (!isValidObjectId(id)) {
        return res
          .status(400)
          .json({ message: "Invalid printout ID provided" });
      }

      const printout = await Printout.findById(id)
        .populate(populatePrintout)
        .lean()
        .exec();

      if (!printout) {
        return res.status(404).json({ message: "Printout not found" });
      }

      return res.status(200).json({
        message: "Printout fetched successfully",
        printout: sanitizePrintout(printout),
      });
    }

    const {
      location,
      unit,
      client,
      requestedBy,
      department,
      fromDate,
      toDate,
      search,
      searchContext,
      includeDeleted,
    } = req.query;
    const filters = {};
    const requestDateFilter = req.query?.dateFilter ||
      req.query?.filters || {
        startDate:
          req.query?.["dateFilter[startDate]"] ||
          req.query?.["filters[startDate]"] ||
          req.query?.startDate ||
          fromDate,
        endDate:
          req.query?.["dateFilter[endDate]"] ||
          req.query?.["filters[endDate]"] ||
          req.query?.endDate ||
          toDate,
      };
    const hasDateFilter = Boolean(
      requestDateFilter?.startDate || requestDateFilter?.endDate,
    );

    const filterErrors = [];
    [
      ["location", location],
      ["unit", unit],
      ["client", client],
      ["requestedBy", requestedBy],
      ["department", department],
    ].forEach(([key, value]) => {
      if (value) {
        if (!isValidObjectId(value)) {
          filterErrors.push(`Invalid ${key} ID provided`);
          return;
        }
        filters[key] = value;
      }
    });

    let dateFilter;
    if (hasDateFilter) {
      if (requestDateFilter.startDate) {
        const parsedFromDate = new Date(requestDateFilter.startDate);
        if (isNaN(parsedFromDate.getTime())) {
          filterErrors.push("Invalid start date provided");
        }
      }
      if (requestDateFilter.endDate) {
        const parsedToDate = new Date(requestDateFilter.endDate);
        if (isNaN(parsedToDate.getTime())) {
          filterErrors.push("Invalid end date provided");
        }
      }

      if (!filterErrors.length) {
        dateFilter = buildDateFilter({
          startDate: requestDateFilter.startDate,
          endDate: requestDateFilter.endDate,
          field: "takenAt",
        });
      }
    }

    if (filterErrors.length) {
      return res.status(400).json({
        message: "Invalid printout filters provided",
        errors: filterErrors,
      });
    }

    let canViewDeleted = false;
    let privilegedUserIds = [];
    if (includeDeleted === "true") {
      const user = await User.findById(req.user)
        .populate("departments", "name")
        .lean()
        .exec();
      canViewDeleted = belongsToPermanentDeleteDepartment(user?.departments);

      if (canViewDeleted) {
        const privilegedDepartments = await Department.find({
          $or: [
            { name: /^top management$/i },
            { _id: TECH_DEPARTMENT_ID },
          ],
        })
          .select("_id")
          .lean()
          .exec();

        privilegedUserIds = await User.find({
          departments: {
            $in: privilegedDepartments.map((department) => department._id),
          },
        }).distinct("_id");
      }
    }

    const { printouts, pagination } = await fetchPrintoutReportService({
      filters,
      page: req.query?.page,
      limit: req.query?.limit,
      search,
      searchContext,
      includeDeleted: canViewDeleted,
      excludedDeletedBy: privilegedUserIds,
      ...(dateFilter && { dateFilter }),
    });

    return res.status(200).json({
      message: "Printouts fetched successfully",
      printouts,
      ...(pagination && { pagination }),
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: error.message,
    });
  }
};

module.exports = {
  addPrintout,
  deletePrintout,
  editPrintout,
  getPrintouts,
  restorePrintout,
};
