const HouseKeepingStaff = require("../../models/hr/HouseKeepingStaff");
const Users = require("../../models/hr/UserData");

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
      manager: "798bf34e469e809084e24c6",
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

module.exports = {
  getHouseKeepingStaff,
  addNewHouseKeepingMember,
  updateHouseKeepingMember,
  softDeleteHouseKeepingMember,
};
