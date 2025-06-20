const HouseKeepingStaff = require("../../models/hr/HouseKeepingStaff");
const Users = require("../../models/hr/UserData");

const addNewHouseKeepingMember = async (req, res, next) => {
  try {
    const { name, gender, manager, unit } = req.body;
    if (!name || !gender || !manager || !unit) {
      return res
        .status(400)
        .json({ message: "Please provide the valid details" });
    }

    const newHouseKeepingStaff = new HouseKeepingStaff({
      name,
      gender,
      manager,
      unit,
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
        { path: "unit", select: "unitNo unitName" },
        { path: "manager", select: "roleTitle" },
      ])
      .lean()
      .exec();

    const managerRoleId = houseKeepingStaff[0].manager;
    const manager = await Users.findOne({
      roleId: managerRoleId,
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
