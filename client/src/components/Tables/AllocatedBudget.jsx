import React, { useState, useMemo, useEffect } from "react";
import dayjs from "dayjs";
import {
  Tabs,
  Tab,  
  Chip,
  CircularProgress,
  IconButton,
  Popover,
   Menu,
  MenuItem,
  TextField,
  FormControl,
  Select,
} from "@mui/material";
import { DateRangePicker } from "react-date-range";
import { addDays, isWithinInterval } from "date-fns";
import { inrFormat } from "../../utils/currencyFormat";
import PrimaryButton from "../PrimaryButton";
import AgTable from "../AgTable";
import { parseAmount } from "../../utils/parseAmount";
import WidgetSection from "../WidgetSection";
import MuiModal from "../MuiModal";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import UploadFileInput from "../UploadFileInput";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "../../main";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import usePageDepartment from "../../hooks/usePageDepartment";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { MdCalendarToday, MdNavigateNext } from "react-icons/md";
import { HiOutlineDotsHorizontal } from "react-icons/hi";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";

const AllocatedBudget = ({
  financialData,
  isLoading,
  variant,
  hideTitle,
  noInvoice = true,
  noFilter = false,
  annaualExpense = false,
  showInvoice = false,
  newTitle,
  enableActionMenu = false,
}) => {
 const axios = useAxiosPrivate();
  const [selectedTab, setSelectedTab] = useState(0);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState([]);
  const [actionAnchorEl, setActionAnchorEl] = useState(null);
  const [actionRow, setActionRow] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const openCalendar = Boolean(anchorEl);
  const handleOpenCalendar = (e) => setAnchorEl(e.currentTarget);
  const handleCloseCalendar = () => setAnchorEl(null);

  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      invoiceImage: null,
    },
  });

   const {
    control: editControl,
    handleSubmit: handleEditSubmit,
    reset: resetEdit,
  } = useForm({
    defaultValues: {
      expanseName: "",
      expanseType: "",
      paymentType: "",
      building: "",
      unit: "",
      projectedAmount: "",
      dueDate: "",
      actualAmount: "",
    },
  });

  const department = usePageDepartment();
  const onUpload = (data, row) => {
    const file = data.invoiceImage;
    if (!file || !row?.id) {
      toast.error("Missing file or selected row.");
      return;
    }
    const formData = new FormData();
    formData.append("invoice", file);
    formData.append("rowId", row.id);
    formData.append("departmentName", department?.name || "");
    uploadInvoiceMutation(formData);
  };

  const { mutate: uploadInvoiceMutation, isPending: isUploadPending } =
    useMutation({
      mutationFn: async (formData) => {
        const rowId = formData.get("rowId");
        formData.delete("rowId");
        const response = await axios.patch(
          `/api/budget/upload-budget-invoice/${rowId}`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        return response.data;
      },
      onSuccess: (data) => {
        toast.success(data.message || "BUDGET UPDATED");
        reset();
        setUploadModalOpen(false);
        queryClient.invalidateQueries({ queryKey: ["financeBudget"] });
      },
      onError: (error) => {
        toast.error("Failed to upload invoice.");
        console.error(error);
      },
    });

const { mutate: updateBudgetMutation, isPending: isUpdatePending } =
    useMutation({
      mutationFn: async ({ budgetId, payload }) => {
        const response = await axios.patch(
          `/api/budget/update-budget/${budgetId}`,
          payload
        );
        return response.data;
      },
      onSuccess: (data) => {
        toast.success(data.message || "Budget updated successfully");
        setEditModalOpen(false);
        setActionAnchorEl(null);
        setActionRow(null);
        resetEdit();
        queryClient.invalidateQueries({ queryKey: ["financeBudget"] });
        queryClient.invalidateQueries({ queryKey: ["departmentBudget"] });
      },
      onError: (error) => {
        toast.error(error?.response?.data?.message || "Failed to update budget");
      },
    });

  const handleOpenActionMenu = (event, row) => {
    setActionAnchorEl(event.currentTarget);
    setActionRow(row);
  };

  const handleCloseActionMenu = () => {
    setActionAnchorEl(null);
    setActionRow(null);
  };

  const handleOpenEditModal = (row) => {
    resetEdit({
      expanseName: row.expanseName || "",
      expanseType: row.expanseType || "",
      paymentType: row.paymentType || "",
      building: row.building || "",
      unit: row.unit || "",
      projectedAmount: row.projectedAmountRaw ?? row.projectedAmount ?? "",
      dueDate: row.dueDateRaw || row.dueDate || "",
      actualAmount: row.actualAmountRaw ?? "",
    });
    setSelectedRow(row);
    setEditModalOpen(true);
  };

  const onEditSubmit = (data) => {
    if (!selectedRow?.id) return;
    updateBudgetMutation({
      budgetId: selectedRow.id,
      payload: { actualAmount: data.actualAmount },
    });
  };


  const allTypes = useMemo(() => {
    const types = new Set();
    financialData?.forEach((item) => {
      item.tableData?.rows?.forEach((row) => {
        types.add(row.expanseType || "Unknown");
      });
    });
    return ["All", ...Array.from(types)];
  }, [financialData]);

  const [dateRange, setDateRange] = useState([]);

  useEffect(() => {
    if (!financialData?.length) return;

    const currentMonthStart = dayjs().startOf("month").toDate();
    const currentMonthEnd = dayjs().endOf("month").toDate();

    const currentMonthHasData = financialData.some((item) => {
      const date = new Date(item.month);
      return date >= currentMonthStart && date <= currentMonthEnd;
    });

    if (currentMonthHasData) {
      setDateRange([
        {
          startDate: currentMonthStart,
          endDate: currentMonthEnd,
          key: "selection",
        },
      ]);
    } else {
      const sortedMonths = [...financialData]
        .map((item) => new Date(item.month))
        .filter((d) => !isNaN(d))
        .sort((a, b) => b - a);
      if (sortedMonths.length > 0) {
        const latest = sortedMonths[0];
        setDateRange([
          {
            startDate: dayjs(latest).startOf("month").toDate(),
            endDate: dayjs(latest).endOf("month").toDate(),
            key: "selection",
          },
        ]);
      }
    }
  }, [financialData]);

  const validDateSet = useMemo(() => {
    const set = new Set();
    financialData?.forEach((fd) => {
      const date = dayjs(fd.month);
      if (date.isValid()) {
        set.add(date.format("YYYY-MM-DD"));
      }
    });
    return set;
  }, [financialData]);


  const filteredRows = useMemo(() => {
    if (!dateRange.length) return [];
    const { startDate, endDate } = dateRange[0];
    return financialData
      .filter((fd) => {
        const date = new Date(fd.month);
        return isWithinInterval(date, { start: startDate, end: endDate });
      })
      //.flatMap((fd) => fd.tableData?.rows || []);
       .flatMap((fd) => fd.tableData?.rows || [])
      .filter((row) => {
        const normalizedStatus = String(row?.status || "")
          .trim()
          .toLowerCase();

        return normalizedStatus === "approved" || normalizedStatus === "pending";
      });
  }, [financialData, dateRange]);

  const tableColumns = useMemo(() => {
    const sample = financialData?.[0]?.tableData?.columns || [];
    // const base = [...sample];
    const base = sample.map((column) => {
      if (column.field !== "status") return column;

      return {
        ...column,
        cellRenderer: (params) => {
          const status = String(params.value || "Unknown");
          const normalizedStatus = status.trim().toLowerCase();

          const statusColorMap = {
            approved: { backgroundColor: "#DCFCE7", color: "#166534" },
            rejected: { backgroundColor: "#FEE2E2", color: "#991B1B" },
            pending: { backgroundColor: "#FEF3C7", color: "#92400E" },
          };

          const { backgroundColor, color } = statusColorMap[normalizedStatus] || {
            backgroundColor: "#E5E7EB",
            color: "#374151",
          };

          return (
            <Chip
              label={status}
              size="small"
              style={{ backgroundColor, color, fontWeight: 500 }}
            />
          );
        },
      };
    });
    if (!noInvoice) {
      base.push({
        field: "actions",
        headerName: "Actions",
        pinned: "right",
        cellRenderer: (params) => {
           if (enableActionMenu) {
            return (
              <div className="p-2 flex items-center">
                <IconButton
  onClick={(event) => handleOpenActionMenu(event, params.data)}
>
  <HiOutlineDotsHorizontal />
</IconButton>
              </div>
            );
          }
          const invoiceAttached =
            params.data.invoiceAttached === true ||
            params.data.invoiceAttached === "true";
          const status = params.data.status;
          const isApproved = status === "Approved";
          const isRejected = status === "Rejected";
          return (
            <div className="p-2">
              {isApproved && !invoiceAttached ? (
                <PrimaryButton
                  title="Upload Invoice"
                  externalStyles="p-2"
                  handleSubmit={() => {
                    setSelectedRow(params.data);
                    setUploadModalOpen(true);
                  }}
                />
              ) : (
                <span className="text-content">
                  {invoiceAttached
                    ? "Invoice Uploaded"
                    : isRejected
                      ? "Rejected"
                      : ""}
                </span>
              )}
            </div>
          );
        },
      });
    }
    return base;
  }, [financialData, noInvoice, enableActionMenu]);

  console.log("filtered ata : ", filteredRows);

  const totalActualAmount = useMemo(() => {
    return filteredRows.reduce(
      (sum, r) => sum + Number((r.actualAmount || "0").replace(/,/g, "")),
      0
    );
  }, [filteredRows]);

  if (isLoading) return <CircularProgress />;

  return (
    <>
      <WidgetSection
        title={
          annaualExpense
            ? "Annual Expenses"
            : newTitle || "BIZ Nest DEPARTMENT WISE EXPENSE DETAILS"
        }
        TitleAmount={`INR ${inrFormat(totalActualAmount)}`}
        border
      >
        <div className="flex flex-col gap-4 rounded-md">
          <div className="flex justify-end">
            <Popover
              open={openCalendar}
              anchorEl={anchorEl}
              onClose={handleCloseCalendar}
              anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
            >
              {dateRange.length > 0 && (
                <DateRangePicker
                  onChange={(item) => setDateRange([item.selection])}
                  moveRangeOnFirstSelection={false}
                  ranges={dateRange}
                  direction="vertical"
                  dayContentRenderer={(date) => {
                    const dateStr = dayjs(date).format("YYYY-MM-DD");
                    const hasData = validDateSet.has(dateStr);
                    return (
                      <div className="overflow-hidden">
                        <div
                          style={{
                            backgroundColor: hasData ? "white" : "transparent",
                            borderBottom: hasData ? "4px solid #1E3D73" : "",
                            borderTopLeftRadius: "5px",
                            borderTopRightRadius: "5px",
                            height: "25px",
                            width: "25px",
                            fontWeight: hasData ? "bold" : "normal",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {date.getDate()}
                        </div>
                      </div>
                    );
                  }}
                />
              )}
            </Popover>
          </div>

          <div className="flex justify-center items-center">
            {dateRange.length > 0 && dateRange[0] && (
              <div className="flex justify-center items-center gap-2">
                {/* Date information here */}

                <div className="flex items-center gap-2  justify-center">
                  <div className="px-6 py-1 rounded-md border-primary border-[1px]">
                    <span className="text-gray-600 text-content font-pregular">
                      {dateRange.length > 0 &&
                        dateRange[0] &&
                        dayjs(dateRange[0].startDate).format("DD MMM YYYY")}
                    </span>{" "}
                  </div>

                  <div className="px-6 py-1 rounded-md border-primary border-[1px]">
                    <span className="text-gray-600 text-content font-pregular">
                      {dateRange.length > 0 &&
                        dateRange[0] &&
                        dayjs(dateRange[0].endDate).format("DD MMM YYYY")}
                    </span>
                  </div>
                </div>
                <div
                  className="p-2 rounded-md bg-primary text-white cursor-pointer hover:bg-[#1E3D55]"
                  onClick={handleOpenCalendar}
                >
                  <MdCalendarToday size={19} />
                </div>
              </div>
            )}
          </div>

          {filteredRows.length > 0 ? (
            <AgTable
              search
              data={filteredRows}
              columns={tableColumns}
              // exportData
              tableHeight={350}
            />
          ) : (
            <div className="h-96 flex justify-center items-center text-muted">
              No data available
            </div>
          )}
        </div>
      </WidgetSection>

      <MuiModal
        open={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        title="Upload Invoice"
      >
        <form
          onSubmit={handleSubmit((data) => onUpload(data, selectedRow))}
          className="space-y-4"
        >
          <Controller
            name="invoiceImage"
            control={control}
            render={({ field }) => (
              <UploadFileInput
                value={field.value}
                onChange={field.onChange}
                allowedExtensions={["pdf"]}
                previewType="pdf"
              />
            )}
          />
          <div className="text-right">
            <PrimaryButton
              title="Submit"
              type="submit"
              isLoading={isUploadPending}
              disabled={isUploadPending}
            />
          </div>
        </form>
      </MuiModal>
      <Menu
  anchorEl={actionAnchorEl}
  open={Boolean(actionAnchorEl)}
  onClose={handleCloseActionMenu}
  anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
  transformOrigin={{ vertical: "top", horizontal: "center" }}
  slotProps={{
    paper: {
      sx: {
        mt: 0.8,
        minWidth: 120,
        borderRadius: "8px",
        overflow: "hidden",
        boxShadow: "0 8px 18px rgba(15, 23, 42, 0.18)",
      },
    },
    list: { sx: { p: 0 } },
  }}
>
  <MenuItem
    sx={{
      justifyContent: "flex-start", // 👉 left side
      fontWeight: 500,
      color: "#1E3D73",
      py: 1.1,
      borderBottom:
        actionRow?.status === "Approved"
          ? "1px solid #D1D5DB"
          : "none",
    }}
    onClick={() => {
      if (actionRow) {
        handleOpenEditModal(actionRow);
      }
      handleCloseActionMenu();
    }}
  >
    Edit
  </MenuItem>

  {actionRow?.status === "Approved" && (
    <MenuItem
      sx={{
        justifyContent: "flex-start", // 👉 left side
        fontWeight: 500,
        color: "#1E3D73",
        py: 1.1,
      }}
      onClick={() => {
        setSelectedRow(actionRow);
        setUploadModalOpen(true);
        handleCloseActionMenu();
      }}
    >
      Upload Invoice
    </MenuItem>
  )}
</Menu>
      <MuiModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Request Budget"
      >
        <form onSubmit={handleEditSubmit(onEditSubmit)} className="space-y-4">
          <Controller
            name="expanseName"
            control={editControl}
            render={({ field }) => (
              <TextField {...field} label="Expense Name" fullWidth size="small" disabled />
            )}
          />

          <Controller
            name="expanseType"
            control={editControl}
            render={({ field }) => (
              <FormControl fullWidth>
                <Select {...field} size="small" displayEmpty disabled>
                  <MenuItem value={field.value || ""}>
                    {field.value || "Select Expense Type"}
                  </MenuItem>
                </Select>
              </FormControl>
            )}
          />

          <Controller
            name="paymentType"
            control={editControl}
            render={({ field }) => (
              <FormControl fullWidth>
                <Select {...field} size="small" displayEmpty disabled>
                  <MenuItem value={field.value || ""}>
                    {field.value || "Select Payment Type"}
                  </MenuItem>
                </Select>
              </FormControl>
            )}
          />

          <Controller
            name="building"
            control={editControl}
            render={({ field }) => (
              <FormControl fullWidth>
                <Select {...field} size="small" displayEmpty disabled>
                  <MenuItem value={field.value || ""}>
                    {field.value || "Select Building"}
                  </MenuItem>
                </Select>
              </FormControl>
            )}
          />

          <Controller
            name="unit"
            control={editControl}
            render={({ field }) => (
              <FormControl fullWidth>
                <Select {...field} size="small" displayEmpty disabled>
                  <MenuItem value={field.value || ""}>
                    {field.value || "Select Unit"}
                  </MenuItem>
                </Select>
              </FormControl>
            )}
          />

          <Controller
            name="projectedAmount"
            control={editControl}
            render={({ field }) => (
              <TextField
                {...field}
                label="Projected Amount"
                fullWidth
                size="small"
                disabled
              />
            )}
          />

          <Controller
            name="dueDate"
            control={editControl}
            render={({ field }) => (
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="Due Date"
                  format="DD-MM-YYYY"
                  value={field.value ? dayjs(field.value) : null}
                  disabled
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: "small",
                    },
                  }}
                />
              </LocalizationProvider>
            )}
          />

          <Controller
            name="actualAmount"
            control={editControl}
            rules={{
              required: "Actual amount is required",
              pattern: {
                value: /^[0-9]+(\.[0-9]{1,2})?$/,
                message: "Enter a valid amount",
              },
            }}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label="Actual Amount"
                fullWidth
                size="small"
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              />
            )}
          />

          <div className="flex justify-center">
            <PrimaryButton
              title="Submit"
              type="submit"
              isLoading={isUpdatePending}
              disabled={isUpdatePending}
            />
          </div>
        </form>
      </MuiModal>
    </>
  );
};

export default AllocatedBudget;
