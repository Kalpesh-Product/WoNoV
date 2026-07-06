const mongoose = require("mongoose");
const Lead = require("../../models/sales/Lead");
const Unit = require("../../models/locations/Unit");
const CustomError = require("../../utils/customErrorlogs");
const { createLog } = require("../../utils/moduleLogs");
const { Readable } = require("stream");
const csvParser = require("csv-parser");
const fs = require("fs");
const path = require("path");
const ClientService = require("../../models/sales/ClientService");
const { fetchLeadReportService } = require("../../services/reports/lead");

// const hasValue = (value) => {
//   if (Array.isArray(value)) {
//     return value.length > 0;
//   }

//   return value !== undefined && value !== null && value !== "";
// };

// const getDuplicateEmailQuery = (emailAddress, leadId) => {
//   const query = {
//     ...(leadId ? { _id: { $ne: leadId } } : {}),
//   };

//   if (hasValue(emailAddress)) {
//     query.emailAddress = emailAddress.trim();
//     return query;
//   }

//   query.$or = [
//     { emailAddress: "" },
//     { emailAddress: null },
//     { emailAddress: { $exists: false } },
//   ];

//   return query;
// };

// const createLead = async (req, res, next) => {
//   const logPath = "sales/SalesLog";
//   const logAction = "Create Lead";
//   const logSourceKey = "lead";

//   const { user, ip, company } = req;

//   try {
//     const {
//       dateOfContact,
//       companyName,
//       serviceCategory,
//       leadStatus,
//       proposedLocations,
//       sector,
//       headOfficeLocation,
//       officeInGoa,
//       pocName,
//       designation,
//       contactNumber,
//       emailAddress,
//       leadSource,
//       period,
//       openDesks,
//       cabinDesks,
//       totalDesks,
//       clientBudget,
//       startDate,
//       remarksComments,
//       lastFollowUpDate,
//     } = req.body;
//     const { company } = req;

//     if (!companyName) {
//       throw new CustomError(
//         "Company name is required",
//         logPath,
//         logAction,
//         logSourceKey,
//       );
//     }

//     const currDate = new Date();
//     if (
//       hasValue(startDate) &&
//       new Date(startDate).getDate() < currDate.getDate()
//     ) {
//       throw new CustomError(
//         "Start date must be a future date",
//         logPath,
//         logAction,
//         logSourceKey,
//       );
//     }

//     if (emailAddress) {
//       const leadExists = await Lead.findOne({
//         emailAddress,
//       });

//       if (leadExists) {
//         throw new CustomError(
//           "Lead already exists",
//           logPath,
//           logAction,
//           logSourceKey,
//         );
//       }
//     }

//     if (
//       hasValue(proposedLocations) &&
//       !mongoose.Types.ObjectId.isValid(proposedLocations)
//     ) {
//       throw new CustomError(
//         "Invalid proposed location ID",
//         logPath,
//         logAction,
//         logSourceKey,
//       );
//     }

//     if (hasValue(proposedLocations)) {
//       const unitExists = await Unit.findOne({ _id: proposedLocations });
//       if (!unitExists) {
//         throw new CustomError(
//           "Proposed location doesn't exist",
//           logPath,
//           logAction,
//           logSourceKey,
//         );
//       }
//     }

//     // if (
//     //   (hasValue(totalDesks) && totalDesks < 1) ||
//     //   (hasValue(clientBudget) && clientBudget <= 0)
//     // ) {
//     //   throw new CustomError(
//     //     "Invalid numerical values",
//     //     logPath,
//     //     logAction,
//     //     logSourceKey,
//     //   );
//     // }

//     const lead = new Lead({
//       dateOfContact,
//       companyName,
//       serviceCategory,
//       leadStatus,
//       proposedLocations,
//       sector,
//       headOfficeLocation,
//       officeInGoa,
//       pocName,
//       designation,
//       contactNumber,
//       emailAddress,
//       leadSource,
//       period,
//       openDesks,
//       cabinDesks,
//       totalDesks,
//       clientBudget,
//       startDate,
//       company,
//       remarksComments,
//       lastFollowUpDate,
//     });

//     await lead.save();

//     await createLog({
//       path: logPath,
//       action: logAction,
//       remarks: "Lead created successfully",
//       status: "Success",
//       user: user,
//       ip: ip,
//       company: company,
//       sourceKey: logSourceKey,
//       sourceId: lead._id,
//       changes: lead,
//     });

//     return res.status(201).json({ message: "Lead created successfully" });
//   } catch (error) {
//     if (error instanceof CustomError) {
//       next(error);
//     } else {
//       next(
//         new CustomError(error.message, logPath, logAction, logSourceKey, 500),
//       );
//     }
//   }
// };

const createLead = async (req, res, next) => {
  const { company } = req;

  try {
    let {
      dateOfContact,
      companyName,
      serviceCategory,
      leadStatus,
      proposedLocations,
      sector,
      headOfficeLocation,
      officeInGoa,
      pocName,
      designation,
      contactNumber,
      emailAddress,
      source,
      leadSource,
      period,
      openDesks,
      cabinDesks,
      totalDesks,
      clientBudget,
      startDate,
      remarksComments,
      lastFollowUpDate,
    } = req.body;

    // Required fields
    const requiredFields = {
      dateOfContact,
      companyName,
      serviceCategory,
      leadStatus,
      proposedLocations,
      officeInGoa,
      pocName,
      contactNumber,
      leadSource,
      openDesks,
      cabinDesks,
      totalDesks,
      clientBudget,
      startDate,
    };

    for (const [key, value] of Object.entries(requiredFields)) {
      if (
        value === undefined ||
        value === null ||
        value === "" ||
        (Array.isArray(value) && value.length === 0)
      ) {
        throw new CustomError(`${key} is required`);
      }
    }

    // Duplicate company name
    const companyExists = await Lead.findOne({
      company,
      companyName: {
        $regex: new RegExp(`^${companyName.trim()}$`, "i"),
      },
    });

    if (companyExists) {
      throw new CustomError("Lead already exists");
    }

    const leadData = {
      company,
      dateOfContact,
      companyName: companyName.trim(),
      serviceCategory,
      leadStatus,
      proposedLocations,
      sector,
      headOfficeLocation,
      officeInGoa,
      pocName,
      designation,
      contactNumber,
      emailAddress,
      source,
      leadSource,
      period,
      openDesks,
      cabinDesks,
      totalDesks,
      clientBudget,
      startDate,
      remarksComments,
      lastFollowUpDate,
    };

    // Remove optional empty ObjectId fields
    if (!leadData.serviceCategory) delete leadData.serviceCategory;

    if (
      !leadData.proposedLocations ||
      leadData.proposedLocations.length === 0
    ) {
      delete leadData.proposedLocations;
    }

    // Remove optional empty string fields
    [
      "sector",
      "headOfficeLocation",
      "designation",
      "emailAddress",
      "source",
      "period",
      "remarksComments",
      "lastFollowUpDate",
    ].forEach((field) => {
      if (
        leadData[field] === "" ||
        leadData[field] === undefined ||
        leadData[field] === null
      ) {
        delete leadData[field];
      }
    });

    const lead = await Lead.create(leadData);

    return res.status(201).json({
      success: true,
      message: "Lead created successfully.",
      lead,
    });
  } catch (error) {
    next(error);
  }
};

const editLead = async (req, res, next) => {
  const logPath = "sales/SalesLog";
  const logAction = "Edit Lead";
  const logSourceKey = "lead";

  const { user, ip, company } = req;

  try {
    // const { leadId } = req.params;
    const leadId = req.params.leadId || req.body.leadId;

    if (!mongoose.Types.ObjectId.isValid(leadId)) {
      throw new CustomError(
        "Invalid Lead ID",
        logPath,
        logAction,
        logSourceKey,
      );
    }

    const existingLead = await Lead.findOne({ _id: leadId, company });

    if (!existingLead) {
      throw new CustomError("Lead not found", logPath, logAction, logSourceKey);
    }

    const {
      proposedLocations,
      emailAddress,
      totalDesks,
      clientBudget,
      startDate,
    } = req.body;

    // ✅ Future date validation
    const currDate = new Date();
    // if (hasValue(startDate) && new Date(startDate) < currDate) {
    //   throw new CustomError(
    //     "Start date must be a future date",
    //     logPath,
    //     logAction,
    //     logSourceKey,
    //   );
    // }

    // ✅ Duplicate email check (excluding self)
    if (hasValue(emailAddress)) {
      const emailExists = await Lead.findOne({
        emailAddress,
        _id: { $ne: leadId },
      });

      if (emailExists) {
        throw new CustomError(
          "Another lead with this email already exists",
          logPath,
          logAction,
          logSourceKey,
        );
      }
    }

    // ✅ Proposed location validation
    if (
      hasValue(proposedLocations) &&
      !mongoose.Types.ObjectId.isValid(proposedLocations)
    ) {
      throw new CustomError(
        "Invalid proposed location ID",
        logPath,
        logAction,
        logSourceKey,
      );
    }

    if (hasValue(proposedLocations)) {
      const unitExists = await Unit.findById(proposedLocations);
      if (!unitExists) {
        throw new CustomError(
          "Proposed location doesn't exist",
          logPath,
          logAction,
          logSourceKey,
        );
      }
    }

    // ✅ Numeric validation
    // if (
    //   (hasValue(totalDesks) && totalDesks < 0) ||
    //   (hasValue(clientBudget) && clientBudget <= 0)
    // ) {
    //   throw new CustomError(
    //     "Invalid numerical values",
    //     logPath,
    //     logAction,
    //     logSourceKey,
    //   );
    // }

    // ✅ Whitelist fields for update
    const allowedFields = [
      "dateOfContact",
      "companyName",
      "serviceCategory",
      "leadStatus",
      "proposedLocations",
      "sector",
      "headOfficeLocation",
      "officeInGoa",
      "pocName",
      "designation",
      "contactNumber",
      "emailAddress",
      "leadSource",
      "period",
      "openDesks",
      "cabinDesks",
      "totalDesks",
      "clientBudget",
      "startDate",
      "remarksComments",
      "lastFollowUpDate",
    ];

    const updateData = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    // Save old state for logging
    const oldLead = existingLead.toObject();

    // ✅ Apply update safely
    existingLead.set(updateData);

    await existingLead.save();

    await createLog({
      path: logPath,
      action: logAction,
      remarks: "Lead updated successfully",
      status: "Success",
      user,
      ip,
      company,
      sourceKey: logSourceKey,
      sourceId: existingLead._id,
      changes: {
        before: oldLead,
        after: existingLead,
      },
    });

    return res.status(200).json({
      message: "Lead updated successfully",
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

const updateCoworkingClientStatus = async (req, res, next) => {
  const logPath = "sales/SalesLog";
  const logAction = "Update CoworkingClient Status";
  const logSourceKey = "client";

  const { user, ip, company } = req;

  try {
    const { clientId } = req.params;
    const { isActive } = req.body;

    // ✅ Validate ID
    if (!mongoose.Types.ObjectId.isValid(clientId)) {
      throw new CustomError(
        "Invalid client ID",
        logPath,
        logAction,
        logSourceKey,
      );
    }

    // ✅ Validate boolean strictly
    if (typeof isActive !== "boolean") {
      throw new CustomError(
        "isActive must be true or false",
        logPath,
        logAction,
        logSourceKey,
      );
    }

    const existingClient = await CoworkingClient.findOne({
      _id: clientId,
      company,
    });

    if (!existingClient) {
      throw new CustomError(
        "Client not found",
        logPath,
        logAction,
        logSourceKey,
      );
    }

    const oldStatus = existingClient.isActive;

    // No-op protection
    if (oldStatus === isActive) {
      return res.status(200).json({
        message: `Client is already ${isActive ? "active" : "inactive"}`,
      });
    }

    existingClient.isActive = isActive;
    await existingClient.save();

    await createLog({
      path: logPath,
      action: logAction,
      remarks: `Client marked as ${isActive ? "Active" : "Inactive"}`,
      status: "Success",
      user,
      ip,
      company,
      sourceKey: logSourceKey,
      sourceId: existingClient._id,
      changes: {
        isActive: {
          before: oldStatus,
          after: isActive,
        },
      },
    });

    return res.status(200).json({
      message: `Client ${isActive ? "activated" : "deactivated"} successfully`,
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

// const getLeads = async (req, res, next) => {
//   try {
//     const { company } = req;
//     const leads = await Lead.find({ company }).populate([
//       {
//         path: "serviceCategory",
//         select: "serviceName",
//       },
//       {
//         path: "proposedLocations",
//         select: "unitNo unitName building",
//         model: "Unit",
//         populate: {
//           path: "building",
//           select: "buildingName",
//           model: "Building",
//         },
//       },
//     ]);

//     if (!leads.length) {
//       return res.status(404).json({ message: "No leads found" });
//     }
//     res.status(200).json(leads);
//   } catch (error) {
//     next(error);
//   }
// };

const getLeads = async (req, res, next) => {
  try {
    const leads = await fetchLeadReportService({
      company: req.company,
      query: { ...req.query },
    });

    if (!leads.length) {
      return res.status(404).json({ message: "No leads found" });
    }

    return res.status(200).json(leads);
  } catch (error) {
    next(error);
  }
};

const bulkInsertLeads = async (req, res, next) => {
  try {
    const file = req.file;
    const { company } = req;

    if (!file) {
      return res.status(400).json({ message: "Please provide a CSV sheet" });
    }

    const units = await Unit.find().lean();
    const unitsMap = new Map(units.map((u) => [u.unitNo, u._id]));

    const services = await ClientService.find().lean();

    const servicesMap = new Map(
      services.map((s) => [s.serviceName.toLowerCase(), s._id]),
    );

    const newLeads = [];
    const stream = Readable.from(file.buffer.toString("utf-8").trim());
    let rowCount = 0;
    stream
      .pipe(csvParser())
      .on("data", async (row) => {
        try {
          rowCount++;
          const proposedLocationsRaw = row["Proposed Location"] || "";
          const proposedLocations = proposedLocationsRaw
            .split(/[,/]/)
            .map((id) => id.trim())
            .filter((id) => id && id !== "-")
            .map((unitNo) => unitsMap.get(unitNo))
            .filter(Boolean);

          const rawService = row["Sales Category"]?.trim().toLowerCase();
          const serviceCategoryId = rawService && servicesMap.get(rawService);
          const rawBudget = row["Client Budget"]?.trim();

          let clientBudget = 0;

          if (rawBudget && rawBudget !== "-") {
            const parsed = parseFloat(rawBudget);
            clientBudget = isNaN(parsed) ? 0 : parsed;
          }

          const lead = {
            company,
            dateOfContact: row["Date of Contact"]
              ? new Date(row["Date of Contact"])
              : null,
            companyName: row["Company Name"]?.trim() || "",
            serviceCategory: serviceCategoryId || null,
            leadStatus: row["Lead Status"] || "",
            proposedLocations: proposedLocations.length
              ? proposedLocations
              : null,
            sector: row["Sector"] || "",
            headOfficeLocation: row["HO Location"]?.trim() || "",
            officeInGoa: row["Office in Goa"]?.toLowerCase().trim() === "yes",
            pocName: row["POC Name"] || "",
            designation: row["Designation"] || "",
            contactNumber: row["Contact Number"] || "",
            emailAddress: row["Email Address"] || "",
            leadSource: row["Lead Source"] || row["Source"] || "",
            period: row["Period"] || "",
            openDesks: row["Open Desks"]?.trim()
              ? parseInt(row["Open Desks"], 10)
              : null,
            cabinDesks: row["Cabin Desks"]?.trim()
              ? parseInt(row["Cabin Desks"], 10)
              : null,
            totalDesks: row["Total Desks"]?.trim()
              ? parseInt(row["Total Desks"], 10)
              : null,
            clientBudget: clientBudget,
            remarksComments: row["Remarks/Comments"] || "",
            startDate:
              row["Start Date"]?.trim() &&
              row["Start Date"] !== "-" &&
              row["Start Date"] !== "TBD"
                ? new Date(row["Start Date"])
                : null,
            lastFollowUpDate:
              row["Last Follow-up Date"]?.trim() &&
              row["Last Follow-up Date"] !== "-"
                ? new Date(row["Last Follow-up Date"])
                : null,
          };

          newLeads.push(lead);
        } catch (err) {
          console.error("Row Count 1st", rowCount);
          console.error("Error processing row:", err);
          return res
            .status(400)
            .json({ message: "Invalid data format in row" });
        }
      })
      .on("end", async () => {
        try {
          await Lead.insertMany(newLeads);
          res.status(201).json({
            message: "Leads inserted successfully",
            count: newLeads.length,
          });
        } catch (error) {
          console.error("Row Count 2nd", rowCount);
          console.error("Insert error:", error);
          res.status(500).json({ message: "Error inserting leads" });
        }
      });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createLead,
  editLead,
  updateCoworkingClientStatus,
  getLeads,
  bulkInsertLeads,
};
