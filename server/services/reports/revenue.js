const AlternateRevenue = require("../../models/sales/AlternateRevenue");
const CoworkingRevenue = require("../../models/sales/CoworkingRevenue");
const MeetingRevenue = require("../../models/sales/MeetingRevenue");
const VirtualOfficeRevenue = require("../../models/sales/VirtualOfficeRevenue");
const WorkationRevenue = require("../../models/sales/WorkationRevenue");

const fetchCoworkingRevenueService = async ({
  dateFilter,
  query,
  company,
  isReport = false,
  type,
}) => {
  try {
    const filter = { company };
    if (query && query.serviceId) {
      filter.service = query.serviceId;
    }
    if (dateFilter) {
      filter.rentDate = dateFilter.rentDate;
    }

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
        ...(!isReport && { dueTerm: item.dueTerm }),
        rentDate: item.rentDate,
        rentStatus: item.rentStatus,
        ...(!isReport && { pastDueDate: item.pastDueDate }),
        annualIncrement: item.annualIncrement,
        nextIncrementDate: item.nextIncrementDate,
        ...(!isReport && { serviceName: item.service?.serviceName }),
      });
    });

    const transformedData = Array.from(monthlyMap.values());

    if (isReport) {
      let result = transformedData.flatMap((month) => month.clients);
      if (type === "collection") {
        return result.map((client) => ({
          clientName: client.clientName,
          revenue: client.revenue,
          rentDate: client.rentDate,
          status: client.rentStatus,
        }));
      } else return result;
    }

    return transformedData;
  } catch (error) {
    throw error;
  }
};

const fetchAlternateRevenueReportService = async ({
  dateFilter,
  isReport = false,
}) => {
  let filter = {};
  if (dateFilter) {
    filter.invoiceCreationDate = dateFilter.invoiceCreationDate;
  }

  const records = await AlternateRevenue.find(filter)
    .sort({ createdAt: -1 })
    .lean()
    .exec();

  const monthlyMap = new Map();

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

  records.forEach((item) => {
    const invoiceCreationDate = new Date(item.invoiceCreationDate);

    const month = MONTHS_SHORT[invoiceCreationDate.getMonth()];
    const year = invoiceCreationDate.getFullYear().toString().slice(-2);

    const monthKey = `${month}-${year}`;

    if (!monthlyMap.has(monthKey)) {
      monthlyMap.set(monthKey, {
        month: monthKey,
        taxable: 0,
        revenue: [],
      });
    }

    const monthData = monthlyMap.get(monthKey);

    monthData.taxable += item.taxableAmount || 0;

    monthData.revenue.push({
      name: item.name,
      particulars: item.particulars,
      taxableAmount: item.taxableAmount,
      invoiceAmount: item.invoiceAmount,
      invoiceCreationDate: item.invoiceCreationDate,
      invoicePaidDate: item.invoicePaidDate,
      gst: item.gst,
    });
  });

  const transformedRecords = Array.from(monthlyMap.values()).sort((a, b) => {
    const parseKey = (key) => {
      const [month, year] = key.split("-");
      const monthIndex = MONTHS_SHORT.indexOf(month);

      return parseInt(`20${year}${String(monthIndex + 1).padStart(2, "0")}`);
    };

    return parseKey(a.month) - parseKey(b.month);
  });

  if (isReport) {
    return transformedRecords.flatMap((month) => month.revenue);
  }

  return transformedRecords;
};

const fetchMeetingRevenueReportService = async ({
  company,
  dateFilter,
  isReport = false,
}) => {
  const filter = {};

  if (dateFilter) {
    filter.date = dateFilter.date;
  }

  const revenues = await MeetingRevenue.find(filter)
    .sort({ date: -1 })
    .lean()
    .exec();

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
    const referenceDate = new Date(item.date);

    const month = MONTHS_SHORT[referenceDate.getMonth()];
    const year = referenceDate.getFullYear().toString().slice(-2);

    const monthKey = `${month}-${year}`;

    if (!monthlyMap.has(monthKey)) {
      monthlyMap.set(monthKey, {
        month: monthKey,
        actual: 0,
        revenue: [],
      });
    }

    const monthData = monthlyMap.get(monthKey);

    monthData.actual += item.taxable || 0;

    monthData.revenue.push({
      clientName: item.client,
      particulars: item.particulars,
      unitsOrHours: item.unitsOrHours,
      hoursBooked: item.hoursBooked,
      costPerHour: item.costPerHour,
      taxable: item.taxable,
      gst: item.gst,
      status: item.status,
      totalAmount: item.totalAmount,
      // date: item.date,
      paymentDate: item.paymentDate,
      meetingRoomName: item.meetingRoomName,
      remarks: item.remarks || "",
    });
  });

  const transformedRecords = Array.from(monthlyMap.values()).sort((a, b) => {
    const parseKey = (key) => {
      const [month, year] = key.split("-");
      const monthIndex = MONTHS_SHORT.indexOf(month);

      return parseInt(
        `20${year}${String(monthIndex + 1).padStart(2, "0")}`,
        10,
      );
    };

    return parseKey(a.month) - parseKey(b.month);
  });

  if (isReport) {
    return transformedRecords.flatMap((month) => month.revenue);
  }

  return transformedRecords;
};

const fetchVirtualOfficeRevenueReportService = async ({
  dateFilter,
  departmentId,
  departments,
  roles,
  company,
  user,
  query,
  params,
  isReport = false,
}) => {
  let filter = { company };

  if (dateFilter) {
    filter.rentDate = dateFilter.rentDate;
  }

  const revenues = await VirtualOfficeRevenue.find(filter)
    .populate([{ path: "client", select: "clientName" }])
    .lean()
    .exec();

  if (isReport) {
    return revenues.map(
      ({ pastDueDate, unitNo, unitName, buildingName, ...item }) => item,
    );
  }

  return revenues;
};

const fetchWorkationRevenueReportService = async ({
  company,
  isReport = false,
  dateFilter,
}) => {
  let filter = {};

  if (dateFilter) {
    filter.date = dateFilter.date;
  }

  const revenues = await WorkationRevenue.find(filter)
    .populate("client")
    .lean()
    .exec();

  if (isReport) {
    return revenues.map((rev) => {
      const { nameOfClient, ...rest } = rev;
      return rest;
    });
  }

  return revenues;
};

module.exports = {
  fetchCoworkingRevenueService,
  fetchMeetingRevenueReportService,
  fetchAlternateRevenueReportService,
  fetchVirtualOfficeRevenueReportService,
  fetchWorkationRevenueReportService,
};
