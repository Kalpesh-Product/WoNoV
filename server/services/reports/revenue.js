const AlternateRevenue = require("../../models/sales/AlternateRevenue");
const CoworkingRevenue = require("../../models/sales/CoworkingRevenue");
const MeetingRevenue = require("../../models/sales/MeetingRevenue");
const VirtualOfficeRevenue = require("../../models/sales/VirtualOfficeRevenue");
const WorkationRevenue = require("../../models/sales/WorkationRevenue");
const ExternalVisits = require("../../models/visitor/ExternalVisits");

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
      const invoiceDate = item.invoice?.date || null;

      monthData.totalRevenue += item.revenue || 0;

      monthData.clients.push({
        _id: item._id,
        clients: item.clients,
        service: item.service,
        clientName: item.clientName || item.client?.clientName,
        clientInvoiceName: item.clientInvoiceName,
        channel: item.channel,
        noOfDesks: item.noOfDesks,
        deskRate: item.deskRate,
        occupation: item.occupation,
        revenue: item.revenue,
        totalTerm: item.totalTerm,
        ...(!isReport && { dueTerm: item.dueTerm }),
        rentDate: item.rentDate,
        invoiceName: item.invoice?.name || null,
        invoiceLink: item.invoice?.link || null,
        invoiceUploadedAt: invoiceDate,
        invoice: item.invoice || null,
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
  company,
  dateFilter,
  isReport = false,
}) => {
  let filter = {};
  if (company) {
    filter.company = company;
  }
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
    const invoiceDate = item.invoice?.date || item.invoicePaidDate || null;

    monthData.taxable += item.taxableAmount || 0;

    monthData.revenue.push({
      _id: item._id,
      name: item.name,
      clientInvoiceName: item.clientInvoiceName || null,
      particulars: item.particulars,
      taxableAmount: item.taxableAmount,
      invoiceAmount: item.invoiceAmount,
      invoiceCreationDate: item.invoiceCreationDate,
      invoicePaidDate: invoiceDate,
      gst: item.gst,
      status: item.status || "Unpaid",
      invoiceName: item.invoice?.name || null,
      invoiceLink: item.invoice?.link || null,
      invoice: item.invoice || null,
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

  if (company) {
    filter.company = company;
  }

  if (dateFilter) {
    filter.date = dateFilter.date;
  }

  const dayPassFilter = {
    ...(company && { company }),
    visitorType: { $in: ["Full-Day Pass", "Half-Day Pass"] },
    meeting: null,
    ...(dateFilter?.date && { dateOfVisit: dateFilter.date }),
  };

  const [meetingRevenues, dayPassVisits] = await Promise.all([
    MeetingRevenue.find(filter)
      .sort({ date: -1 })
      .populate({
        path: "meeting",
        select: "meetingType bookedRoom",
        populate: {
          path: "bookedRoom",
          select: "location",
          populate: {
            path: "location",
            select: "unitNo unitName building",
            populate: { path: "building", select: "buildingName" },
          },
        },
      })
      .lean()
      .exec(),
    ExternalVisits.find(dayPassFilter)
      .sort({ dateOfVisit: -1 })
      .populate({
        path: "visitorId",
        select:
          "firstName middleName lastName registeredClientCompany brandName visitorCompany",
      })
      .populate({
        path: "unit",
        select: "unitNo unitName building",
        populate: { path: "building", select: "buildingName" },
      })
      .lean()
      .exec(),
  ]);

  const dayPassRevenues = dayPassVisits.map((visit) => {
    const visitorName = [
      visit.visitorId?.firstName,
      visit.visitorId?.middleName,
      visit.visitorId?.lastName,
    ]
      .filter(Boolean)
      .join(" ");

    return {
      client:
        visit.visitorId?.registeredClientCompany ||
        visit.visitorId?.brandName ||
        visit.visitorId?.visitorCompany ||
        visitorName ||
        "N/A",
      meetingType: visit.visitorType,
      particulars: visit.purposeOfVisit || visit.visitorType,
      unitsOrHours: "Pass",
      meetingRoomName:
        visit.unit?.unitName || visit.unit?.unitNo || "N/A",
      unit: visit.unit,
      building: visit.unit?.building?.buildingName || "N/A",
      taxable: Math.max(
        Number(visit.amount || 0) - Number(visit.discount || 0),
        0,
      ),
      gst: Number(visit.gstAmount || 0),
      totalAmount: Number(visit.totalAmount || 0),
      date: visit.dateOfVisit,
      paymentDate: visit.paymentStatus ? visit.updatedAt : null,
      status: visit.paymentStatus ? "Paid" : "Unpaid",
      remarks: visit.paymentMode || "-",
      source: "day-pass",
    };
  });

  const revenues = [...meetingRevenues, ...dayPassRevenues].sort(
    (a, b) => new Date(b.date || 0) - new Date(a.date || 0),
  );

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
      meetingType:
        item.source === "day-pass"
          ? item.meetingType
          : item.meeting
            ? "Meeting Room Booking"
            : String(item.particulars || "").trim() || "N/A",
      particulars: item.particulars,
      unitsOrHours: item.unitsOrHours,
      hoursBooked: item.hoursBooked,
      costPerHour: item.costPerHour,
      taxable: item.taxable,
      gst: item.gst,
      status: item.status,
      totalAmount: item.totalAmount,
      date: item.date,
      paymentDate: item.paymentDate,
      meetingRoomName: item.meetingRoomName,
      unit:
        item.source === "day-pass"
          ? item.unit
          : item.meeting?.bookedRoom?.location,
      building:
        item.source === "day-pass"
          ? item.building
          : item.meeting?.bookedRoom?.location?.building?.buildingName ||
            "N/A",
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
  const filter = {};

  if (company) {
    filter.company = company;
  }
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

const buildVerticalRevenueFilter = (
  company,
  dateFilter,
  dateField,
  status,
) => ({
  ...(company ? { company } : {}),
  ...(status && { status }),
  ...(dateFilter?.startDate || dateFilter?.endDate
    ? {
        [dateField]: {
          ...(dateFilter.startDate
            ? { $gte: new Date(dateFilter.startDate) }
            : {}),
          ...(dateFilter.endDate ? { $lte: new Date(dateFilter.endDate) } : {}),
        },
      }
    : {}),
});

const sumRevenue = (records, amountField) =>
  records.reduce(
    (total, item) => total + (Number(item?.[amountField]) || 0),
    0,
  );

const fetchVerticalRevenueReportService = async ({ company, dateFilter }) => {
  const status = "Paid";
  const [
    meetingRevenue,
    alternateRevenues,
    virtualOfficeRevenues,
    workationRevenues,
    coworkingRevenues,
  ] = await Promise.all([
    MeetingRevenue.find(
      buildVerticalRevenueFilter(company, dateFilter, "date", status),
    )
      .select("taxable")
      .lean()
      .exec(),
    AlternateRevenue.find(
      buildVerticalRevenueFilter(company, dateFilter, "invoiceCreationDate"),
    )
      .select("taxableAmount")
      .lean()
      .exec(),
    VirtualOfficeRevenue.find(
      buildVerticalRevenueFilter(company, dateFilter, "rentDate"),
    )
      .select("taxableAmount")
      .lean()
      .exec(),
    WorkationRevenue.find(
      buildVerticalRevenueFilter(company, dateFilter, "date"),
    )
      .select("taxableAmount")
      .lean()
      .exec(),
    CoworkingRevenue.find(
      buildVerticalRevenueFilter(company, dateFilter, "rentDate"),
    )
      .select("revenue")
      .lean()
      .exec(),
  ]);

  return [
    { vertical: "Meeting", revenue: sumRevenue(meetingRevenue, "taxable") },
    {
      vertical: "Alternate",
      revenue: sumRevenue(alternateRevenues, "taxableAmount"),
    },
    {
      vertical: "Virtual Office",
      revenue: sumRevenue(virtualOfficeRevenues, "taxableAmount"),
    },
    {
      vertical: "Workation",
      revenue: sumRevenue(workationRevenues, "taxableAmount"),
    },
    {
      vertical: "Co-Working",
      revenue: sumRevenue(coworkingRevenues, "revenue"),
    },
  ].map((item, index) => ({
    Vertical: item.vertical,
    "Revenue (INR)": item.revenue,
  }));
};

module.exports = {
  fetchCoworkingRevenueService,
  fetchMeetingRevenueReportService,
  fetchAlternateRevenueReportService,
  fetchVirtualOfficeRevenueReportService,
  fetchWorkationRevenueReportService,
  fetchVerticalRevenueReportService,
};
