import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { inrFormat } from "../../../utils/currencyFormat";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { CircularProgress, MenuItem, TextField } from "@mui/material";
import WidgetTable from "../../../components/Tables/WidgetTable";
import StatusChip from "../../../components/StatusChip";
import FyBarGraph from "../../../components/graphs/FyBarGraph";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import MuiModal from "../../../components/MuiModal";
import DetalisFormatted from "../../../components/DetalisFormatted";
import humanDate from "../../../utils/humanDateForamt";
import ThreeDotMenu from "../../../components/ThreeDotMenu";
import UploadFileInput from "../../../components/UploadFileInput";
import PrimaryButton from "../../../components/PrimaryButton";
import dayjs from "dayjs";

// const MeetingRevenue = () => {
//   const axios = useAxiosPrivate();

//   const {
//     data: meetingsData = [],
//     isLoading: isMeetingsLoading,
//     isError,
//     error,
//   } = useQuery({
//     queryKey: ["meetings-revenue"],
//     queryFn: async () => {
//       const response = await axios.get("/api/sales/get-meeting-revenue");
//       return Array.isArray(response.data) ? response.data : [];
//     },
//   });

//   const graphData = isMeetingsLoading
//     ? []
//     : meetingsData.flatMap((item) => item.revenue);

//   const hasData = Array.isArray(meetingsData) && meetingsData.length > 0;

const MONTH_INDEX_MAP = {
  Jan: 0,
  Feb: 1,
  Mar: 2,
  Apr: 3,
  May: 4,
  Jun: 5,
  Jul: 6,
  Aug: 7,
  Sep: 8,
  Oct: 9,
  Nov: 10,
  Dec: 11,
};

const getNormalizedPaymentStatus = (status) =>
  String(status || "")
    .trim()
    .toLowerCase();

const getNumericAmount = (value) =>
  parseFloat(String(value || "0").replace(/,/g, "")) || 0;

const getUnitLabel = (unit) => {
  if (!unit) return "N/A";
  if (typeof unit === "string") return unit;
  return unit.unitNo || unit.unitName || "N/A";
};

const getCurrentFinancialYearLabel = () => {
  const today = new Date();
  const startYear =
    today.getMonth() < 3 ? today.getFullYear() - 1 : today.getFullYear();

  return `FY ${startYear}-${String((startYear + 1) % 100).padStart(2, "0")}`;
};

const getFinancialYear = (dateValue) => {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return null;

  const startYear =
    date.getMonth() < 3 ? date.getFullYear() - 1 : date.getFullYear();
  return `FY ${startYear}-${String((startYear + 1) % 100).padStart(2, "0")}`;
};

const getUserDisplayName = (user) => {
  if (!user) return "";
  if (typeof user === "string") return user;
  return (
    user.employeeName ||
    [user.firstName, user.middleName, user.lastName].filter(Boolean).join(" ")
  );
};

const formatMeetingTimeRange = (startTime, endTime) => {
  const start = dayjs(startTime);
  const end = dayjs(endTime);

  if (!start.isValid() || !end.isValid()) return "N/A";

  return `${start.format("h:mm a")} - ${end.format("h:mm a")}`;
};

const formatMeetingDuration = (startTime, endTime, fallbackHours) => {
  const start = dayjs(startTime);
  const end = dayjs(endTime);

  if (start.isValid() && end.isValid() && end.isAfter(start)) {
    const minutes = end.diff(start, "minute");
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0
      ? `${hours}h ${remainingMinutes}min`
      : `${hours}h`;
  }

  const numericHours = Number(fallbackHours || 0);
  if (!Number.isFinite(numericHours) || numericHours <= 0) return "N/A";
  if (numericHours < 1) return `${Math.round(numericHours * 60)}min`;
  return `${numericHours}h`;
};

// const MeetingRevenue = () => {
  // const MeetingRevenue = ({ showChart = true }) => {
  // const axios = useAxiosPrivate();
  // const [selectedFY, setSelectedFY] = useState(getCurrentFinancialYearLabel());
  // const [selectedRevenue, setSelectedRevenue] = useState(null);

  const MeetingRevenue = ({ showChart = true }) => {
  const axios = useAxiosPrivate();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [selectedFY, setSelectedFY] = useState(getCurrentFinancialYearLabel());
  const [selectedRevenue, setSelectedRevenue] = useState(null);
  const [editingRevenue, setEditingRevenue] = useState(null);
  const [invoiceFile, setInvoiceFile] = useState(null);
  const [financeStatus, setFinanceStatus] = useState("Pending");
 // const [financeStatus, setFinanceStatus] = useState("Upload Invoice");

  const {
    data: meetingsData = [],
    isLoading: isMeetingsLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["meetings-revenue"],
    queryFn: async () => {
      const response = await axios.get("/api/sales/get-meeting-revenue");
      return Array.isArray(response.data) ? response.data : [];
    },
  });

  const hasData = Array.isArray(meetingsData) && meetingsData.length > 0;
  const tableData = meetingsData.map((monthData) => ({
    revenue: monthData?.revenue?.map((client) => ({
      ...client,
      particulars: client.particulars || "-",
      meetingType: client.meetingType || "N/A",
      unitsOrHours: client.unitsOrHours ?? "-",
      taxable: client.taxable ?? 0,
      gst: client.gst ?? 0,
      totalAmount: client.totalAmount ?? 0,
      date: client.date,
      paymentDate: client.paymentDate,
      normalizedStatus: getNormalizedPaymentStatus(client.status),
      normalizedFinanceStatus: getNormalizedPaymentStatus(client.financeStatus),
      hasUploadedInvoice: Boolean(client.invoiceUploadedAt || client.invoiceLink),
      paymentProofLink: client.paymentProofLink || "",
      paymentProofName: client.paymentProofName || "",
      paymentVerification: client.paymentVerification || "N/A",
      paymentMode: client.paymentMode || "N/A",
      meetingTitle: client.meetingTitle || "",
      meetingAgenda: client.meetingAgenda || "",
      meetingStartTime: client.meetingStartTime || null,
      meetingEndTime: client.meetingEndTime || null,
      meetingStatus: client.meetingStatus || "N/A",
      meetingTypeRaw: client.meetingTypeRaw || client.meetingType || "N/A",
      meetingHousekeepingStatus: client.meetingHousekeepingStatus || "N/A",
      meetingBookedByName: getUserDisplayName(client.meetingBookedBy),
      meetingReceptionistName: getUserDisplayName(client.meetingReceptionist),
      meetingCompanyName: client.meetingCompanyName || client.clientName || "N/A",
      meetingLocationLabel:
        client.unit?.unitNo && client.unit?.unitName
          ? `${client.unit.unitNo} (${client.unit.unitName})`
          : getUnitLabel(client.unit),
      meetingTimeLabel: formatMeetingTimeRange(
        client.meetingStartTime,
        client.meetingEndTime,
      ),
      meetingDurationLabel: formatMeetingDuration(
        client.meetingStartTime,
        client.meetingEndTime,
        client.hoursBooked,
      ),
      invoiceUploadedBy: client.invoiceUploadedBy || null,
      invoiceUploadedByName: getUserDisplayName(client.invoiceUploadedBy),
      remarks: client.remarks || "-",
    })),
  }));

  //const flattenedRevenueData = tableData.flatMap((month) => month.revenue);
  const allRevenueData = tableData.flatMap((month) => month.revenue);
  const isVerifiedFinanceRow = (item) =>
    item?.normalizedFinanceStatus === "verified";
  const flattenedRevenueData = showChart
    ? allRevenueData.filter(isVerifiedFinanceRow)
    : allRevenueData;

  const updateInvoice = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append("financeStatus", financeStatus);
      if (invoiceFile) formData.append("client-invoice", invoiceFile);
      return axios.patch(
        `/api/sales/update-meeting-revenue/${editingRevenue.id}`,
        formData,
      );
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["meetings-revenue"] });
      setEditingRevenue(null);
      setInvoiceFile(null);
    },
  });

  const openEditModal = (row) => {
    setEditingRevenue(row);
    setFinanceStatus(row.financeStatus || "Pending");
   // setFinanceStatus(row.financeStatus || "Upload Invoice");
    setInvoiceFile(null);
  };
  const formatDateValue = (value) => {
    if (!value) return "-";
    const date = dayjs(value);
    return date.isValid() ? date.format("DD-MM-YYYY") : "-";
  };
  const formatNumberValue = (value) => {
    if (value === 0) return "0";
    if (value === null || value === undefined || value === "") return "-";
    const numericValue = Number(String(value).replace(/,/g, ""));
    return Number.isNaN(numericValue)
      ? String(value)
      : numericValue.toLocaleString("en-IN");
  };
  const editableInvoiceFile =
    invoiceFile ||
    (editingRevenue?.invoiceLink
      ? {
          name: editingRevenue?.invoiceName || "Uploaded Invoice",
          url: editingRevenue.invoiceLink,
        }
      : null);
  const clientLabel = editingRevenue?.clientName || editingRevenue?.client || "-";
  const meetingTypeLabel = editingRevenue?.meetingType || "-";
  const meetingRoomLabel = editingRevenue?.meetingRoomName || "-";
  const hoursBookedLabel =
    editingRevenue?.hoursBooked || editingRevenue?.unitsOrHours || "-";
  const isUpdateDisabled = updateInvoice.isPending;

  const graphData = useMemo(
    () =>
      isMeetingsLoading
        ? []
        : flattenedRevenueData
            .filter(isVerifiedFinanceRow)
            .map((item) => ({
              date: item.date,
              taxable: getNumericAmount(item.taxable),
              vertical: "Meeting",
            })),
    [flattenedRevenueData, isMeetingsLoading],
  );
  const selectedFiscalYearRevenue = useMemo(
    () =>
      graphData.filter((item) => getFinancialYear(item.date) === selectedFY),
    [graphData, selectedFY],
  );
  const maxMeetingAmount = useMemo(
    () =>
      selectedFiscalYearRevenue.reduce(
        (max, item) => Math.max(max, getNumericAmount(item.taxable)),
        0,
      ),
    [selectedFiscalYearRevenue],
  );
  const useLakhsScale = maxMeetingAmount >= 100000;
  const options = {
    dataLabels: {
      enabled: true,
      formatter: function (val) {
        return `${inrFormat(val)}`;
      },
      style: {
        fontSize: "10px",
        fontWeight: "bold",
        colors: ["#000"],
      },
      offsetY: -22,
    },
    yaxis: {
      min: 0,
      title: { text: useLakhsScale ? "Amount In Lakhs (INR)" : "Amount (INR)" },
      labels: {
        formatter: (val) =>
          useLakhsScale
            ? `${Number(val / 100000).toLocaleString("en-IN", {
                maximumFractionDigits: 1,
              })}`
            : `${Number(val).toLocaleString("en-IN", {
                maximumFractionDigits: 0,
              })}`,
      },
    },
    tooltip: {
      enabled: true,
      custom: ({ series, seriesIndex, dataPointIndex, w }) => {
        const label =
          w?.globals?.categoryLabels?.[dataPointIndex] ||
          w?.config?.xaxis?.categories?.[dataPointIndex] ||
          "";
        const seriesName = w?.globals?.seriesNames?.[seriesIndex] || "Meeting";
        const value = series?.[seriesIndex]?.[dataPointIndex] || 0;
        const color = w?.globals?.colors?.[seriesIndex] || "#2196F3";

        return `
          <div style="min-width: 160px; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 14px rgba(15, 23, 42, 0.18); border: 1px solid #e5e7eb;">
            <div style="background: #eef2f6; color: #1f2937; font-size: 12px; padding: 8px 12px; border-bottom: 1px solid #dbe1e8;">
              ${label}
            </div>
            <div style="display: flex; align-items: center; gap: 8px; padding: 10px 12px; font-size: 12px; color: #111827;">
              <span style="width: 12px; height: 12px; border-radius: 999px; background: ${color}; display: inline-block;"></span>
              <span>${seriesName}:</span>
              <span style="font-weight: 700;">INR ${inrFormat(value)}</span>
            </div>
          </div>
        `;
      },
      y: {
        formatter: (val) => `INR ${inrFormat(val)}`,
      },
    },
    plotOptions: {
      bar: {
        columnWidth: "40%",
        borderRadius: 5,
        dataLabels: {
          position: "top",
        },
      },
    },
    colors: ["#2196F3", "#4CAF50", "#FF9800", "#9C27B0", "#F44336"],
  };

  return (
    <div className="flex flex-col gap-4">
      {isMeetingsLoading ? (
        <div className="flex h-72 justify-center items-center">
          <CircularProgress />
        </div>
      ) : isError ? (
        <div className="text-red-600 text-center py-8">
          Failed to fetch meeting revenue data. {error?.message || ""}
        </div>
      ) : !hasData ? (
        <div className="text-gray-500 text-center py-8">
          No meeting revenue data available.
        </div>
      ) : (
        <>
          {/* <FyBarGraph
            data={graphData}
            dateKey="date"
            valueKey="taxable"
            graphTitle="ANNUAL MONTHLY MEETINGS REVENUES"
            chartOptions={options}
            selectedFY={selectedFY}
            onSelectedFYChange={setSelectedFY}
          /> */}
           {showChart && (
            <FyBarGraph
              data={graphData}
              dateKey="date"
              valueKey="taxable"
              graphTitle="ANNUAL MONTHLY MEETINGS REVENUES"
              chartOptions={options}
              selectedFY={selectedFY}
              onSelectedFYChange={setSelectedFY}
              disableHoverCrosshair
            />
          )}

          <WidgetTable
            data={flattenedRevenueData}
            headerActions={
              !showChart ? (
                <PrimaryButton
                  title="Manage Meeting"
                  handleSubmit={() =>
                    navigate(
                      "/app/dashboard/finance-dashboard/mix-bag/manage-meetings/external-clients",
                    )
                  }
                />
              ) : null
            }
              tableTitle={
              showChart
                ? "Monthly Revenue with Client Details"
                : "Meeting Revenue Client Invoicing"
            }
           // tableTitle={"Monthly Revenue with Client Details"}
            dateColumn={"date"}
            formatDate
            exportData
            totalKey="taxable"
            titleAmountOverride=""
            titleAmountGreen={({ filteredData }) =>
              `INR ${inrFormat(
                filteredData.reduce((sum, item) => {
                  if (!isVerifiedFinanceRow(item)) {
                    return sum;
                  }
                  return sum + getNumericAmount(item.taxable);
                }, 0),
              )}`
            }
            titleAmountRed={({ filteredData }) =>
              `INR ${inrFormat(
                filteredData.reduce((sum, item) => {
                  if (isVerifiedFinanceRow(item)) {
                    return sum;
                  }
                  return sum + getNumericAmount(item.taxable);
                }, 0),
              )}`
            }
            titleAmountTotal={({ rangeTotal }) =>
              `INR ${inrFormat(rangeTotal)}`
            }
            greenTitle="Paid"
            redTitle="Unpaid"
            totalTitle="Total"
            summaryChipVariant="ticket"
            columns={[
              { headerName: "Sr No", field: "srNo", width: 100 },
              // { headerName: "Particulars", field: "particulars", width: 200 },
              // { headerName: "Units / Hours", field: "unitsOrHours" },
              { headerName: "Client Name", field: "clientName" },
              { headerName: "Meeting Type", field: "meetingType" },
              {
                headerName: "Taxable (INR)",
                field: "taxable",
                valueFormatter: ({ value }) =>
                  typeof value === "number"
                    ? value.toLocaleString("en-IN")
                    : `${value ?? ""}`,
              },
              {
                headerName: "GST (INR)",
                field: "gst",
                valueFormatter: ({ value }) =>
                  typeof value === "number"
                    ? value.toLocaleString("en-IN")
                    : `${value ?? ""}`,
              },
              {
                headerName: "Total Amount (INR)",
                field: "totalAmount",
                valueFormatter: ({ value }) =>
                  typeof value === "number"
                    ? value.toLocaleString("en-IN")
                    : `${value ?? ""}`,
              },
              //{ headerName: "Date", field: "date" },
              { headerName: "Payment Date", field: "paymentDate" },
              { headerName: "Remarks", field: "remarks" },
              {
                 headerName: "Admin Status",
                field: "status",
                pinned: "right",
                cellRenderer: (params) => <StatusChip status={params.value} />,
              },
              ...(showChart
                ? [
                    {
                      headerName: "Finance Status",
                      field: "financeStatus",
                      pinned: "right",
                      cellRenderer: (params) => (
                        <StatusChip status={params.value} />
                      ),
                    },
                  ]
                : []),
               ...(!showChart
                ? [
                    {
                      headerName: "Admin Payment Proof",
                      field: "paymentProofLink",
                      pinned:"right",
                      cellRenderer: ({ value }) =>
                        value ? (
                          <a
                            className="text-primary underline"
                            href={value}
                            target="_blank"
                            rel="noreferrer"
                          >
                            View File
                          </a>
                        ) : (
                          "-"
                        ),
                    },
                    {
                      headerName: "Invoice Link",
                      field: "invoiceLink",
                      pinned:"right",
                      cellRenderer: ({ value, data }) => {
                        const link = value || data?.invoice?.link;
                        return link ? (
                          <a
                            className="text-primary underline"
                            href={link}
                            target="_blank"
                            rel="noreferrer"
                          >
                            View PDF
                          </a>
                        ) : (
                          "-"
                        );
                      },
                    },
                    {
                      headerName: "Invoice Uploaded On",
                      field: "invoiceUploadedAt",
                      pinned:"right",
                      valueFormatter: ({ value }) =>
                        value ? humanDate(value) : "-",
                    },
                      {
                      headerName: "Finance Status",
                      field: "financeStatus",
                      pinned:"right",
                      cellRenderer: ({ value }) => (
                        <StatusChip status={value} />
                      ),
                    },
                  ]
                : []),
              {
                headerName: "Actions",
                field: "actions",
                pinned: "right",
                sortable: false,
                filter: false,
                cellRenderer: (params) => (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      aria-label="View meeting revenue details"
                      className="p-2 rounded-full hover:bg-gray-200"
                      onClick={() => setSelectedRevenue(params.data)}
                      >
                        <MdOutlineRemoveRedEye size={20} />
                      </button>
                    {!showChart && params.data.id && (
                      <ThreeDotMenu
                        rowId={params.data.id}
                          disabled={
                          (params.data.financeStatus || "Pending") === "Pending"
                        }
                        menuItems={[
                          {
                            label: "Edit",
                            onClick: () => openEditModal(params.data),
                          },
                        ]}
                      />
                    )}
                  </div>
                ),
              },
            ]}
          />
          <MuiModal
            title="Meeting Revenue Details"
            open={Boolean(selectedRevenue)}
            onClose={() => setSelectedRevenue(null)}
          >
            {selectedRevenue && (
              <div className="grid grid-cols-1 gap-4 w-full">
                <div className="font-bold text-lg">Basic Info</div>
                <DetalisFormatted
                  title="Title"
                  detail={selectedRevenue.meetingTitle || "N/A"}
                />
                <DetalisFormatted
                  title="Agenda"
                  detail={selectedRevenue.meetingAgenda || "N/A"}
                />
                <DetalisFormatted
                  title="Date"
                  detail={humanDate(selectedRevenue.date)}
                />
                <DetalisFormatted
                  title="Time"
                  detail={selectedRevenue.meetingTimeLabel || "N/A"}
                />
                <DetalisFormatted
                  title="Duration"
                  detail={selectedRevenue.meetingDurationLabel || "N/A"}
                />
                <DetalisFormatted
                  title="Status"
                  detail={selectedRevenue.meetingStatus || "N/A"}
                />
                <DetalisFormatted
                  title="Type"
                  detail={selectedRevenue.meetingTypeRaw || "N/A"}
                />
                <DetalisFormatted
                  title="Company"
                  detail={selectedRevenue.meetingCompanyName || "N/A"}
                />
                <DetalisFormatted
                  title="Booked By"
                  detail={selectedRevenue.meetingBookedByName || "N/A"}
                />
                <DetalisFormatted
                  title="Receptionist"
                  detail={selectedRevenue.meetingReceptionistName || "N/A"}
                />
                <DetalisFormatted
                  title="Client"
                  detail={selectedRevenue.clientName || "N/A"}
                />
                <div className="font-bold text-lg pt-4">Venue Details</div>
                <DetalisFormatted
                  title="Room"
                  detail={selectedRevenue.meetingRoomName || "N/A"}
                />
                <DetalisFormatted
                  title="Location"
                  detail={selectedRevenue.meetingLocationLabel || "N/A"}
                />
                <DetalisFormatted
                  title="Building"
                  detail={selectedRevenue.building || "N/A"}
                />
                <DetalisFormatted
                  title="Housekeeping Status"
                  detail={selectedRevenue.meetingHousekeepingStatus || "N/A"}
                />
                <div className="font-bold text-lg pt-4">Payment Details</div>
                <DetalisFormatted
                  title="Payment Date"
                  detail={
                    selectedRevenue.paymentDate
                      ? humanDate(selectedRevenue.paymentDate)
                      : "N/A"
                  }
                />
                <DetalisFormatted
                  title="Unit"
                  detail={getUnitLabel(selectedRevenue.unit)}
                />
                <DetalisFormatted
                  title="Building"
                  detail={selectedRevenue.building || "N/A"}
                />
                <DetalisFormatted
                  title="Hours Booked"
                  detail={selectedRevenue.hoursBooked || "N/A"}
                />
                <DetalisFormatted
                  title="Cost Per Hour"
                  detail={`INR ${inrFormat(selectedRevenue.costPerHour || 0)}`}
                />
                <DetalisFormatted
                  title="Taxable Amount"
                  detail={`INR ${inrFormat(selectedRevenue.taxable || 0)}`}
                />
                <DetalisFormatted
                  title="GST Amount"
                  detail={`INR ${inrFormat(selectedRevenue.gst || 0)}`}
                />
                <DetalisFormatted
                  title="Total Amount"
                  detail={`INR ${inrFormat(selectedRevenue.totalAmount || 0)}`}
                />
                <DetalisFormatted
                  title="Admin Status"
                  detail={selectedRevenue.status || "N/A"}
                />
                <DetalisFormatted
                  title="Admin Payment Proof"
                  detail={
                    selectedRevenue.paymentProofLink ? (
                      <a
                        href={selectedRevenue.paymentProofLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary underline"
                      >
                        {selectedRevenue.paymentProofName || "View File"}
                      </a>
                    ) : (
                      "-"
                    )
                  }
                />
                <DetalisFormatted
                  title="Payment Verification"
                  detail={selectedRevenue.paymentVerification || "N/A"}
                />
                <DetalisFormatted
                  title="Remarks"
                  detail={selectedRevenue.remarks || selectedRevenue.paymentMode || "N/A"}
                />
                <div className="font-bold text-lg pt-4">Finance Invoice Details</div>
                <DetalisFormatted
                  title="Invoice Link"
                  detail={
                    selectedRevenue.invoiceLink ? (
                      <a
                        href={selectedRevenue.invoiceLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary underline"
                      >
                        View PDF
                      </a>
                    ) : (
                      "-"
                    )
                  }
                />
                <DetalisFormatted
                  title="Invoice Uploaded On"
                  detail={
                    selectedRevenue.invoiceUploadedAt
                      ? humanDate(selectedRevenue.invoiceUploadedAt)
                      : "N/A"
                  }
                />
                <DetalisFormatted
                  title="Invoice Uploaded By"
                  detail={selectedRevenue.invoiceUploadedByName || "N/A"}
                />
                <DetalisFormatted
                  title="Finance Status"
                  detail={selectedRevenue.financeStatus || "Pending"}
                  //detail={selectedRevenue.financeStatus || "Upload Invoice"}
                />
              </div>
            )}
          </MuiModal>
          <MuiModal
          title="Edit Meeting Invoice"
            open={Boolean(editingRevenue)}
            onClose={() => setEditingRevenue(null)}
            widthClassName="w-[94vw] max-w-[920px]"
          >
            {editingRevenue && (
              <form
                className="grid grid-cols-1 gap-4"
                onSubmit={(event) => {
                  event.preventDefault();
                  updateInvoice.mutate();
                }}
              >
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <TextField
                    select
                    size="small"
                    fullWidth
                    label="Select Client"
                    value={clientLabel}
                    disabled
                  >
                    <MenuItem value={clientLabel}>{clientLabel}</MenuItem>
                  </TextField>

                  <TextField
                    size="small"
                    fullWidth
                    label="Client Name"
                    value={clientLabel}
                    disabled
                  />

                  <TextField
                    size="small"
                    fullWidth
                    label="Meeting Type"
                    value={meetingTypeLabel}
                    disabled
                  />

                  <TextField
                    size="small"
                    fullWidth
                    label="Meeting Room"
                    value={meetingRoomLabel}
                    disabled
                  />

                  <TextField
                    size="small"
                    fullWidth
                    label="Unit"
                    value={getUnitLabel(editingRevenue.unit)}
                    disabled
                  />

                  <TextField
                    size="small"
                    fullWidth
                    label="Building"
                    value={editingRevenue.building || "-"}
                    disabled
                  />

                  <TextField
                    size="small"
                    fullWidth
                    label="No. of Hours"
                    value={hoursBookedLabel}
                    disabled
                  />

                  <TextField
                    size="small"
                    fullWidth
                    label="Cost Per Hour"
                    value={formatNumberValue(editingRevenue.costPerHour)}
                    disabled
                  />

                  <TextField
                    size="small"
                    fullWidth
                    label="Taxable"
                    value={formatNumberValue(editingRevenue.taxable)}
                    disabled
                  />

                  <TextField
                    size="small"
                    fullWidth
                    label="GST"
                    value={formatNumberValue(editingRevenue.gst)}
                    disabled
                  />

                  <TextField
                    size="small"
                    fullWidth
                    label="Total Amount"
                    value={formatNumberValue(editingRevenue.totalAmount)}
                    disabled
                  />

                  <TextField
                    size="small"
                    fullWidth
                    label="Meeting Date"
                    value={formatDateValue(editingRevenue.date)}
                    disabled
                  />

                  <TextField
                    size="small"
                    fullWidth
                    label="Payment Date"
                    value={formatDateValue(editingRevenue.paymentDate)}
                    disabled
                  />

                  <TextField
                    size="small"
                    fullWidth
                    label="Invoice Upload Date"
                    value={formatDateValue(
                      editingRevenue.invoiceUploadedAt ||
                        editingRevenue.invoice?.date,
                    )}
                    disabled
                  />

                  <TextField
                    size="small"
                    fullWidth
                    label="Admin Status"
                    value={editingRevenue.status || "-"}
                    disabled
                  />

                  <TextField
                    select
                    size="small"
                    fullWidth
                    label="Finance Status"
                    value={financeStatus}
                    onChange={(event) => setFinanceStatus(event.target.value)}
                  >
                    <MenuItem value="Upload Invoice">Upload Invoice</MenuItem>
                    <MenuItem value="Verified">Verified</MenuItem>
                  </TextField>

                  <TextField
                    size="small"
                    fullWidth
                    label="Remarks"
                    value={editingRevenue.remarks || "-"}
                    disabled
                    multiline
                    minRows={2}
                    className="md:col-span-2"
                  />

                  <div className="md:col-span-2">
                    <UploadFileInput
                      value={editableInvoiceFile}
                      onChange={setInvoiceFile}
                      label="Upload File"
                      allowedExtensions={["pdf", "doc", "docx"]}
                      previewType="pdf"
                    />
                  </div>
                </div>

                {updateInvoice.isError && (
                  <p className="text-sm text-red-600">
                    {updateInvoice.error?.response?.data?.message ||
                      "Unable to update invoice."}
                  </p>
                )}

                <PrimaryButton
                  type="submit"
                  title="Update Invoice"
                  className="w-full py-3 text-[15px]"
                  disabled={isUpdateDisabled}
                  isLoading={updateInvoice.isPending}
                >
                </PrimaryButton>
              </form>
            )}
          </MuiModal>
        </>
      )}
    </div>
  );
};

export default MeetingRevenue;
