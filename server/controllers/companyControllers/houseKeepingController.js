const HouseKeepingStaff = require("../../models/hr/HouseKeepingStaff");
const Users = require("../../models/hr/UserData");
const HouseKeepingSchedule = require("../../models/HousekeepingSchedule");
const Unit = require("../../models/locations/Unit");

const addNewHouseKeepingMember = async (req, res, next) => {
  try {
    const {
      firstName,
      middleName,
      lastName,
      gender,
      dateOfBirth,
      mobilePhone,
      email,
      addressLine1,
      addressLine2,
      country,
      state,
      city,
      pinCode,
      manager,
    } = req.body;

    // Basic validation
    if (!firstName || !gender) {
      return res
        .status(400)
        .json({ message: "Please provide the valid details" });
    }

    const newHouseKeepingStaff = new HouseKeepingStaff({
      firstName,
      middleName,
      lastName,
      gender,
      dateOfBirth,
      mobilePhone,
      email,
      addressLine1,
      addressLine2,
      country,
      state,
      city,
      pinCode,
      manager: "6798bf34e469e809084e24c6",
      department: "6798bae6e469e809084e24a4", // hardcoded for now
    });

    const savedHouseKeepingStaff = await newHouseKeepingStaff.save();

    res.status(201).json({
      message: "House Keeping Staff Added Successfully",
      savedHouseKeepingStaff,
    });
  } catch (error) {
    next(error);
  }
};

const getHouseKeepingStaff = async (req, res, next) => {
  try {
    const houseKeepingStaff = await HouseKeepingStaff.find()
      .populate([
        { path: "manager", select: "roleTitle" },
        { path: "department", select: "name" },
      ])
      .lean()
      .exec();

    const staff = await Promise.all(
      houseKeepingStaff.map(async (staffMember) => {
        const managerRoleId = staffMember.manager?._id?.toString();

        const managerUser = await Users.findOne({
          role: managerRoleId,
          isActive: true,
        })
          .select("firstName lastName email mobileNumber")
          .lean()
          .exec();

        return {
          ...staffMember,
          managerUser,
        };
      })
    );

    return res.status(200).json(staff);
  } catch (error) {
    next(error);
  }
};

const updateHouseKeepingMember = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updatedStaff = await HouseKeepingStaff.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: updates },
      { new: true }
    );

    if (!updatedStaff) {
      return res
        .status(404)
        .json({ message: "Staff not found or already deleted." });
    }

    res.status(200).json({
      message: "House Keeping Staff Updated Successfully",
      updatedStaff,
    });
  } catch (error) {
    next(error);
  }
};

const softDeleteHouseKeepingMember = async (req, res, next) => {
  try {
    const { id } = req.params;

    const deleted = await HouseKeepingStaff.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: { isDeleted: true } },
      { new: true }
    );

    if (!deleted) {
      return res
        .status(404)
        .json({ message: "Staff not found or already deleted." });
    }

    res.status(200).json({ message: "Staff soft deleted successfully." });
  } catch (error) {
    next(error);
  }
};

const assignHouseKeepingMember = async (req, res, next) => {
  try {
    const { memberId, unitId, startDate, endDate } = req.body;

    if (!memberId || !unitId || !startDate || !endDate) {
      return res.status(400).json({ message: "Please fill all fields" });
    }

    // const existingMember = await HouseKeepingStaff.findOne({
    //   _id: memberId,
    //   isDeleted: false,
    // })
    //   .lean()
    //   .exec();


    // if (!existingMember) {
    //   return res.status(404).json({ message: "No such member exists" });
    // }

    const validStartDate = new Date(startDate);
    const validEndDate = new Date(endDate);

    if (isNaN(validStartDate) || isNaN(validEndDate)) {
      return res.status(400).json({ message: "Invalid date" });
    }

    if (validStartDate > validEndDate) {
      return res
        .status(400)
        .json({ message: "Start date cannot be after end date" });
    }

    // Check for overlapping assignments for the same member
    const overlap = await HouseKeepingSchedule.findOne({
      housekeepingMember: memberId,
      unit: unitId,
      $or: [
        {
          startDate: { $lte: validEndDate },
          endDate: { $gte: validStartDate },
        },
      ],
    });

    if (overlap) {
      return res.status(409).json({
        message: "Member already assigned in this period for the unit",
      });
    }

    const newAssignment = await HouseKeepingSchedule.create({
      housekeepingMember: memberId,
      unit: unitId,
      startDate: validStartDate,
      endDate: validEndDate,
    });

    return res.status(201).json({
      message: "Housekeeping member assigned successfully",
      data: newAssignment,
    });
  } catch (error) {
    next(error);
  }
};

const getHouseKeepingAssignments = async (req, res, next) => {
  try {
    const { memberId, unitId, fromDate, toDate } = req.query;

    const query = {};

    if (memberId) query.housekeepingMember = memberId;
    if (unitId) query.unit = unitId;

    if (fromDate && toDate) {
      const start = new Date(fromDate);
      const end = new Date(toDate);
      if (isNaN(start) || isNaN(end)) {
        return res.status(400).json({ message: "Invalid date range" });
      }

      query.$or = [{ startDate: { $lte: end }, endDate: { $gte: start } }];
    }

    const schedules = await HouseKeepingSchedule.find(query)
      .populate("housekeepingMember", "name employeeId") // customize fields
      .populate("unit", "unitName floorNumber"); // customize fields

    return res.status(200).json({
      message: "Housekeeping assignments fetched successfully",
      data: schedules,
    });
  } catch (error) {
    next(error);
  }
};
module.exports = {
  getHouseKeepingStaff,
  addNewHouseKeepingMember,
  updateHouseKeepingMember,
  softDeleteHouseKeepingMember,
  assignHouseKeepingMember,
  getHouseKeepingAssignments,
};
