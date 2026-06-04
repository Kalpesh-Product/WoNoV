const CoworkingRevenue = require("../../models/sales/CoworkingRevenue");

const fetchCoworkingRevenueService = async ({
  dateFilter,
  query,
  company,
  isReport = false,
}) => {
  try {
    const filter = { company };
    if (query && query.serviceId) {
      filter.service = query.serviceId;
    }
    if (dateFilter) {
      filter.rentDate = dateFilter.rentDate;
    }

    console.log("fetchCoworkingRevenueService filter", dateFilter);
    const revenues = await CoworkingRevenue.find(filter).lean().exec();

    const MONTHS_SHORT = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const monthlyMap = new Map();

    revenues.forEach((item) => {
      const referenceDate = item.rentDate || item.createdAt;
      const dateObj = new Date(referenceDate);
      const month = MONTHS_SHORT[dateObj.getMonth()];
      const year = dateObj.getFullYear().toString().slice(-2);
      const monthKey = `${month}-${year}`;

      if (!monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, {
          month: monthKey,
          totalRevenue: 0,
          clients: [],
        });
      }

      const monthData = monthlyMap.get(monthKey);
      monthData.totalRevenue += item.revenue || 0;

      monthData.clients.push({
        clientName: item.clientName || item.client?.clientName,
        channel: item.channel,
        noOfDesks: item.noOfDesks,
        deskRate: item.deskRate,
        occupation: item.occupation,
        revenue: item.revenue,
        totalTerm: item.totalTerm,
        dueTerm: item.dueTerm,
        rentDate: item.rentDate,
        rentStatus: item.rentStatus,
        pastDueDate: item.pastDueDate,
        annualIncrement: item.annualIncrement,
        nextIncrementDate: item.nextIncrementDate,
        serviceName: item.service?.serviceName,
      });
    });

    const transformedData = Array.from(monthlyMap.values());

    console.log("isReport", isReport);
    if (isReport) {
      return transformedData.flatMap((month) => month.clients);
    }

    return transformedData;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  fetchCoworkingRevenueService,
};
