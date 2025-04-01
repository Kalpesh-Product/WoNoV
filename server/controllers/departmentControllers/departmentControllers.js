const Department = require("../../models/Departments");
const crypto = require("crypto");

const createDepartment = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res
        .status(400)
        .json({ message: "Please provide a name for the department" });
    }
    const departmentId = `D-000${crypto.randomInt(100)}`;
    const newDepartment = new Department({
      name,
      departmentId,
    });

    await newDepartment.save();
    res.status(201).json({ message: "New Department created" });
  } catch (error) {
    next(error);
  }
};

module.exports = { createDepartment };
