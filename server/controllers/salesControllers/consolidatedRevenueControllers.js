const MeetingRevenue = require("../../models/sales/MeetingRevenue");
const AlternateRevenues = require("../../models/sales/AlternateRevenue");
const VirtualOfficeRevenues = require("../../models/sales/VirtualOfficeRevenue");
const WorkationRevenues = require("../../models/sales/WorkationRevenue");
const transformRevenues = require("../../utils/revenueFormatter");

const getConsolidatedRevenue = async (req, res, next) => {
  try {
    const company = req.company;
    const meetingRevenue = await MeetingRevenue.find({ company }).lean().exec();
    const alternateRevenue = await AlternateRevenues.find({ company })
      .lean()
      .exec();
    const virtualOfficeRevenue = await AlternateRevenues.find({ company })
      .lean()
      .exec();

    const workationRevenues = await WorkationRevenues.find({ company })
      .lean()
      .exec();

    const formattedVirtualOffice = transformRevenues(
      virtualOfficeRevenue,
      "rentDate",
      "actualRevenue"
    );
    const formattedWorkationRevenue = transformRevenues(
      workationRevenues,
      "rentDate",
      "actualRevenue"
    );

    const formattedMeetingRevenue = transformRevenues(
      meetingRevenue,
      "date",
      "totalAmount"
    );
    const formattedAlternateRevenues = transformRevenues(alternateRevenue);
  } catch (error) {
    next(error);
  }
};
