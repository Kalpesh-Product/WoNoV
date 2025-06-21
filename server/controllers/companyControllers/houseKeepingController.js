const HouseKeepingStaff = require("../../models/hr/HouseKeepingStaff");
const Users = require("../../models/hr/UserData");

const addNewHouseKeepingMember = async (req, res, next) => {
  try {
    const { name, gender, manager } = req.body;
    if (!name || !gender || !manager) {
      return res
        .status(400)
        .json({ message: "Please provide the valid details" });
    }

    const newHouseKeepingStaff = new HouseKeepingStaff({
      name,
      gender,
      manager,
      unit,
      department: "6798bae6e469e809084e24a4",
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

    const managerRoleId = houseKeepingStaff[0].manager._id.toString();
    const manager = await Users.findOne({
      role: managerRoleId,
      isActive: true,
    })
      .lean()
      .exec();

    const staff = houseKeepingStaff.map((staff) => {
      return {
        ...staff,
        manager,
      };
    });

    return res.status(200).json(staff);
  } catch (error) {
    next(error);
  }
};

module.exports = { addNewHouseKeepingMember, getHouseKeepingStaff };
