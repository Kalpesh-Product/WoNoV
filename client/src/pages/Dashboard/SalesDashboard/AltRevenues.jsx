import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { CircularProgress, MenuItem, TextField } from "@mui/material";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import { toast } from "sonner";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import WidgetTable from "../../../components/Tables/WidgetTable";
import StatusChip from "../../../components/StatusChip";
import FyBarGraph from "../../../components/graphs/FyBarGraph";
import MuiModal from "../../../components/MuiModal";
import DetalisFormatted from "../../../components/DetalisFormatted";
import UploadFileInput from "../../../components/UploadFileInput";
import PrimaryButton from "../../../components/PrimaryButton";
import ThreeDotMenu from "../../../components/ThreeDotMenu";
import { inrFormat } from "../../../utils/currencyFormat";
import { queryClient } from "../../../main";

const GST_RATE = 0.18;

const getNormalizedStatus = (status) =>
  String(status || "").trim().toLowerCase();

const getNumericAmount = (value) =>
  parseFloat(String(value || "0").replace(/,/g, "")) || 0;

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

const getAlternateTaxCalculations = (taxableAmount) => {
  const taxable = getNumericAmount(taxableAmount);
  if (String(taxableAmount ?? "").trim() === "") {
    return { gst: "", invoiceAmount: "" };
  }

  const gst = Number((taxable * GST_RATE).toFixed(2));
  const invoiceAmount = Number((taxable + gst).toFixed(2));

  return { gst, invoiceAmount };
};

const getEmptyAlternateFormValues = () => ({
  selectedClient: "",
  name: "",
  clientInvoiceName: "",
  particulars: "",
  taxableAmount: "",
  gst: "",
  invoiceAmount: "",
  invoiceCreationDate: dayjs(),
  invoicePaidDate: dayjs(),
  status: "Unpaid",
  invoiceFile: null,
});

const AlternateRevenueActions = ({ row, onView, onEdit }) => (
  <div className="flex items-center justify-start gap-0.5 w-full pl-2">
    <button
      type="button"
      aria-label="View alternate revenue details"
      onClick={() => onView(row)}
      className="rounded p-2 text-gray-500 hover:bg-slate-100 hover:text-primary"
    >
      <MdOutlineRemoveRedEye size={18} />
    </button>

    <ThreeDotMenu
      rowId={row?._id || row?.id}
      menuItems={[
        {
          label: "Edit",
          onClick: () => onEdit(row),
        },
      ]}
    />
  </div>
);

const AltRevenues = ({ showChart = true }) => {
  const axios = useAxiosPrivate();
  const [viewRow, setViewRow] = useState(null);
  const [editRow, setEditRow] = useState(null);
  const [modalMode, setModalMode] = useState(null);
  const [selectedFY, setSelectedFY] = useState(getCurrentFinancialYearLabel());
  const isBillingView = !showChart;

  const { control, handleSubmit, reset, setValue, watch } = useForm({
    defaultValues: getEmptyAlternateFormValues(),
  });

  const selectedClientValue = watch("selectedClient");
  const taxableAmountValue = watch("taxableAmount");

  const { data: alternateRevenue = [], isLoading: isLoadingAlternateRevenue } =
    useQuery({
      queryKey: ["alternateRevenue"],
      queryFn: async () => {
        const response = await axios.get("/api/sales/get-alternate-revenue");
        return Array.isArray(response.data) ? response.data : [];
      },
    });

  useEffect(() => {
    const { gst, invoiceAmount } =
      getAlternateTaxCalculations(taxableAmountValue);
    setValue("gst", gst, { shouldDirty: false });
    setValue("invoiceAmount", invoiceAmount, { shouldDirty: false });
  }, [setValue, taxableAmountValue]);

  const alternateRevenueRows = useMemo(
    () =>
      alternateRevenue.flatMap((monthData, monthIndex) => {
        if (Array.isArray(monthData?.revenue)) {
          return monthData.revenue.map((item, index) => ({
            ...item,
            id: item._id || `${monthData.month || monthIndex}-${index}`,
          }));
        }

        return [
          {
            ...monthData,
            id: monthData?._id || monthData?.id || `alt-${monthIndex}`,
          },
        ];
      }),
    [alternateRevenue],
  );

  const tableData = useMemo(
    () =>
      alternateRevenueRows.map((item) => {
        const invoice = item.invoice || {};

        return {
          ...item,
          name: item.name || "-",
          clientName: item.name || item.clientName || "-",
          clientInvoiceName: item.clientInvoiceName || "-",
          particulars: item.particulars || "-",
          taxableAmount: getNumericAmount(item.taxableAmount),
          gst: getNumericAmount(item.gst),
          invoiceAmount: getNumericAmount(item.invoiceAmount),
          invoiceCreationDate: item.invoiceCreationDate,
          invoicePaidDate: item.invoicePaidDate || invoice.date || null,
          status: item.status || "Unpaid",
          normalizedStatus: getNormalizedStatus(item.status || "Unpaid"),
          invoice: invoice || null,
          invoiceName: invoice.name || item.invoiceName || "-",
          invoiceLink: invoice.link || item.invoiceLink || "-",
          invoiceAttached: Boolean(invoice.link),
        };
      }),
    [alternateRevenueRows],
  );

  const clientOptions = useMemo(() => {
    const clientMap = new Map();
    const pushName = (value) => {
      const trimmedName = String(value || "").trim();
      if (!trimmedName) return;

      const normalizedName = trimmedName.toLowerCase();
      if (!clientMap.has(normalizedName)) {
        clientMap.set(normalizedName, trimmedName);
      }
    };

    alternateRevenueRows.forEach((item) =>
      pushName(item?.name || item?.clientName || item?.clientInvoiceName),
    );

    return [...clientMap.values()].sort((a, b) => a.localeCompare(b));
  }, [alternateRevenueRows]);

  const graphData = useMemo(
    () =>
      isLoadingAlternateRevenue
        ? []
        : tableData
            .filter((item) => item.normalizedStatus === "paid")
            .map((item) => ({
              ...item,
              taxableAmount: getNumericAmount(item.taxableAmount),
              vertical: "Alternate Revenue",
            })),
    [isLoadingAlternateRevenue, tableData],
  );

  const selectedFiscalYearRevenue = useMemo(
    () =>
      graphData.filter(
        (item) => getFinancialYear(item.invoiceCreationDate) === selectedFY,
      ),
    [graphData, selectedFY],
  );

  const maxAlternateRevenueAmount = useMemo(
    () =>
      selectedFiscalYearRevenue.reduce(
        (max, item) => Math.max(max, getNumericAmount(item.taxableAmount)),
        0,
      ),
    [selectedFiscalYearRevenue],
  );

  const useLakhsScale = maxAlternateRevenueAmount >= 100000;

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
            w?.globals?.seriesNames?.[seriesIndex] || "Alternate Revenue";
          const value = series?.[seriesIndex]?.[dataPointIndex] || 0;
          const color = w?.globals?.colors?.[seriesIndex] || "#1976D2";

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
      colors: ["#1976D2"],
    }),
    [useLakhsScale],
  );

  const openCreate = () => {
    setModalMode("create");
    setEditRow(null);
    reset(getEmptyAlternateFormValues());
  };

  const openEdit = (row) => {
    setModalMode("edit");
    setEditRow(row);

    const calculatedAmounts = getAlternateTaxCalculations(row.taxableAmount);

    reset({
      selectedClient: row.name || "",
      name: row.name || "",
      clientInvoiceName: row.clientInvoiceName || "",
      particulars: row.particulars || "",
      taxableAmount:
        row.taxableAmount !== undefined && row.taxableAmount !== null
          ? row.taxableAmount
          : "",
      gst: calculatedAmounts.gst,
      invoiceAmount: calculatedAmounts.invoiceAmount,
      invoiceCreationDate: row.invoiceCreationDate
        ? dayjs(row.invoiceCreationDate)
        : dayjs(),
      invoicePaidDate: row.invoicePaidDate
        ? dayjs(row.invoicePaidDate)
        : dayjs(),
      status: row.status || "Unpaid",
      invoiceFile: row.invoice?.link
        ? { name: row.invoice?.name || "Invoice", url: row.invoice.link }
        : null,
    });
  };

  const closeFormModal = () => {
    setModalMode(null);
    setEditRow(null);
    reset(getEmptyAlternateFormValues());
  };

  const { mutate: saveAlternateRevenue, isPending: isSavingAlternateRevenue } =
    useMutation({
      mutationFn: async (values) => {
        const formData = new FormData();
        formData.append("revenueId", editRow?._id || "");
        if (values.selectedClient) {
          formData.append("originalClientName", values.selectedClient);
        }

        [
          ["name", values.name || values.selectedClient],
          ["clientInvoiceName", values.clientInvoiceName],
          ["particulars", values.particulars],
          ["taxableAmount", values.taxableAmount],
          ["gst", values.gst],
          ["invoiceAmount", values.invoiceAmount],
          ["status", values.status],
        ].forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            formData.append(key, value);
          }
        });

        if (values.invoiceCreationDate) {
          formData.append(
            "invoiceCreationDate",
            dayjs(values.invoiceCreationDate).toISOString(),
          );
        }

        if (values.invoicePaidDate) {
          formData.append(
            "invoicePaidDate",
            dayjs(values.invoicePaidDate).toISOString(),
          );
        }

        if (values.invoiceFile instanceof File) {
          formData.append("client-invoice", values.invoiceFile);
        }

        await axios.patch("/api/sales/alternate-revenue-invoice", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      },
      onSuccess: () => {
        toast.success(
          modalMode === "edit"
            ? "Alternate revenue updated successfully"
            : "Alternate revenue added successfully",
        );
        queryClient.invalidateQueries({ queryKey: ["alternateRevenue"] });
        closeFormModal();
      },
      onError: (error) =>
        toast.error(
          error.response?.data?.message || "Unable to save alternate revenue",
        ),
    });

  const revenueColumns = [
    { headerName: "Sr No", field: "srNo", width: 90 },
    { headerName: "Particulars", field: "particulars", minWidth: 190, flex: 1.2 },
    {
      headerName: "Taxable Amount (INR)",
      field: "taxableAmount",
      minWidth: 170,
      cellRenderer: (params) => inrFormat(params.value || 0),
    },
    {
      headerName: "Invoice Creation Date",
      field: "invoiceCreationDate",
      minWidth: 180,
      valueFormatter: (params) =>
        params.value ? dayjs(params.value).format("DD-MM-YYYY") : "-",
    },
    {
      headerName: "Invoice Paid Date",
      field: "invoicePaidDate",
      minWidth: 170,
      valueFormatter: (params) =>
        params.value ? dayjs(params.value).format("DD-MM-YYYY") : "-",
    },
    {
      headerName: "GST (INR)",
      field: "gst",
      minWidth: 130,
      cellRenderer: (params) => inrFormat(params.value || 0),
    },
    {
      headerName: "Status",
      field: "status",
      minWidth: 120,
      pinned: "right",
      cellRenderer: (params) => <StatusChip status={params.value || "Unpaid"} />,
    },
  ];

  const billingColumns = [
    { headerName: "Sr No", field: "srNo", width: 90 },
    { headerName: "Client Name", field: "clientName"},
    { headerName: "Particulars", field: "particulars"},
    {
      headerName: "Taxable Amount (INR)",
      field: "taxableAmount",
      cellRenderer: (params) => inrFormat(params.value || 0),
    },
    {
      headerName: "GST (INR)",
      field: "gst",
      cellRenderer: (params) => inrFormat(params.value || 0),
    },
    {
      headerName: "Invoice Amount (INR)",
      field: "invoiceAmount",
      cellRenderer: (params) => inrFormat(params.value || 0),
    },
    {
      headerName: "Invoice Creation Date",
      field: "invoiceCreationDate",
      valueFormatter: (params) =>
        params.value ? dayjs(params.value).format("DD-MM-YYYY") : "-",
    },
    {
      headerName: "Client Invoice Name",
      field: "clientInvoiceName",
      valueFormatter: (params) => params.value || "-",
    },
    {
      headerName: "Invoice Link",
      field: "invoiceLink",
      flex:1,
      pinned:"right",
      cellRenderer: (params) =>
        params.value && params.value !== "-" ? (
          <a
            href={params.value}
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
      headerName: "Invoice Paid Date",
      field: "invoicePaidDate",
      flex:1,
      pinned:"right",
      valueFormatter: (params) =>
        params.value ? dayjs(params.value).format("DD-MM-YYYY") : "-",
    },
    {
      headerName: "Status",
      field: "status",
      flex:1,
      pinned: "right",
      cellRenderer: (params) => <StatusChip status={params.value || "Unpaid"} />,
    },
    {
      headerName: "Actions",
      field: "actions",
      minWidth: 110,
      pinned: "right",
      sortable: false,
      filter: false,
      cellRenderer: (params) => (
        <AlternateRevenueActions
          row={params.data}
          onView={setViewRow}
          onEdit={openEdit}
        />
      ),
    },
  ];

  const columns = isBillingView ? billingColumns : revenueColumns;

  return (
    <div className="flex flex-col gap-4">
      {showChart && !isLoadingAlternateRevenue ? (
        <FyBarGraph
          graphTitle="ANNUAL MONTHLY ALTERNATE REVENUES"
          chartOptions={options}
          data={graphData}
          dateKey="invoiceCreationDate"
          valueKey="taxableAmount"
          selectedFY={selectedFY}
          onSelectedFYChange={setSelectedFY}
          disableHoverCrosshair
        />
      ) : null}

      {isLoadingAlternateRevenue ? (
        <div className="flex h-72 justify-center items-center">
          <CircularProgress />
        </div>
      ) : (
        <WidgetTable
          tableTitle={
            isBillingView
              ? "Monthly Revenue with Alternate Billing Details"
              : "Monthly Revenue with Source Details"
          }
          data={tableData}
          dateColumn="invoiceCreationDate"
          totalKey="taxableAmount"
          exportData
          search
          preserveCurrentMonthRange={isBillingView}
          titleAmountOverride=""
          titleAmountGreen={({ filteredData }) =>
            `INR ${inrFormat(
              filteredData.reduce((sum, item) => {
                if (item.normalizedStatus !== "paid") return sum;
                return sum + getNumericAmount(item.taxableAmount);
              }, 0),
            )}`
          }
          titleAmountRed={({ filteredData }) =>
            `INR ${inrFormat(
              filteredData.reduce((sum, item) => {
                if (item.normalizedStatus !== "unpaid") return sum;
                return sum + getNumericAmount(item.taxableAmount);
              }, 0),
            )}`
          }
          titleAmountTotal={({ rangeTotal }) => `INR ${inrFormat(rangeTotal)}`}
          greenTitle="Paid"
          redTitle="Unpaid"
          totalTitle="Total"
          summaryChipVariant="ticket"
          headerActions={
            isBillingView ? (
              <PrimaryButton
                type="button"
                title="Add Alternate"
                handleSubmit={openCreate}
              />
            ) : null
          }
          columns={columns}
        />
      )}

      {viewRow && (
        <MuiModal
          open
          onClose={() => setViewRow(null)}
          title="View Alternate Revenue Details"
        >
          <div className="flex flex-col gap-3">
            <DetalisFormatted
              title="Client Name"
              detail={viewRow.name || viewRow.clientName || "-"}
            />
            <DetalisFormatted
              title="Client Invoice Name"
              detail={viewRow.clientInvoiceName || "-"}
            />
            <DetalisFormatted
              title="Particulars"
              detail={viewRow.particulars || "-"}
            />
            <DetalisFormatted
              title="Taxable Amount"
              detail={`INR ${inrFormat(viewRow.taxableAmount || 0)}`}
            />
            <DetalisFormatted
              title="GST"
              detail={`INR ${inrFormat(viewRow.gst || 0)}`}
            />
            <DetalisFormatted
              title="Invoice Amount"
              detail={`INR ${inrFormat(viewRow.invoiceAmount || 0)}`}
            />
            <DetalisFormatted
              title="Invoice Creation Date"
              detail={
                viewRow.invoiceCreationDate
                  ? dayjs(viewRow.invoiceCreationDate).format("DD-MM-YYYY")
                  : "-"
              }
            />
            <DetalisFormatted
              title="Invoice Attached"
              detail={viewRow.invoice?.link ? "Yes" : "No"}
            />
            <DetalisFormatted
              title="Invoice Link"
              detail={
                viewRow.invoice?.link ? (
                  <a
                    href={viewRow.invoice.link}
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
              title="Invoice Paid Date"
              detail={
                viewRow.invoicePaidDate
                  ? dayjs(viewRow.invoicePaidDate).format("DD-MM-YYYY")
                  : "-"
              }
            />
              <DetalisFormatted
              title="Paid/Rent Status"
              detail={viewRow.status || "Unpaid"}
            />
          </div>
        </MuiModal>
      )}

      {modalMode && (
        <MuiModal
          open
          onClose={closeFormModal}
          title={modalMode === "edit" ? "Edit Alternate" : "Add Alternate"}
        >
          <form
            onSubmit={handleSubmit(saveAlternateRevenue)}
            className="grid grid-cols-2 gap-4"
          >
            <div className="col-span-2 grid grid-cols-2 gap-4">
              <Controller
                name="selectedClient"
                control={control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    select
                    label="Select Client"
                    size="small"
                    fullWidth
                    displayEmpty
                    onChange={(event) => {
                      field.onChange(event);
                      setValue("name", event.target.value, {
                        shouldDirty: true,
                      });
                    }}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  >
                    <MenuItem value="">Select Client</MenuItem>
                    {clientOptions.map((client) => (
                      <MenuItem key={client} value={client}>
                        {client}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />

              <Controller
                name="name"
                control={control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label="Client Name"
                    size="small"
                    fullWidth
                    disabled={Boolean(selectedClientValue)}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
            </div>

            <Controller
              name="clientInvoiceName"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="Client Invoice Name"
                  size="small"
                  fullWidth
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />

            <Controller
              name="particulars"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Particulars"
                  size="small"
                  fullWidth
                />
              )}
            />

            <div className="col-span-2 grid grid-cols-3 gap-4">
              <Controller
                name="taxableAmount"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="number"
                    label="Taxable Amount"
                    size="small"
                    fullWidth
                  />
                )}
              />

              <Controller
                name="gst"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="number"
                    label="GST (18%)"
                    size="small"
                    fullWidth
                    disabled
                    InputProps={{ readOnly: true }}
                  />
                )}
              />

              <Controller
                name="invoiceAmount"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="number"
                    label="Invoice Amount"
                    size="small"
                    fullWidth
                    disabled
                    InputProps={{ readOnly: true }}
                  />
                )}
              />
            </div>

            <div className="col-span-2 grid grid-cols-3 gap-4">
              <Controller
                name="invoiceCreationDate"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    {...field}
                    value={field.value || null}
                    onChange={(value) => field.onChange(value)}
                    label="Invoice Creation Date"
                    format="DD-MM-YYYY"
                    slotProps={{ textField: { fullWidth: true, size: "small" } }}
                  />
                )}
              />

              <Controller
                name="invoicePaidDate"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    {...field}
                    value={field.value || null}
                    onChange={(value) => field.onChange(value)}
                    label="Invoice Paid Date"
                    format="DD-MM-YYYY"
                    disabled
                    slotProps={{ textField: { fullWidth: true, size: "small" } }}
                  />
                )}
              />

              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label="Paid/Rent Status"
                    size="small"
                    fullWidth
                  >
                    <MenuItem value="Paid">Paid</MenuItem>
                    <MenuItem value="Unpaid">Unpaid</MenuItem>
                  </TextField>
                )}
              />
            </div>

            <Controller
              name="invoiceFile"
              control={control}
              render={({ field }) => (
                <div className="col-span-2">
                  <UploadFileInput
                    value={field.value}
                    onChange={field.onChange}
                    allowedExtensions={["pdf", "doc", "docx"]}
                    previewType="pdf"
                  />
                </div>
              )}
            />

            <div className="col-span-2">
              <PrimaryButton
                type="submit"
                title={modalMode === "edit" ? "Update Alternate" : "Add Alternate"}
                disabled={isSavingAlternateRevenue}
                isLoading={isSavingAlternateRevenue}
                className="w-full"
              />
            </div>
          </form>
        </MuiModal>
      )}
    </div>
  );
};

export default AltRevenues;
