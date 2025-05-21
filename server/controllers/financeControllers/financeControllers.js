const Budget = require("../../models/budget/Budget");
const MeetingRevenue = require("../../models/sales/MeetingRevenue");
const AlternateRevenues = require("../../models/sales/AlternateRevenue");
const VirtualOfficeRevenues = require("../../models/sales/VirtualOfficeRevenue");
const WorkationRevenues = require("../../models/sales/WorkationRevenue");
const CoworkingRevenue = require("../../models/sales/CoworkingRevenue");
const Unit = require("../../models/locations/Unit");

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
      units,
    ] = await Promise.all([
      Budget.find({ company, status: "Approved" }).lean().exec(),
      MeetingRevenue.find({ company }).lean().exec(),
      AlternateRevenues.find({ company }).lean().exec(),
      VirtualOfficeRevenues.find({ company }).lean().exec(),
      WorkationRevenues.find({ company }).lean().exec(),
      CoworkingRevenue.find({ company }).lean().exec(),
      Unit.find({ company })
        .populate([{ path: "building", select: "buildingName" }])
        .lean()
        .exec(),
    ]);

    const response = [
      {
        expense: [...budgets],
      },
      {
        income: {
          meetingRevenue: [...meetingRevenue],
          alternateRevenues: [...alternateRevenues],
          virtualOfficeRevenues: [...virtualOfficeRevenues],
          workationRevenues: [...workationRevenues],
          coworkingRevenues: [...coworkingRevenues],
        },
      },
      {
        units: [...units],
      },
    ];

    return res.status(200).json({ response });
  } catch (error) {
    next(error);
  }
};

module.exports = getIncomeAndExpanse;
