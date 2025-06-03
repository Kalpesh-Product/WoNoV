const mongoose = require("mongoose");
const Visitor = require("../../models/visitor/Visitor");
const CustomError = require("../../utils/customErrorlogs");
const { createLog } = require("../../utils/moduleLogs");
const ExternalCompany = require("../../models/meetings/ExternalCompany");
const UserData = require("../../models/hr/UserData");

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
        ]);
    }

    return res.status(200).json(visitors);
  } catch (error) {
    next(error);
  }
};

// Check for existing visitor with the same ID proof number
const existingIdProof = await Visitor.findOne({
  "idProof.idNumber": idProof.idNumber,
  company, // optional: only if idProof is company-specific
});

if (existingIdProof) {
  throw new CustomError(
    "A visitor with this ID proof number already exists.",
    logPath,
    logAction,
    logSourceKey
  );
}

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
      visitor: updatedVisitor,
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
