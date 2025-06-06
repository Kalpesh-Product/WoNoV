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
      Budget.find({ company, status: "Approved" })
        .populate([
          {
            path: "unit",
            populate: {
              path: "building",
              select: "buildingName",
              model: "Building",
            },
          },
          { path: "department", select: "name" },
        ])
        .lean()
        .exec(),
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
          meetingRevenue: [
            ...meetingRevenue.map((m) => ({ ...m, status: "paid" })),
          ],
          alternateRevenues: [
            ...alternateRevenues.map((m) => ({ ...m, status: "paid" })),
          ],
          virtualOfficeRevenues: [
            ...virtualOfficeRevenues.map((m) => ({ ...m, status: "paid" })),
          ],
          workationRevenues: [
            ...workationRevenues.map((m) => ({ ...m, status: "paid" })),
          ],
          coworkingRevenues: [
            ...coworkingRevenues.map((m) => ({ ...m, status: "paid" })),
          ],
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
