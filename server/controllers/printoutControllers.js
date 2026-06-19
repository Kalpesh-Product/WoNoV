const mongoose = require("mongoose");
const Printout = require("./../models/Printout");
const Company = require("../models/hr/Company");

const clientModels = ["CoworkingClient", "Company"];
const requestedByModels = ["CoworkingMember", "UserData"];
const populatePrintout = [
  { path: "takenBy", select: "firstName lastName" },
  {
    path: "unit",
    select: "unitName unitNo",
  },
  { path: "client", select: "clientName" },
  { path: "requestedBy", select: "employeeName" },
  { path: "department", select: "departmentId name" },
];

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const validatePrintoutPayload = (payload, { isUpdate = false } = {}) => {
  const errors = [];
  const requiredFields = [
    "timeTakenAt",
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

  ["takenBy", "unit", "client", "requestedBy", "department"].forEach(
    (field) => {
      if (
        payload[field] !== undefined &&
        payload[field] !== null &&
        payload[field] !== "" &&
        !isValidObjectId(payload[field])
      ) {
        errors.push(`Invalid ${field} ID provided`);
      }
    },
  );

  if (
    payload.timeTakenAt !== undefined &&
    isNaN(new Date(payload.timeTakenAt).getTime())
  ) {
    errors.push("Invalid timeTakenAt provided");
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
    "timeTakenAt",
    "unit",
    "client",
    "clientModel",
    "requestedByModel",
    "requestedBy",
    "department",
    "printoutCount",
  ];

  const isClient = company.toString() !== body.client.toString();

  const clientModel = isClient ? "CoworkingClient" : "Company";
  const requestedByModel = isClient ? "CoworkingMember" : "UserData";

  const payload = { clientModel, requestedByModel };

  allowedFields.forEach((field) => {
    if (body[field] !== undefined) {
      payload[field] = body[field];
    }
  });

  if (payload.timeTakenAt !== undefined) {
    payload.timeTakenAt = new Date(payload.timeTakenAt);
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
      printout: populatedPrintout,
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

    const printout = await Printout.findByIdAndUpdate(id, printoutPayload, {
      new: true,
      runValidators: true,
    })
      .populate(populatePrintout)
      .lean()
      .exec();

    if (!printout) {
      return res.status(404).json({ message: "Printout not found" });
    }

    return res.status(200).json({
      message: "Printout updated successfully",
      printout,
    });
  } catch (error) {
    return res.status(500).json({
      message: "An error occurred while updating the printout",
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
        printout,
      });
    }

    const { unit, client, requestedBy, department, fromDate, toDate } =
      req.query;
    const filters = {};

    const filterErrors = [];
    [
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

    if (fromDate || toDate) {
      filters.timeTakenAt = {};
      if (fromDate) {
        const parsedFromDate = new Date(fromDate);
        if (isNaN(parsedFromDate.getTime())) {
          filterErrors.push("Invalid fromDate provided");
        } else {
          filters.timeTakenAt.$gte = parsedFromDate;
        }
      }
      if (toDate) {
        const parsedToDate = new Date(toDate);
        if (isNaN(parsedToDate.getTime())) {
          filterErrors.push("Invalid toDate provided");
        } else {
          filters.timeTakenAt.$lte = parsedToDate;
        }
      }
      if (!Object.keys(filters.timeTakenAt).length) {
        delete filters.timeTakenAt;
      }
    }

    if (filterErrors.length) {
      return res.status(400).json({
        message: "Invalid printout filters provided",
        errors: filterErrors,
      });
    }

    const printouts = await Printout.find(filters)
      .populate(populatePrintout)
      .sort({ timeTakenAt: -1 })
      .lean()
      .exec();

    return res.status(200).json({
      message: "Printouts fetched successfully",
      printouts,
    });
  } catch (error) {
    return res.status(500).json({
      message: "An error occurred while fetching printouts",
      error: error.message,
    });
  }
};

module.exports = {
  addPrintout,
  editPrintout,
  getPrintouts,
};
