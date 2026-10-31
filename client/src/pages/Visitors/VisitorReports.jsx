import MeetingPaymentDetails from "../../components/MeetingPaymentDetails";
import { isMeetingVisit } from "../../utils/isMeetingVisit";
import DayPassPaymentDetails from "../../components/DayPassPaymentDetails";
import { getDayPassPaymentDetails } from "../../utils/dayPassPaymentDetails";
import { Tab, Tabs } from "@mui/material";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useQuery } from "@tanstack/react-query";
import humanTime from "../../utils/humanTime";
import humanDate from "../../utils/humanDateForamt";
import MuiModal from "../../components/MuiModal";
import DetalisFormatted from "../../components/DetalisFormatted";
import PageFrame from "../../components/Pages/PageFrame";
import YearWiseTable from "../../components/Tables/YearWiseTable";
import { formatDateTimeFields } from "../../utils/formatDateTime";
import { State } from "country-state-city";
import dayjs from "dayjs";
import {
  DEFAULT_PAGE_SIZE,
  PAGE_SIZE_OPTIONS,
} from "../../constants/pagination";

const getStateName = (stateValue) => {
  if (!stateValue) return "-";

  const normalizedStateValue = String(stateValue).trim();
  const state = State.getStateByCodeAndCountry(
    normalizedStateValue.toUpperCase(),
    "IN",
  );

  return state?.name || normalizedStateValue;
};

const formatDateValue = (value) => {
  if (!value) return "-";
  const formattedValue = humanDate(value);
  return formattedValue === "N/A" || formattedValue === "â€”"
    ? "-"
    : formattedValue;
};

const formatTimeValue = (value) => {
  if (!value) return "-";
  const formattedValue = humanTime(value);
  return formattedValue === "Invalid date" || formattedValue === "â€”"
    ? "-"
    : formattedValue;
};
const toUtcDayBoundary = (value, endOfDay = false) => {
  const date = dayjs(value);

  return new Date(
    Date.UTC(
      date.year(),
      date.month(),
      date.date(),
      endOfDay ? 23 : 0,
      endOfDay ? 59 : 0,
      endOfDay ? 59 : 0,
      endOfDay ? 999 : 0,
    ),
  ).toISOString();
};

const VisitorReports = () => {
  const axios = useAxiosPrivate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVisitor, setSelectedVisitor] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: DEFAULT_PAGE_SIZE,
    total: 0,
  });

  const [visitorSearch, setVisitorSearch] = useState("");
  const [debouncedVisitorSearch, setDebouncedVisitorSearch] = useState("");

  const handleVisitorSearchChange = (value) => {
    setVisitorSearch(value);
    setPagination((current) => ({ ...current, page: 1 }));
  };

  const initialVisitorDateRange = useMemo(
    () => ({
      startDate: dayjs().startOf("month").toDate(),
      endDate: dayjs().endOf("month").toDate(),
      key: "selection",
    }),
    [],
  );
  const [visitorDateRange, setVisitorDateRange] = useState(
    initialVisitorDateRange,
  );
  const visitorDateRangeRef = useRef(initialVisitorDateRange);
  const visitorFilters = useMemo(
    () => ({
      startDate: visitorDateRange?.startDate
        ? toUtcDayBoundary(visitorDateRange.startDate)
        : undefined,
      endDate: visitorDateRange?.endDate
        ? toUtcDayBoundary(visitorDateRange.endDate, true)
        : undefined,
    }),
    [visitorDateRange],
  );
  const handleVisitorDateFilterChange = useCallback(({ selectedRange }) => {
    if (!selectedRange?.startDate || !selectedRange?.endDate) return;

    // setVisitorDateRange((currentRange) => {
    //   const currentStart = currentRange?.startDate
    //     ? new Date(currentRange.startDate).getTime()
    //     : null;
    //   const currentEnd = currentRange?.endDate
    //     ? new Date(currentRange.endDate).getTime()
    //     : null;
    //   const nextStart = new Date(selectedRange.startDate).getTime();
    //   const nextEnd = new Date(selectedRange.endDate).getTime();

    //   if (currentStart === nextStart && currentEnd === nextEnd) {
    //     return currentRange;
    //   }

    //   return selectedRange;
    // });
    const currentRange = visitorDateRangeRef.current;
    const currentStart = currentRange?.startDate
      ? new Date(currentRange.startDate).getTime()
      : null;
    const currentEnd = currentRange?.endDate
      ? new Date(currentRange.endDate).getTime()
      : null;
    const nextStart = new Date(selectedRange.startDate).getTime();
    const nextEnd = new Date(selectedRange.endDate).getTime();

    if (currentStart === nextStart && currentEnd === nextEnd) return;

    visitorDateRangeRef.current = selectedRange;
    setVisitorDateRange(selectedRange);
    setPagination((current) => ({ ...current, page: 1 }));
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(
      () => setDebouncedVisitorSearch(visitorSearch.trim()),
      400,
    );
    return () => clearTimeout(timeoutId);
  }, [visitorSearch]);

  const { data: visitorReportResponse, isPending: isVisitorsData } = useQuery({
    queryKey: [
      "visitor-reports",
      visitorFilters.startDate,
      visitorFilters.endDate,
      pagination.page,
      pagination.limit,
      debouncedVisitorSearch,
      activeTab,
    ],
    queryFn: async () => {
      const response = await axios.get("/api/visitors/fetch-visitors", {
        params: {
          filters: visitorFilters,
          page: pagination.page,
          limit: pagination.limit,
          search: debouncedVisitorSearch || undefined,
          searchContext: "visitor-reports",
          visitScope: activeTab === 1 ? "meeting" : undefined,
        },
      });
      return response.data;
    },
  });

  const visitorsData = Array.isArray(visitorReportResponse)
    ? visitorReportResponse
    : visitorReportResponse?.data || [];

  useEffect(() => {
    const responsePagination = visitorReportResponse?.pagination;
    if (!responsePagination) return;

    setPagination((current) => {
      const nextPagination = {
        page: Number(responsePagination.page) || current.page,
        limit: Number(responsePagination.limit) || current.limit,
        total: Number(responsePagination.total) || 0,
      };

      return current.page === nextPagination.page &&
        current.limit === nextPagination.limit &&
        current.total === nextPagination.total
        ? current
        : nextPagination;
    });
  }, [visitorReportResponse]);

  const handleDetailsClick = (visitor) => {
    setSelectedVisitor(formatDateTimeFields(visitor));
    setIsModalOpen(true);
  };

  const meetingReportsColumn = [
    { field: "srNo", headerName: "Sr No" },
    //{ field: "firstName", headerName: "First Name", hide: true },
    //{ field: "lastName", headerName: "Last Name", hide: true },
    {
      field: "name",
      headerName: "Name",
      cellRenderer: (params) => (
        <div role="button" onClick={() => handleDetailsClick(params.data)}>
          <span className="underline text-primary cursor-pointer">
            {params.value}
          </span>
        </div>
      ),
    },
    { field: "visitorType", headerName: "Type" },
    { field: "registeredClientCompany", headerName: "Client Company" },
    { field: "purpose", headerName: "Purpose" },
    { field: "toMeet", headerName: "To Meet" },
    {
      field: "dateOfVisit",
      headerName: "Date Of Visit",
    },
    { field: "gender", headerName: "Gender", hide: true },
    { field: "building", headerName: "Building", hide: true },
    { field: "unit", headerName: "Unit", hide: true },
    // { field: "buildingName", headerName: "Building Name", hide: true },
    //{ field: "unitNo", headerName: "Unit No", hide: true },
    { field: "unitName", headerName: "Unit Name", hide: true },
    { field: "visitorCompany", headerName: "Visitor Company", hide: true },
    { field: "brandName", headerName: "Brand Name", hide: true },
    { field: "toMeetCompany", headerName: "Company To Meet", hide: true },
    // {
    //   field: "toMeetCompanyClientName",
    //   headerName: "To Meet Company - Client Name",
    //   hide: true,
    // },
    // {
    //   field: "clientToMeetEmployeeName",
    //   headerName: "Client To Meet - Employee Name",
    //   hide: true,
    // },
    { field: "department", headerName: "Department", hide: true },
    { field: "city", headerName: "City", hide: true },
    { field: "state", headerName: "State", hide: true },
    { field: "sector", headerName: "Sector", hide: true },
    { field: "idProofType", headerName: "ID Type", hide: true },
    { field: "idProofNumber", headerName: "ID Number", hide: true },
    { field: "gstNumber", headerName: "GST Number", hide: true },
    { field: "gstFile", headerName: "GST File", hide: true },
    { field: "panNumber", headerName: "PAN Number", hide: true },
    { field: "panFile", headerName: "Pan File", hide: true },
    { field: "otherFile", headerName: "Other File", hide: true },
    { field: "email", headerName: "Email" },
    { field: "phone", headerName: "Phone No" },

    {
      field: "scheduledDate",
      headerName: "Scheduled Date",
      hide: true,
    },
    { field: "checkInDate", headerName: "Check In Date", hide: true },

    {
      field: "checkInTime",
      headerName: "Check In Time",
    },
    {
      field: "checkInBy",
      headerName: "Checked In By",
    },
    { field: "checkOutDate", headerName: "Check Out Date", hide: true },
    {
      field: "checkOutTime",
      headerName: "Check Out Time",
    },
    {
      field: "checkOutBy",
      headerName: "Checked Out By",
    },
    { field: "paymentAmount", headerName: "Amount", hide: true },
    { field: "discountAmount", headerName: "Discount", hide: true },
    { field: "gstAmount", headerName: "Gst Amount", hide: true },
    { field: "totalAmount", headerName: "Total Amount", hide: true },
    { field: "paymentStatus", headerName: "Payment Status", hide: true },
    {
      field: "paymentVerification",
      headerName: "Payment Verification",
      hide: true,
    },
    { field: "paymentMode", headerName: "Payment Mode", hide: true },
    {
      field: "paymentProofUrl",
      headerName: "Payment Proof - Url",
      hide: true,
    },

    // {
    //   field: "actions",
    //   headerName: "Actions",
    //   cellRenderer: (params) => (
    //     <div className="p-2">
    //       <PrimaryButton
    //         title={"View Details"}
    //         handleSubmit={() => handleDetailsClick(params.data)}
    //       />
    //     </div>
    //   ),
    // },
  ];

  const meetingVisitsColumns = [
    { field: "srNo", headerName: "Sr No", width: 90 },
    {
      field: "name",
      headerName: "Visitor Name",
      minWidth: 180,
      cellRenderer: (params) => (
        <button
          type="button"
          className="cursor-pointer text-primary underline"
          onClick={() => handleDetailsClick(params.data)}
        >
          {params.value}
        </button>
      ),
    },
    {
      field: "registeredClientCompany",
      headerName: "Client Company",
      minWidth: 180,
    },
    { field: "phone", headerName: "Phone No", minWidth: 140 },
    {
      field: "meetingSubject",
      headerName: "Meeting Subject",
      minWidth: 200,
    },
    {
      field: "meetingAgenda",
      headerName: "Meeting Agenda",
      minWidth: 200,
    },
    { field: "meetingRoom", headerName: "Meeting Room", minWidth: 150 },
    { field: "meetingBuilding", headerName: "Building", minWidth: 150 },
    { field: "meetingUnit", headerName: "Unit", minWidth: 140 },
    { field: "meetingDate", headerName: "Meeting Date", minWidth: 140 },
    {
      field: "meetingStartTime",
      headerName: "Start Time",
      minWidth: 130,
    },
    { field: "meetingEndTime", headerName: "End Time", minWidth: 130 },
    {
      field: "meetingStatus",
      headerName: "Meeting Status",
      minWidth: 150,
    },
    { field: "meetingType", headerName: "Meeting Type", minWidth: 140 },
    { field: "checkInTime", headerName: "Check In Time", minWidth: 140 },
    { field: "checkOutTime", headerName: "Check Out Time", minWidth: 150 },
    { field: "paymentStatus", headerName: "Payment Status", minWidth: 150 },
    {
      field: "paymentVerification",
      headerName: "Payment Verification",
      minWidth: 180,
    },
    { field: "paymentMode", headerName: "Payment Mode", minWidth: 140 },
    { field: "totalAmount", headerName: "Total Amount", minWidth: 140 },
  ];

  // Format table rows for AgTable

  // const rows = visitorsData.map((visitor, index) => ({
  //   srNo: index + 1,
  //   name: `${visitor.firstName || ""} ${visitor.lastName || ""}`,
  //   address: visitor.address || "-",
  //   email: visitor.email || "-",
  //   phone: visitor.phoneNumber || "-",
  //   purpose: visitor.purposeOfVisit || "-",
  //   toMeet: visitor.toMeet
  //     ? `${visitor.toMeet?.firstName} ${visitor.toMeet?.lastName}`
  //     : visitor.clientToMeet
  //     ? visitor?.clientToMeet?.employeeName
  //     : "",
  //   checkIn: visitor.checkIn,
  //   checkInTime: humanTime(visitor.checkIn),
  //   checkOut: visitor.checkOut,
  //   checkOutTime: humanTime(visitor.checkOut),
  //   rawData: visitor, // Pass full object for modal
  //   visitorType: visitor.visitorFlag || "-",
  //   date: visitor.checkIn,
  //   dateOfVisit: visitor.checkIn,
  // }));

  const rows = visitorsData.map((visitor, index) => {
    const visitRecords = Array.isArray(visitor?.externalVisits)
      ? visitor.externalVisits
      : [];

    const latestVisit = [...visitRecords].sort((a, b) => {
      const aTime = new Date(
        a?.checkIn || a?.dateOfVisit || a?.createdAt || 0,
      ).getTime();
      const bTime = new Date(
        b?.checkIn || b?.dateOfVisit || b?.createdAt || 0,
      ).getTime();
      return bTime - aTime;
    })[0];

    const paymentSource = latestVisit || visitor;
    const meeting = paymentSource?.meeting || visitor?.meeting || null;
    const meetingRoom = meeting?.bookedRoom || null;
    const meetingLocation = meetingRoom?.location || null;
    const effectiveMeetingEndTime =
      meeting?.extendTime &&
      new Date(meeting.extendTime).getTime() >
        new Date(meeting?.endTime || 0).getTime()
        ? meeting.extendTime
        : meeting?.endTime;
    const toMeetName = visitor.toMeet
      ? `${visitor.toMeet?.firstName} ${visitor.toMeet?.lastName}`
      : visitor.clientToMeet
        ? visitor?.clientToMeet?.employeeName
        : "-";

    const toMeetCompany =
      visitor.toMeetCompany === "6799f0cd6a01edbe1bc3fcea"
        ? "BIZNest"
        : visitor?.toMeetCompany?.clientName ||
          visitor?.toMeetCompany?.companyName ||
          visitor?.toMeetCompany?.name ||
          visitor?.toMeetCompany?.company?.companyName ||
          visitor?.toMeetCompany ||
          "-";

    const buildingName =
      visitor?.building?.buildingName || visitor?.building || "-";
    const unitNo = visitor?.unit?.unitNo || "-";
    const unitName = visitor?.unit?.unitName || visitor?.unit || "-";

    return {
      srNo: (pagination.page - 1) * pagination.limit + index + 1,
      firstName: visitor.firstName || "-",
      lastName: visitor.lastName || "-",
      name:
        `${visitor.firstName || ""} ${visitor.lastName || ""}`.trim() || "-",
      gender: visitor.gender || "-",
      building: buildingName,
      unit:
        visitor?.unit?.unitNo ||
        visitor?.unit?.unitName ||
        visitor?.unit ||
        "-",
      buildingName,
      unitNo,
      unitName,
      email: visitor.email || "-",
      phone: visitor.phoneNumber || "-",
      purpose: visitor.purposeOfVisit || "-",
      toMeet: toMeetName,
      toMeetCompany,
      toMeetCompanyClientName:
        visitor?.toMeetCompany?.clientName ||
        visitor?.toMeetCompany?.companyName ||
        visitor?.toMeetCompany?.name ||
        "-",
      clientToMeetEmployeeName: visitor?.clientToMeet?.employeeName || "-",
      visitorCompany: visitor.visitorCompany || "-",
      brandName: visitor?.brandName || "-",
      department: visitor.department?.name || "-",
      city: visitor?.city || visitor?.hoCity || "-",
      state: getStateName(visitor?.state || visitor?.hoState),
      sector: visitor?.sector || "-",
      idProofType: visitor.idProof?.idType || "-",
      idProofNumber: visitor.idProof?.idNumber || "-",
      panNumber: visitor.panNumber || "-",
      gstNumber: visitor.gstNumber || "-",
      checkIn: visitor.checkIn,
      checkInDate: formatDateValue(visitor.checkIn),
      checkInTime:
        visitor.checkIn || activeTab === 0
          ? formatTimeValue(visitor.checkIn)
          : "Not recorded",
      checkInBy: visitor.checkedInBy
        ? `${visitor.checkedInBy.firstName} ${visitor.checkedInBy.lastName}`
        : activeTab === 1
          ? "Not recorded"
          : "-",
      checkOut: visitor.checkOut,
      checkOutDate: formatDateValue(visitor.checkOut),
      checkOutTime:
        visitor.checkOut || activeTab === 0
          ? formatTimeValue(visitor.checkOut)
          : "Not recorded",
      checkOutBy: visitor.checkedOutBy
        ? `${visitor.checkedOutBy.firstName} ${visitor.checkedOutBy.lastName}`
        : activeTab === 1
          ? "Not recorded"
          : "-",
      rawData: visitor, // Pass full object for modal
      visitorFlag: visitor.visitorFlag || "-",
      visitorType: visitor.visitorType || "-",
      date: visitor.checkIn,
      // The report is queried and paginated by check-in, so show that same DB
      // value instead of a separately scheduled visit date.
      dateOfVisit: formatDateValue(visitor.dateOfVisit || visitor.checkIn),
      scheduledDate: formatDateValue(visitor.scheduledDate),
      gstFile: visitor?.gstFile?.link,
      otherFile: visitor?.otherFile?.link,
      panFile: visitor?.panFile?.link,
      isMeeting: isMeetingVisit(paymentSource),
      meetingPaymentDetails: paymentSource.meetingPaymentDetails,
      meeting,
      meetingSubject: meeting?.subject || "-",
      meetingAgenda: meeting?.agenda || "-",
      meetingRoom: meetingRoom?.name || "-",
      meetingBuilding: meetingLocation?.building?.buildingName || "-",
      meetingUnit:
        meetingLocation?.unitNo || meetingLocation?.unitName
          ? [meetingLocation?.unitNo, meetingLocation?.unitName]
              .filter(Boolean)
              .join(" - ")
          : "-",
      meetingDate: formatDateValue(meeting?.startDate || meeting?.startTime),
      meetingStartTime: formatTimeValue(meeting?.startTime),
      meetingEndTime: formatTimeValue(effectiveMeetingEndTime),
      meetingStatus: meeting?.status || "-",
      meetingType: meeting?.meetingType || "-",
      meetingParticipants: Array.isArray(meeting?.externalParticipants)
        ? meeting.externalParticipants
            .map((participant) =>
              [participant?.name, participant?.mobileNumber]
                .filter(Boolean)
                .join(" - "),
            )
            .filter(Boolean)
            .join(", ") || "-"
        : "-",
      paymentDetails: getDayPassPaymentDetails(paymentSource),
      paymentAmount:
        paymentSource?.amount ??
        paymentSource?.paymentAmount ??
        paymentSource?.totalAmount ??
        "-",
      deskAmount: paymentSource?.amount ?? "-",
      taxableAmount:
        paymentSource?.amount != null
          ? Math.max(
              Number(paymentSource.amount) - Number(paymentSource.discount ?? 0),
              0,
            )
          : "-",
      discountAmount:
        paymentSource?.discount ?? paymentSource?.discountAmount ?? "-",
      gstAmount: paymentSource?.gstAmount ?? "-",
      totalAmount: paymentSource?.totalAmount ?? "-",
      paymentStatus:
        typeof paymentSource?.paymentStatus === "boolean"
          ? paymentSource.paymentStatus
            ? "true"
            : "false"
          : paymentSource?.paymentStatus || "-",
      paymentVerification: paymentSource?.paymentVerification || "-",
      paymentMode: paymentSource?.paymentMode || "-",
      paymentProofUrl:
        paymentSource?.paymentProof?.url ||
        paymentSource?.paymentProof?.link ||
        visitor?.paymentProof?.url ||
        visitor?.paymentProof?.link ||
        "-",
      registeredClientCompany:
        visitor?.registeredClientCompany ||
        visitor?.visitorCompany ||
        visitor?.brandName ||
        "-",
    };
  });

  return (
    <div className="flex flex-col gap-4 p-4">
      <Tabs
        value={activeTab}
        onChange={(_, value) => {
          setActiveTab(value);
          setPagination((current) => ({ ...current, page: 1, total: 0 }));
        }}
        variant="fullWidth"
        TabIndicatorProps={{ style: { display: "none" } }}
        sx={{
          backgroundColor: "white",
          borderRadius: 2,
          border: "1px solid #d1d5db",
          overflow: "hidden",
          "& .MuiTab-root": {
            textTransform: "none",
            fontWeight: 500,
            padding: "12px 16px",
            color: "#1E3D73",
            borderRight: "1px solid #d1d5db",
          },
          "& .MuiTab-root:last-of-type": {
            borderRight: "none",
          },
          "& .Mui-selected": {
            backgroundColor: "#1E3D73",
            color: "white !important",
          },
        }}
      >
        <Tab label="All Visits" />
        <Tab label="Meeting Visits" />
      </Tabs>

      <PageFrame>
        <div>
          <YearWiseTable
            key={activeTab}
            exportData
            dateColumn={"checkIn"}
            initialDateRange={initialVisitorDateRange}
            onDateFilterChange={handleVisitorDateFilterChange}
            search={true}
            searchColumn={"name"}
            tableTitle={activeTab === 0 ? "All Visits" : "Meeting Visits"}
            data={rows}
            columns={
              activeTab === 0 ? meetingReportsColumn : meetingVisitsColumns
            }
            loading={isVisitorsData}
            serverPagination
            pageSizeOptions={PAGE_SIZE_OPTIONS}
            paginationPageSize={pagination.limit}
            paginationPage={pagination.page}
            paginationTotal={pagination.total}
            onPaginationPageChange={(page) =>
              setPagination((current) => ({ ...current, page }))
            }
            onPaginationPageSizeChange={(limit) =>
              setPagination((current) =>
                current.limit === limit
                  ? current
                  : { ...current, page: 1, limit },
              )
            }
            serverSearch
            searchValue={visitorSearch}
            onSearchChange={handleVisitorSearchChange}
          />
        </div>
      </PageFrame>

      <MuiModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Visitor Details"
      >
        {selectedVisitor && (
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-4">
            <div className="font-bold">Personal Information</div>
            <DetalisFormatted title="Name" detail={selectedVisitor.name} />
            <DetalisFormatted
              title="Visitor Type"
              detail={selectedVisitor.visitorType}
            />
            <DetalisFormatted title="Gender" detail={selectedVisitor.gender} />
            <DetalisFormatted title="Phone" detail={selectedVisitor.phone} />
            <DetalisFormatted title="Email" detail={selectedVisitor.email} />
            <DetalisFormatted
              title="Building"
              detail={
                selectedVisitor?.building?.buildingName ||
                selectedVisitor?.building ||
                "-"
              }
            />
            <DetalisFormatted
              title="Unit"
              detail={
                selectedVisitor?.unit?.unitNo ||
                selectedVisitor?.unit?.unitName ||
                selectedVisitor?.unit ||
                "-"
              }
            />
            {selectedVisitor.visitorFlag !== "Client" && (
              <DetalisFormatted
                title="Visitor Company"
                detail={selectedVisitor.visitorCompany}
              />
            )}
            <br />
            <div className="font-bold">Visit Details</div>

            {selectedVisitor.visitorFlag !== "Client" && (
              <>
                <DetalisFormatted
                  title="To Meet"
                  detail={selectedVisitor.toMeet}
                />
                <DetalisFormatted
                  title="Company To Meet"
                  detail={selectedVisitor.toMeetCompany}
                />
                {selectedVisitor.toMeetCompany === "BIZNest" && (
                  <DetalisFormatted
                    title="Department"
                    detail={selectedVisitor.department}
                  />
                )}
              </>
            )}

            <DetalisFormatted
              title="Purpose"
              detail={selectedVisitor.purpose}
            />
            {selectedVisitor.visitorFlag === "Client" && (
              <>
                <DetalisFormatted
                  title="ID Type"
                  detail={selectedVisitor.idProofType}
                />

                <DetalisFormatted
                  title="ID Number"
                  detail={selectedVisitor.idProofNumber}
                />

                <DetalisFormatted
                  title="GST Number"
                  detail={selectedVisitor.gstNumber}
                />

                <DetalisFormatted
                  title="GST File"
                  detail={
                    selectedVisitor.gstFile ? (
                      <a
                        href={selectedVisitor.gstFile}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline"
                      >
                        File
                      </a>
                    ) : (
                      "-"
                    )
                  }
                />
                <DetalisFormatted
                  title="PAN Number"
                  detail={selectedVisitor.panNumber}
                />

                <DetalisFormatted
                  title="PAN File"
                  detail={
                    selectedVisitor.panFile ? (
                      <a
                        href={selectedVisitor.panFile}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline"
                      >
                        File
                      </a>
                    ) : (
                      "-"
                    )
                  }
                />

                <DetalisFormatted
                  title="Other File"
                  detail={
                    selectedVisitor.otherFile ? (
                      <a
                        href={selectedVisitor.otherFile}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline"
                      >
                        File
                      </a>
                    ) : (
                      "-"
                    )
                  }
                />
              </>
            )}
            <DetalisFormatted
              title="Check In"
              detail={selectedVisitor.checkInTime}
            />
            <DetalisFormatted
              title="Checked In By"
              detail={selectedVisitor.checkInBy}
            />
            <DetalisFormatted
              title="Check Out"
              detail={
                selectedVisitor.checkOutTime ||
                selectedVisitor.rawData?.checkOut ||
                "-"
              }
            />
            <DetalisFormatted
              title="Checked Out By"
              detail={
                selectedVisitor.checkOutBy ||
                (selectedVisitor.rawData?.checkedOutBy
                  ? `${selectedVisitor.rawData.checkedOutBy.firstName || ""} ${selectedVisitor.rawData.checkedOutBy.lastName || ""}`.trim()
                  : "-")
              }
            />
            <DetalisFormatted
              title="Date of Visit"
              detail={selectedVisitor.dateOfVisit}
            />
            <DetalisFormatted
              title="Scheduled Date"
              detail={selectedVisitor.scheduledDate}
            />
            {selectedVisitor.isMeeting && selectedVisitor.meeting && (
              <>
                <br />
                <div className="font-bold">Meeting Details</div>
                <DetalisFormatted
                  title="Subject"
                  detail={selectedVisitor.meetingSubject}
                />
                <DetalisFormatted
                  title="Agenda"
                  detail={selectedVisitor.meetingAgenda}
                />
                <DetalisFormatted
                  title="Meeting Room"
                  detail={selectedVisitor.meetingRoom}
                />
                <DetalisFormatted
                  title="Building"
                  detail={selectedVisitor.meetingBuilding}
                />
                <DetalisFormatted
                  title="Unit"
                  detail={selectedVisitor.meetingUnit}
                />
                <DetalisFormatted
                  title="Meeting Date"
                  detail={selectedVisitor.meetingDate}
                />
                <DetalisFormatted
                  title="Start Time"
                  detail={selectedVisitor.meetingStartTime}
                />
                <DetalisFormatted
                  title="End Time"
                  detail={selectedVisitor.meetingEndTime}
                />
                <DetalisFormatted
                  title="Meeting Status"
                  detail={selectedVisitor.meetingStatus}
                />
                <DetalisFormatted
                  title="Meeting Type"
                  detail={selectedVisitor.meetingType}
                />
                <DetalisFormatted
                  title="External Participants"
                  detail={selectedVisitor.meetingParticipants}
                />
              </>
            )}
            {(selectedVisitor.isMeeting || selectedVisitor.visitorFlag === "Client" ||
              ["Full-Day Pass", "Half-Day Pass", "Meeting"].includes(
                selectedVisitor.visitorType,
              )) && (
              selectedVisitor.isMeeting ? (
                <MeetingPaymentDetails revenue={selectedVisitor.meetingPaymentDetails} />
              ) : (
                <DayPassPaymentDetails revenue={selectedVisitor.paymentDetails} />
              )
            )}
            {selectedVisitor.rawData?.image?.url && (
              <div className="lg:col-span-2">
                <img
                  src={selectedVisitor.rawData.image.url}
                  alt="Visitor Attachment"
                  className="max-w-full max-h-96 rounded border"
                />
              </div>
            )}
          </div>
        )}
      </MuiModal>
    </div>
  );
};

export default VisitorReports;
