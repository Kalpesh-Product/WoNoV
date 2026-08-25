import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { MenuItem, TextField } from "@mui/material";
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

const getNormalizedStatus = (status) =>
  String(status || "").trim().toLowerCase();

const getNumericAmount = (value) =>
  parseFloat(String(value || "0").replace(/,/g, "")) || 0;

const GST_RATE = 0.18;

const getWorkationTaxCalculations = (taxableAmount) => {
  const hasValue = String(taxableAmount ?? "").trim() !== "";
  if (!hasValue) {
    return {
      gst: "",
      totalAmount: "",
    };
  }

  const taxable = getNumericAmount(taxableAmount);
  const gst = Number((taxable * GST_RATE).toFixed(2));
  const totalAmount = Number((taxable + gst).toFixed(2));

  return { gst, totalAmount };
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

const getEmptyWorkationFormValues = () => ({
  selectedClient: "",
  nameOfClient: "",
  clientInvoiceName: "",
  particulars: "",
  taxableAmount: "",
  gst: "",
  totalAmount: "",
  date: dayjs(),
  status: "Unpaid",
  invoiceUploadedAt: dayjs(),
  invoiceFile: null,
});

const WorkationInvoiceActions = ({ row, onView, onEdit }) => (
  <div className="flex items-center justify-start gap-0.5 w-full pl-2">
    <button
      type="button"
      aria-label="View invoice details"
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

const Workations = ({ showChart = true, showInvoiceProjections = false }) => {
  const axios = useAxiosPrivate();
  const [viewRow, setViewRow] = useState(null);
  const [editRow, setEditRow] = useState(null);
  const [modalMode, setModalMode] = useState(null);
  const [selectedFY, setSelectedFY] = useState(getCurrentFinancialYearLabel());

  const { control, handleSubmit, reset, setValue, watch } = useForm({
    defaultValues: getEmptyWorkationFormValues(),
  });

  const selectedClientValue = watch("selectedClient");
  const taxableAmountValue = watch("taxableAmount");

  const { data: workationRevenue = [], isLoading: isWorkationLoading } =
    useQuery({
      queryKey: ["workationData"],
      queryFn: async () => {
        const response = await axios.get("/api/sales/get-workation-revenue");
        return Array.isArray(response.data) ? response.data : [];
      },
    });

  const { data: workationClients = [] } = useQuery({
    queryKey: ["workationClients"],
    queryFn: async () => {
      const response = await axios.get("/api/sales/get-workation-clients");
      return Array.isArray(response.data) ? response.data : [];
    },
  });

  const clientOptions = useMemo(
    () =>
      workationClients
        .filter((client) => client?.clientName)
        .map((client) => ({
          value: client._id ? String(client._id) : `name:${client.clientName}`,
          label: client.clientName,
          clientId: client._id ? String(client._id) : "",
        })),
    [workationClients],
  );

  useEffect(() => {
    const { gst, totalAmount } = getWorkationTaxCalculations(taxableAmountValue);
    setValue("gst", gst, { shouldDirty: false });
    setValue("totalAmount", totalAmount, { shouldDirty: false });
  }, [setValue, taxableAmountValue]);

  const tableData = useMemo(
    () =>
      isWorkationLoading
        ? []
        : workationRevenue.map((item) => {
            const invoice = item.invoice || {};
            const clientName =
              item.client?.clientName || item.nameOfClient || "-";

            return {
              ...item,
              id: item._id,
              clientName,
              nameOfClient: item.nameOfClient || clientName,
              clientInvoiceName: item.clientInvoiceName || "",
              particulars: item.particulars || "-",
              taxableAmount: getNumericAmount(item.taxableAmount),
              gst: getNumericAmount(item.gst),
              totalAmount: getNumericAmount(item.totalAmount),
              date: item.date,
              status: item.status || "Unpaid",
              normalizedStatus: getNormalizedStatus(item.status || "Unpaid"),
              invoice: invoice || null,
              invoiceName: invoice.name || item.invoiceName || "-",
              invoiceLink: invoice.link || item.invoiceLink || "-",
              invoiceUploadedAt:
                item.invoiceUploadedAt || invoice.date || null,
              invoiceAttached: Boolean(invoice.link),
            };
          })
          .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0)),
    [isWorkationLoading, workationRevenue],
  );

  const graphData = useMemo(
    () =>
      isWorkationLoading
        ? []
        : tableData
            .filter((item) => item.normalizedStatus === "paid")
            .map((item) => ({
              ...item,
              taxableAmount: getNumericAmount(item.taxableAmount),
              vertical: "Workation",
            })),
    [isWorkationLoading, tableData],
  );

  const selectedFiscalYearRevenue = useMemo(
    () => graphData.filter((item) => getFinancialYear(item.date) === selectedFY),
    [graphData, selectedFY],
  );

  const maxWorkationAmount = useMemo(
    () =>
      selectedFiscalYearRevenue.reduce(
        (max, item) => Math.max(max, getNumericAmount(item.taxableAmount)),
        0,
      ),
    [selectedFiscalYearRevenue],
  );

  const useLakhsScale = maxWorkationAmount >= 100000;

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
            w?.globals?.seriesNames?.[seriesIndex] || "Workation";
          const value = series?.[seriesIndex]?.[dataPointIndex] || 0;
          const color = w?.globals?.colors?.[seriesIndex] || "#54C4A7";

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
      colors: ["#54C4A7", "#EB5C45"],
    }),
    [useLakhsScale],
  );

  const openEdit = (row) => {
    setModalMode("edit");
    setEditRow(row);
    const calculatedAmounts = getWorkationTaxCalculations(row.taxableAmount);
    reset({
      selectedClient: row.client?._id
        ? String(row.client._id)
        : row.nameOfClient
          ? `name:${row.nameOfClient}`
          : "",
      nameOfClient: row.nameOfClient || row.clientName || "",
      clientInvoiceName: row.clientInvoiceName || "",
      particulars: row.particulars || "",
      taxableAmount:
        row.taxableAmount !== undefined && row.taxableAmount !== null
          ? row.taxableAmount
          : "",
      gst: calculatedAmounts.gst,
      totalAmount: calculatedAmounts.totalAmount,
      date: row.date ? dayjs(row.date) : dayjs(),
      status: row.status || "Unpaid",
      invoiceUploadedAt: row.invoiceUploadedAt
        ? dayjs(row.invoiceUploadedAt)
        : dayjs(),
      invoiceFile: row.invoice?.link
        ? { name: row.invoice?.name || "Invoice", url: row.invoice.link }
        : null,
    });
  };

  const openCreate = () => {
    setModalMode("create");
    setEditRow(null);
    reset(getEmptyWorkationFormValues());
  };

  const closeFormModal = () => {
    setModalMode(null);
    setEditRow(null);
    reset(getEmptyWorkationFormValues());
  };

  const { mutate: saveInvoice, isPending: isSavingInvoice } = useMutation({
    mutationFn: async (values) => {
      const formData = new FormData();
      const selectedClient = clientOptions.find(
        (option) => option.value === values.selectedClient,
      );
      formData.append("revenueId", editRow?._id || "");
      formData.append(
        "isProjectedInvoice",
        String(Boolean(editRow?.isProjectedInvoice)),
      );

      [
        ["nameOfClient", values.nameOfClient],
        ["clientInvoiceName", values.clientInvoiceName],
        ["particulars", values.particulars],
        ["taxableAmount", values.taxableAmount],
        ["gst", values.gst],
        ["totalAmount", values.totalAmount],
        ["status", values.status],
      ].forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          formData.append(key, value);
        }
      });

      if (selectedClient?.clientId) {
        formData.append("clientId", selectedClient.clientId);
        formData.append("client", selectedClient.clientId);
      }

      if (values.date) {
        formData.append("date", dayjs(values.date).toISOString());
      }

      if (values.invoiceUploadedAt) {
        formData.append(
          "invoiceUploadedAt",
          dayjs(values.invoiceUploadedAt).toISOString(),
        );
      }

      if (values.invoiceFile instanceof File) {
        formData.append("client-invoice", values.invoiceFile);
      }

      await axios.patch("/api/sales/workation-revenue-invoice", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    },
    onSuccess: () => {
      toast.success(
        modalMode === "edit"
          ? "Workation invoice updated successfully"
          : "Workation added successfully",
      );
      queryClient.invalidateQueries({ queryKey: ["workationData"] });
      queryClient.invalidateQueries({ queryKey: ["workationClients"] });
      closeFormModal();
    },
    onError: (error) =>
      toast.error(
        error.response?.data?.message || "Unable to update invoice",
      ),
  });

  const revenueColumns = [
    { headerName: "Sr No", field: "srNo", width: 90 },
    { headerName: "Client Name", field: "clientName", flex: 1.4 },
    {
      headerName: "Taxable (INR)",
      field: "taxableAmount",
      flex: 1,
      cellRenderer: (params) => inrFormat(params.value || 0),
    },
    {
      headerName: "GST (INR)",
      field: "gst",
      cellRenderer: (params) => inrFormat(params.value || 0),
    },
    {
      headerName: "Total (INR)",
      field: "totalAmount",
      flex: 1,
      cellRenderer: (params) => inrFormat(params.value || 0),
    },
    {
      headerName: "Status",
      field: "status",
      flex: 1,
      pinned: "right",
      cellRenderer: (params) => <StatusChip status={params.value || "Unpaid"} />,
    },
  ];

  const billingColumns = [
    { headerName: "Sr No", field: "srNo", width: 90 },
    { headerName: "Client Name", field: "clientName" },
    { headerName: "Particulars", field: "particulars" },
    {
      headerName: "Taxable (INR)",
      field: "taxableAmount",
      cellRenderer: (params) => inrFormat(params.value || 0),
    },
    {
      headerName: "GST (INR)",
      field: "gst",
      cellRenderer: (params) => inrFormat(params.value || 0),
    },
    {
      headerName: "Total (INR)",
      field: "totalAmount",
      cellRenderer: (params) => inrFormat(params.value || 0),
    },
    {
      headerName: "Revenue Collection Date",
      field: "date",
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
      flex: 1,
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
      headerName: "Invoice Uploaded At",
      field: "invoiceUploadedAt",
      flex: 1,
      pinned:"right",
      valueFormatter: (params) =>
        params.value ? dayjs(params.value).format("DD-MM-YYYY") : "-",
    },
    {
      headerName: "Status",
      field: "status",
      flex: 1,
      pinned: "right",
      cellRenderer: (params) => <StatusChip status={params.value || "Unpaid"} />,
    },
    {
      headerName: "Actions",
      field: "actions",
      pinned: "right",
      flex:1,
      sortable: false,
      filter: false,
      cellRenderer: (params) => (
        <WorkationInvoiceActions
          row={params.data}
          onView={setViewRow}
          onEdit={openEdit}
        />
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      {showChart && !isWorkationLoading ? (
        <FyBarGraph
          graphTitle="ANNUAL MONTHLY WORKATION REVENUES"
          data={graphData}
          chartOptions={options}
          dateKey="date"
          valueKey="taxableAmount"
          selectedFY={selectedFY}
          onSelectedFYChange={setSelectedFY}
          disableHoverCrosshair
        />
      ) : null}

      <WidgetTable
        data={tableData}
        tableTitle={
          showInvoiceProjections
            ? "Workation Revenue Client Invoicing"
            : "Monthly Revenue with Client Details"
        }
        totalKey="taxableAmount"
        dateColumn="date"
        exportData
        search
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
        preserveCurrentMonthRange={showInvoiceProjections}
        getMissingRangeData={undefined}
        headerActions={
          showInvoiceProjections ? (
            <PrimaryButton
              type="button"
              title="Add Workation"
              handleSubmit={openCreate}
            />
          ) : null
        }
        columns={showInvoiceProjections ? billingColumns : revenueColumns}
      />

      {viewRow && (
        <MuiModal
          open
          onClose={() => setViewRow(null)}
          title="View Workation Invoice Details"
        >
          <div className="grid grid-cols-1 gap-4 w-full">
            <div className="font-bold text-lg">Client Details</div>
            <DetalisFormatted
              title="Client Name"
              detail={viewRow.nameOfClient || viewRow.clientName || "-"}
            />
            <DetalisFormatted
              title="Client Invoice Name"
              detail={viewRow.clientInvoiceName || "-"}
            />
            <DetalisFormatted
              title="Particulars"
              detail={viewRow.particulars || "-"}
            />

            <div className="font-bold text-lg pt-4">Payment Details</div>
            <DetalisFormatted
              title="Taxable Amount"
              detail={`INR ${inrFormat(viewRow.taxableAmount || 0)}`}
            />
            <DetalisFormatted
              title="GST Amount"
              detail={`INR ${inrFormat(viewRow.gst || 0)}`}
            />
            <DetalisFormatted
              title="Total Amount"
              detail={`INR ${inrFormat(viewRow.totalAmount || 0)}`}
            />
            <DetalisFormatted
              title="Revenue Collection Date"
              detail={
                viewRow.date ? dayjs(viewRow.date).format("DD-MM-YYYY") : "-"
              }
            />

            <div className="font-bold text-lg pt-4">Finance Invoice Details</div>
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
              title="Invoice Uploaded At"
              detail={
                viewRow.invoiceUploadedAt
                  ? dayjs(viewRow.invoiceUploadedAt).format("DD-MM-YYYY")
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
          title={modalMode === "edit" ? "Edit Workation" : "Add Workation"}
        >
          <form
            onSubmit={handleSubmit(saveInvoice)}
            className="grid grid-cols-2 gap-4"
          >
            <Controller
              name="selectedClient"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  label="Select Client"
                  size="small"
                  fullWidth
                  onChange={(event) => {
                    const value = event.target.value;
                    field.onChange(value);

                    if (!value) {
                      setValue("nameOfClient", "", { shouldDirty: true });
                      return;
                    }

                    const selectedOption = clientOptions.find(
                      (option) => option.value === value,
                    );

                    if (selectedOption) {
                      setValue("nameOfClient", selectedOption.label, {
                        shouldDirty: true,
                      });
                    }
                  }}
                >
                  <MenuItem value="">Select Client</MenuItem>
                  {clientOptions.map((client) => (
                    <MenuItem key={client.value} value={client.value}>
                      {client.label}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />

            <Controller
              name="nameOfClient"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Client Name"
                  size="small"
                  fullWidth
                  disabled={Boolean(selectedClientValue)}
                  InputProps={{ readOnly: Boolean(selectedClientValue) }}
                  onChange={(event) => {
                    field.onChange(event);
                    if (selectedClientValue) {
                      setValue("selectedClient", "", { shouldDirty: true });
                    }
                  }}
                />
              )}
            />

            <div className="col-span-2 grid grid-cols-2 gap-4">
              <Controller
                name="clientInvoiceName"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Client Invoice Name"
                    size="small"
                    fullWidth
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
            </div>

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
                name="totalAmount"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="number"
                    label="Total Amount"
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
                name="date"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    {...field}
                    value={field.value || null}
                    onChange={(value) => field.onChange(value)}
                    label="Revenue Collection Date"
                    format="DD-MM-YYYY"
                    slotProps={{
                      textField: { fullWidth: true, size: "small" },
                    }}
                  />
                )}
              />

              <Controller
                name="invoiceUploadedAt"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    {...field}
                    value={field.value || null}
                    onChange={(value) => field.onChange(value)}
                    label="Invoice Upload Date"
                    format="DD-MM-YYYY"
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        size: "small",
                        disabled: true,
                      },
                    }}
                    disabled
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
                title={modalMode === "edit" ? "Update Invoice" : "Add Workation"}
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

export default Workations;
