import {
  CircularProgress,
  IconButton,
  MenuItem,
  TextField,
} from "@mui/material";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import dayjs from "dayjs";
import { inrFormat } from "../../../utils/currencyFormat";
import { useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import WidgetTable from "../../../components/Tables/WidgetTable";
import StatusChip from "../../../components/StatusChip";
import FyBarGraph from "../../../components/graphs/FyBarGraph";
import MuiModal from "../../../components/MuiModal";
import DetalisFormatted from "../../../components/DetalisFormatted";
import UploadFileInput from "../../../components/UploadFileInput";
import PrimaryButton from "../../../components/PrimaryButton";
import ThreeDotMenu from "../../../components/ThreeDotMenu";
import { queryClient } from "../../../main";

const getNormalizedRentStatus = (status) =>
  String(status || "").trim().toLowerCase();

const getNumericAmount = (value) =>
  parseFloat(String(value || "0").replace(/,/g, "")) || 0;

const normalizeAmount = (value) => {
  if (value === null || value === undefined || value === "") return 0;
  const parsed = Number(String(value).replace(/,/g, ""));
  return Number.isNaN(parsed) ? 0 : parsed;
};

const CoworkingInvoiceActions = ({ row, onView, onEdit }) => (
  <div className="flex items-center justify-start gap-0.5 w-full pl-2">
    <IconButton
      size="small"
      aria-label="View invoice details"
      onClick={() => onView(row)}
      sx={{
        padding: "6px",
        color: "#6B7280",
        "&:hover": {
          backgroundColor: "rgba(30, 61, 115, 0.08)",
          color: "#1E3D73",
        },
      }}
    >
      <MdOutlineRemoveRedEye size={18} />
    </IconButton>

    <ThreeDotMenu
      rowId={row?._id || row?.id}
      disabled={dayjs(row?.rentDate)
        .startOf("month")
        .isAfter(dayjs().startOf("month"))}
      menuItems={[
        {
          label: "Edit",
          onClick: () => onEdit(row),
        },
      ]}
    />
  </div>
);

// const getUnpaidInvoiceRowsForMonth = (rows, selectedDate) => {
  const getClientIdentity = (row) => {
  const clientId = row?.clients?._id || row?.clients;
  if (clientId) return `id:${String(clientId)}`;

  return `name:${String(row?.clientName || row?.clientInvoiceName || "")
    .trim()
    .toLowerCase()}`;
};

const getUnpaidInvoiceRowsForMonth = (
  rows,
  selectedDate,
  existingMonthRows = [],
) => {
  const targetMonth = dayjs(selectedDate).startOf("month");
  if (!targetMonth.isValid() || targetMonth.isBefore(dayjs().startOf("month"))) {
    return [];
  }

  const validRows = rows.filter((row) => dayjs(row.rentDate).isValid());
  if (!validRows.length) return [];
  const currentMonth = dayjs().startOf("month");
  const sourceRows = validRows.filter((row) => {
    const rowMonth = dayjs(row.rentDate).startOf("month");
    return (
      rowMonth.isBefore(currentMonth) &&
      getNormalizedRentStatus(row.rentStatus) === "paid"
    );
  });
  if (!sourceRows.length) return [];

  const latestSourceMonth = sourceRows.reduce((latest, row) => {
    const rowMonth = dayjs(row.rentDate).startOf("month");
    return rowMonth.isAfter(latest) ? rowMonth : latest;
  }, dayjs(sourceRows[0].rentDate).startOf("month"));

  const templateRows = sourceRows.filter((row) =>
    dayjs(row.rentDate).isSame(latestSourceMonth, "month"),
  );

  const existingClients = new Set(existingMonthRows.map(getClientIdentity));
  const projectedClients = new Set();

  return templateRows
    .filter((row) => !existingClients.has(getClientIdentity(row)))
    .filter((row) => {
      const identity = getClientIdentity(row);
      if (projectedClients.has(identity)) return false;
      projectedClients.add(identity);
      return true;
    })
    .map((row, index) => {
      const originalRentDate = dayjs(row.rentDate);
      const projectedRentDate = targetMonth.date(
        Math.min(originalRentDate.date(), targetMonth.daysInMonth())
      );

      return {
        ...row,
        id: `projected-${targetMonth.format("YYYY-MM")}-${index}`,
        rentDate: projectedRentDate.toISOString(),
        rentStatus: "Unpaid",
        normalizedRentStatus: "unpaid",
        isProjectedInvoice: true,
      };
    });
};
// const CoWorking = () => {
  // const CoWorking = ({ showChart = true }) => {
const CoWorking = ({ showChart = true, showInvoiceProjections = false }) => {
  const axios = useAxiosPrivate();
  const [viewRow, setViewRow] = useState(null);
  const [editRow, setEditRow] = useState(null);
  const { control, handleSubmit, reset } = useForm();

  const { data: coworkingClients = [] } = useQuery({
    queryKey: ["coworkingInvoiceClients"],
    queryFn: async () => {
      const response = await axios.get("/api/sales/co-working-clients");
      return Array.isArray(response.data) ? response.data : [];
    },
  });

  const openEdit = (row) => {
    setEditRow(row);
    reset({
      ...row,
      invoiceFile: row.invoice?.link
        ? {
            name: row.invoice?.name || "",
            url: row.invoice.link,
          }
        : null,
      clientInvoiceName: row.invoice?.name || "",
      invoiceUploadedAt: dayjs(),
      rentDate: dayjs(row.rentDate),
      pastDueDate: row.pastDueDate ? dayjs(row.pastDueDate) : null,
      nextIncrementDate: row.nextIncrementDate ? dayjs(row.nextIncrementDate) : null,
      rentStatus: row.isProjectedInvoice ? "Unpaid" : row.rentStatus,
    });
  };

  const { mutate: saveInvoice, isPending: isSavingInvoice } = useMutation({
    mutationFn: async (values) => {
      const formData = new FormData();
      formData.append("revenueId", editRow._id);
      formData.append("isProjectedInvoice", String(Boolean(editRow.isProjectedInvoice)));

      [
        ["clients", values.clients],
        ["service", values.service],
        ["clientName", values.clientName],
        ["clientInvoiceName", values.clientInvoiceName],
        ["channel", values.channel],
        ["noOfDesks", values.noOfDesks],
        ["deskRate", values.deskRate],
        ["occupation", values.occupation],
        ["revenue", values.revenue],
        ["totalTerm", values.totalTerm],
        ["dueTerm", values.dueTerm],
        ["rentDate", values.rentDate?.toISOString()],
        ["invoiceUploadedAt", values.invoiceUploadedAt?.toISOString()],
        ["rentStatus", values.rentStatus],
        ["pastDueDate", values.pastDueDate?.toISOString()],
        ["annualIncrement", values.annualIncrement],
        ["nextIncrementDate", values.nextIncrementDate?.toISOString()],
      ].forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          formData.append(key, value);
        }
      });

      if (values.invoiceFile instanceof File) {
        formData.append("client-invoice", values.invoiceFile);
      }

      await axios.patch("/api/sales/coworking-revenue-invoice", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    },
    onSuccess: () => {
      toast.success("Invoice updated successfully");
      queryClient.invalidateQueries({ queryKey: ["coWorkingData"] });
      setEditRow(null);
    },
    onError: (error) => toast.error(error.response?.data?.message || "Unable to update invoice"),
  });
  const { data: coWorkingData = [], isLoading: isCoWorkingLoading } = useQuery({
    queryKey: ["coWorkingData"],
    queryFn: async () => {
      try {
        const response = await axios.get(`/api/sales/fetch-coworking-revenues`);
        return Array.isArray(response.data) ? response.data : [];
      } catch (error) {
        throw new Error(error.response.data.message);
      }
    },
  });

  const graphData = isCoWorkingLoading
    ? []
    : coWorkingData.flatMap((item) =>
      (item.clients || []).filter(
        (client) => getNormalizedRentStatus(client.rentStatus) === "paid"
      ).map((client) => ({
        ...client,
        vertical: "Co-Working",
      }))
    );

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
      title: { text: "Amount In Lakhs (INR)" },
      labels: {
        formatter: (val) => `${(val / 100000).toLocaleString()}`,
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
          w?.globals?.seriesNames?.[seriesIndex] || "Co-Working";
        const value = series?.[seriesIndex]?.[dataPointIndex] || 0;
        const color = w?.globals?.colors?.[seriesIndex] || "#1E88E5";

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
    colors: ["#1E3D73"],
  };

  let serialNumber = 1;
  const tableData = isCoWorkingLoading
    ? []
    : coWorkingData.map((monthData) => ({
      revenue: monthData?.clients?.map((client) => ({
        id: serialNumber++,
       _id: client._id,
        service: client.service,
        clientName: client.clientName,
        clientInvoiceName: "",
        invoice: client.invoice || null,
        invoiceName: client.invoice?.name || "",
        invoiceLink: client.invoice?.link || "",
        invoiceUploadedAt: client.invoice?.date || null,
        channel: client.channel,
        occupation: client.occupation,
        noOfDesks: client.noOfDesks,
        deskRate: normalizeAmount(client.deskRate),
        revenue: normalizeAmount(client.revenue),
        totalTerm: client.totalTerm || 0,
        dueTerm: client.dueTerm || 0,
        rentDate: client.rentDate,
        rentStatus: client.rentStatus,
        normalizedRentStatus: getNormalizedRentStatus(client.rentStatus),
        pastDueDate: client.pastDueDate,
        annualIncrement: client.annualIncrement || 0,
        nextIncrementDate: client.nextIncrementDate,
      })),
    }));

  //const flattenedRevenueData = tableData.flatMap((month) => month.revenue);
  const baseRevenueData = tableData.flatMap((month) => month.revenue);
  const flattenedRevenueData = baseRevenueData;

  return (
    <div className="flex flex-col gap-4">
      {/* {!isCoWorkingLoading ? ( */}
       {showChart && (!isCoWorkingLoading ? (
        // <YearlyGraph
        //   title={"ANNUAL MONTHLY CO WORKING REVENUES"}
        //   titleAmount={`INR ${inrFormat(totalActual)}`}
        //   data={series}
        //   options={options}
        // />
        <FyBarGraph
          data={graphData}
          chartOptions={options}
          dateKey="rentDate"
          valueKey="revenue"
          graphTitle="ANNUAL MONTHLY CO WORKING REVENUES"
        />
      ) : (
        <div className="h-72 flex justify-center items-center">
          <CircularProgress />
        </div>
      // )}
      ))}

      {!isCoWorkingLoading ? (
        <WidgetTable
          data={flattenedRevenueData}
          dateColumn={"rentDate"}
          exportData
          formatDate
          tableTitle={"MONTHLY REVENUE WITH CLIENT DETAILS"}
          totalKey="revenue"
          titleAmountOverride=""
          titleAmountGreen={({ filteredData }) =>
            `INR ${inrFormat(
              filteredData.reduce((sum, item) => {
                if (item.normalizedRentStatus !== "paid") return sum;
                return sum + getNumericAmount(item.revenue);
              }, 0)
            )}`
          }
          titleAmountRed={({ filteredData }) =>
            `INR ${inrFormat(
              filteredData.reduce((sum, item) => {
                if (item.normalizedRentStatus !== "unpaid") return sum;
                return sum + getNumericAmount(item.revenue);
              }, 0)
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
              // ? (selectedDate) =>
              //     getUnpaidInvoiceRowsForMonth(baseRevenueData, selectedDate)
               ? (selectedDate, existingMonthRows) =>
                  getUnpaidInvoiceRowsForMonth(
                    baseRevenueData,
                    selectedDate,
                    existingMonthRows,
                  )
              : undefined
          }
          columns={[
            { headerName: "Sr No", field: "srNo", width: 100 },
            { headerName: "Client Name", field: "clientName", width: 350 },
            { headerName: "Channel", field: "channel" },
            {
              headerName: "Revenue (INR)",
              field: "revenue",
              cellRenderer: (params) => inrFormat(params.value),
            },
            { headerName: "No. of Desks", field: "noOfDesks" },
            {
              headerName: "Desk Rate",
              field: "deskRate",
              cellRenderer: (params) => `INR ${inrFormat(params.value || 0)}`,
            },
            { headerName: "Total Term", field: "totalTerm" },
            { headerName: "Rent Date", field: "rentDate" },

            { headerName: "Past Due Date", field: "pastDueDate" },
            {
              headerName: "Annual Increment (%)",
              field: "annualIncrement",
            },
            {
              headerName: "Next Increment Date",
              field: "nextIncrementDate",
            },
            {
              headerName: "Rent Status",
              field: "rentStatus",
              flex: 1,
              pinned: "right",
              cellRenderer: (params) => <StatusChip status={params.value} />,
            },
             ...(showInvoiceProjections
                ? [
                  {
                    headerName: "Action",
                    field: "actions",
                    pinned: "right",
                    flex: 1,
                    minWidth: 130,
                    maxWidth: 130,
                    sortable: false,
                    filter: false,
                    cellStyle: {
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "flex-start",
                      paddingLeft: "8px",
                      paddingRight: "8px",
                    },
                    cellRenderer: (params) => (
                      <CoworkingInvoiceActions
                        row={params.data}
                        onView={setViewRow}
                        onEdit={openEdit}
                      />
                    ),
                  },
                ]
              : []),
          ]}
        />
      ) : (
        <div className="h-72 flex justify-center items-center">
          <CircularProgress />
        </div>
      )}

      {viewRow && (
        <MuiModal
          open
          onClose={() => setViewRow(null)}
          title="View Invoice Details"
        >
          <div className="flex flex-col gap-3">
            {/* <span className="text-subtitle font-pmedium text-primary uppercase">
              Co-Working Revenue Details
            </span> */}
            <DetalisFormatted title="Client Name" detail={viewRow.clientName || "-"} />
            <DetalisFormatted
              title="Invoice Name"
              detail={viewRow.invoice?.name || "-"}
            />
            <DetalisFormatted
              title="Invoice Link"
              detail={
                viewRow.invoice?.link ? (
                  <a
                    href={viewRow.invoice?.link}
                    target="_blank"
                    rel="noopener noreferrer"
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
                viewRow.invoice?.date
                  ? dayjs(viewRow.invoice?.date).format("DD-MM-YYYY")
                  : "-"
              }
            />
            <DetalisFormatted title="Channel" detail={viewRow.channel || "-"} />
            {/* <DetalisFormatted title="Occupation" detail={viewRow.occupation || "-"} /> */}
            <DetalisFormatted title="No. of Desks" detail={viewRow.noOfDesks || "-"} />
            <DetalisFormatted title="Desk Rate" detail={`INR ${inrFormat(normalizeAmount(viewRow.deskRate))}`} />
            <DetalisFormatted title="Revenue" detail={`INR ${inrFormat(normalizeAmount(viewRow.revenue))}`} />
            <DetalisFormatted title="Total Term" detail={viewRow.totalTerm || "-"} />
            {/* <DetalisFormatted title="Due Term" detail={viewRow.dueTerm || "-"} /> */}
            <DetalisFormatted
              title="Rent Date"
              detail={viewRow.rentDate ? dayjs(viewRow.rentDate).format("DD-MM-YYYY") : "-"}
            />
            <DetalisFormatted
              title="Past Due Date"
              detail={viewRow.pastDueDate ? dayjs(viewRow.pastDueDate).format("DD-MM-YYYY") : "-"}
            />
            <DetalisFormatted title="Annual Increment (%)" detail={viewRow.annualIncrement || "-"} />
            <DetalisFormatted
              title="Next Increment Date"
              detail={viewRow.nextIncrementDate ? dayjs(viewRow.nextIncrementDate).format("DD-MM-YYYY") : "-"}
            />
            <DetalisFormatted title="Paid Status" detail={viewRow.rentStatus || "-"} />
          </div>
        </MuiModal>
      )}

{editRow && (
  <MuiModal
    open
    onClose={() => setEditRow(null)}
    title="Edit Invoice"
  >
    <form
      onSubmit={handleSubmit((values) => saveInvoice(values))}
      className="grid grid-cols-2 gap-4"
    >
      <Controller
        name="clients"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            select
            label="Select Client"
            size="small"
            fullWidth
          >
            {coworkingClients.map((client) => (
              <MenuItem key={client._id} value={client._id}>
                {client.clientName}
              </MenuItem>
            ))}
          </TextField>
        )}
      />

      {[
        ["clientName", "Client Name", "text"],
        ["clientInvoiceName", "Invoice Name", "text"],
        ["channel", "Channel", "text"],
        ["noOfDesks", "No. of Desks", "number"],
        // ["occupation", "Occupation", "text"],
        // ["dueTerm", "Due Term", "number"],
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
              disabled={name === "invoiceUploadedAt"}
              slotProps={{
                textField: {
                  size: "small",
                  fullWidth: true,
                  disabled: name === "invoiceUploadedAt",
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
            label="Paid Status"
            size="small"
            fullWidth
          >
            <MenuItem value="Paid">Paid</MenuItem>
            <MenuItem value="Unpaid">Unpaid</MenuItem>
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
              allowedExtensions={["pdf", "doc", "docx"]}
            />
          </div>
        )}
      />

      <div className="col-span-2">
        <PrimaryButton
          type="submit"
          title="Update Invoice"
          disabled={isSavingInvoice}
          isLoading={isSavingInvoice}
          className="w-full"
        />
      </div>
    </form>
  </MuiModal>
)}
    </div>
  );
};

export default CoWorking;
