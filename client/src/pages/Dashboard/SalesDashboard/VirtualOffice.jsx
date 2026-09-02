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

const formatBillingNumber = (value) => {
  const numberValue = Number(String(value ?? "").replace(/,/g, ""));
  if (!Number.isFinite(numberValue)) return "";

  const truncatedValue = Math.trunc(numberValue * 100) / 100;
  return Number.isInteger(truncatedValue)
    ? String(Math.trunc(truncatedValue))
    : truncatedValue.toFixed(2);
};

const getClientIdentity = (row) => {
  const id = row?.client?._id || row?.client;
  if (id) return `id:${String(id)}`;
  return `name:${String(row?.clientName || "").trim().toLowerCase()}`;
};

const getVirtualOfficeCurrentRate = (row) => {
  const client = row?.client || {};
  const startDate = dayjs(
    client.termStartDate || client.startDate || row?.rentDate || row?.createdAt,
  );
  const endDate = dayjs(client.termEnd || client.endDate || row?.pastDueDate);
  const annualIncrement = Number(
    client.annualIncrement ?? row?.annualIncrement ?? 0,
  ) || 0;
  const baseRate = Number(
    client.openDeskRate ?? row?.deskRate ?? client.cabinDeskRate ?? 0,
  ) || 0;

  if (
    !startDate.isValid() ||
    !endDate.isValid() ||
    !endDate.isAfter(startDate, "day")
  ) {
    return baseRate;
  }

  const yearsElapsed = Math.max(endDate.diff(startDate, "year"), 0);

  return baseRate * Math.pow(1 + annualIncrement / 100, yearsElapsed);
};

const getUnpaidInvoiceRowsForMonth = (
  rows,
  selectedDate,
  existingMonthRows = [],
) => {
  const targetMonth = dayjs(selectedDate).startOf("month");
  const currentMonth = dayjs().startOf("month");

  if (!targetMonth.isValid() || targetMonth.isBefore(currentMonth)) return [];

  // const historicalPaidRows = rows.filter((row) => {
  //   const rowMonth = dayjs(row.rentDate).startOf("month");
  //   return (
  //     rowMonth.isValid() &&
  //     rowMonth.isBefore(currentMonth) &&
  //     getNormalizedPaymentStatus(row.rentStatus ?? row.status) === "paid"
  //   );
  // });
  // if (!historicalPaidRows.length) return [];

  // const latestSourceMonth = historicalPaidRows.reduce((latest, row) => {
  //   const rowMonth = dayjs(row.rentDate).startOf("month");
  //   return rowMonth.isAfter(latest) ? rowMonth : latest;
  // }, dayjs(historicalPaidRows[0].rentDate).startOf("month"));

  // const existingClients = new Set(existingMonthRows.map(getClientIdentity));
  // const projectedClients = new Set();

  // return historicalPaidRows
  //   .filter((row) => dayjs(row.rentDate).isSame(latestSourceMonth, "month"))
  //   .filter((row) => !existingClients.has(getClientIdentity(row)))
  //   .filter((row) => {
  //     const identity = getClientIdentity(row);
  //     if (projectedClients.has(identity)) return false;
  //     projectedClients.add(identity);
  //     return true;
  //   })

  const historicalRows = rows.filter((row) => {
    const rowMonth = dayjs(row.rentDate).startOf("month");
    return rowMonth.isValid() && rowMonth.isBefore(currentMonth);
  });
  if (!historicalRows.length) return [];

  const latestSourceMonth = historicalRows.reduce((latest, row) => {
    const rowMonth = dayjs(row.rentDate).startOf("month");
    return rowMonth.isAfter(latest) ? rowMonth : latest;
  }, dayjs(historicalRows[0].rentDate).startOf("month"));

  // Keep occurrences rather than a Set because one client can legitimately have
  // multiple revenue rows in a month. Existing rows consume only their matching
  // occurrence; every other row from the latest historical month is projected.
  const existingClientCounts = existingMonthRows.reduce((counts, row) => {
    const identity = getClientIdentity(row);
    counts.set(identity, (counts.get(identity) || 0) + 1);
    return counts;
  }, new Map());

  return historicalRows
    .filter((row) => dayjs(row.rentDate).isSame(latestSourceMonth, "month"))
    .filter((row) => {
      const identity = getClientIdentity(row);
      const existingCount = existingClientCounts.get(identity) || 0;
      if (existingCount > 0) {
        existingClientCounts.set(identity, existingCount - 1);
        return false;
      }
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

const getUserDisplayName = (user) => {
  if (!user) return "";
  if (typeof user === "string") return user;
  return (
    user.employeeName ||
    [user.firstName, user.middleName, user.lastName].filter(Boolean).join(" ") ||
    user.name ||
    ""
  ).trim();
};

// const VirtualOffice = () => {
  //const VirtualOffice = ({ showChart = true }) => {
  const VirtualOffice = ({ showChart = true, showInvoiceProjections = false }) => {
  const axios = useAxiosPrivate();
  const [viewRow, setViewRow] = useState(null);
  const [editRow, setEditRow] = useState(null);
  const [addRow, setAddRow] = useState(false);
  const [addedRevenueIds, setAddedRevenueIds] = useState([]);
  const { control, handleSubmit, reset } = useForm();
  const {
    control: addControl,
    handleSubmit: handleAddSubmit,
    reset: resetAdd,
    setValue: setAddValue,
    watch: watchAdd,
  } = useForm();
  const [selectedFY, setSelectedFY] = useState(
    getCurrentFinancialYearLabel(),
  );

  const {
    data: virtualOfficeRevenue = [],
    isLoading: isLoadingVirtualOfficeRevenue = false,
  } = useQuery({
    queryKey: ["virtualOfficeRevenue", { useClientDetails: true }],
   // queryKey: ["virtualOfficeRevenue"],
    // queryKey: [
    //   "virtualOfficeRevenue",
    //   { useClientDetails: showInvoiceProjections },
    // ],
    queryFn: async () => {
      try {
        const response = await axios.get(
          `/api/sales/get-virtual-office-revenue`,
          { params: { useClientDetails: true } },
          //  {
          //   params: showInvoiceProjections
          //     ? { useClientDetails: true }
          //     : undefined,
          // },    
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

  const activeVirtualOfficeClients = useMemo(
    () =>
      virtualOfficeClients.filter((client) =>
        typeof client?.isActive === "boolean"
          ? client.isActive
          : Boolean(client?.clientStatus),
      ),
    [virtualOfficeClients],
  );

  const tableData = useMemo(
    () =>
      isLoadingVirtualOfficeRevenue
        ? []
        : (Array.isArray(virtualOfficeRevenue) ? virtualOfficeRevenue : []).map((item) => ({
            ...item,
            ...(showInvoiceProjections && item.client
              ? {
                  deskRate: getVirtualOfficeCurrentRate(item),
                  revenue:
                    (Number(
                      item.client?.totalDesks ||
                        item.noOfDesks ||
                        Number(item.client?.cabinDesks || 0) +
                          Number(item.client?.openDesks || 0),
                    ) || 0) * getVirtualOfficeCurrentRate(item),
                }
              : {}),
            clientName: item.client?.clientName,
             securityDeposit: item.client?.securityDeposit ?? item.securityDeposit,
            billingFrequency: item.client?.billingFrequency || item.billingFrequency,
            normalizedStatus: getNormalizedPaymentStatus(
              item.rentStatus ?? item.status,
            ),
            rentStatus: item.rentStatus || (item.status ? "Paid" : "Unpaid"),
            invoiceLink: item.invoice?.link || "",
            invoiceUploadedAt: item.invoice?.date || item.invoiceUploadedAt,
            //normalizedStatus: getNormalizedPaymentStatus(item.status),
          })),
    [isLoadingVirtualOfficeRevenue, showInvoiceProjections, virtualOfficeRevenue],
  );

   const openEdit = (row) => {
    setEditRow(row);
    reset({
      ...row,
      client: row.client?._id || row.client,
      clientName: row.clientName || "",
      clientInvoiceName: row.clientInvoiceName || row.clientName || "",
      revenue: formatBillingNumber(row.revenue),
      channel: row.channel || "",
      noOfDesks: row.noOfDesks ?? "",
      deskRate: formatBillingNumber(row.deskRate),
      totalTerm: row.totalTerm ?? "",
      securityDeposit: row.securityDeposit ?? row.client?.securityDeposit ?? "",
      billingFrequency: row.billingFrequency || row.client?.billingFrequency || "Yearly",
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
        "securityDeposit",
        "billingFrequency",
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

  const selectedAddClientId = watchAdd("client");
  const selectedAddClient = activeVirtualOfficeClients.find(
    (client) => client._id === selectedAddClientId,
  );
  const addTotalDesks =
    Number(selectedAddClient?.totalDesks) ||
    Number(selectedAddClient?.cabinDesks || 0) +
      Number(selectedAddClient?.openDesks || 0);
  const addDeskRate = selectedAddClient
    ? getVirtualOfficeCurrentRate({ client: selectedAddClient })
    : 0;
  const addRevenue = addTotalDesks * addDeskRate;

  const { mutate: addVirtualInvoice, isPending: isAddingVirtualInvoice } =
    useMutation({
      mutationFn: async (values) => {
        const payload = {
          client: values.client,
          location: selectedAddClient?.buildingAddress || selectedAddClient?.city || "",
          channel: selectedAddClient?.bookingType || "Direct",
          taxableAmount: addRevenue,
          revenue: addRevenue,
          totalTerm: selectedAddClient?.totalTerm || 0,
          rentDate: selectedAddClient?.rentDate || null,
          rentStatus: values.rentStatus,
          annualIncrement: selectedAddClient?.annualIncrement || 0,
          nextIncrementDate: selectedAddClient?.nextIncrementDate || null,
        };
        const response = await axios.post("/api/sales/create-virtual-office-revenue", payload);
        const createdRevenue = response.data?.data || response.data?.revenue;

        if (values.invoiceFile instanceof File && createdRevenue?._id) {
          const form = new FormData();
          form.append("revenueId", createdRevenue._id);
          form.append("rentStatus", values.rentStatus);
          form.append("invoiceUploadedAt", new Date().toISOString());
          form.append("client-invoice", values.invoiceFile);
          await axios.patch("/api/sales/virtual-office-revenue-invoice", form);
        }

        return { ...response.data, createdRevenue };
      },
      onSuccess: (data) => {
        toast.success("Virtual office invoice added successfully");
        if (data.createdRevenue?._id) {
          setAddedRevenueIds((ids) => [...ids, data.createdRevenue._id]);
        }
        queryClient.invalidateQueries({ queryKey: ["virtualOfficeRevenue"] });
        setAddRow(false);
        resetAdd();
      },
      onError: (error) =>
        toast.error(error.response?.data?.message || "Unable to add invoice"),
    });

  const openAdd = () => {
    resetAdd({ client: "", clientName: "", rentStatus: "Unpaid", invoiceFile: null });
    setAddRow(true);
  };

  const handleAddClientChange = (event) => {
    const client = activeVirtualOfficeClients.find(
      (item) => item._id === event.target.value,
    );
    setAddValue("client", event.target.value);
    setAddValue("clientName", client?.clientName || "");
  };

  const visibleTableData = useMemo(
    () =>
      tableData.filter(
        (item) => item.isManualInvoice || addedRevenueIds.includes(item._id),
      ),
    [addedRevenueIds, tableData],
  );

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

  const revenueTableColumns = [
    {
      headerName: "Sr No",
      field: "srNo",
      width: 300,
      minWidth: 80,
    },
    {
      headerName: "Client Name",
      field: "clientName",
      flex: 1.9,
      minWidth: 320,
    },
    {
      headerName: "Revenue (INR)",
      field: "revenue",
      flex: 2.5,
      minWidth: 170,
      cellRenderer: (params) => inrFormat(params.value || 0),
    },
    {
      headerName: "No. of Desks",
      field: "noOfDesks",
    },
    {
      headerName: "Open Desk Rate",
      field: "deskRate",
      cellRenderer: (params) => `INR ${inrFormat(params.value || 0)}`,
    },
    {
      headerName: "Rent Status",
      field: "rentStatus",
     flex:2,
     pinned: "right",
      cellStyle: {
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-start",
        paddingLeft: "12px",
        paddingRight: "12px",
      },
      cellRenderer: (params) => <StatusChip status={params.value} />,
    },
    {
      headerName: "Action",
      field: "actions",
      pinned: "right",
      width: 100,
      minWidth: 90,
      sortable: false,
      filter: false,
      cellStyle: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        paddingLeft: "8px",
        paddingRight: "8px",
      },
      cellRenderer: ({ data }) => (
        <IconButton
          size="small"
          onClick={() => setViewRow(data)}
          aria-label="View invoice"
        >
          <MdOutlineRemoveRedEye size={18} />
        </IconButton>
      ),
    },
  ];

  const billingTableColumns = [
    {
      headerName: "Sr No",
      field: "srNo",
      width: 80,
      minWidth: 80,
    },
    {
      headerName: "Client Name",
      field: "clientName",
      width: 350,
      minWidth: 220,
    },
    {
      headerName: "Channel",
      field: "channel",
    },
    {
      headerName: "Revenue (INR)",
      field: "revenue",
      cellRenderer: (params) => inrFormat(params.value || 0),
    },
    {
      headerName: "No. of Desks",
      field: "noOfDesks",
    },
    {
      headerName: "Open Desk Rate",
      field: "deskRate",
      cellRenderer: (params) => `INR ${inrFormat(params.value || 0)}`,
    },
    {
      headerName: "Total Term",
      field: "totalTerm",
    },
    {
      headerName: "Rent Date",
      field: "rentDate",
    },
    {
      headerName: "Past Due Date",
      field: "pastDueDate",
    },
    {
      headerName: "Annual Increment (%)",
      field: "annualIncrement",
    },
    {
      headerName: "Next Increment Date",
      field: "nextIncrementDate",
    },
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
        value ? dayjs(value).format("DD-MM-YYYY") : "-",
    },
    {
      headerName: "Rent Status",
      field: "rentStatus",
      pinned: "right",
      flex:1,
      headerClass: "vo-right-pinned-header",
      cellClass: "vo-right-pinned-cell",
      cellStyle: {
        paddingLeft: "16px",
        paddingRight: "16px",
      },
      cellRenderer: (params) => <StatusChip status={params.value} />,
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
  ];

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
          disableHoverCrosshair
        />
      ) : (
        <Skeleton height={"500px"} width={"100%"} />
      // )}
      ))}

      {!isLoadingVirtualOfficeRevenue ? (
        <WidgetTable
          tableTitle={
            showInvoiceProjections
              ? "Virtual Office Revenue Client Invoicing"
              : "Monthly Revenue with Client Details"
          }
          data={visibleTableData}
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
          showCalendarWhenEmpty={showInvoiceProjections}
          getMissingRangeData={
            showInvoiceProjections
              ? (selectedDate, existingMonthRows) =>
                  getUnpaidInvoiceRowsForMonth(
                    visibleTableData,
                    selectedDate,
                    existingMonthRows,
                  )
              : undefined
          }
          headerActions={
            <PrimaryButton title="Add Virtual" handleSubmit={openAdd} />
          }
          columns={
            showInvoiceProjections ? billingTableColumns : revenueTableColumns
          }
        />
      ) : (
        <Skeleton height={"500px"} width={"100%"} />
      )}
      {addRow && (
        <MuiModal
          open
          title="Add Virtual"
          onClose={() => setAddRow(false)}
        >
          <form
            onSubmit={handleAddSubmit(addVirtualInvoice)}
            className="grid grid-cols-2 gap-4"
          >
            <Controller
              name="client"
              control={addControl}
              rules={{ required: "Select a client" }}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  select
                  label="Select Client"
                  size="small"
                  fullWidth
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                  onChange={handleAddClientChange}
                >
                  {activeVirtualOfficeClients.map((client) => (
                    <MenuItem key={client._id} value={client._id}>
                      {client.clientName}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
            <Controller
              name="clientName"
              control={addControl}
              render={({ field }) => (
                <TextField {...field} label="Client Name" size="small" fullWidth />
              )}
            />

            {[
              ["clientInvoiceName", "Client Invoice Name", selectedAddClient?.clientName],
              ["channel", "Channel", selectedAddClient?.bookingType || "Direct"],
              ["noOfDesks", "No. of Desks", addTotalDesks],
              ["deskRate", "Open Desk Rate", addDeskRate],
              ["revenue", "Revenue", addRevenue],
              ["totalTerm", "Total Term", selectedAddClient?.totalTerm || 0],
              ["annualIncrement", "Annual Increment (%)", selectedAddClient?.annualIncrement || 0],
            ].map(([name, label, value]) => (
              <TextField
                key={name}
                value={value ?? ""}
                label={label}
                size="small"
                fullWidth
                disabled
              />
            ))}

            <TextField
              value={selectedAddClient?.rentDate ? dayjs(selectedAddClient.rentDate).format("DD-MM-YYYY") : ""}
              label="Rent Date"
              size="small"
              fullWidth
              disabled
            />
            <TextField
              value={selectedAddClient?.securityDeposit ?? ""}
              label="Security Deposit"
              size="small"
              fullWidth
              disabled
            />
            <TextField
              value={selectedAddClient?.billingFrequency || "Yearly"}
              label="Billing Frequency"
              size="small"
              fullWidth
              disabled
            />
            <TextField
              value={selectedAddClient?.pastDueDate ? dayjs(selectedAddClient.pastDueDate).format("DD-MM-YYYY") : ""}
              label="Past Due Date"
              size="small"
              fullWidth
              disabled
            />
            <TextField
              value={selectedAddClient?.nextIncrementDate ? dayjs(selectedAddClient.nextIncrementDate).format("DD-MM-YYYY") : ""}
              label="Next Increment Date"
              size="small"
              fullWidth
              disabled
            />
            <TextField
              value={dayjs().format("DD-MM-YYYY")}
              label="Invoice Upload Date"
              size="small"
              fullWidth
              disabled
            />
            <Controller
              name="rentStatus"
              control={addControl}
              render={({ field }) => (
                <TextField {...field} select label="Paid/Rent Status" size="small" fullWidth>
                  <MenuItem value="Paid">Paid</MenuItem>
                  <MenuItem value="Unpaid">Unpaid</MenuItem>
                </TextField>
              )}
            />
            <Controller
              name="invoiceFile"
              control={addControl}
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
                title="Add Virtual"
                disabled={isAddingVirtualInvoice}
                isLoading={isAddingVirtualInvoice}
                className="w-full"
              />
            </div>
          </form>
        </MuiModal>
      )}
      {viewRow && (
        <MuiModal
          open
          onClose={() => setViewRow(null)}
          title="View Invoice Details"
        >
          <div className="grid grid-cols-1 gap-6">
            <div>
              <div className="text-subtitle font-pmedium mb-4">Client Info</div>
              <div className="grid grid-cols-1 gap-2 mt-2">
                <DetalisFormatted title="Client Name" detail={viewRow.clientName || "-"} />
                <DetalisFormatted
                  title="Client Invoice Name"
                  detail={viewRow.clientInvoiceName || viewRow.clientName || "-"}
                />
                <DetalisFormatted title="Channel" detail={viewRow.channel || "-"} />
              </div>
            </div>

            <div>
              <div className="text-subtitle font-pmedium mb-4">Financials</div>
              <div className="grid grid-cols-1 gap-2 mt-2">
                <DetalisFormatted
                  title="No. of Desks"
                  detail={viewRow.noOfDesks ?? "-"}
                />
                <DetalisFormatted
                  title="Open Desk Rate(Current)"
                  detail={`INR ${inrFormat(getNumericAmount(viewRow.deskRate))}`}
                />
                <DetalisFormatted
                  title="Revenue"
                  detail={`INR ${inrFormat(getNumericAmount(viewRow.revenue))}`}
                />
                <DetalisFormatted
                  title="Annual Increment (%)"
                  detail={
                    viewRow.annualIncrement !== undefined &&
                    viewRow.annualIncrement !== null &&
                    viewRow.annualIncrement !== ""
                      ? `${viewRow.annualIncrement}%`
                      : "-"
                  }
                />
              </div>
            </div>

            <div>
              <div className="text-subtitle font-pmedium mb-4">Rental Terms</div>
              <div className="grid grid-cols-1 gap-2 mt-2">
                <DetalisFormatted
                  title="Security Deposit"
                  detail={viewRow.securityDeposit ?? viewRow.client?.securityDeposit ?? "-"}
                />
                <DetalisFormatted
                  title="Billing Frequency"
                  detail={viewRow.billingFrequency || viewRow.client?.billingFrequency || "-"}
                />
                <DetalisFormatted
                  title="Rent Date"
                  detail={
                    viewRow.rentDate
                      ? dayjs(viewRow.rentDate).format("DD-MM-YYYY")
                      : "-"
                  }
                />
                <DetalisFormatted
                  title="Paid/Rent Status"
                  detail={viewRow.rentStatus || "-"}
                />
                <DetalisFormatted
                  title="Total Term"
                  detail={viewRow.totalTerm ?? "-"}
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
                  title="Past Due Date"
                  detail={
                    viewRow.pastDueDate
                      ? dayjs(viewRow.pastDueDate).format("DD-MM-YYYY")
                      : "-"
                  }
                />
              </div>
            </div>

            <div>
              <div className="text-subtitle font-pmedium mb-4">
                Finance Invoice Details
              </div>
              <div className="grid grid-cols-1 gap-2 mt-2">
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
                  title="Invoice Uploaded by"
                  detail={
                    viewRow.invoiceUploadedByName ||
                    getUserDisplayName(viewRow.invoiceUploadedBy) ||
                    "-"
                  }
                />
              </div>
            </div>
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
        ["deskRate", "Open Desk Rate", "number"],
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

      <Controller
        name="rentDate"
        control={control}
        render={({ field }) => (
          <DatePicker
            {...field}
            value={field.value ?? null}
            label="Rent Date"
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

      <Controller
        name="securityDeposit"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            type="number"
            label="Security Deposit"
            size="small"
            fullWidth
            disabled
          />
        )}
      />

      <Controller
        name="billingFrequency"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            select
            label="Billing Frequency"
            size="small"
            fullWidth
            disabled
          >
            <MenuItem value="Monthly">Monthly</MenuItem>
            <MenuItem value="Yearly">Yearly</MenuItem>
          </TextField>
        )}
      />

      {[
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
