const mongoose = require("mongoose");
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
          {
            path: "clientCompany",
            select: "clientName email",
          },
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
      checkIn,
      checkOut,
      scheduledStartTime,
      scheduledEndTime,
      scheduledDate,
      toMeet,
      clientToMeet,
      toMeetCompany,
      clientCompany,
      department,
      visitorType,
      visitorCompany,
      visitorFlag,
    } = req.body;

    const visitDate = new Date();
    const clockIn = new Date(checkIn);
    const clockOut = checkOut ? new Date(checkOut) : null;
    const isScheduled = visitorType === "Scheduled";

    // Validate IDs
    if (toMeetCompany && !mongoose.Types.ObjectId.isValid(toMeetCompany)) {
      throw new CustomError(
        "Invalid to meet company's ID provided",
        logPath,
        logAction,
        logSourceKey
      );
    }

    if (toMeetCompany && !toMeet) {
      throw new CustomError(
        "Missing person to meet field",
        logPath,
        logAction,
        logSourceKey
      );
    }

    if (toMeet && !mongoose.Types.ObjectId.isValid(toMeet)) {
      throw new CustomError(
        "Invalid to meet ID provided",
        logPath,
        logAction,
        logSourceKey
      );
    }

    if (visitorFlag === "Client" && !email) {
      return res.status(400).json({ message: "Email is required" });
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

    // Scheduled-specific checks
    if (isScheduled) {
      if (!scheduledDate) {
        throw new CustomError(
          "Missing scheduled date for scheduled visitor",
          logPath,
          logAction,
          logSourceKey
        );
      }

      if (
        !firstName ||
        !lastName ||
        !phoneNumber ||
        !gender ||
        !purposeOfVisit ||
        !visitorCompany ||
        !clientToMeet ||
        !toMeetCompany ||
        !toMeet
      ) {
        return res
          .status(400)
          .json({ message: "Missing required fields for scheduled visitor" });
      }
      // if (!scheduledStartTime || !scheduledEndTime) {
      //   throw new CustomError(
      //     "Missing scheduled start/end time for scheduled visitor",
      //     logPath,
      //     logAction,
      //     logSourceKey
      //   );
      // }

      // Prevent overlap: check if any scheduled visitor is meeting the same person at overlapping time
      const overlappingVisitor = await Visitor.findOne({
        toMeet,
        visitorType: "Scheduled",
        company,
        scheduledDate,
        // $or: [
        //   {
        //     scheduledStartTime: {
        //       $lt: new Date(scheduledEndTime),
        //       $gte: new Date(scheduledStartTime),
        //     },
        //   },
        //   {
        //     scheduledEndTime: {
        //       $gt: new Date(scheduledStartTime),
        //       $lte: new Date(scheduledEndTime),
        //     },
        //   },
        // ],
      });

      if (overlappingVisitor) {
        throw new CustomError(
          "Another visitor is already scheduled to meet this person during that day.",
          logPath,
          logAction,
          logSourceKey
        );
      }
    }

    // Client member validation
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

    // Resolve visitor company
    let companyToMeet = null;
    const isClient = company !== toMeetCompany;

    if (toMeetCompany && isClient) {
      companyToMeet = await CoworkingClient.findById(toMeetCompany);
      if (!companyToMeet) {
        throw new CustomError(
          "Client company not found",
          logPath,
          logAction,
          logSourceKey
        );
      }
    } else if (toMeetCompany) {
      companyToMeet = await Company.findById(toMeetCompany);
      if (!companyToMeet) {
        throw new CustomError(
          "Company not found",
          logPath,
          logAction,
          logSourceKey
        );
      }
    }

    // Handle optional department
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
      phoneNumber,
      purposeOfVisit,
      idProof: {
        idType: idProof?.idType || "",
        idNumber: idProof?.idNumber || "",
      },
      dateOfVisit: visitDate,
      checkIn: clockIn,
      checkOut: clockOut,
      // scheduledStartTime: scheduledStartTime
      //   ? new Date(scheduledStartTime)
      //   : null,
      // scheduledEndTime: scheduledEndTime ? new Date(scheduledEndTime) : null,
      scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
      toMeet: isDepartmentEmpty ? null : toMeet,
      toMeetCompany: companyToMeet || null,
      clientToMeet: clientToMeet || null,
      clientCompany: clientCompany || null,
      sector,
      city,
      state,
      department: isDepartmentEmpty ? null : department,
      visitorType,
      visitorCompany,
      company,
      visitorFlag,
    });

    const savedVisitor = await newVisitor.save();

    // Notification that visitor was added

    // Fetch department employees (or the specific person being visited)
    const foundDepartment = await Department.findById(department).select(
      "name"
    );

    const userDetails = await UserData.findById({
      _id: toMeet,
    });

    const deptEmployees = await UserData.find({
      departments: { $in: department },
    });
    console.log(department);
    console.log("To Meet", toMeet);

    // Emit the visitor notification
    emitter.emit("notification", {
      initiatorData: user,
      users: deptEmployees.map((emp) => ({
        userActions: {
          whichUser: emp._id,
          // whichUser: toMeet || clientToMeet || initiator._id, // send to the person being visited or fallback to initiator
          hasRead: false,
        },
      })),
      type: "add visitor",
      module: "Visitors",
      message: `Visitor ${firstName} ${lastName} has been registered to meet ${userDetails.firstName} ${userDetails.lastName} from ${foundDepartment.name} department.`,
    });

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
