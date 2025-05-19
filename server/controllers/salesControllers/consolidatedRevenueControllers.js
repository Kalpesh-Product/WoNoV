const MeetingRevenue = require("../../models/sales/MeetingRevenue");
const AlternateRevenues = require("../../models/sales/AlternateRevenue");
const VirtualOfficeRevenues = require("../../models/sales/VirtualOfficeRevenue");
const WorkationRevenues = require("../../models/sales/WorkationRevenue");
const CoworkingRevenue = require("../../models/sales/CoworkingRevenue");

const getConsolidatedRevenue = async (req, res, next) => {
  try {
    const company = req.company;

    const [
      meetingRevenue,
      alternateRevenues,
      virtualOfficeRevenues,
      workationRevenues,
      coworkingRevenues,
    ] = await Promise.all([
      MeetingRevenue.find({ company }).lean().exec(),
      AlternateRevenues.find({ company }).lean().exec(),
      VirtualOfficeRevenues.find({ company }).lean().exec(),
      WorkationRevenues.find({ company }).lean().exec(),
      CoworkingRevenue.find({ company }).lean().exec(),
    ]);

    // Helpers
    const getFinancialYear = (date) => {
      const d = new Date(date);
      const year = d.getFullYear();
      const month = d.getMonth(); // 0 = Jan
      return month >= 3
        ? `${year}-${(year + 1).toString().slice(-2)}`
        : `${year - 1}-${year.toString().slice(-2)}`;
    };

    const getFinancialMonthIndex = (date) => {
      const month = new Date(date).getMonth(); // 0 = Jan
      return (month + 9) % 12; // Apr = 0, Mar = 11
    };

    const initFYData = () => Array(12).fill(0);

    const categoryMap = {
      Meetings: { data: {} },
      "Alt. Revenues": { data: {} },
      "Virtual Offices": { data: {} },
      Workations: { data: {} },
      Coworking: { data: {} },
    };

    // Meetings (use paymentDate)
    meetingRevenue.forEach((item) => {
      if (item.paymentDate) {
        const fy = getFinancialYear(item.paymentDate);
        const idx = getFinancialMonthIndex(item.paymentDate);
        categoryMap.Meetings.data[fy] ??= initFYData();
        categoryMap.Meetings.data[fy][idx] += item.totalAmount || 0;
      }
    });

    // Alt Revenues (use invoicePaidDate)
    alternateRevenues.forEach((item) => {
      if (item.invoicePaidDate) {
        const fy = getFinancialYear(item.invoicePaidDate);
        const idx = getFinancialMonthIndex(item.invoicePaidDate);
        categoryMap["Alt. Revenues"].data[fy] ??= initFYData();
        categoryMap["Alt. Revenues"].data[fy][idx] += item.invoiceAmount || 0;
      }
    });

    // Virtual Offices (use rentDate)
    virtualOfficeRevenues.forEach((item) => {
      if (item.rentDate) {
        const fy = getFinancialYear(item.rentDate);
        const idx = getFinancialMonthIndex(item.rentDate);
        const amount =
          parseFloat(item.actualRevenue) ||
          parseFloat(item.projectedRevenue) ||
          0;
        categoryMap["Virtual Offices"].data[fy] ??= initFYData();
        categoryMap["Virtual Offices"].data[fy][idx] += amount;
      }
    });

    // Workations (use date)
    workationRevenues.forEach((item) => {
      if (item.date) {
        const fy = getFinancialYear(item.date);
        const idx = getFinancialMonthIndex(item.date);
        categoryMap.Workations.data[fy] ??= initFYData();
        categoryMap.Workations.data[fy][idx] += item.totalAmount || 0;
      }
    });

    // Coworking (use rentDate)
    coworkingRevenues.forEach((item) => {
      if (item.rentDate) {
        const fy = getFinancialYear(item.rentDate);
        const idx = getFinancialMonthIndex(item.rentDate);
        categoryMap.Coworking.data[fy] ??= initFYData();
        categoryMap.Coworking.data[fy][idx] += item.revenue || 0;
      }
    });

    // Final response
    const rawData = Object.entries(categoryMap).map(([name, value]) => ({
      name,
      data: value.data,
    }));

    return res.status(200).json(rawData);
  } catch (error) {
    next(error);
  }
};

module.exports = getConsolidatedRevenue;
