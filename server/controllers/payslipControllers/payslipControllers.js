const Payslip = require("../../models/Payslip");

const fetchEmployeePayslips = async (req, res, next) => {
  const { company } = req;
  const { user } = req.params;
  try {
    const payslips = await Payslip.find({ employee: user }).populate({
      path: "employee",
      select: "firstName lastName empId email departments role",
      populate: [{ path: "departments" }, { path: "role" }],
    });

    if (!payslips) {
      return res.status(400).json({ message: "No Payslip found" });
    }

    return res.status(200).json(payslips);
  } catch (error) {
    next(error);
  }
};

module.exports = { fetchEmployeePayslips };
