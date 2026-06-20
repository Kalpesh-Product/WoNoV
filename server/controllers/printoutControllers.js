const mongoose = require("mongoose");
const Printout = require("./../models/Printout");
const Company = require("../models/hr/Company");

const clientModels = ["CoworkingClient", "Company"];
const requestedByModels = ["CoworkingMember", "UserData"];
const populatePrintout = [
  { path: "takenBy", select: "firstName lastName" },
  { path: "location", select: "buildingName fullAddress" },
  {
    path: "unit",
    select: "unitName unitNo",
  },
  { path: "client", select: "clientName companyName name" },
  { path: "requestedBy", select: "employeeName firstName lastName name email" },
  { path: "department", select: "departmentId name" },
];

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

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
  ];

  //   const isClient = company.toString() !== body.client.toString();

  //   const clientModel = isClient ? "CoworkingClient" : "Company";
  //   const requestedByModel = isClient ? "CoworkingMember" : "UserData";

  //   const payload = { clientModel, requestedByModel };

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

    const {
      location,
      unit,
      client,
      requestedBy,
      department,
      fromDate,
      toDate,
    } = req.query;
    const filters = {};

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

    if (fromDate || toDate) {
      filters.takenAt = {};
      if (fromDate) {
        const parsedFromDate = new Date(fromDate);
        if (isNaN(parsedFromDate.getTime())) {
          filterErrors.push("Invalid fromDate provided");
        } else {
          filters.takenAt.$gte = parsedFromDate;
        }
      }
      if (toDate) {
        const parsedToDate = new Date(toDate);
        if (isNaN(parsedToDate.getTime())) {
          filterErrors.push("Invalid toDate provided");
        } else {
          filters.takenAt.$lte = parsedToDate;
        }
      }
      if (!Object.keys(filters.takenAt).length) {
        delete filters.takenAt;
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
      .sort({ takenAt: -1 })
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
