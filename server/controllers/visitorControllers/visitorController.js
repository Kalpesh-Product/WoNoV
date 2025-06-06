const mongoose = require("mongoose");
const Visitor = require("../../models/visitor/Visitor");
const CustomError = require("../../utils/customErrorlogs");
const { createLog } = require("../../utils/moduleLogs");
const ExternalCompany = require("../../models/meetings/ExternalCompany");
const UserData = require("../../models/hr/UserData");
const CoworkingMember = require("../../models/sales/CoworkingMembers");

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
          {
            path: "clientCompany",
            select: "clientName email",
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
          {
            path: "clientCompany",
            select: "clientName email",
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
      address,
      phoneNumber,
      purposeOfVisit,
      idProof,
      // dateOfVisit,
      checkIn,
      checkOut,
      scheduledTime,
      toMeet,
      clientToMeet,
      clientCompany,
      department,
      visitorType,
      visitorCompany,
      visitorCompanyId,
    } = req.body;

    // Validate date format
    const visitDate = new Date();
    const clockIn = new Date(checkIn);
    const clockOut = checkOut ? new Date(checkOut) : null;

    // if (isNaN(visitDate.getTime()) || isNaN(clockIn.getTime())) {
    //   throw new CustomError(
    //     "Invalid date format",
    //     logPath,
    //     logAction,
    //     logSourceKey
    //   );
    // }

    if (
      visitorCompanyId &&
      !mongoose.Types.ObjectId.isValid(visitorCompanyId)
    ) {
      throw new CustomError(
        "Invalid visitor company Id provided",
        logPath,
        logAction,
        logSourceKey
      );
    }

    if (visitorType === "Scheduled") {
      const existingVisitor = await Visitor.findOne({
        toMeet,
        dateOfVisit,
        scheduledTime,
        visitorType: "Scheduled",
        company,
      });

      if (clientToMeet && !mongoose.Types.ObjectId.isValid(clientToMeet)) {
        throw new CustomError(
          "Invalid client member Id provided",
          logPath,
          logAction,
          logSourceKey
        );
      }

      if (existingVisitor) {
        throw new CustomError(
          "A scheduled visitor is already meeting this person at the same time.",
          logPath,
          logAction,
          logSourceKey
        );
      }
    }

    let foundClientMember = null;
    if (clientToMeet) {
      if (!mongoose.Types.ObjectId.isValid(clientToMeet)) {
        throw new CustomError(
          "Invalid client member Id provided",
          logPath,
          logAction,
          logSourceKey
        );
      }

      foundClientMember = await CoworkingMember.findById(clientToMeet);
      if (!foundClientMember) {
        throw new CustomError(
          "No client member found",
          logPath,
          logAction,
          logSourceKey
        );
      }
    }

    let externalCompany = null;

    // Save new external company if provided in request
    if (visitorCompany) {
      const newExternalCompany = new ExternalCompany({
        ...visitorCompany,
        company,
      });
      externalCompany = await newExternalCompany.save();
    }

    // Lookup existing external company if ID provided
    if (visitorCompanyId) {
      externalCompany = await ExternalCompany.findById({
        _id: visitorCompanyId,
      });
      if (!externalCompany) {
        throw new CustomError(
          "Visitor's Company not found",
          logPath,
          logAction,
          logSourceKey
        );
      }
    }

    // Handle empty department and clear toMeet if department is empty
    const isDepartmentEmpty =
      department === null ||
      department === undefined ||
      (typeof department === "string" && department.trim() === "");

    const newVisitor = new Visitor({
      firstName,
      middleName,
      lastName,
      email,
      gender,
      address,
      phoneNumber,
      purposeOfVisit,
      clientToMeet: clientToMeet ? clientToMeet : null,
      clientCompany: clientCompany ? clientCompany : null,
      idProof: {
        idType: idProof.idType,
        idNumber: idProof.idNumber,
      },
      dateOfVisit: visitDate,
      checkIn: clockIn,
      checkOut: clockOut,
      toMeet: isDepartmentEmpty ? null : toMeet,
      company,
      department: isDepartmentEmpty ? null : department,
      visitorType,
      company,
    });

    if (externalCompany) {
      newVisitor.visitorCompany = externalCompany._id;
    }

    const savedVisitor = await newVisitor.save();

    await createLog({
      path: logPath,
      action: logAction,
      remarks: "Visitor added successfully",
      status: "Success",
      user,
      ip,
      company,
      sourceKey: logSourceKey,
      sourceId: savedVisitor._id,
      changes: newVisitor,
    });

    return res.status(201).json({
      message: "Visitor added successfully",
      visitor: savedVisitor,
    });
  } catch (error) {
    next(
      error instanceof CustomError
        ? error
        : new CustomError(error.message, logPath, logAction, logSourceKey, 500)
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
        logSourceKey
      );
    }

    const updatedVisitor = await Visitor.findByIdAndUpdate(
      visitorId,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedVisitor) {
      throw new CustomError(
        "Visitor not found",
        logPath,
        logAction,
        logSourceKey
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
        new CustomError(error.message, logPath, logAction, logSourceKey, 500)
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

module.exports = {
  fetchVisitors,
  addVisitor,
  updateVisitor,
  fetchExternalCompanies,
  fetchTeamMembers,
};
