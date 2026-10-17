import { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CircularProgress, Popover, TextField } from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateRangePicker } from "react-date-range";
import { HiPencilSquare } from "react-icons/hi2";
import { MdCalendarToday } from "react-icons/md";
import dayjs from "dayjs";
import { toast } from "sonner";
import AgTable from "../../components/AgTable";
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

const KraKpaPendingApprovals = () => {
  const axios = useAxiosPrivate();
  const queryClient = useQueryClient();
  const location = useLocation();
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
  const member = location.state?.selectedMember || selectedMember;
  const departmentId =
    location.state?.selectedDepartment ||
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

  const [dateRange, setDateRange] = useState(initialDateRange);
  const [calendarAnchor, setCalendarAnchor] = useState(null);
  const [editingRecord, setEditingRecord] = useState(null);
  const [approvalRecord, setApprovalRecord] = useState(null);
  const [form, setForm] = useState({ month: "", target: "", deadline: "" });
  const [errors, setErrors] = useState({});

  const { data: records = [], isLoading } = useQuery({
    queryKey: ["kraKpaPendingApprovals", departmentId, employeeId],
    enabled: Boolean(departmentId && employeeId),
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
      width: 185,
      sortable: false,
      filter: false,
      cellRenderer: ({ data }) => (
        <div className="flex h-full items-center gap-2">
          <button
            type="button"
            title="Edit KPA"
            aria-label={`Edit ${data.target}`}
            onClick={() => openEdit(data)}
            className="flex h-8 w-8 items-center justify-center"
          >
            <HiPencilSquare size={24} color="#111827" />
          </button>
          <PrimaryButton
            type="button"
            title="Approve"
            handleSubmit={() => setApprovalRecord(data)}
            className="!h-8 !px-3 !py-1 !text-xs"
          />
        </div>
      ),
    },
  ];

  return (
    <PageFrame>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-title font-pmedium uppercase text-primary">
          {departmentName ? `${departmentName} - ` : ""}{employeeName}
        </h1>
      </div>
      <div className="mb-1 flex flex-wrap items-center justify-center gap-2">
        <div className="min-w-40 rounded-md border border-primary px-6 py-2 text-center text-content text-gray-600">
          {dayjs(dateRange.startDate).format("DD MMM YYYY")}
        </div>
        <div className="min-w-40 rounded-md border border-primary px-6 py-2 text-center text-content text-gray-600">
          {dayjs(dateRange.endDate).format("DD MMM YYYY")}
        </div>
        <button
          type="button"
          aria-label="Select date range"
          className="rounded-md bg-primary p-3 text-white"
          onClick={(event) => setCalendarAnchor(event.currentTarget)}
        >
          <MdCalendarToday size={20} />
        </button>
      </div>
      <Popover
        open={Boolean(calendarAnchor)}
        anchorEl={calendarAnchor}
        onClose={() => setCalendarAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        transformOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <DateRangePicker
          ranges={[dateRange]}
          onChange={({ selection }) => setDateRange(selection)}
          moveRangeOnFirstSelection={false}
          direction="vertical"
        />
      </Popover>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <CircularProgress />
        </div>
      ) : (
        <AgTable
          data={tableData}
          columns={columns}
          hideTitle
          enableCheckbox
          search
          exportData
          hideFilter
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
    </PageFrame>
  );
};

export default KraKpaPendingApprovals;
