import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { inrFormat } from "../../../utils/currencyFormat";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { useQuery } from "@tanstack/react-query";
import { IconButton, MenuItem, Skeleton, TextField } from "@mui/material";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { useMutation } from "@tanstack/react-query";
import dayjs from "dayjs";
import { toast } from "sonner";
import WidgetTable from "../../../components/Tables/WidgetTable";
import StatusChip from "../../../components/StatusChip";
import FyBarGraph from "../../../components/graphs/FyBarGraph";
import MuiModal from "../../../components/MuiModal";
import DetalisFormatted from "../../../components/DetalisFormatted";
import UploadFileInput from "../../../components/UploadFileInput";
import PrimaryButton from "../../../components/PrimaryButton";
import ThreeDotMenu from "../../../components/ThreeDotMenu";
import { queryClient } from "../../../main";

const getNormalizedPaymentStatus = (status) => {
  if (typeof status === "string") return status.trim().toLowerCase();
  return status ? "paid" : "unpaid";
};

const getNumericAmount = (value) =>
  parseFloat(String(value || "0").replace(/,/g, "")) || 0;

const getClientIdentity = (row) => {
  const id = row?.client?._id || row?.client;
  if (id) return `id:${String(id)}`;
  return `name:${String(row?.clientName || "").trim().toLowerCase()}`;
};

const getUnpaidInvoiceRowsForMonth = (
  rows,
  selectedDate,
  existingMonthRows = [],
) => {
  const targetMonth = dayjs(selectedDate).startOf("month");
  const currentMonth = dayjs().startOf("month");

  if (!targetMonth.isValid() || targetMonth.isBefore(currentMonth)) return [];

  const historicalPaidRows = rows.filter((row) => {
    const rowMonth = dayjs(row.rentDate).startOf("month");
    return (
      rowMonth.isValid() &&
      rowMonth.isBefore(currentMonth) &&
      getNormalizedPaymentStatus(row.rentStatus ?? row.status) === "paid"
    );
  });
  if (!historicalPaidRows.length) return [];

  const latestSourceMonth = historicalPaidRows.reduce((latest, row) => {
    const rowMonth = dayjs(row.rentDate).startOf("month");
    return rowMonth.isAfter(latest) ? rowMonth : latest;
  }, dayjs(historicalPaidRows[0].rentDate).startOf("month"));

  const existingClients = new Set(existingMonthRows.map(getClientIdentity));
  const projectedClients = new Set();

  return historicalPaidRows
    .filter((row) => dayjs(row.rentDate).isSame(latestSourceMonth, "month"))
    .filter((row) => !existingClients.has(getClientIdentity(row)))
    .filter((row) => {
      const identity = getClientIdentity(row);
      if (projectedClients.has(identity)) return false;
      projectedClients.add(identity);
      return true;
    })
    .map((row, index) => ({
      ...row,
      id: `projected-${targetMonth.format("YYYY-MM")}-${index}`,
      rentDate: targetMonth
        .date(Math.min(dayjs(row.rentDate).date(), targetMonth.daysInMonth()))
        .toISOString(),
      rentStatus: "Unpaid",
      normalizedStatus: "unpaid",
      invoice: null,
      invoiceLink: "",
      invoiceUploadedAt: null,
      isProjectedInvoice: true,
    }));
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

// const VirtualOffice = () => {
  //const VirtualOffice = ({ showChart = true }) => {
  const VirtualOffice = ({ showChart = true, showInvoiceProjections = false }) => {
  const axios = useAxiosPrivate();
  const [viewRow, setViewRow] = useState(null);
  const [editRow, setEditRow] = useState(null);
  const { control, handleSubmit, reset } = useForm();
  const [selectedFY, setSelectedFY] = useState(
    getCurrentFinancialYearLabel(),
  );

  const {
    data: virtualOfficeRevenue,
    isLoading: isLoadingVirtualOfficeRevenue = [],
  } = useQuery({
    queryKey: ["virtualOfficeRevenue"],
    queryFn: async () => {
      try {
        const response = await axios.get(
          `/api/sales/get-virtual-office-revenue`,
        );
        return Array.isArray(response.data) ? response.data : [];
      } catch (error) {
        throw new Error(error.response.data.message);
      }
    },
  });

  const { data: virtualOfficeClients = [] } = useQuery({
    queryKey: ["virtualOfficeClientOptions"],
    queryFn: async () => {
      try {
        const response = await axios.get("/api/sales/consolidated-clients");
        return Array.isArray(response.data?.virtualOfficeClients)
          ? response.data.virtualOfficeClients
          : [];
      } catch (error) {
        console.error(error);
        return [];
      }
    },
  });

  const tableData = useMemo(
    () =>
      isLoadingVirtualOfficeRevenue
        ? []
        : virtualOfficeRevenue.map((item) => ({
            ...item,
            clientName: item.client?.clientName,
             normalizedStatus: getNormalizedPaymentStatus(
              item.rentStatus ?? item.status,
            ),
            rentStatus: item.rentStatus || (item.status ? "Paid" : "Unpaid"),
            invoiceLink: item.invoice?.link || "",
            invoiceUploadedAt: item.invoice?.date || item.invoiceUploadedAt,
            //normalizedStatus: getNormalizedPaymentStatus(item.status),
          })),
    [isLoadingVirtualOfficeRevenue, virtualOfficeRevenue],
  );

   const openEdit = (row) => {
    setEditRow(row);
    reset({
      ...row,
      client: row.client?._id || row.client,
      clientName: row.clientName || "",
      clientInvoiceName: row.clientInvoiceName || row.clientName || "",
      revenue: row.revenue ?? "",
      channel: row.channel || "",
      noOfDesks: row.noOfDesks ?? "",
      deskRate: row.deskRate ?? "",
      totalTerm: row.totalTerm ?? "",
      rentDate: row.rentDate ? dayjs(row.rentDate) : null,
      pastDueDate: row.pastDueDate ? dayjs(row.pastDueDate) : null,
      annualIncrement: row.annualIncrement ?? "",
      nextIncrementDate: row.nextIncrementDate ? dayjs(row.nextIncrementDate) : null,
      rentStatus: row.isProjectedInvoice ? "Unpaid" : row.rentStatus,
      invoiceUploadedAt: row.invoice?.date ? dayjs(row.invoice.date) : dayjs(),
      invoiceFile: row.invoice?.link ? { name: row.invoice.name, url: row.invoice.link } : null,
    });
  };
  const { mutate: saveInvoice, isPending } = useMutation({
    mutationFn: async (values) => {
      const form = new FormData();
      form.append("revenueId", editRow._id || "");
      form.append(
        "isProjectedInvoice",
        String(Boolean(editRow.isProjectedInvoice)),
      );
      [
        "client",
        "clientName",
        "clientInvoiceName",
        "location",
        "channel",
        "noOfDesks",
        "deskRate",
        "taxableAmount",
        "revenue",
        "totalTerm",
        "rentStatus",
        "annualIncrement",
        "service",
      ].forEach((field) => {
        if (values[field] !== undefined && values[field] !== null) {
          form.append(field, values[field]);
        }
      });
      ["dueTerm", "rentDate", "pastDueDate", "nextIncrementDate"].forEach(
        (field) => {
          if (values[field]) form.append(field, dayjs(values[field]).toISOString());
        },
      );
      form.append("invoiceUploadedAt", values.invoiceUploadedAt.toISOString());
      if (values.invoiceFile instanceof File) form.append("client-invoice", values.invoiceFile);
      return axios.patch("/api/sales/virtual-office-revenue-invoice", form);
    },
    onSuccess: () => {
      toast.success("Virtual office invoice updated successfully");
      queryClient.invalidateQueries({ queryKey: ["virtualOfficeRevenue"] });
      setEditRow(null);
    },
    onError: (error) => toast.error(error.response?.data?.message || "Unable to update invoice"),
  });

  const graphData = useMemo(
    () =>
      isLoadingVirtualOfficeRevenue
        ? []
        : tableData
            .filter((item) => item.normalizedStatus === "paid")
            .map((item) => ({
              ...item,
              revenue: getNumericAmount(item.revenue),
              vertical: "Virtual Office",
            })),
    [isLoadingVirtualOfficeRevenue, tableData],
  );

  const selectedFiscalYearRevenue = useMemo(
    () =>
      graphData.filter((item) => getFinancialYear(item.rentDate) === selectedFY),
    [graphData, selectedFY],
  );

  const maxVirtualOfficeAmount = useMemo(
    () =>
      selectedFiscalYearRevenue.reduce(
        (max, item) => Math.max(max, getNumericAmount(item.revenue)),
        0,
      ),
    [selectedFiscalYearRevenue],
  );

  const useLakhsScale = maxVirtualOfficeAmount >= 100000;

  const options = useMemo(
    () => ({
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
        title: {
          text: useLakhsScale ? "Amount In Lakhs (INR)" : "Amount (INR)",
        },
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
          const seriesName =
            w?.globals?.seriesNames?.[seriesIndex] || "Virtual Office";
          const value = series?.[seriesIndex]?.[dataPointIndex] || 0;
          const color = w?.globals?.colors?.[seriesIndex] || "#11daf5";

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
          formatter: (val) => `INR ${val.toLocaleString()}`,
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
      colors: ["#11daf5"],
    }),
    [useLakhsScale],
  );

  return (
    <div className="flex flex-col gap-4">
      {/* {!isLoadingVirtualOfficeRevenue ? ( */}
      {showChart && (!isLoadingVirtualOfficeRevenue ? (
        <FyBarGraph
          graphTitle="ANNUAL MONTHLY VIRTUAL OFFICE REVENUES"
          data={graphData}
          dateKey="rentDate"
          valueKey="revenue"
          chartOptions={options}
          selectedFY={selectedFY}
          onSelectedFYChange={setSelectedFY}
        />
      ) : (
        <Skeleton height={"500px"} width={"100%"} />
      // )}
      ))}

      {!isLoadingVirtualOfficeRevenue ? (
        <WidgetTable
          tableTitle={"Monthly Revenue with Client Details"}
          data={tableData}
          totalKey="revenue"
          exportData
          dateColumn={"rentDate"}
          titleAmountOverride=""
          titleAmountGreen={({ filteredData }) =>
            `INR ${inrFormat(
              filteredData.reduce((sum, item) => {
                if (item.normalizedStatus !== "paid") return sum;
                return sum + getNumericAmount(item.revenue);
              }, 0),
            )}`
          }
          titleAmountRed={({ filteredData }) =>
            `INR ${inrFormat(
              filteredData.reduce((sum, item) => {
                if (item.normalizedStatus !== "unpaid") return sum;
                return sum + getNumericAmount(item.revenue);
              }, 0),
            )}`
          }
          titleAmountTotal={({ rangeTotal }) => `INR ${inrFormat(rangeTotal)}`}
          greenTitle="Paid"
          redTitle="Unpaid"
          totalTitle="Total"
          summaryChipVariant="ticket"
          preserveCurrentMonthRange={showInvoiceProjections}
          getMissingRangeData={
            showInvoiceProjections
              ? (selectedDate, existingMonthRows) =>
                  getUnpaidInvoiceRowsForMonth(
                    tableData,
                    selectedDate,
                    existingMonthRows,
                  )
              : undefined
          }
          columns={[
            {
              headerName: "Sr No",
              field: "srNo",
              width: 80,
              minWidth: 80,
            },
            {
              headerName: "Client Name",
              field: "clientName",
              flex: 1.6,
              minWidth: 220,
            },
            { headerName: "Channel", field: "channel"},
            {
              headerName: "Revenue (INR)",
              field: "revenue",
             
              cellRenderer: (params) => inrFormat(params.value || 0),
            },
            {
              headerName: "No. of Desk",
              field: "noOfDesks",
            
            },
            {
              headerName: "Desk Rate",
              field: "deskRate",
             
              cellRenderer: (params) => `INR ${inrFormat(params.value || 0)}`,
            },
            { headerName: "Total Term", field: "totalTerm" },
            {
              headerName: "Rent Date",
              field: "rentDate",
             
              valueFormatter: ({ value }) =>
                value ? dayjs(value).format("DD-MM-YYYY") : "-",
            },
            {
              headerName: "Past Due Date",
              field: "pastDueDate",
             
              valueFormatter: ({ value }) =>
                value ? dayjs(value).format("DD-MM-YYYY") : "-",
            },
            {
              headerName: "Annual Increment",
              field: "annualIncrement",
              
              cellRenderer: (params) =>
                params.value !== undefined &&
                params.value !== null &&
                params.value !== ""
                  ? `${params.value}%`
                  : "-",
            },
            {
              headerName: "Next Increment Date",
              field: "nextIncrementDate",
             
              valueFormatter: ({ value }) =>
                value ? dayjs(value).format("DD-MM-YYYY") : "-",
            },
            ...(showInvoiceProjections
  ? [
      {
        headerName: "Invoice Link",
        field: "invoiceLink",
        pinned: "right",
        flex:1,
        headerClass: "vo-right-pinned-header",
        cellClass: "vo-right-pinned-cell",
        cellStyle: {
          paddingLeft: "16px",
          paddingRight: "16px",
        },
        cellRenderer: ({ value }) =>
          value ? (
            <a
              href={value}
              target="_blank"
              rel="noreferrer"
              className="text-primary underline"
            >
              View PDF
            </a>
          ) : (
            "-"
          ),
      },
      {
        headerName: "Invoice Upload Date",
        field: "invoiceUploadedAt",
        pinned: "right",
         flex:1,
        headerClass: "vo-right-pinned-header",
        cellClass: "vo-right-pinned-cell",
        cellStyle: {
          paddingLeft: "16px",
          paddingRight: "16px",
        },
        valueFormatter: ({ value }) =>
          value
            ? dayjs(value).format("DD-MM-YYYY")
            : "-",
      },
      {
        headerName: "Status",
        field: "rentStatus",
        pinned: "right",
        flex:1,
        headerClass: "vo-right-pinned-header",
        cellClass: "vo-right-pinned-cell",
        cellStyle: {
          paddingLeft: "16px",
          paddingRight: "16px",
        },
        cellRenderer: (params) => (
          <StatusChip status={params.value} />
        ),
      },
      {
        headerName: "Action",
        field: "actions",
        pinned: "right",
       flex:1,
        headerClass: "vo-right-pinned-header",
        cellClass: "vo-right-pinned-cell",
        cellStyle: {
          paddingLeft: "16px",
          paddingRight: "16px",
        },
        sortable: false,
        filter: false,
        cellRenderer: ({ data }) => (
          <div className="flex items-center">
            <IconButton
              size="small"
              onClick={() => setViewRow(data)}
              aria-label="View invoice"
            >
              <MdOutlineRemoveRedEye size={18} />
            </IconButton>

            <ThreeDotMenu
              rowId={data._id}
              menuItems={[
                {
                  label: "Edit",
                  onClick: () => openEdit(data),
                },
              ]}
            />
          </div>
        ),
      },
    ]
  : []),
          ]}
        />
      ) : (
        <Skeleton height={"500px"} width={"100%"} />
      )}
      {viewRow && (
  <MuiModal
    open
    title="View Invoice Details"
    onClose={() => setViewRow(null)}
  >
    <div className="flex flex-col gap-3">
      <DetalisFormatted
        title="Client Name"
        detail={viewRow.clientName || "-"}
      />

      <DetalisFormatted
        title="Client Invoice Name"
        detail={viewRow.clientName || viewRow.clientInvoiceName || "-"}
      />

      <DetalisFormatted
        title="Invoice Link"
        detail={
          viewRow.invoiceLink ? (
            <a
              href={viewRow.invoiceLink}
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
        title="Invoice Uploaded Date"
        detail={
          viewRow.invoiceUploadedAt
            ? dayjs(viewRow.invoiceUploadedAt).format("DD-MM-YYYY")
            : "-"
        }
      />

      <DetalisFormatted
        title="Channel"
        detail={viewRow.channel || "-"}
      />

      <DetalisFormatted
        title="No. of Desks"
        detail={viewRow.noOfDesks ?? "-"}
      />

      <DetalisFormatted
        title="Desk Rate"
        detail={`INR ${inrFormat(viewRow.deskRate || 0)}`}
      />

      <DetalisFormatted
        title="Revenue"
        detail={`INR ${inrFormat(viewRow.revenue || 0)}`}
      />

      <DetalisFormatted
        title="Total Term"
        detail={viewRow.totalTerm ?? "-"}
      />

      <DetalisFormatted
        title="Rent Date"
        detail={viewRow.rentDate ? dayjs(viewRow.rentDate).format("DD-MM-YYYY") : "-"}
      />

      <DetalisFormatted
        title="Past Due Date"
        detail={
          viewRow.pastDueDate
            ? dayjs(viewRow.pastDueDate).format("DD-MM-YYYY")
            : "-"
        }
      />

      <DetalisFormatted
        title="Annual Increment (%)"
        detail={
          viewRow.annualIncrement !== undefined &&
          viewRow.annualIncrement !== null &&
          viewRow.annualIncrement !== ""
            ? viewRow.annualIncrement
            : "-"
        }
      />

      <DetalisFormatted
        title="Next Increment Date"
        detail={
          viewRow.nextIncrementDate
            ? dayjs(viewRow.nextIncrementDate).format("DD-MM-YYYY")
            : "-"
        }
      />

      <DetalisFormatted
        title="Paid/Rent Status"
        detail={viewRow.rentStatus || "-"}
      />
    </div>
  </MuiModal>
)}

{editRow && (
  <MuiModal
    open
    title="Edit Invoice"
    onClose={() => setEditRow(null)}
  >
    <form
      onSubmit={handleSubmit(saveInvoice)}
      className="grid grid-cols-2 gap-4"
    >
      <Controller
        name="client"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            select
            label="Select Client"
            size="small"
            fullWidth
            disabled
          >
            {virtualOfficeClients.map((client) => (
              <MenuItem key={client._id} value={client._id}>
                {client.clientName}
              </MenuItem>
            ))}
          </TextField>
        )}
      />

      {[
        ["clientName", "Client Name", "text"],
        ["clientInvoiceName", "Client Invoice Name", "text"],
        ["channel", "Channel", "text"],
        ["noOfDesks", "No. of Desks", "number"],
        ["deskRate", "Desk Rate", "number"],
        ["revenue", "Revenue", "number"],
        ["totalTerm", "Total Term", "number"],
        ["annualIncrement", "Annual Increment (%)", "number"],
      ].map(([name, label, type]) => (
        <Controller
          key={name}
          name={name}
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              type={type}
              label={label}
              size="small"
              fullWidth
              disabled
            />
          )}
        />
      ))}

      {[
        ["rentDate", "Rent Date"],
        ["pastDueDate", "Past Due Date"],
        ["nextIncrementDate", "Next Increment Date"],
        ["invoiceUploadedAt", "Invoice Upload Date"],
      ].map(([name, label]) => (
        <Controller
          key={name}
          name={name}
          control={control}
          render={({ field }) => (
            <DatePicker
              {...field}
              value={field.value ?? null}
              label={label}
              format="DD-MM-YYYY"
              disabled
              slotProps={{
                textField: {
                  size: "small",
                  fullWidth: true,
                  disabled: true,
                },
              }}
            />
          )}
        />
      ))}

      <Controller
        name="rentStatus"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            select
            label="Paid/Rent Status"
            size="small"
            fullWidth
          >
            <MenuItem value="Paid">
              Paid
            </MenuItem>

            <MenuItem value="Unpaid">
              Unpaid
            </MenuItem>
          </TextField>
        )}
      />

      <Controller
        name="invoiceFile"
        control={control}
        render={({ field }) => (
          <div className="col-span-2">
            <UploadFileInput
              value={field.value}
              onChange={field.onChange}
              allowedExtensions={[
                "pdf",
                "doc",
                "docx",
              ]}
            />
          </div>
        )}
      />

      <div className="col-span-2">
        <PrimaryButton
          type="submit"
          title="Update Invoice"
          disabled={isPending}
          isLoading={isPending}
          className="w-full"
        />
      </div>
    </form>
  </MuiModal>
)}
    </div>
  );
};

export default VirtualOffice;
