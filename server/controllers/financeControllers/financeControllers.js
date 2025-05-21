const Budget = require("../../models/budget/Budget");
const MeetingRevenue = require("../../models/sales/MeetingRevenue");
const AlternateRevenues = require("../../models/sales/AlternateRevenue");
const VirtualOfficeRevenues = require("../../models/sales/VirtualOfficeRevenue");
const WorkationRevenues = require("../../models/sales/WorkationRevenue");
const CoworkingRevenue = require("../../models/sales/CoworkingRevenue");

const getIncomeAndExpanse = async (req, res, next) => {
  try {
    const company = req.company;
        
  } catch (error) {
    next(error);
  }
};
