const CustomError = require("../../utils/customErrorlogs");
const { createLog } = require("../../utils/moduleLogs");
const CoworkingClientMember = require("../models/coworkingClientMember");
const mongoose = require("mongoose");

const createMember = async (req, res, next) => {
  const logPath = "sales/SalesLog";
  const logAction = "Onboard Coworking Client Member";
  const logSourceKey = "clientMember";
  const { user, ip, company } = req;

  try {
    const {
      name,
      designation,
      email,
      phone,
      bloodGroup,
      dob,
      emergencyName,
      emergencyNo,
      biznestDoj,
      biometricStatus,
      client,
    } = req.body;

    if (!name || !email || !dob || !phone || !client) {
      throw new CustomError(
        "Missing required fields",
        logPath,
        logAction,
        logSourceKey
      );
    }

    const existing = await CoworkingClientMember.findOne({ email });
    if (existing) {
      throw new CustomError(
        "Client member already exists with this email",
        logPath,
        logAction,
        logSourceKey
      );
    }

    if (client && !mongoose.Types.ObjectId.isValid(client)) {
      throw new CustomError(
        "Invalid client ID",
        logPath,
        logAction,
        logSourceKey
      );
    }

    const newMember = new CoworkingClientMember({
      name,
      designation,
      email,
      phone,
      bloodGroup,
      dob,
      emergencyName,
      emergencyNo,
      biznestDoj,
      biometricStatus,
      client,
      company,
    });

    const savedMember = await newMember.save();

    await createLog({
      path: logPath,
      action: logAction,
      remarks: "Coworking Client Member onboarded successfully",
      status: "Success",
      user,
      ip,
      company,
      sourceKey: logSourceKey,
      sourceId: savedMember._id,
      changes: {
        member: savedMember,
      },
    });

    return res
      .status(201)
      .json({ message: "Coworking client member onboarded successfully" });
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

const getAllMembers = async (req, res, next) => {
  try {
    const { client, service } = req.query;

    if (!client) {
      return res.status(400).json({ message: "Client ID is missing" });
    }

    if (!service) {
      //service is a string
      return res.status(400).json({ message: "Service is missing" });
    }

    if (!mongoose.Types.ObjectId.isValid(client)) {
      return res.status(400).json({ message: "Invalid client ID provided" });
    }

    const members = await CoworkingClientMember.find({
      company,
      client,
    }).populate("client", "clientName service");

    if (!members) {
      return res.status(400).json({ message: "No Member found" });
    }

    return res.status(200).json(members);
  } catch (error) {
    next(error);
  }
};

const getMemberById = async (req, res) => {
  try {
    const { memberId } = req.params.id;

    if (!memberId) {
      return res.status(400).json({ message: "Member ID is missing" });
    }

    if (!mongoose.Types.ObjectId.isValid(memberId)) {
      return res.status(400).json({ message: "Invalid memeber ID provided" });
    }

    const member = await CoworkingClientMember.findById(memberId).populate(
      "client",
      "clientName service"
    );

    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    res.status(200).json(member);
  } catch (error) {
    next(error);
  }
};

const updateMember = async (req, res, next) => {
  try {
    const { memberId, data } = req.body;

    if (!memberId) {
      return res.status(400).json({ message: "Member ID is missing" });
    }

    if (!mongoose.Types.ObjectId.isValid(memberId)) {
      return res.status(400).json({ message: "Invalid memeber ID provided" });
    }

    const updatedMember = await CoworkingClientMember.findByIdAndUpdate(
      memberId,
      data,
      { new: true, runValidators: true }
    );

    if (!updatedMember) {
      return res.status(404).json({ message: "Member not found" });
    }

    res.status(200).json(updatedMember);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  createMember,
  getAllMembers,
  getMemberById,
  updateMember,
};
