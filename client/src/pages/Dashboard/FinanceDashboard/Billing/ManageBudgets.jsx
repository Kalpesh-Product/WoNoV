import { memo, useCallback, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Controller, useForm, useWatch } from "react-hook-form";
import dayjs from "dayjs";
import { Chip, TextField } from "@mui/material";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import { toast } from "sonner";

import DetalisFormatted from "../../../../components/DetalisFormatted";
import PaidAmountHistory from "../../../../components/PaidAmountHistory";
import MuiModal from "../../../../components/MuiModal";
import PageFrame from "../../../../components/Pages/PageFrame";
import PrimaryButton from "../../../../components/PrimaryButton";
import ThreeDotMenu from "../../../../components/ThreeDotMenu";
import YearWiseTable from "../../../../components/Tables/YearWiseTable";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import { inrFormat } from "../../../../utils/currencyFormat";
import humanDate from "../../../../utils/humanDateForamt";
import { queryClient } from "../../../../main";

const getManageBudgetsRowId = ({ data }) => String(data._id);
const MemoizedYearWiseTable = memo(YearWiseTable);

const BudgetViewDetail = ({ detail, ...props }) => {
  const isMissing =
    detail == null ||
    (typeof detail === "string" &&
      ["", "-", "--", "\u2013", "\u2014"].includes(detail.trim()));
  return <DetalisFormatted {...props} detail={isMissing ? "\u2014" : detail} />;
};

const ManageBudgets = () => {
  const axios = useAxiosPrivate();
  const [viewDetailsId, setViewDetailsId] = useState(null);
  const [viewDetailsSrNo, setViewDetailsSrNo] = useState(null);
  const [editRow, setEditRow] = useState(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      financeAmount: "",
    },
  });

  const financeAmountValue = useWatch({ control, name: "financeAmount" });

  const { data: budgetHistory = [], isPending: isBudgetLoading } = useQuery({
    queryKey: ["manageBudgets"],
    queryFn: async () => {
      try {
        const response = await axios.get("/api/budget/company-budget");
        const budgets = response.data.allBudgets;
        return Array.isArray(budgets) ? budgets : [];
      } catch (error) {
        console.error("Error fetching budget history:", error);
        return [];
      }
    },
  });

  const { mutate: updateFinanceAmount, isPending: isUpdatePending } =
    useMutation({
      mutationKey: ["updateBudgetFinanceAmount"],
      mutationFn: async ({ budgetId, financeAmount }) => {
        const response = await axios.patch(
          `/api/budget/update-finance-amount/${budgetId}`,
          { financeAmount },
        );
        return response.data;
      },
      onSuccess: (data) => {
        toast.success(data.message || "Finance amount updated successfully");
        setEditRow(null);
        reset({ financeAmount: "" });
        queryClient.invalidateQueries({ queryKey: ["manageBudgets"] });
        queryClient.invalidateQueries({ queryKey: ["allBudgets"] });
      },
      onError: (error) => {
        toast.error(
          error?.response?.data?.message ||
            error?.message ||
            "Failed to update finance amount",
        );
      },
    });

  const handleOpenEdit = useCallback((row) => {
    setEditRow(row);
    reset({ financeAmount: "" });
  }, [reset]);

  const handleCloseEdit = () => {
    setEditRow(null);
    reset({ financeAmount: "" });
  };

  const onEditSubmit = (data) => {
    if (!editRow?._id) return;
    updateFinanceAmount({
      budgetId: editRow._id,
      financeAmount: Number(data.financeAmount),
    });
  };

  const remainingPreview =
    Number(editRow?.actualAmountRaw || 0) -
    Number(editRow?.financeAmountRaw || 0) -
    Number(financeAmountValue || 0);

  const columns = useMemo(() => [
    {
      field: "srNo",
      headerName: "Sr No",
      flex: 0.8,
      sortable: false,
      valueGetter: (params) =>
        params.node?.rowIndex == null ? "" : params.node.rowIndex + 1,
    },
    { field: "vendorName", headerName: "Vendor", flex: 1.2 },
    { field: "expanseName", headerName: "Expense Name", flex: 1.5 },
    { field: "expanseType", headerName: "Expense Type", flex: 1.2 },
    { field: "paymentType", headerName: "Payment Type", flex: 1.2 },
    {
      field: "projectedAmount",
      headerName: "Projected Amount (INR)",
      flex: 1.2,
    },
    {
      field: "financeAmount",
      headerName: "Paid Amount",
      flex: 1.6,
    },
    {
      field: "remainingAmount",
      headerName: "Remaining Amount",
      flex: 1.6,
    },
    { field: "actualAmount", headerName: "Actual Amount (INR)", flex: 1.2 },
    { field: "dueDate", headerName: "Due Date", flex: 1.1 },
    {
      field: "status",
      headerName: "Approval Status",
      flex: 1,
      pinned: "right",
      cellRenderer: (params) => {
        const status = String(params?.value || "-");
        const normalizedStatus = status.toLowerCase();

        const styleMap = {
          approved: { backgroundColor: "#DCFCE7", color: "#166534" },
          rejected: { backgroundColor: "#FEE2E2", color: "#991B1B" },
        };

        const chipStyle = styleMap[normalizedStatus] || {
          backgroundColor: "#F5F5F5",
          color: "#616161",
        };

        return (
          <Chip
            label={status}
            size="small"
            sx={{
              ...chipStyle,
              fontWeight: 500,
              textTransform: "capitalize",
            }}
          />
        );
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      pinned: "right",
      width: 90,
      cellRenderer: (params) => (
        <div className="flex h-full items-center gap-2">
          <button
            type="button"
            className="text-subtitle text-primary cursor-pointer"
            title="View budget details"
            aria-label="View budget details"
            onClick={() => {
              setViewDetailsId(String(params.data?._id || ""));
              setViewDetailsSrNo(
                params.node?.rowIndex == null
                  ? params.data.srNo
                  : params.node.rowIndex + 1,
              );
            }}
          >
            <MdOutlineRemoveRedEye />
          </button>

          <ThreeDotMenu
            rowId={params.data?._id}
            menuItems={[
              {
                label: "Edit",
                onClick: () => handleOpenEdit(params.data),
              },
            ]}
          />
        </div>
      ),
    },
  ], [handleOpenEdit]);

  const tableData = useMemo(() => budgetHistory
    .filter((item) => String(item?.status || "").toLowerCase() === "approved")
    .map((item) => {
      const invoice = item?.invoice || {};
      const unit = item?.unit || {};
      const projectedAmountRaw = Number(item?.projectedAmount || 0);
      const financeAmountRaw = Number(item?.financeAmount || 0);

      return {
        ...item,
        department: item?.department?.name || item?.department || "-",
        vendorName: item?.vendor?.companyName || item?.vendor?.name || "-",
        unitName: unit?.unitName || "-",
        unitNo: unit?.unitNo || "-",
        buildingName: unit?.building?.buildingName || "-",
        projectedAmountRaw,
        actualAmountRaw: item?.actualAmount ?? "",
        financeAmountRaw,
        projectedAmount: inrFormat(projectedAmountRaw),
        financeAmount: inrFormat(financeAmountRaw),
        remainingAmount: inrFormat(
          Number(item?.actualAmount || 0) - financeAmountRaw,
        ),
        actualAmount: inrFormat(item?.actualAmount || 0),
        dueDate: item?.dueDate ? humanDate(item.dueDate) : "-",
        dueDateRaw: item?.dueDate ? dayjs(item.dueDate).toISOString() : null,
        invoiceName: invoice?.name || "-",
        invoiceDate: invoice?.date ? humanDate(invoice.date) : "-",
        invoiceLink: invoice?.link || "-",
        status: item?.status || "-",
        isPaid: item?.status === "Approved" ? "Paid" : "Unpaid",
      };
    }), [budgetHistory]);

  const selectedBudget = viewDetailsId
    ? tableData.find((item) => String(item?._id) === viewDetailsId)
    : null;
  const viewDetails = selectedBudget
    ? { ...selectedBudget, srNo: viewDetailsSrNo ?? selectedBudget.srNo }
    : null;

  const closeViewDetails = () => {
    setViewDetailsId(null);
    setViewDetailsSrNo(null);
  };

  const invoiceFiles = viewDetails
    ? (viewDetails?.invoices?.length
        ? viewDetails.invoices
        : viewDetails?.invoice?.link
          ? [viewDetails.invoice]
          : []
      ).filter((file) => file?.link)
    : [];

  const invoiceChips = invoiceFiles.length ? (
    <span className="flex max-w-full flex-wrap gap-2">
      {invoiceFiles.map((file, index) => {
        const name = file.name || `Invoice ${index + 1}`;

        return (
          <Chip
            key={file.id || `${file.link}-${index}`}
            component="a"
            href={file.link}
            target="_blank"
            rel="noopener noreferrer"
            clickable
            label={name}
            title={name}
            size="small"
            variant="outlined"
            color="primary"
            sx={{ maxWidth: "100%" }}
          />
        );
      })}
    </span>
  ) : (
    "-"
  );

  return (
    <PageFrame>
      <MemoizedYearWiseTable
        data={tableData}
        columns={columns}
        dateColumn="dueDateRaw"
        search
        tableTitle="Manage Budgets"
        tableHeight={450}
        isLoading={isBudgetLoading}
        exportData
        getRowId={getManageBudgetsRowId}
      />

      <MuiModal
        open={Boolean(editRow)}
        onClose={handleCloseEdit}
        title="Manage Budget"
      >
        <form onSubmit={handleSubmit(onEditSubmit)} className="space-y-4">
          <TextField
            label="Expense Name"
            value={editRow?.expanseName || ""}
            fullWidth
            size="small"
            disabled
          />

          <TextField
            label="Expense Type"
            value={editRow?.expanseType || ""}
            fullWidth
            size="small"
            disabled
          />

          <TextField
            label="Payment Type"
            value={editRow?.paymentType || ""}
            fullWidth
            size="small"
            disabled
          />

          <TextField
            label="Vendor"
            value={editRow?.vendorName || ""}
            fullWidth
            size="small"
            disabled
          />

          <TextField
            label="Building"
            value={editRow?.buildingName || ""}
            fullWidth
            size="small"
            disabled
          />

          <TextField
            label="Unit"
            value={editRow?.unitNo || ""}
            fullWidth
            size="small"
            disabled
          />

          <TextField
            label="Projected Amount"
            value={editRow?.projectedAmountRaw ?? ""}
            fullWidth
            size="small"
            disabled
          />

          <TextField
            label="Due Date"
            value={editRow?.dueDate || ""}
            fullWidth
            size="small"
            disabled
          />

          <TextField
            label="Actual Amount"
            value={editRow?.actualAmountRaw ?? ""}
            fullWidth
            size="small"
            disabled
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextField
              label="Total Paid Amount"
              value={inrFormat(editRow?.financeAmountRaw || 0)}
              fullWidth
              size="small"
              disabled
            />

            <Controller
              name="financeAmount"
              control={control}
              rules={{
                required: "Paid amount is required",
                validate: (value) => {
                  if (value === "" || value === null || value === undefined) {
                    return "Paid amount is required";
                  }
                  const amount = Number(value);
                  if (Number.isNaN(amount)) return "Enter a valid amount";
                  if (amount <= 0) return "Amount must be greater than zero";
                  const availableAmount =
                    Number(editRow?.actualAmountRaw || 0) -
                    Number(editRow?.financeAmountRaw || 0);
                  if (amount > Math.max(availableAmount, 0)) {
                    return "Paid amount cannot exceed the remaining amount";
                  }
                  return true;
                },
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Paid Amount"
                  type="number"
                  fullWidth
                  size="small"
                  inputProps={{ min: 0.01, step: "0.01" }}
                  error={Boolean(errors.financeAmount)}
                  helperText={errors.financeAmount?.message}
                />
              )}
            />
          </div>

          <TextField
            label="Remaining Amount"
            value={`INR ${inrFormat(Math.max(Number.isFinite(remainingPreview) ? remainingPreview : 0, 0))}`}
            fullWidth
            size="small"
            disabled
          />

          <div className="flex justify-center">
            <PrimaryButton
              title="Submit"
              type="submit"
              externalStyles="w-full"
              isLoading={isUpdatePending}
              disabled={isUpdatePending}
            />
          </div>
        </form>
      </MuiModal>

      {viewDetails && (
        <MuiModal
          open={Boolean(viewDetails)}
          onClose={closeViewDetails}
          title={
            <span className="text-subtitle font-pmedium text-primary my-4 uppercase">
              Department-Invoice Approval Budget Summary
            </span>
          }
        >
          <div className="space-y-3">
            <BudgetViewDetail title="Sr No" detail={viewDetails.srNo} />
            <BudgetViewDetail
              title="Department"
              detail={viewDetails.department || "-"}
            />
            <BudgetViewDetail
              title="Expense Name"
              detail={viewDetails.expanseName || "-"}
            />
            <BudgetViewDetail
              title="Expense Type"
              detail={viewDetails.expanseType || "-"}
            />
            <BudgetViewDetail
              title="Vendor"
              detail={viewDetails.vendorName || "-"}
            />
            <BudgetViewDetail
              title="Payment Type"
              detail={viewDetails.paymentType || "-"}
            />
            <BudgetViewDetail
              title="Projected Amount"
              detail={`INR ${Number(viewDetails.projectedAmountRaw || 0).toLocaleString("en-IN")}`}
            />
            <BudgetViewDetail
              title="Paid Amount"
              detail={`INR ${Number(viewDetails.financeAmountRaw || 0).toLocaleString("en-IN")}`}
            />
            <BudgetViewDetail
              title="Paid Amount History"
              detail={
                <PaidAmountHistory
                  history={viewDetails.financeAmountHistory}
                  currentAmount={viewDetails.financeAmountRaw}
                  currentDate={viewDetails.financeAmountDate}
                />
              }
            />
            <BudgetViewDetail
              title="Remaining Amount"
              detail={`INR ${Number(
                Number(viewDetails.actualAmountRaw || 0) -
                  Number(viewDetails.financeAmountRaw || 0),
              ).toLocaleString("en-IN")}`}
            />
            <BudgetViewDetail
              title="Actual Amount"
              detail={`INR ${Number(viewDetails.actualAmountRaw || 0).toLocaleString("en-IN")}`}
            />
            <BudgetViewDetail
              title="Unit"
              detail={viewDetails.unitName || "-"}
            />
            <BudgetViewDetail
              title="Unit No"
              detail={viewDetails.unitNo || "-"}
            />
            <BudgetViewDetail
              title="Building"
              detail={viewDetails.buildingName || "-"}
            />
            <BudgetViewDetail
              title="Due Date"
              detail={viewDetails.dueDate || "-"}
            />
            <BudgetViewDetail
              title="Invoice Name"
              detail={`${invoiceFiles.length} ${invoiceFiles.length === 1 ? "file" : "files"} uploaded`}
            />
            <BudgetViewDetail
              title="Invoice Date"
              detail={viewDetails.invoiceDate || "-"}
            />
            <BudgetViewDetail
              title="Approval Status"
              detail={viewDetails.status || "-"}
            />
            {viewDetails.status === "Rejected" && (
              <BudgetViewDetail
                title="Rejected By"
                detail={viewDetails.rejectedByName}
              />
            )}
            {viewDetails.status === "Approved" && (
              <BudgetViewDetail
                title="Approver Name"
                detail={
                  viewDetails.approverName ||
                  viewDetails.requiredApprover ||
                  "\u2014"
                }
              />
            )}
            <BudgetViewDetail
              title="Paid Status"
              detail={viewDetails.isPaid || "Unpaid"}
            />
            <BudgetViewDetail title="Invoice File" detail={invoiceChips} />
            <BudgetViewDetail
              title="Level"
              detail={viewDetails.approvalLevel || "\u2014"}
            />
          </div>
        </MuiModal>
      )}
    </PageFrame>
  );
};

export default ManageBudgets;
