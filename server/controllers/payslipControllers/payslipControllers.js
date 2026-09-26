const Payslip = require("../../models/Payslip");
const axios = require("axios");

const populateEmployee = {
  path: "employee",
  select: "firstName lastName empId email departments role isActive",
  populate: [{ path: "departments" }, { path: "role" }],
};

const fetchCompanyPayslips = async (req, res, next) => {
  const { company } = req;

  try {
    const payslips = await Payslip.find({ company })
      .populate(populateEmployee)
      .sort({ month: -1 })
      .lean();

    return res.status(200).json(payslips);
  } catch (error) {
    next(error);
  }
};

const fetchEmployeePayslips = async (req, res, next) => {
  const { company } = req;
  const { user } = req.params;
  try {
    const payslips = await Payslip.find({ employee: user, company })
      .populate(populateEmployee)
      .sort({ month: -1 })
      .lean();

    return res.status(200).json(payslips);
  } catch (error) {
    next(error);
  }
};

const downloadPayslip = async (req, res, next) => {
  const { company } = req;
  const { payslipId } = req.params;

  try {
    const payslip = await Payslip.findOne({ _id: payslipId, company })
      .select("payslipLink payslipName")
      .lean();

    if (!payslip?.payslipLink) {
      return res.status(404).json({ message: "Payslip PDF not found" });
    }

    const pdfResponse = await axios.get(payslip.payslipLink, {
      responseType: "arraybuffer",
    });
    const filename = String(payslip.payslipName || "Payslip.pdf").replace(
      /[\r\n"]/g,
      "",
    );

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${filename}"`,
    );
    return res.send(Buffer.from(pdfResponse.data));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  downloadPayslip,
  fetchCompanyPayslips,
  fetchEmployeePayslips,
};
