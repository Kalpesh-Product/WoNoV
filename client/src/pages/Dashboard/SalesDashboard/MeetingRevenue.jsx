import { useMemo, useState } from "react";
import { inrFormat } from "../../../utils/currencyFormat";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { CircularProgress } from "@mui/material";
import WidgetTable from "../../../components/Tables/WidgetTable";
import StatusChip from "../../../components/StatusChip";
import FyBarGraph from "../../../components/graphs/FyBarGraph";
import { MdEdit, MdOutlineRemoveRedEye } from "react-icons/md";
import MuiModal from "../../../components/MuiModal";
import DetalisFormatted from "../../../components/DetalisFormatted";
import humanDate from "../../../utils/humanDateForamt";

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

// const MeetingRevenue = () => {
  // const MeetingRevenue = ({ showChart = true }) => {
  // const axios = useAxiosPrivate();
  // const [selectedFY, setSelectedFY] = useState(getCurrentFinancialYearLabel());
  // const [selectedRevenue, setSelectedRevenue] = useState(null);

  const MeetingRevenue = ({ showChart = true }) => {
  const axios = useAxiosPrivate();
  const queryClient = useQueryClient();
  const [selectedFY, setSelectedFY] = useState(getCurrentFinancialYearLabel());
  const [selectedRevenue, setSelectedRevenue] = useState(null);
  const [editingRevenue, setEditingRevenue] = useState(null);
  const [invoiceFile, setInvoiceFile] = useState(null);
  const [financeStatus, setFinanceStatus] = useState("Upload Invoice");

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
      remarks: client.remarks || "-",
    })),
  }));

  //const flattenedRevenueData = tableData.flatMap((month) => month.revenue);
  const allRevenueData = tableData.flatMap((month) => month.revenue);
  const flattenedRevenueData = showChart
    ? allRevenueData.filter((item) => Boolean(item.invoiceUploadedAt))
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
    setFinanceStatus(row.financeStatus || "Upload Invoice");
    setInvoiceFile(null);
  };
  const graphData = useMemo(
    () =>
      isMeetingsLoading
        ? []
        : flattenedRevenueData
            .filter((item) => item.normalizedStatus === "paid")
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
              tableTitle={
              showChart
                ? "Monthly Revenue with Client Details"
                : "Meeting Invoicing"
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
                  if (item.normalizedStatus !== "paid") return sum;
                  return sum + getNumericAmount(item.taxable);
                }, 0),
              )}`
            }
            titleAmountRed={({ filteredData }) =>
              `INR ${inrFormat(
                filteredData.reduce((sum, item) => {
                  if (item.normalizedStatus !== "unpaid") return sum;
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
               ...(!showChart
                ? [
                    {
                      headerName: "Invoice Uploaded On",
                      field: "invoiceUploadedAt",
                      valueFormatter: ({ value }) =>
                        value ? humanDate(value) : "-",
                    },
                    {
                      headerName: "Invoice Link",
                      field: "invoiceLink",
                      cellRenderer: ({ value }) =>
                        value ? (
                          <a
                            className="text-primary underline"
                            href={value}
                            target="_blank"
                            rel="noreferrer"
                          >
                            View Invoice
                          </a>
                        ) : (
                          "-"
                        ),
                    },
                    {
                      headerName: "Finance Status",
                      field: "financeStatus",
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
                  // <button
                  //   type="button"
                  //   aria-label="View meeting revenue details"
                  //   className="p-2 rounded-full hover:bg-gray-200 transition-colors"
                  //   onClick={() => setSelectedRevenue(params.data)}
                  // >
                  //   <MdOutlineRemoveRedEye size={20} />
                  // </button>
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
                      <button
                        type="button"
                        aria-label="Edit meeting invoice"
                        className="p-2 rounded-full hover:bg-gray-200"
                        onClick={() => openEditModal(params.data)}
                      >
                        <MdEdit size={20} />
                      </button>
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
                <DetalisFormatted
                  title="Client Name"
                  detail={selectedRevenue.clientName || "N/A"}
                />
                <DetalisFormatted
                  title="Meeting Type"
                  detail={selectedRevenue.meetingType || "N/A"}
                />
                <DetalisFormatted
                  title="Meeting Date"
                  detail={humanDate(selectedRevenue.date)}
                />
                <DetalisFormatted
                  title="Payment Date"
                  detail={humanDate(selectedRevenue.paymentDate)}
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
                  title="Invoice Uploaded On"
                  detail={
                    selectedRevenue.invoiceUploadedAt
                      ? humanDate(selectedRevenue.invoiceUploadedAt)
                      : "N/A"
                  }
                />
                <DetalisFormatted
                  title="Invoice Link"
                  detail={selectedRevenue.invoiceLink || "N/A"}
                />
                <DetalisFormatted
                  title="Finance Status"
                  detail={selectedRevenue.financeStatus || "Upload Invoice"}
                />
                <DetalisFormatted
                  title="Remarks"
                  detail={selectedRevenue.remarks || "N/A"}
                />
              </div>
            )}
          </MuiModal>
          <MuiModal
            title="Edit Meeting Invoice"
            open={Boolean(editingRevenue)}
            onClose={() => setEditingRevenue(null)}
          >
            {editingRevenue && (
              <form
                className="grid grid-cols-1 gap-4"
                onSubmit={(event) => {
                  event.preventDefault();
                  updateInvoice.mutate();
                }}
              >
                {[
                  ["Client Name", editingRevenue.clientName],
                  ["Meeting Type", editingRevenue.meetingType],
                  ["Taxable (INR)", editingRevenue.taxable],
                  ["GST (INR)", editingRevenue.gst],
                  ["Total Amount (INR)", editingRevenue.totalAmount],
                  ["Admin Status", editingRevenue.status],
                ].map(([label, value]) => (
                  <label
                    key={label}
                    className="flex flex-col gap-1 text-sm font-medium"
                  >
                    {label}
                    <input
                      className="rounded border bg-gray-100 p-2 text-gray-600"
                      value={value ?? ""}
                      disabled
                    />
                  </label>
                ))}
                <label className="flex flex-col gap-1 text-sm font-medium">
                  Upload Invoice
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(event) =>
                      setInvoiceFile(event.target.files?.[0] || null)
                    }
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm font-medium">
                  Finance Status
                  <select
                    className="rounded border p-2"
                    value={financeStatus}
                    onChange={(event) => setFinanceStatus(event.target.value)}
                  >
                    <option value="Upload Invoice">Upload Invoice</option>
                    <option value="Verified">Verified</option>
                  </select>
                </label>
                {updateInvoice.isError && (
                  <p className="text-sm text-red-600">
                    {updateInvoice.error?.response?.data?.message ||
                      "Unable to update invoice."}
                  </p>
                )}
                <button
                  className="rounded bg-primary px-4 py-2 text-white disabled:opacity-60"
                  type="submit"
                  disabled={
                    updateInvoice.isPending ||
                    (!invoiceFile &&
                      financeStatus === editingRevenue.financeStatus)
                  }
                >
                  {updateInvoice.isPending ? "Saving..." : "Save"}
                </button>
              </form>
            )}
          </MuiModal>
        </>
      )}
    </div>
  );
};

export default MeetingRevenue;
