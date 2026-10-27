import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CircularProgress, TextField } from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { HiPencilSquare } from "react-icons/hi2";
import dayjs from "dayjs";
import { toast } from "sonner";
import AgTable from "../../components/AgTable";
import TableDateFilter from "../../components/TableDateFilter";
import ConfirmationModal from "../../components/ConfirmationModal";
import MuiModal from "../../components/MuiModal";
import PageFrame from "../../components/Pages/PageFrame";
import PrimaryButton from "../../components/PrimaryButton";
import SecondaryButton from "../../components/SecondaryButton";
import useAuth from "../../hooks/useAuth";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";

const formatUserName = (user) =>
  user && typeof user === "object"
    ? [user.firstName, user.middleName, user.lastName]
        .filter(Boolean)
        .join(" ") || "-"
    : "-";
const initialDateRange = () => ({
  startDate: dayjs().startOf("month").toDate(),
  endDate: dayjs().endOf("month").toDate(),
  key: "selection",
});
const formatDateTime = (date) =>
  date && dayjs(date).isValid()
    ? dayjs(date).format("DD-MM-YYYY, hh:mm A")
    : "-";

const PendingApprovalActions = ({ data, node, onEdit, onApprove, onReject, isPending }) => {
  const [selected, setSelected] = useState(() => Boolean(node.isSelected()));
  useEffect(() => {
    const syncSelection = () => setSelected(Boolean(node.isSelected()));
    syncSelection();
    node.addEventListener("rowSelected", syncSelection);
    return () => node.removeEventListener("rowSelected", syncSelection);
  }, [node]);
  const disabled = !selected || isPending;
  return (
    <div className="flex h-full items-center gap-2">
      <button
        type="button"
        title="Edit KPA"
        aria-label={`Edit ${data.target}`}
        disabled={disabled}
        onClick={() => onEdit(data)}
        className="flex h-8 w-8 items-center justify-center disabled:cursor-not-allowed"
      >
        <HiPencilSquare size={24} color={disabled ? "#9ca3af" : "#111827"} />
      </button>
      <PrimaryButton
        type="button"
        title="Approve"
        disabled={disabled}
        handleSubmit={() => onApprove(data)}
        className="!h-8 !px-3 !py-1 !text-xs"
      />
      <button
        type="button"
        disabled={disabled}
        onClick={() => onReject(data)}
        className="h-8 rounded border border-red-600 px-3 text-xs text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:border-gray-300 disabled:text-gray-400 disabled:hover:bg-transparent"
        aria-label={`Reject ${data.target}`}
      >
        Reject
      </button>
    </div>
  );
};

const KraKpaPendingApprovals = () => {
  const axios = useAxiosPrivate();
  const queryClient = useQueryClient();
  const location = useLocation();
  const navigate = useNavigate();
  const isOverview = location.pathname.replace(/\/$/, "") === "/app/kra-kpa/pending-approvals";
  const { auth } = useAuth();
  const selectedDepartment = useSelector(
    (state) => state.performance.selectedDepartment,
  );
  const selectedDepartmentName = useSelector(
    (state) => state.performance.selectedDepartmentName,
  );
  const selectedMember = useSelector(
    (state) => state.performance.selectedMember,
  );
  const member = isOverview ? null : location.state?.selectedMember || selectedMember;
  const departmentId =
    isOverview ? undefined : location.state?.selectedDepartment ||
    selectedDepartment ||
    auth?.user?.departments?.[0]?._id;
  const departmentName =
    location.state?.selectedDepartmentName ||
    selectedDepartmentName ||
    auth?.user?.departments?.find(
      (department) => String(department?._id) === String(departmentId),
    )?.name;
  const employeeId = member?.memberId;
  const employeeName = member?.memberName || "Selected Member";

  const [dateRange, setDateRange] = useState(() => isOverview ? null : initialDateRange());
  const [editingRecord, setEditingRecord] = useState(null);
  const [approvalRecord, setApprovalRecord] = useState(null);
  const [rejectionRecord, setRejectionRecord] = useState(null);
  const [form, setForm] = useState({ month: "", target: "", deadline: "" });
  const [errors, setErrors] = useState({});

  const { data: records = [], isLoading, isError, error } = useQuery({
    queryKey: ["kraKpaPendingApprovals", departmentId, employeeId],
    enabled: isOverview || Boolean(departmentId && employeeId),
    queryFn: async () => {
      const response = await axios.get(
        "/api/kra-kpa/individual-monthly-kpa/pending-approvals",
        { params: { department: departmentId, employee: employeeId } },
      );
      return response.data || [];
    },
  });

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["kraKpaPendingApprovals"] });
    queryClient.invalidateQueries({ queryKey: ["kraKpaIndividualMonthlyKpa"] });
    queryClient.invalidateQueries({ queryKey: ["kraKpaDueTaskParentKpas"] });
    queryClient.invalidateQueries({ queryKey: ["kraKpaDailyLogs"] });
  };

  const saveKpa = useMutation({
    mutationFn: async (payload) => {
      const response = await axios.patch(
        `/api/kra-kpa/individual-monthly-kpa/${editingRecord._id}`,
        payload,
      );
      return response.data;
    },
    onSuccess: () => {
      refresh();
      setEditingRecord(null);
      toast.success("KPA updated");
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Unable to update KPA");
    },
  });

  const approveKpa = useMutation({
    mutationFn: async (record) => {
      const response = await axios.patch(
        `/api/kra-kpa/individual-monthly-kpa/${record._id}/approve`,
      );
      return response.data;
    },
    onSuccess: () => {
      refresh();
      setApprovalRecord(null);
      toast.success("KPA approved");
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Unable to approve KPA");
    },
  });

  const openEdit = (record) => {
    setEditingRecord(record);
    setForm({
      month: record.month || "",
      target: record.target || "",
      deadline: record.deadline
        ? dayjs(record.deadline).format("YYYY-MM-DD")
        : "",
    });
    setErrors({});
  };

  const rejectKpa = useMutation({
    mutationFn: async (record) => {
      const response = await axios.patch(
        `/api/kra-kpa/individual-monthly-kpa/${record._id}/reject`,
      );
      return response.data;
    },
    onSuccess: () => {
      refresh();
      setRejectionRecord(null);
      toast.success("KPA rejected");
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Unable to reject KPA");
    },
  });

  const submitEdit = (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!form.target.trim()) nextErrors.target = "KPA is required";
    if (!form.deadline) nextErrors.deadline = "Deadline is required";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    saveKpa.mutate({
      month: form.month,
      target: form.target.trim(),
      deadline: form.deadline,
    });
  };

  const tableData = useMemo(
    () =>
      records
        .filter((record) => {
          if (!dateRange) return true;
          if (!record.month) return false;
          const recordStart = dayjs(`${record.month}-01`).startOf("month");
          const recordEnd = recordStart.endOf("month");
          return (
            recordStart.isBefore(dayjs(dateRange.endDate).endOf("day")) &&
            recordEnd.isAfter(dayjs(dateRange.startDate).startOf("day"))
          );
        })
        .map((record, index) => ({
        ...record,
        srNo: index + 1,
        employeeName: formatUserName(record.employee),
        departmentName: record.department?.name || "-",
        assignedByName: formatUserName(record.createdBy),
        deadlineLabel:
          record.deadline && dayjs(record.deadline).isValid()
            ? dayjs(record.deadline).format("DD-MM-YYYY")
            : "-",
      })),
    [records, dateRange],
  );

  const columns = [
    { headerName: "Sr No", field: "srNo", width: 85 },
    ...(isOverview ? [
      {
        headerName: "Member", field: "employeeName", minWidth: 180, flex: 1,
        valueGetter: ({ data }) => formatUserName(data.employee),
        cellRenderer: ({ data }) => <button
          type="button"
          className="text-primary underline cursor-pointer"
          disabled={!data.employee?._id || !data.department?._id}
          onClick={() => navigate("/app/kra-kpa/department-KPA/member-wise-KPA/employee-dashboard", {
            state: {
              selectedMember: { memberId: data.employee?._id, memberName: formatUserName(data.employee), memberRole: "Employee" },
              selectedDepartment: data.department?._id,
              selectedDepartmentName: data.department?.name,
            },
          })}
        >{formatUserName(data.employee)}</button>,
      },
      { headerName: "Department", field: "departmentName", minWidth: 170, valueGetter: ({ data }) => data.department?.name || "-" },
    ] : []),
    { headerName: "KPA", field: "target", minWidth: 280, flex: 2 },
    { headerName: "Deadline", field: "deadlineLabel", width: 155 },
    { headerName: "Assigned By", field: "assignedByName", minWidth: 180, flex: 1 },
    {
      headerName: "Assigned On",
      field: "createdAt",
      width: 220,
      valueFormatter: ({ value }) => formatDateTime(value),
    },
    {
      headerName: "Actions",
      field: "actions",
      pinned: "right",
      width: 265,
      sortable: false,
      filter: false,
      cellRenderer: ({ data, node }) => (
        <PendingApprovalActions
          data={data}
          node={node}
          onEdit={openEdit}
          onApprove={setApprovalRecord}
          onReject={setRejectionRecord}
          isPending={saveKpa.isPending || approveKpa.isPending || rejectKpa.isPending}
        />
      ),
    },
  ];

  return (
    <PageFrame>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-title font-pmedium uppercase text-primary">
          {isOverview ? "Pending KPA Approvals" : `${departmentName ? `${departmentName} - ` : ""}${employeeName}`}
        </h1>
      </div>
      {isError ? (
        <p role="alert" className="py-6 text-red-600">{error?.response?.data?.message || "Unable to load pending approvals"}</p>
      ) : isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <CircularProgress />
        </div>
      ) : (
        <AgTable
          showDateControls={false}
          toolbarDateControls={<TableDateFilter
            fields={[{ field: "month", label: "KPA Month" }]}
            field="month"
            range={dateRange}
            onChange={setDateRange}
          />}
          data={tableData}
          columns={columns}
          hideTitle
          enableCheckbox
          search
          exportData
          hideFilter={false}
          processExportCell={({ value }) => value ?? ""}
          tableHeight={Math.max(300, Math.min(650, tableData.length * 58 + 90))}
        />
      )}

      <MuiModal
        open={Boolean(editingRecord)}
        onClose={() => setEditingRecord(null)}
        title="Edit KPA"
        widthClass="w-[92vw] max-w-[680px]"
      >
        <form className="grid gap-4" onSubmit={submitEdit} noValidate>
          <TextField
            label="Month"
            size="small"
            value={
              form.month ? dayjs(`${form.month}-01`).format("MMMM YYYY") : ""
            }
            disabled
            fullWidth
          />
          <TextField
            label="KPA *"
            size="small"
            value={form.target}
            onChange={(event) => {
              setForm((current) => ({ ...current, target: event.target.value }));
              setErrors((current) => ({ ...current, target: "" }));
            }}
            error={Boolean(errors.target)}
            helperText={errors.target}
            inputProps={{ maxLength: 2000 }}
            multiline
            minRows={3}
            fullWidth
          />
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Deadline *"
              format="DD-MM-YYYY"
              value={form.deadline ? dayjs(form.deadline) : null}
              onChange={(date) => {
                setForm((current) => ({
                  ...current,
                  deadline: date?.isValid() ? date.format("YYYY-MM-DD") : "",
                }));
                setErrors((current) => ({ ...current, deadline: "" }));
              }}
              slotProps={{
                textField: {
                  size: "small",
                  fullWidth: true,
                  error: Boolean(errors.deadline),
                  helperText: errors.deadline,
                },
              }}
            />
          </LocalizationProvider>
          <div className="flex justify-end gap-3">
            <SecondaryButton
              type="button"
              title="Cancel"
              handleSubmit={() => setEditingRecord(null)}
            />
            <PrimaryButton
              type="submit"
              title="Save"
              isLoading={saveKpa.isPending}
              disabled={saveKpa.isPending}
            />
          </div>
        </form>
      </MuiModal>

      <ConfirmationModal
        open={Boolean(approvalRecord)}
        onClose={() => setApprovalRecord(null)}
        onConfirm={() => approvalRecord && approveKpa.mutate(approvalRecord)}
        title="Approve KPA"
        message="Approve this KPA and make it available for work?"
        confirmText="Approve"
        cancelText="Cancel"
        cancelFirst
        isLoading={approveKpa.isPending}
      />
      <ConfirmationModal
        open={Boolean(rejectionRecord)}
        onClose={() => !rejectKpa.isPending && setRejectionRecord(null)}
        onConfirm={() => rejectionRecord && rejectKpa.mutate(rejectionRecord)}
        title="Reject KPA"
        message="Reject this KPA? It will remain in Self KPA as rejected and cannot be scheduled or completed."
        confirmText="Reject"
        cancelText="Cancel"
        cancelFirst
        isLoading={rejectKpa.isPending}
      />
    </PageFrame>
  );
};

export default KraKpaPendingApprovals;
