import React, { useState, useMemo, useEffect } from "react";
import dayjs from "dayjs";
import {
  Tabs,
  Tab,
  CircularProgress,
  IconButton,
  Popover,
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
import { MdNavigateNext } from "react-icons/md";

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
}) => {
  const axios = useAxiosPrivate();
  const [selectedTab, setSelectedTab] = useState(0);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const openCalendar = Boolean(anchorEl);
  const handleOpenCalendar = (e) => setAnchorEl(e.currentTarget);
  const handleCloseCalendar = () => setAnchorEl(null);

  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      invoiceImage: null,
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

  const filteredRows = useMemo(() => {
    if (!dateRange.length) return [];
    const { startDate, endDate } = dateRange[0];
    return financialData
      .filter((fd) => {
        const date = new Date(fd.month);
        return isWithinInterval(date, { start: startDate, end: endDate });
      })
      .flatMap((fd) => fd.tableData?.rows || []);
  }, [financialData, dateRange]);

  const tableColumns = useMemo(() => {
    const sample = financialData?.[0]?.tableData?.columns || [];
    const base = [...sample];
    if (!noInvoice) {
      base.push({
        field: "actions",
        headerName: "Actions",
        pinned: "right",
        cellRenderer: (params) => {
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
  }, [financialData, noInvoice]);

  const totalProjectedAmount = useMemo(() => {
    return filteredRows.reduce(
      (sum, r) => sum + Number((r.projectedAmount || "0").replace(/,/g, "")),
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
        TitleAmount={`INR ${inrFormat(totalProjectedAmount)}`}
        border
      >
        <div className="flex flex-col gap-4 rounded-md">
          <div className="flex justify-end">
            <IconButton onClick={handleOpenCalendar}>
              <MdNavigateNext size={20} />
            </IconButton>
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
                />
              )}
            </Popover>
          </div>

          {filteredRows.length > 0 ? (
            <AgTable
              search
              data={filteredRows}
              columns={tableColumns}
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
    </>
  );
};

export default AllocatedBudget;
