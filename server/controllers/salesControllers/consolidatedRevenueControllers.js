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
    const toIST = (date) => {
      const d = new Date(date);
      // IST is UTC + 5 hours 30 minutes → 19800 seconds = 19800000 ms
      return new Date(d.getTime() + 5.5 * 60 * 60 * 1000);
    };

    const getFinancialYear = (date) => {
      const istDate = toIST(date);
      const year = istDate.getFullYear();
      const month = istDate.getMonth(); // 0 = Jan
      return month >= 3
        ? `${year}-${(year + 1).toString().slice(-2)}`
        : `${year - 1}-${year.toString().slice(-2)}`;
    };

    const getFinancialMonthIndex = (date) => {
      const istDate = toIST(date);
      const month = istDate.getMonth(); // 0 = Jan
      return (month + 9) % 12; // Apr = 0
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
      if (item.date) {
        const fy = getFinancialYear(item.date);
        const idx = getFinancialMonthIndex(item.date);
        categoryMap.Meetings.data[fy] ??= initFYData();
        categoryMap.Meetings.data[fy][idx] += item.taxable || 0;
      }
    });

    // Alt Revenues (use invoicePaidDate)
    alternateRevenues.forEach((item) => {
      if (item.invoicePaidDate) {
        const fy = getFinancialYear(item.invoiceCreationDate);
        const idx = getFinancialMonthIndex(item.invoiceCreationDate);
        categoryMap["Alt. Revenues"].data[fy] ??= initFYData();
        categoryMap["Alt. Revenues"].data[fy][idx] += item.taxableAmount || 0;
      }
    });

    // Virtual Offices (use rentDate)
    virtualOfficeRevenues.forEach((item) => {
      if (item.rentDate) {
        const fy = getFinancialYear(item.rentDate);
        const idx = getFinancialMonthIndex(item.rentDate);
        const amount = parseFloat(item.taxableAmount) || 0;
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
        categoryMap.Workations.data[fy][idx] += item.taxableAmount || 0;
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

const getSimpleConsolidatedRevenue = async (req, res, next) => {
  const company = req.company;
  try {
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

    return res.status(200).json({
      meetingRevenue,
      alternateRevenues,
      virtualOfficeRevenues,
      workationRevenues,
      coworkingRevenues,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getConsolidatedRevenue, getSimpleConsolidatedRevenue };
