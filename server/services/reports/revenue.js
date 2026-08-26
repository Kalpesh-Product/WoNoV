const AlternateRevenue = require("../../models/sales/AlternateRevenue");
const CoworkingRevenue = require("../../models/sales/CoworkingRevenue");
const MeetingRevenue = require("../../models/sales/MeetingRevenue");
const VirtualOfficeRevenue = require("../../models/sales/VirtualOfficeRevenue");
const WorkationRevenue = require("../../models/sales/WorkationRevenue");
const ExternalVisits = require("../../models/visitor/ExternalVisits");
const dayjs = require("dayjs");

const getPaymentStatusLabel = (value) => {
  const normalized = String(value ?? "")
    .trim()
    .toLowerCase();

  return value === true || normalized === "paid" || normalized === "true"
    ? "Paid"
    : "Unpaid";
};
const fetchCoworkingRevenueService = async ({
  dateFilter,
  query,
  company,
  isReport = false,
  type,
}) => {
  try {
    const useClientDetails =
      String(query?.useClientDetails || "").toLowerCase() === "true";
    const filter = { company };
    if (query && query.serviceId) {
      filter.service = query.serviceId;
    }
    if (dateFilter) {
      filter.rentDate = dateFilter.rentDate;
    }

   // const revenues = await CoworkingRevenue.find(filter).lean().exec();
    const revenues = await CoworkingRevenue.find(filter)
      .populate({
        path: "clients",
        select:
          "clientName bookingType cabinDesks openDesks ratePerCabinDesk ratePerOpenDesk annualIncrement nextIncrement startDate endDate lockinPeriod rentDate",
      })
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
       let clientBillingValues = {};

      if (useClientDetails && item.clients) {
        const client = item.clients;
        const noOfDesks =
          Number(client.cabinDesks || 0) + Number(client.openDesks || 0);
        const baseRate = [client.ratePerCabinDesk, client.ratePerOpenDesk]
          .map(Number)
          .find((rate) => Number.isFinite(rate) && rate > 0) || 0;
        const startDate = dayjs(client.startDate);
        const endDate = dayjs(client.endDate);
        const annualIncrement = Number(client.annualIncrement) || 0;
        const yearsElapsed = startDate.isValid()
          ? Math.max(dayjs().diff(startDate, "year"), 0)
          : 0;
        const currentRate =
          baseRate * Math.pow(1 + annualIncrement / 100, yearsElapsed);

        clientBillingValues = {
          clientName: client.clientName,
          channel: client.bookingType,
          annualIncrement,
          nextIncrementDate: client.nextIncrement,
          revenue: noOfDesks * currentRate,
          noOfDesks,
          deskRate: currentRate,
          totalTerm:
            startDate.isValid() &&
            endDate.isValid() &&
            endDate.isAfter(startDate)
              ? endDate.diff(startDate, "month")
              : Number(client.lockinPeriod) || 0,
          rentDate: client.rentDate,
        };
      }
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

    //   const monthData = monthlyMap.get(monthKey);
    //   const invoiceDate = item.invoice?.date || null;

    //   monthData.totalRevenue += item.revenue || 0;

    //   monthData.clients.push({
    //     _id: item._id,
    //     clients: item.clients,
    //     service: item.service,
    //     clientName: item.clientName || item.client?.clientName,
    //     clientInvoiceName: item.clientInvoiceName,
    //     channel: item.channel,
    //     noOfDesks: item.noOfDesks,
    //     deskRate: item.deskRate,
    //     occupation: item.occupation,
    //     revenue: item.revenue,
    //     totalTerm: item.totalTerm,
    //     ...(!isReport && { dueTerm: item.dueTerm }),
    //     rentDate: item.rentDate,
    //     invoiceName: item.invoice?.name || null,
    //     invoiceLink: item.invoice?.link || null,
    //     invoiceUploadedAt: invoiceDate,
    //     invoice: item.invoice || null,
    //     rentStatus: item.rentStatus,
    //     ...(!isReport && { pastDueDate: item.pastDueDate }),
    //     annualIncrement: item.annualIncrement,
    //     nextIncrementDate: item.nextIncrementDate,
    //     ...(!isReport && { serviceName: item.service?.serviceName }),
    //   });
    // });
      const monthData = monthlyMap.get(monthKey);
      const invoiceDate = item.invoice?.date || null;

      monthData.totalRevenue += clientBillingValues.revenue ?? item.revenue ?? 0;

      monthData.clients.push({
        _id: item._id,
        clients: item.clients?._id || item.clients,
        service: item.service,
        clientName: clientBillingValues.clientName ?? item.clientName,
        clientInvoiceName: item.clientInvoiceName,
        channel: clientBillingValues.channel ?? item.channel,
        noOfDesks: clientBillingValues.noOfDesks ?? item.noOfDesks,
        deskRate: clientBillingValues.deskRate ?? item.deskRate,
        occupation: item.occupation,
        revenue: clientBillingValues.revenue ?? item.revenue,
        totalTerm: clientBillingValues.totalTerm ?? item.totalTerm,
        ...(!isReport && { dueTerm: item.dueTerm }),
        rentDate: item.rentDate || clientBillingValues.rentDate,
        invoiceName: item.invoice?.name || null,
        invoiceLink: item.invoice?.link || null,
        invoiceUploadedAt: invoiceDate,
        invoice: item.invoice || null,
        rentStatus: item.rentStatus,
        ...(!isReport && { pastDueDate: item.pastDueDate }),
       annualIncrement:
          clientBillingValues.annualIncrement ?? item.annualIncrement,
        nextIncrementDate:
          clientBillingValues.nextIncrementDate ?? item.nextIncrementDate,
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
  const isHistoricalRevenue = (value) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return false;

    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    return date < currentMonthStart;
  };

  //  const getFinanceStatus = (item) => {
  //   if (
  //     item.source === "day-pass" &&
  //     item.paymentVerification === "Completed"
  //   ) {
  //     return "Upload Invoice";
  //   }
   const getFinanceStatus = (item) => {
    if (isHistoricalRevenue(item.date) || item.financeStatus === "Verified") {
      return "Verified";
    }
    if (
      item.paymentVerification === "Completed" ||
      item.meeting?.paymentVerification === "Completed"
    ) {
      return "Upload Invoice";
    }
    return "Pending";
  };

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
      .sort({ date: -1, updatedAt: -1, createdAt: -1 })
      .populate({
        path: "invoiceUploadedBy",
        select: "firstName middleName lastName employeeName",
      })
      .populate({
        path: "meeting",
        select:
          "meetingType subject agenda startTime endTime status houeskeepingStatus bookedBy receptionist client externalClient bookedRoom paymentVerification paymentStatus paymentProof",
        populate: [
          {
            path: "bookedBy",
            select: "firstName middleName lastName employeeName",
          },
          {
            path: "receptionist",
            select: "firstName middleName lastName employeeName",
          },
          {
            path: "client",
            select: "clientName",
          },
          {
            path: "externalClient",
            select: "registeredClientCompany",
          },
          {
            path: "bookedRoom",
            select: "name location",
            populate: {
              path: "location",
              select: "unitNo unitName building",
              populate: { path: "building", select: "buildingName" },
            },
          },
        ],
      })
      .lean()
      .exec(),
    ExternalVisits.find(dayPassFilter)
      .sort({ dateOfVisit: -1 })
        .populate({
        path: "invoiceUploadedBy",
        select: "firstName middleName lastName employeeName",
      })
      .populate({
        path: "visitorId",
        select:
          // "firstName middleName lastName registeredClientCompany brandName visitorCompany",
           "firstName middleName lastName email phoneNumber gender purposeOfVisit registeredClientCompany brandName visitorCompany state city sector gstNumber gstFile idProof otherFile",
      })
      .populate({
        path: "checkedInBy",
        select: "firstName middleName lastName employeeName",
      })
      .populate({
        path: "checkedOutBy",
        select: "firstName middleName lastName employeeName",
      })
      .populate({
        path: "unit",
        select: "unitNo unitName building",
        populate: { path: "building", select: "buildingName" },
      })
      .lean()
      .exec(),
  ]);

  // const uniqueMeetingRevenues = [];
  // const seenMeetingKeys = new Set();

  // meetingRevenues.forEach((item) => {
  //   const meetingKey =
  //     item?.meeting?._id?.toString?.() ||
  //     item?.meeting?.toString?.() ||
  //     item?._id?.toString?.();

  //   if (!meetingKey || seenMeetingKeys.has(meetingKey)) return;

  //   seenMeetingKeys.add(meetingKey);
  //   uniqueMeetingRevenues.push(item);
  // });


  const dayPassRevenues = dayPassVisits.map((visit) => {
    const visitorName = [
      visit.visitorId?.firstName,
      visit.visitorId?.middleName,
      visit.visitorId?.lastName,
    ]
      .filter(Boolean)
      .join(" ");

    return {
       _id: visit._id,
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
      discount: Number(visit.discount || 0),
      totalAmount: Number(visit.totalAmount || 0),
      date: visit.dateOfVisit,
      paymentDate: visit.paymentStatus ? visit.updatedAt : null,
      visitorDetails: {
        firstName: visit.visitorId?.firstName || "",
        lastName: visit.visitorId?.lastName || "",
        email: visit.visitorId?.email || "",
        phoneNumber: visit.visitorId?.phoneNumber || "",
        gender: visit.visitorId?.gender || "",
        purposeOfVisit: visit.purposeOfVisit || visit.visitorId?.purposeOfVisit || visit.visitorType,
        brandName: visit.visitorId?.brandName || "",
        registeredClientCompany: visit.visitorId?.registeredClientCompany || "",
        state: visit.visitorId?.state || "",
        city: visit.visitorId?.city || "",
        sector: visit.visitorId?.sector || "",
        gstNumber: visit.visitorId?.gstNumber || "",
        gstFile: visit.visitorId?.gstFile || null,
        idType: visit.visitorId?.idProof?.idType || "",
        idNumber: visit.visitorId?.idProof?.idNumber || "",
        otherFile: visit.visitorId?.otherFile || null,
        checkIn: visit.checkIn || null,
        checkOut: visit.checkOut || null,
        checkedInBy: visit.checkedInBy || null,
        checkedOutBy: visit.checkedOutBy || null,
      },
  // //     status: visit.paymentStatus ? "Paid" : "Unpaid",
  // //     paymentProof: visit.paymentProof || null,
  // //     remarks: visit.paymentMode || "-",
  // //     source: "day-pass",
  // //   };
  // // });

  // // const revenues = [...uniqueMeetingRevenues, ...dayPassRevenues].sort(
  //  status: getPaymentStatusLabel(visit.paymentStatus),
  paymentVerification: visit.paymentVerification || "Pending",
      status: getPaymentStatusLabel(visit.paymentStatus),
      paymentProof: visit.paymentProof || null,
      invoice: visit.invoice,
      invoiceUploadedAt: visit.invoiceUploadedAt,
      invoiceUploadedBy: visit.invoiceUploadedBy,
      financeStatus: visit.financeStatus,
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
      id: item._id,
      source: item.source || "meeting-revenue",
      visitorDetails: item.visitorDetails || null,
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
      discount: item.discount || 0,
      // status: item.status,
      // // financeStatus: item.financeStatus || "Upload Invoice",
      // financeStatus:
      //   item.financeStatus === "Verified"
      //     ? "Verified"
      //     : item.meeting?.paymentVerification === "Completed"
      //       ? "Upload Invoice"
      //       : "Pending",
      invoiceLink: item.invoice?.link || "",
      invoiceName: item.invoice?.name || "",
      invoiceUploadedAt: item.invoiceUploadedAt || item.invoice?.date || null,
      invoiceUploadedBy: item.invoiceUploadedBy,
      totalAmount: item.totalAmount,
      date: item.date,
      paymentDate: item.paymentDate,
      meetingRoomName: item.meetingRoomName,
      status:
        // item.source === "day-pass"
        //   ? item.status
        //   : item.meeting?.paymentStatus
        //     ? "Paid"
        //     : item.status || "Unpaid",
         item.source === "day-pass"
          ? getPaymentStatusLabel(item.status)
          : item.meeting
            ? getPaymentStatusLabel(item.meeting.paymentStatus)
            : getPaymentStatusLabel(item.status),
      paymentProofLink:
        item.source === "day-pass"
          ? item.paymentProof?.url || ""
          : item.meeting?.paymentProof?.link || "",
      paymentProofName:
        item.source === "day-pass"
          ? item.paymentProof?.name || "View File"
          : item.meeting?.paymentProof?.name || "",
            paymentVerification:
        item.paymentVerification || item.meeting?.paymentVerification || "N/A",
      //paymentVerification: item.meeting?.paymentVerification || "N/A",
      paymentMode: item.meeting?.paymentMode || item.remarks || "N/A",
      meetingTitle: item.meeting?.subject || "",
      meetingAgenda: item.meeting?.agenda || "",
      meetingStartTime: item.meeting?.startTime || null,
      meetingEndTime: item.meeting?.endTime || null,
      meetingStatus: item.meeting?.status || "N/A",
      meetingTypeRaw: item.meeting?.meetingType || item.meetingType || "N/A",
      meetingHousekeepingStatus: item.meeting?.houeskeepingStatus || "N/A",
      meetingBookedBy: item.meeting?.bookedBy || null,
      meetingReceptionist: item.meeting?.receptionist || null,
      meetingCompanyName:
        item.meeting?.client?.clientName ||
        item.meeting?.externalClient?.registeredClientCompany ||
        item.client ||
        "N/A",
      unit:
        item.source === "day-pass"
          ? item.unit
          : item.meeting?.bookedRoom?.location,
      building:
        item.source === "day-pass"
          ? item.building
          : item.meeting?.bookedRoom?.location?.building?.buildingName ||
            "N/A",
      // financeStatus: isHistoricalRevenue(item.date)
      //   ? "Verified"
      //   : item.financeStatus === "Verified"
      //     ? "Verified"
      //     : item.meeting?.paymentVerification === "Completed"
      //       ? "Upload Invoice"
      //       : "Pending",
       financeStatus: getFinanceStatus(item),
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
    // MeetingRevenue.find(
    //   buildVerticalRevenueFilter(company, dateFilter, "date", status),
    // )
     MeetingRevenue.find({
      ...buildVerticalRevenueFilter(company, dateFilter, "date", status),
      invoiceUploadedAt: { $ne: null },
    })
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
