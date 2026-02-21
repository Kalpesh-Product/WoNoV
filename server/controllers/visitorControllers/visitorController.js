const mongoose = require("mongoose");
const { Readable } = require("stream");
const csvParser = require("csv-parser");
const Visitor = require("../../models/visitor/Visitor");
const CustomError = require("../../utils/customErrorlogs");
const { createLog } = require("../../utils/moduleLogs");
const ExternalCompany = require("../../models/meetings/ExternalCompany");
const UserData = require("../../models/hr/UserData");
const CoworkingMember = require("../../models/sales/CoworkingMembers");
const CoworkingClient = require("../../models/sales/CoworkingClient");
const Company = require("../../models/hr/Company");
const emitter = require("../../utils/eventEmitter");
const Department = require("../../models/Departments");
const { PDFDocument } = require("pdf-lib");
const { handleDocumentUpload } = require("../../config/cloudinaryConfig");
const Building = require("../../models/locations/Building");

const fetchVisitors = async (req, res, next) => {
  const { company } = req;
  const { query } = req.query;

  try {
    const companyId = new mongoose.Types.ObjectId(company);
    let visitors;

    switch (query) {
      case "department":
        visitors = await Visitor.aggregate([
          { $match: { company: companyId } },
          { $match: { department: { $ne: null } } },
          {
            $group: {
              _id: "$department",
              visitors: { $sum: 1 },
            },
          },
          {
            $lookup: {
              from: "departments",
              localField: "_id",
              foreignField: "_id",
              as: "department",
            },
          },
          { $unwind: "$department" },
          { $project: { department: "$department.name", visitors: 1 } },
        ]);
        break;

      case "today":
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        visitors = await Visitor.find({
          company: companyId,
          dateOfVisit: { $gte: startOfDay, $lte: endOfDay },
        }).populate([
          {
            path: "department",
            select: "name",
          },
          {
            path: "visitorCompany",
            select: "companyName",
          },
          {
            path: "toMeet",
            select: "firstName lastName email",
          },
          {
            path: "clientToMeet",
            select: "employeeName email",
          },
          // {
          //   path: "clientCompany",
          //   select: "clientName email",
          // },
          {
            path: "meeting",
          },
        ]);
        break;

      default:
        visitors = await Visitor.find({ company: companyId }).populate([
          {
            path: "department",
            select: "name",
          },
          {
            path: "toMeet",
            select: "firstName lastName email",
          },
          {
            path: "visitorCompany",
            select: "companyName pocName",
          },
          {
            path: "clientToMeet",
            select: "employeeName email",
          },
          // {
          //   path: "clientCompany",
          //   select: "clientName email",
          // },
          {
            path: "meeting",
          },
        ]);
    }

    return res.status(200).json(visitors);
  } catch (error) {
    next(error);
  }
};

const addVisitor = async (req, res, next) => {
  const logPath = "visitor/VisitorLog";
  const logAction = "Add Visitor";
  const logSourceKey = "visitor";
  const { user, ip, company } = req;

  try {
    const {
      firstName,
      middleName,
      lastName,
      email,
      gender,
      phoneNumber,
      purposeOfVisit,
      idProof,
      sector,
      city,
      state,
      checkIn = new Date(),
      checkOut,
      scheduledStartTime,
      scheduledEndTime,
      scheduledDate,
      toMeet,
      clientToMeet,
      toMeetCompany,
      department,
      visitorType,
      visitorCompany,
      visitorFlag,
      registeredClientCompany,
      brandName,
      gstNumber,
      panNumber,
    } = req.body;

    const gstFile = req.files?.gstFile?.[0];
    const panFile = req.files?.panFile?.[0];
    const otherFile = req.files?.otherFile?.[0];

    const allowedMimeTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    const visitDate = new Date();
    const clockIn = new Date(checkIn);
    const clockOut = checkOut ? new Date(checkOut) : null;
    const isScheduled = visitorType === "Scheduled";

    // === Validations ===

    if (isNaN(clockIn.getTime())) {
      return res.status(400).json({
        message: "Invalid Check-in time",
      });
    }

    if (clockOut && isNaN(clockOut.getTime())) {
      return res.status(400).json({
        message: "Invalid Check-out time",
      });
    }

    if (clockOut && clockIn.getDate() !== clockOut.getDate()) {
      return res.status(400).json({
        message: "Check-in and Check-out date should be the same",
      });
    }

    if (clockOut && clockOut.getTime() < clockIn.getTime()) {
      return res.status(400).json({
        message: "Check-out time shouldn't be before Check-in time",
      });
    }

    if (toMeetCompany && !mongoose.Types.ObjectId.isValid(toMeetCompany)) {
      throw new CustomError(
        "Invalid to meet company's ID provided",
        logPath,
        logAction,
        logSourceKey,
      );
    }
    if (toMeetCompany && !toMeet && !clientToMeet) {
      throw new CustomError(
        "Missing person to meet field",
        logPath,
        logAction,
        logSourceKey,
      );
    }
    if (toMeet && !mongoose.Types.ObjectId.isValid(toMeet)) {
      throw new CustomError(
        "Invalid to meet ID provided",
        logPath,
        logAction,
        logSourceKey,
      );
    }
    if (clientToMeet && !mongoose.Types.ObjectId.isValid(clientToMeet)) {
      throw new CustomError(
        "Invalid client to meet ID provided",
        logPath,
        logAction,
        logSourceKey,
      );
    }

    if (visitorFlag === "Client" && (!email || !gstNumber || !panNumber)) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (
      (visitorType === "Walk In" && !firstName) ||
      !lastName ||
      !phoneNumber ||
      !gender ||
      !purposeOfVisit
    ) {
      return res
        .status(400)
        .json({ message: "Missing required fields for walk-in visitor" });
    }

    if (isScheduled) {
      if (!scheduledDate) {
        throw new CustomError(
          "Missing scheduled date",
          logPath,
          logAction,
          logSourceKey,
        );
      }
      if (
        !firstName ||
        !lastName ||
        !phoneNumber ||
        !gender ||
        !purposeOfVisit ||
        !visitorCompany ||
        !toMeetCompany ||
        (!toMeet && !clientToMeet)
      ) {
        return res
          .status(400)
          .json({ message: "Missing required fields for scheduled visitor" });
      }

      let overlappingVisitor;
      if (visitorType === "Scheduled") {
        overlappingVisitor = await Visitor.findOne({
          $or: [{ toMeet }, { clientToMeet }],
          visitorType: "Scheduled",
          company,
          scheduledDate,
        });
      }

      if (overlappingVisitor) {
        throw new CustomError(
          "Another visitor is already scheduled to meet this person during that day.",
          logPath,
          logAction,
          logSourceKey,
        );
      }
    }

    // Client member validation
    let foundClientMember = null;
    if (clientToMeet) {
      foundClientMember = await CoworkingMember.findById(clientToMeet);
      if (!foundClientMember) {
        throw new CustomError(
          "No client member found",
          logPath,
          logAction,
          logSourceKey,
        );
      }
    }

    // Resolve visitor company

    let companyToMeet = null;
    const isClient = toMeetCompany && company !== toMeetCompany;

    console.log("isClient", isClient);
    console.log("company", company);
    console.log("toMeetCompany", toMeetCompany);

    if (visitorFlag === "Client" && !idProof) {
      return res.status(400).json({
        message: "ID proof is required for client visitors",
      });
    }

    if (toMeetCompany && isClient) {
      companyToMeet = await CoworkingClient.findById(toMeetCompany);
      if (!companyToMeet) {
        throw new CustomError(
          "Client company not found",
          logPath,
          logAction,
          logSourceKey,
        );
      }
    } else if (toMeetCompany) {
      companyToMeet = await Company.findById(toMeetCompany);
      if (!companyToMeet) {
        throw new CustomError(
          "Company not found",
          logPath,
          logAction,
          logSourceKey,
        );
      }
    }

    const isDepartmentEmpty =
      !department ||
      (typeof department === "string" && department.trim() === "");

    const visitorData = new Visitor({
      firstName,
      middleName,
      lastName,
      email,
      gender,
      phoneNumber,
      purposeOfVisit,
      dateOfVisit: visitDate,
      checkIn: clockIn,
      checkOut: clockOut,
      scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
      toMeet: isDepartmentEmpty ? null : toMeet,
      toMeetCompany: companyToMeet || null,
      clientToMeet: clientToMeet || null,
      sector,
      city,
      state,
      department: isDepartmentEmpty ? null : department,
      visitorType,
      visitorCompany,
      company,
      visitorFlag,
      registeredClientCompany,
      brandName,
      gstNumber,
      panNumber,
    });

    if (visitorFlag === "Client") {
      visitorData.idProof = {
        idType: idProof.idType,
        idNumber: idProof.idNumber,
      };
    } else if (visitorFlag === "Visitor") {
      visitorData.idProof = {
        idType: idProof?.idType ?? null,
        idNumber: idProof?.idNumber ?? null,
      };
    }

    const visitor = new Visitor(visitorData);

    const companyData = await Company.findById(company).lean();

    // Upload and attach files
    const fileFields = [
      { file: gstFile, field: "gstFile" },
      { file: panFile, field: "panFile" },
      { file: otherFile, field: "otherFile" },
    ];

    for (const { file, field } of fileFields) {
      if (file) {
        if (!allowedMimeTypes.includes(file.mimetype)) {
          throw new CustomError(
            `Invalid ${field} file type`,
            logPath,
            logAction,
            logSourceKey,
          );
        }

        let processedBuffer = file.buffer;
        const originalFilename = file.originalname;

        if (file.mimetype === "application/pdf") {
          const pdfDoc = await PDFDocument.load(file.buffer);
          pdfDoc.setTitle(originalFilename.split(".")[0] || "Untitled");
          processedBuffer = await pdfDoc.save();
        }

        const uploadRes = await handleDocumentUpload(
          processedBuffer,
          `${companyData.companyName}/visitors/clients/${field}`,
          originalFilename,
        );

        if (!uploadRes.public_id) {
          throw new CustomError(
            `Failed to upload ${field}`,
            logPath,
            logAction,
            logSourceKey,
          );
        }

        visitor[field] = {
          link: uploadRes.secure_url,
          id: uploadRes.public_id,
        };
      }
    }

    const savedVisitor = await visitor.save();

    if (!isDepartmentEmpty) {
      const foundDepartment =
        await Department.findById(department).select("name");
      const userDetails = await UserData.findById({ _id: toMeet });
      const deptEmployees = await UserData.find({
        departments: { $in: department },
      });

      emitter.emit("notification", {
        initiatorData: user,
        users: deptEmployees.map((emp) => ({
          userActions: {
            whichUser: emp._id || null,
            hasRead: false,
          },
        })),
        type: "add visitor",
        module: "Visitors",
        message: `Visitor ${firstName} ${lastName} has been registered to meet ${userDetails.firstName} ${userDetails.lastName} from ${foundDepartment.name} department.`,
      });
    }

    return res.status(201).json({
      message: "Visitor added successfully",
      visitor: savedVisitor,
    });
  } catch (error) {
    next(
      error instanceof CustomError
        ? error
        : new CustomError(error.message, logPath, logAction, logSourceKey, 500),
    );
  }
};

const updateVisitor = async (req, res, next) => {
  const logPath = "visitor/VisitorLog";
  const logAction = "Update Visitor";
  const logSourceKey = "visitor";
  const { user, ip, company } = req;

  try {
    const { visitorId } = req.params;
    const updateData = req.body;

    if (!mongoose.Types.ObjectId.isValid(visitorId)) {
      throw new CustomError(
        "Invalid visitor ID provided",
        logPath,
        logAction,
        logSourceKey,
      );
    }

    const visitor = await Visitor.findOne({ _id: visitorId }).lean();

    if (!visitor) {
      return res.status(400).json({
        message: "Visitor not found",
      });
    }
    const parsedCheckout = new Date(updateData.checkOut);
    const parsedCheckin = new Date(visitor.checkIn);

    if (isNaN(parsedCheckout.getTime())) {
      return res.status(400).json({
        message: "Invalid checkout time",
      });
    }

    if (parsedCheckout.getDate() !== parsedCheckin.getDate()) {
      return res.status(400).json({
        message: "Check-in and Check-out date should be the same",
      });
    }

    if (parsedCheckout.getTime() < parsedCheckin.getTime()) {
      return res.status(400).json({
        message: "Check-out time should be after Check-in time",
      });
    }

    const updatedVisitor = await Visitor.findByIdAndUpdate(
      visitorId,
      updateData,
      {
        new: true,
        runValidators: true,
      },
    );

    if (!updatedVisitor) {
      throw new CustomError(
        "Visitor not found",
        logPath,
        logAction,
        logSourceKey,
      );
    }

    await createLog({
      path: logPath,
      action: logAction,
      remarks: "Visitor updated successfully",
      status: "Success",
      user: user,
      ip: ip,
      company: company,
      sourceKey: logSourceKey,
      sourceId: updatedVisitor._id,
      changes: updateData,
    });

    return res.status(200).json({
      message: "Visitor updated successfully",
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

const fetchExternalCompanies = async (req, res, next) => {
  const { company } = req;
  const { externalCompanyId } = req.query;

  try {
    if (!mongoose.Types.ObjectId.isValid(company)) {
      return res.status(400).json({ message: "Company not found" });
    }

    let externalCompanies = [];
    if (externalCompanyId) {
      externalCompanies = await ExternalCompany.find({
        _id: externalCompanyId,
      }).sort({
        createdAt: -1,
      });
    } else {
      externalCompanies = await ExternalCompany.find();
    }

    if (!externalCompanies) {
      return res
        .status(400)
        .json({ message: "Failed to load external companies" });
    }

    return res.status(200).json(externalCompanies);
  } catch (error) {
    next(error);
  }
};

const fetchTeamMembers = async (req, res, next) => {
  try {
    const { company } = req;

    const { dept } = req.query;
    // Find team members
    const teamMembers = await UserData.find({
      departments: { $in: [dept] },
      isActive: true,
    })
      .populate([
        { path: "role", select: "roleTitle" },
        { path: "departments", select: "name" },
      ])
      .select("firstName middleName lastName email");

    const transformedVisitors = teamMembers.map((member) => {
      return {
        name: `${member.firstName} ${member.middleName || ""} ${
          member.lastName
        }`.trim(),
        email: member.email,
        department: member.departments.map((dept) => dept.name),
        role: member.role.map((r) => r.roleTitle),
      };
    });

    return res.status(200).json(transformedVisitors);
  } catch (error) {
    next(error);
  }
};

const bulkInsertExternalClients = async (req, res, next) => {
  try {
    const file = req.file;
    const company = req.company;

    if (!file) {
      return res.status(400).json({ message: "Please provide a CSV file" });
    }

    // 🔹 Fetch Buildings (Only 2 valid ones)
    const buildings = await Building.find({
      company,
      buildingName: { $in: ["Sunteck Kanaka", "Dempo Trade Centre"] },
    }).lean();

    if (!buildings.length) {
      return res.status(400).json({ message: "Buildings not found" });
    }

    const buildingMap = new Map(buildings.map((b) => [b.buildingName, b._id]));

    const stream = Readable.from(file.buffer.toString("utf-8").trim());

    let visitors = [];
    let skipped = [];

    stream
      .pipe(csvParser())
      .on("data", (row) => {
        const {
          firstName,
          lastName,
          email,
          gender,
          phoneNumber,
          panNumber,
          gstNumber,
          dateOfVisit,
          registeredClientCompany,
          brandName,
          buildingName, // if you later add column
        } = row;

        if (!firstName) {
          skipped.push({
            firstName,
            lastName,
            reason: "Missing required fields",
          });
          return;
        }

        // 🔹 Default building logic (since CSV doesn't have building column)
        // You can customize this logic however you want
        const resolvedBuildingName =
          buildingName && buildingMap.has(buildingName)
            ? buildingName
            : "Sunteck Kanaka"; // fallback

        const buildingId = buildingMap.get(resolvedBuildingName);

        if (!buildingId) {
          skipped.push({
            firstName,
            lastName,
            reason: "Invalid building",
          });
          return;
        }

        const parsedDate = new Date(dateOfVisit);

        if (isNaN(parsedDate)) {
          skipped.push({
            firstName,
            lastName,
            reason: "Invalid dateOfVisit format",
          });
          return;
        }

        visitors.push({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email?.trim(),
          gender,
          phoneNumber: phoneNumber.toString(),
          panNumber,
          gstNumber,
          dateOfVisit: parsedDate,
          registeredClientCompany,
          brandName,
          visitorFlag: "Client",
          visitorType: "Meeting",
          building: buildingId,
          company,
        });
      })

      .on("end", async () => {
        try {
          if (!visitors.length) {
            return res.status(400).json({
              message: "No valid visitors found",
              skipped,
            });
          }

          // 1️⃣ Remove CSV duplicates
          const uniqueMap = new Map();
          const csvDuplicates = [];

          visitors.forEach((visitor) => {
            const key = `${visitor.phoneNumber}_${visitor.dateOfVisit.toISOString()}`;

            if (!uniqueMap.has(key)) {
              uniqueMap.set(key, visitor);
            } else {
              csvDuplicates.push({
                phoneNumber: visitor.phoneNumber,
                dateOfVisit: visitor.dateOfVisit,
                reason: "Duplicate in CSV",
              });
            }
          });

          const uniqueVisitors = Array.from(uniqueMap.values());

          // 2️⃣ Check existing DB duplicates
          const existingVisitors = await Visitor.find({
            company,
            phoneNumber: { $in: uniqueVisitors.map((v) => v.phoneNumber) },
            visitorFlag: "Client",
            visitorType: "Meeting",
          })
            .select("phoneNumber dateOfVisit")
            .lean();

          const existingSet = new Set(
            existingVisitors.map(
              (v) =>
                `${v.phoneNumber}_${new Date(v.dateOfVisit).toISOString()}`,
            ),
          );

          const dbDuplicates = [];

          const finalVisitors = uniqueVisitors.filter((visitor) => {
            const key = `${visitor.phoneNumber}_${visitor.dateOfVisit.toISOString()}`;

            if (existingSet.has(key)) {
              dbDuplicates.push({
                phoneNumber: visitor.phoneNumber,
                dateOfVisit: visitor.dateOfVisit,
                reason: "Already exists in database",
              });
              return false;
            }

            return true;
          });

          if (finalVisitors.length > 0) {
            await Visitor.insertMany(finalVisitors);
          }

          return res.status(201).json({
            message: `${finalVisitors.length} external clients inserted successfully`,
            insertedCount: finalVisitors.length,
            skippedCount:
              skipped.length + csvDuplicates.length + dbDuplicates.length,
            missingFieldSkipped: skipped,
            csvDuplicates,
            dbDuplicates,
          });
        } catch (err) {
          next(err);
        }
      })

      .on("error", (err) => {
        next(err);
      });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  fetchVisitors,
  addVisitor,
  updateVisitor,
  fetchExternalCompanies,
  fetchTeamMembers,
  bulkInsertExternalClients,
};
