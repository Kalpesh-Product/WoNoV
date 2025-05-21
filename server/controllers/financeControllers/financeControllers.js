const Budget = require("../../models/budget/Budget");
const MeetingRevenue = require("../../models/sales/MeetingRevenue");
const AlternateRevenues = require("../../models/sales/AlternateRevenue");
const VirtualOfficeRevenues = require("../../models/sales/VirtualOfficeRevenue");
const WorkationRevenues = require("../../models/sales/WorkationRevenue");
const CoworkingRevenue = require("../../models/sales/CoworkingRevenue");

const getIncomeAndExpanse = async (req, res, next) => {
  try {
    const company = req.company;

    const [
      budgets,
      meetingRevenue,
      alternateRevenues,
      virtualOfficeRevenues,
      workationRevenues,
      coworkingRevenues,
    ] = await Promise.all([
      Budget.find({ company, status: "Approved" }).lean().exec(),
      MeetingRevenue.find({ company }).lean().exec(),
      AlternateRevenues.find({ company }).lean().exec(),
      VirtualOfficeRevenues.find({ company }).lean().exec(),
      WorkationRevenues.find({ company }).lean().exec(),
      CoworkingRevenue.find({ company }).lean().exec(),
    ]);

    const totalBudget = budgets.reduce(
      (acc, budget) => acc + budget.actualAmount,
      0 
    );
    const totalMeetingRevenue = meetingRevenue.reduce(
      (acc, revenue) => acc + revenue.totalAmount,
      0
    );
    const totalAlternateRevenue = alternateRevenues.reduce(
      (acc, revenue) => acc + revenue.invoiceAmount,
      0
    );

    const totalWorkationRevenue = workationRevenues.reduce(
      (acc, revenue) => acc + revenue.totalAmount,
      0
    );

    const totalVirtualOfficeRevenue = virtualOfficeRevenues.reduce(
      (acc, revenue) => acc + revenue.actualRevenue,
      0
    );

    const totalCoworkingRevenue = coworkingRevenues.reduce(
      (acc, revenue) => acc + revenue.revenue,
      0
    );

    console.log("totalBudget", totalBudget);
    console.log(
      "totalRevenue",
        totalMeetingRevenue +
        totalAlternateRevenue +
        totalWorkationRevenue +
        totalVirtualOfficeRevenue +
        totalCoworkingRevenue
    );

    return res.status(200).json({ message: "Some response" });
  } catch (error) {
    next(error);
  }
};

module.exports = getIncomeAndExpanse;
