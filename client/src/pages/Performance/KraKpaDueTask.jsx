import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Chip, CircularProgress, MenuItem, Popover, TextField } from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateRangePicker } from "react-date-range";
import { MdCalendarToday, MdDeleteForever } from "react-icons/md";
import { HiPencilSquare } from "react-icons/hi2";
import dayjs from "dayjs";
import { toast } from "sonner";
import AgTable from "../../components/AgTable";
import ConfirmationModal from "../../components/ConfirmationModal";
import DetalisFormatted from "../../components/DetalisFormatted";
import MuiModal from "../../components/MuiModal";
import PageFrame from "../../components/Pages/PageFrame";
import PrimaryButton from "../../components/PrimaryButton";
import SecondaryButton from "../../components/SecondaryButton";
import useAuth from "../../hooks/useAuth";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";

const formatDate = (value) =>
  value && dayjs(value).isValid() ? dayjs(value).format("DD-MM-YYYY") : "-";

const KPA_SLOTS = ["11:00 AM - 12:30 PM", "03:00 PM - 04:30 PM"];

const formatUserName = (user) =>
  user && typeof user === "object"
    ? [user.firstName, user.middleName, user.lastName]
        .filter(Boolean)
        .join(" ") || user.empId || "-"
    : "-";

const initialDateRange = () => ({
  startDate: dayjs().startOf("month").toDate(),
  endDate: dayjs().endOf("month").toDate(),
  key: "selection",
});

const emptyForm = () => ({
  dueTaskName: "",
  identificationDate: dayjs().format("YYYY-MM-DD"),
  taskIdentifier: "",
  deadline: "",
  comments: "",
});

const DueTaskActionCell = ({
  data,
  node,
  onEdit,
  onAction,
  onAddToDailyLogs,
  canEdit,
  canDelete,
  canClose,
  canAddToDailyLogs,
  isPending,
}) => {
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
      {data.status !== "Closed" &&
        !data.isAddedToDailyLogs &&
        canAddToDailyLogs && (
        <PrimaryButton
          type="button"
          title="Add Daily Logs"
          handleSubmit={() => onAddToDailyLogs(data)}
          disabled={disabled}
          className="!h-7 whitespace-nowrap !px-2 !py-1 !text-xs"
        />
      )}
      {data.status !== "Closed" && canClose && (
        <PrimaryButton
          type="button"
          title="Mark As Done"
          handleSubmit={() => onAction("close", data)}
          disabled={disabled}
          className="!h-7 whitespace-nowrap !px-2 !py-1 !text-xs"
        />
      )}
      {data.status !== "Closed" && canEdit && (
        <button
          type="button"
          title="Edit"
          aria-label={`Edit ${data.dueTaskName}`}
          disabled={disabled}
          onClick={() => onEdit(data)}
          className="flex h-8 w-8 items-center justify-center disabled:cursor-not-allowed"
        >
          <HiPencilSquare size={24} color={disabled ? "#9ca3af" : "#111827"} />
        </button>
      )}
      {canDelete && (
        <button
          type="button"
          title="Delete"
          aria-label={`Delete ${data.dueTaskName}`}
          disabled={disabled}
          onClick={() => onAction("delete", data)}
          className="flex h-8 w-8 items-center justify-center disabled:cursor-not-allowed"
        >
          <MdDeleteForever size={26} color={disabled ? "#9ca3af" : "red"} />
        </button>
      )}
    </div>
  );
};

const KraKpaDueTask = () => {
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
  const employeeId = member?.memberId || auth?.user?._id;
  const employeeName =
    member?.memberName ||
    [auth?.user?.firstName, auth?.user?.middleName, auth?.user?.lastName]
      .filter(Boolean)
      .join(" ");
  const departmentName =
    location.state?.selectedDepartmentName ||
    selectedDepartmentName ||
    auth?.user?.departments?.find(
      (department) => String(department?._id) === String(departmentId),
    )?.name;
  const roleTitles =
    auth?.user?.role?.map((role) => role?.roleTitle?.toLowerCase()) || [];
  const canManageOthers = roleTitles.some(
    (role) =>
      role.includes("manager") ||
      role.endsWith("admin") ||
      /^hr(?:\s|$)/.test(role) ||
      role === "top management",
  );
  const canAdd =
    String(employeeId) === String(auth?.user?._id) || canManageOthers;
  const [dateRange, setDateRange] = useState(initialDateRange);
  const [calendarAnchor, setCalendarAnchor] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [viewRecord, setViewRecord] = useState(null);
  const [pendingAction, setPendingAction] = useState(null);
  const [dailyLogTarget, setDailyLogTarget] = useState(null);
  const [dailyLogForm, setDailyLogForm] = useState({
    date: dayjs().format("YYYY-MM-DD"),
    type: "",
    kpaSlot: "",
  });
  const [dailyLogErrors, setDailyLogErrors] = useState({});
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});

  const { data: records = [], isLoading } = useQuery({
    queryKey: ["kraKpaDueTask", departmentId, employeeId],
    enabled: Boolean(departmentId && employeeId),
    queryFn: async () => {
      const response = await axios.get("/api/kra-kpa/due-task", {
        params: { department: departmentId, employee: employeeId },
      });
      return response.data || [];
    },
  });

  const { data: userOptions = [], isLoading: isLoadingUsers } = useQuery({
    queryKey: ["kraKpaDueTaskUsers", departmentId],
    enabled: Boolean(departmentId),
    queryFn: async () => {
      const response = await axios.get("/api/kra-kpa/due-task/users", {
        params: { department: departmentId },
      });
      return (response.data || []).map((user) => ({
        id: user._id,
        name: formatUserName(user),
      }));
    },
  });

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["kraKpaDueTask"] });
  };

  const saveTask = useMutation({
    mutationFn: async (payload) => {
      if (editingRecord) {
        const response = await axios.patch(
          `/api/kra-kpa/due-task/${editingRecord._id}`,
          payload,
        );
        return response.data;
      }
      const response = await axios.post("/api/kra-kpa/due-task", {
        ...payload,
        department: departmentId,
        employee: employeeId,
      });
      return response.data;
    },
    onSuccess: () => {
      refresh();
      setModalOpen(false);
      setEditingRecord(null);
      toast.success(`Due Task ${editingRecord ? "updated" : "created"}`);
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Unable to save Due Task");
    },
  });

  const rowAction = useMutation({
    mutationFn: async ({ type, record }) => {
      if (type === "delete") {
        await axios.delete(`/api/kra-kpa/due-task/${record._id}`);
      } else {
        await axios.patch(`/api/kra-kpa/due-task/${record._id}/close`);
      }
    },
    onSuccess: (_, { type }) => {
      refresh();
      setPendingAction(null);
      setViewRecord(null);
      toast.success(type === "delete" ? "Due Task deleted" : "Due Task closed");
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Unable to update Due Task");
    },
  });

  const addToDailyLogs = useMutation({
    mutationFn: async ({ record, date, type, kpaSlot }) => {
      const response = await axios.post(
        `/api/kra-kpa/due-task/${record._id}/daily-log`,
        { date, type, kpaSlot },
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kraKpaDailyLogs"] });
      refresh();
      setDailyLogTarget(null);
      setDailyLogForm({
        date: dayjs().format("YYYY-MM-DD"),
        type: "",
        kpaSlot: "",
      });
      setDailyLogErrors({});
      toast.success("Due Task added to Daily Logs");
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message || "Unable to add task to Daily Logs",
      );
    },
  });

  const openCreate = () => {
    setEditingRecord(null);
    setForm(emptyForm());
    setFormErrors({});
    setModalOpen(true);
  };

  const openEdit = (record) => {
    setEditingRecord(record);
    setForm({
      dueTaskName: record.dueTaskName || "",
      identificationDate: record.identificationDate
        ? dayjs(record.identificationDate).format("YYYY-MM-DD")
        : "",
      taskIdentifier:
        record.taskIdentifier?._id || record.taskIdentifier || "",
      deadline: record.deadline
        ? dayjs(record.deadline).format("YYYY-MM-DD")
        : "",
      comments: record.comments || "",
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const updateForm = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
    setFormErrors((current) => ({ ...current, [field]: "" }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const errors = {};
    if (!form.dueTaskName.trim()) errors.dueTaskName = "Due Task Name is required";
    if (!form.identificationDate) {
      errors.identificationDate = "Identification Date is required";
    }
    if (!form.taskIdentifier) {
      errors.taskIdentifier = "Task Identifier is required";
    }
    if (!form.deadline) errors.deadline = "Deadline is required";
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;
    saveTask.mutate({
      ...form,
      dueTaskName: form.dueTaskName.trim(),
      comments: form.comments.trim(),
    });
  };

  const tableData = useMemo(
    () =>
      records
        .filter((record) => {
          const date = dayjs(record.identificationDate);
          return (
            date.isAfter(dayjs(dateRange.startDate).startOf("day")) ||
            date.isSame(dayjs(dateRange.startDate), "day")
          ) && (
            date.isBefore(dayjs(dateRange.endDate).endOf("day")) ||
            date.isSame(dayjs(dateRange.endDate), "day")
          );
        })
        .map((record, index) => ({
          ...record,
          srNo: index + 1,
          leadName: formatUserName(record.lead),
          assignedByName: formatUserName(record.assignedBy || record.createdBy),
          identifierName: formatUserName(record.taskIdentifier),
        })),
    [records, dateRange],
  );

  const canEditRecord = (record) =>
    canManageOthers ||
    String(record.employee?._id || record.employee) === String(auth?.user?._id) ||
    String(record.createdBy?._id || record.createdBy) === String(auth?.user?._id);
  const isTaskEmployee = (record) =>
    String(record?.employee?._id || record?.employee) ===
    String(auth?.user?._id);
  const canDeleteRecord = (record) =>
    canManageOthers && !isTaskEmployee(record);
  const canCloseRecord = (record) =>
    String(record.lead?._id || record.lead) === String(auth?.user?._id);
  const canAddToDailyLogsRecord = (record) =>
    !record.isAddedToDailyLogs &&
    (isTaskEmployee(record) || canCloseRecord(record));

  const openAddToDailyLogs = (record) => {
    setDailyLogTarget(record);
    setDailyLogForm({
      date: dayjs().format("YYYY-MM-DD"),
      type: "",
      kpaSlot: "",
    });
    setDailyLogErrors({});
  };

  const submitDailyLog = (event) => {
    event.preventDefault();
    const errors = {};
    if (!dailyLogForm.date) errors.date = "Date is required";
    if (!dailyLogForm.type) errors.type = "Type is required";
    if (dailyLogForm.type === "KPA" && !dailyLogForm.kpaSlot) {
      errors.kpaSlot = "KPA Slot is required";
    }
    setDailyLogErrors(errors);
    if (Object.keys(errors).length > 0 || !dailyLogTarget) return;
    addToDailyLogs.mutate({
      record: dailyLogTarget,
      date: dailyLogForm.date,
      type: dailyLogForm.type,
      kpaSlot: dailyLogForm.type === "KPA" ? dailyLogForm.kpaSlot : "",
    });
  };

  const columns = [
    { headerName: "Sr No", field: "srNo", width: 85 },
    {
      headerName: "Due Task Name",
      field: "dueTaskName",
      minWidth: 280,
      flex: 2,
      cellRenderer: ({ data, value }) => (
        <button
          type="button"
          className="text-left text-primary hover:underline"
          onClick={() => setViewRecord(data)}
        >
          {value}
        </button>
      ),
    },
    { headerName: "Lead", field: "leadName", minWidth: 160, flex: 1 },
    {
      headerName: "Assigned By",
      field: "assignedByName",
      minWidth: 170,
      flex: 1,
    },
    {
      headerName: "Identification Date",
      field: "identificationDate",
      width: 185,
      valueFormatter: ({ value }) => formatDate(value),
    },
    {
      headerName: "Task Identifier",
      field: "identifierName",
      minWidth: 180,
      flex: 1,
    },
    {
      headerName: "Deadline",
      field: "deadline",
      width: 150,
      valueFormatter: ({ value }) => formatDate(value),
    },
    {
      headerName: "Status",
      field: "status",
      width: 130,
      cellRenderer: ({ value }) => (
        <Chip
          size="small"
          label={value}
          sx={
            value === "Closed"
              ? { backgroundColor: "#d8f0df", color: "#16784d" }
              : { backgroundColor: "#ffedc9", color: "#ad7000" }
          }
        />
      ),
    },
    {
      headerName: "Closure Date",
      field: "closureDate",
      width: 165,
      valueFormatter: ({ value }) => formatDate(value),
    },
    { headerName: "Delayed Days", field: "delayedDays", width: 155 },
    { headerName: "Comments", field: "comments", minWidth: 220, flex: 1 },
    {
      headerName: "Actions",
      field: "actions",
      pinned: "right",
      width: 365,
      sortable: false,
      filter: false,
      cellRenderer: ({ data, node }) => (
        <DueTaskActionCell
          data={data}
          node={node}
          onEdit={openEdit}
          onAction={(type, record) => setPendingAction({ type, record })}
          onAddToDailyLogs={openAddToDailyLogs}
          canEdit={canEditRecord(data)}
          canDelete={canDeleteRecord(data)}
          canClose={canCloseRecord(data)}
          canAddToDailyLogs={canAddToDailyLogsRecord(data)}
          isPending={rowAction.isPending || addToDailyLogs.isPending}
        />
      ),
    },
  ];

  return (
    <PageFrame>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-title font-pmedium uppercase text-primary">
          {departmentName ? `${departmentName} - ` : ""}Due Task - {employeeName}
        </h1>
        {canAdd && (
          <PrimaryButton
            type="button"
            title="Add Due Task"
            handleSubmit={openCreate}
          />
        )}
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
        open={Boolean(viewRecord)}
        onClose={() => setViewRecord(null)}
        title="Due Task Details"
        widthClass="w-[92vw] max-w-[680px]"
      >
        {viewRecord && (
          <div className="space-y-2 py-2">
            <DetalisFormatted title="Due Task Name" detail={viewRecord.dueTaskName} />
            <DetalisFormatted title="Lead" detail={formatUserName(viewRecord.lead)} />
            <DetalisFormatted
              title="Assigned By"
              detail={formatUserName(viewRecord.assignedBy || viewRecord.createdBy)}
            />
            <DetalisFormatted
              title="Identification Date"
              detail={formatDate(viewRecord.identificationDate)}
            />
            <DetalisFormatted
              title="Task Identifier"
              detail={formatUserName(viewRecord.taskIdentifier)}
            />
            <DetalisFormatted title="Deadline" detail={formatDate(viewRecord.deadline)} />
            <DetalisFormatted title="Status" detail={viewRecord.status} />
            <DetalisFormatted
              title="Closure Date"
              detail={formatDate(viewRecord.closureDate)}
            />
            <DetalisFormatted title="Delayed Days" detail={viewRecord.delayedDays || 0} />
            <DetalisFormatted title="Comments" detail={viewRecord.comments || "-"} />
          </div>
        )}
      </MuiModal>

      <ConfirmationModal
        open={Boolean(pendingAction)}
        onClose={() => setPendingAction(null)}
        onConfirm={() => pendingAction && rowAction.mutate(pendingAction)}
        title={pendingAction?.type === "delete" ? "Delete Due Task" : "Close Due Task"}
        message={
          pendingAction?.type === "delete"
            ? "Are you sure you want to delete this Due Task?"
            : "Mark this Due Task as closed?"
        }
        confirmText={pendingAction?.type === "delete" ? "Delete" : "Mark As Done"}
        cancelText="Cancel"
        cancelFirst
        isLoading={rowAction.isPending}
      />

      <MuiModal
        open={Boolean(dailyLogTarget)}
        onClose={() => setDailyLogTarget(null)}
        title="Add to Daily Logs"
        widthClass="w-[92vw] max-w-[560px]"
      >
        <form className="grid gap-4" onSubmit={submitDailyLog} noValidate>
          <TextField
            label="Due Task"
            size="small"
            value={dailyLogTarget?.dueTaskName || ""}
            disabled
          />
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Date *"
              format="DD-MM-YYYY"
              value={dailyLogForm.date ? dayjs(dailyLogForm.date) : null}
              onChange={(date) => {
                setDailyLogForm((current) => ({
                  ...current,
                  date: date?.isValid() ? date.format("YYYY-MM-DD") : "",
                }));
                setDailyLogErrors((current) => ({ ...current, date: "" }));
              }}
              slotProps={{
                textField: {
                  size: "small",
                  fullWidth: true,
                  error: Boolean(dailyLogErrors.date),
                  helperText: dailyLogErrors.date,
                },
              }}
            />
          </LocalizationProvider>
          <TextField
            label="Type *"
            select
            size="small"
            value={dailyLogForm.type}
            onChange={(event) => {
              const type = event.target.value;
              setDailyLogForm((current) => ({
                ...current,
                type,
                ...(type !== "KPA" && { kpaSlot: "" }),
              }));
              setDailyLogErrors((current) => ({
                ...current,
                type: "",
                ...(type !== "KPA" && { kpaSlot: "" }),
              }));
            }}
            error={Boolean(dailyLogErrors.type)}
            helperText={dailyLogErrors.type}
          >
            <MenuItem value="" disabled>Select Type</MenuItem>
            <MenuItem value="KRA">KRA</MenuItem>
            <MenuItem value="KPA">KPA</MenuItem>
          </TextField>
          {dailyLogForm.type === "KPA" && (
            <TextField
              label="KPA Slot *"
              select
              size="small"
              value={dailyLogForm.kpaSlot}
              onChange={(event) => {
                setDailyLogForm((current) => ({
                  ...current,
                  kpaSlot: event.target.value,
                }));
                setDailyLogErrors((current) => ({
                  ...current,
                  kpaSlot: "",
                }));
              }}
              error={Boolean(dailyLogErrors.kpaSlot)}
              helperText={dailyLogErrors.kpaSlot}
            >
              <MenuItem value="" disabled>Select KPA Slot</MenuItem>
              {KPA_SLOTS.map((slot) => (
                <MenuItem key={slot} value={slot}>{slot}</MenuItem>
              ))}
            </TextField>
          )}
          <div className="flex justify-end gap-3">
            <SecondaryButton
              type="button"
              title="Close"
              handleSubmit={() => setDailyLogTarget(null)}
            />
            <PrimaryButton
              type="submit"
              title="Add Daily Logs"
              isLoading={addToDailyLogs.isPending}
            />
          </div>
        </form>
      </MuiModal>

      <MuiModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingRecord ? "Edit Due Task" : "Add Due Task"}
        widthClass="w-[92vw] max-w-[820px]"
      >
        <form className="grid gap-4" onSubmit={handleSubmit} noValidate>
          <TextField
            label="Due Task Name *"
            size="small"
            value={form.dueTaskName}
            onChange={updateForm("dueTaskName")}
            error={Boolean(formErrors.dueTaskName)}
            helperText={formErrors.dueTaskName}
            inputProps={{ maxLength: 500 }}
          />
          <div className="grid gap-4 md:grid-cols-2">
            <TextField
              label="Task Identifier *"
              select
              size="small"
              value={form.taskIdentifier}
              onChange={updateForm("taskIdentifier")}
              error={Boolean(formErrors.taskIdentifier)}
              helperText={formErrors.taskIdentifier}
              disabled={isLoadingUsers}
              className="md:col-span-2"
            >
              <MenuItem value="" disabled>
                {isLoadingUsers
                  ? "Loading active users..."
                  : "Select Task Identifier"}
              </MenuItem>
              {userOptions.map((user) => (
                <MenuItem key={user.id} value={user.id}>
                  {user.name}
                </MenuItem>
              ))}
            </TextField>
          </div>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <div className="grid gap-4 md:grid-cols-2">
              <DatePicker
                label="Identification Date *"
                format="DD-MM-YYYY"
                value={
                  form.identificationDate ? dayjs(form.identificationDate) : null
                }
                onChange={(date) => {
                  setForm((current) => ({
                    ...current,
                    identificationDate: date?.isValid()
                      ? date.format("YYYY-MM-DD")
                      : "",
                  }));
                  setFormErrors((current) => ({
                    ...current,
                    identificationDate: "",
                  }));
                }}
                slotProps={{
                  textField: {
                    size: "small",
                    fullWidth: true,
                    error: Boolean(formErrors.identificationDate),
                    helperText: formErrors.identificationDate,
                  },
                }}
              />
              <DatePicker
                label="Deadline *"
                format="DD-MM-YYYY"
                value={form.deadline ? dayjs(form.deadline) : null}
                onChange={(date) => {
                  setForm((current) => ({
                    ...current,
                    deadline: date?.isValid() ? date.format("YYYY-MM-DD") : "",
                  }));
                  setFormErrors((current) => ({
                    ...current,
                    deadline: "",
                  }));
                }}
                disabled={Boolean(editingRecord && isTaskEmployee(editingRecord))}
                slotProps={{
                  textField: {
                    size: "small",
                    fullWidth: true,
                    error: Boolean(formErrors.deadline),
                    helperText: formErrors.deadline,
                  },
                }}
              />
            </div>
          </LocalizationProvider>
          <TextField
            label="Comments"
            size="small"
            multiline
            minRows={3}
            value={form.comments}
            onChange={updateForm("comments")}
            inputProps={{ maxLength: 5000 }}
          />
          <div className="flex justify-end gap-3">
            <SecondaryButton
              type="button"
              title="Close"
              handleSubmit={() => setModalOpen(false)}
            />
            <PrimaryButton
              type="submit"
              title="Save"
              isLoading={saveTask.isPending}
            />
          </div>
        </form>
      </MuiModal>
    </PageFrame>
  );
};

export default KraKpaDueTask;
