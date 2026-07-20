import AgTable from "../../components/AgTable";
import { Chip } from "@mui/material";
import PrimaryButton from "../../components/PrimaryButton";
import { useCallback, useMemo, useState } from "react";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useQuery } from "@tanstack/react-query";
import humanTime from "../../utils/humanTime";
import humanDate from "../../utils/humanDateForamt";
import MuiModal from "../../components/MuiModal";
import DetalisFormatted from "../../components/DetalisFormatted";
import PageFrame from "../../components/Pages/PageFrame";
import YearWiseTable from "../../components/Tables/YearWiseTable";
import formatDateTime, {
  formatDateTimeFields,
} from "../../utils/formatDateTime";
import { State } from "country-state-city";
import dayjs from "dayjs";

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

const VisitorReports = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVisitor, setSelectedVisitor] = useState(null);
  const axios = useAxiosPrivate();

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
  const visitorFilters = useMemo(
    () => ({
      startDate: visitorDateRange?.startDate
        ? dayjs(visitorDateRange.startDate).startOf("day").toISOString()
        : undefined,
      endDate: visitorDateRange?.endDate
        ? dayjs(visitorDateRange.endDate).endOf("day").toISOString()
        : undefined,
    }),
    [visitorDateRange],
  );
  const handleVisitorDateFilterChange = useCallback(({ selectedRange }) => {
    if (!selectedRange?.startDate || !selectedRange?.endDate) return;

    setVisitorDateRange((currentRange) => {
      const currentStart = currentRange?.startDate
        ? new Date(currentRange.startDate).getTime()
        : null;
      const currentEnd = currentRange?.endDate
        ? new Date(currentRange.endDate).getTime()
        : null;
      const nextStart = new Date(selectedRange.startDate).getTime();
      const nextEnd = new Date(selectedRange.endDate).getTime();

      if (currentStart === nextStart && currentEnd === nextEnd) {
        return currentRange;
      }

      return selectedRange;
    });
  }, []);

  const { data: visitorsData = [], isPending: isVisitorsData } = useQuery({
    queryKey: [
      "visitor-reports",
      visitorFilters.startDate,
      visitorFilters.endDate,
    ],
    queryFn: async () => {
      const response = await axios.get("/api/visitors/fetch-visitors", {
        params: {
          filters: visitorFilters,
        },
      });
      return response.data;
    },
  });

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
      srNo: index + 1,
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
      checkInTime: formatTimeValue(visitor.checkIn),
      checkInBy: visitor.checkedInBy
        ? `${visitor.checkedInBy.firstName} ${visitor.checkedInBy.lastName}`
        : "-",
      checkOut: visitor.checkOut,
      checkOutDate: formatDateValue(visitor.checkOut),
      checkOutTime: formatTimeValue(visitor.checkOut),
      checkOutBy: visitor.checkedOutBy
        ? `${visitor.checkedOutBy.firstName} ${visitor.checkedOutBy.lastName}`
        : "-",
      rawData: visitor, // Pass full object for modal
      visitorFlag: visitor.visitorFlag || "-",
      visitorType: visitor.visitorType || "-",
      date: visitor.dateOfVisit || visitor.checkIn,
      dateOfVisit: formatDateValue(visitor.dateOfVisit || visitor.checkInDate),
      scheduledDate: formatDateValue(visitor.scheduledDate),
      gstFile: visitor?.gstFile?.link,
      otherFile: visitor?.otherFile?.link,
      panFile: visitor?.panFile?.link,
      paymentAmount:
        paymentSource?.amount ??
        paymentSource?.paymentAmount ??
        paymentSource?.totalAmount ??
        "-",
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
      registeredClientCompany: visitor?.registeredClientCompany || "-",
    };
  });

  return (
    <div className="flex flex-col gap-8 p-4">
      <PageFrame>
        <div>
          <YearWiseTable
            exportData
            dateColumn={"checkIn"}
            initialDateRange={initialVisitorDateRange}
            onDateFilterChange={handleVisitorDateFilterChange}
            search={true}
            searchColumn={"name"}
            tableTitle={"Visitor Reports"}
            data={rows}
            columns={meetingReportsColumn}
            loading={isVisitorsData}
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
