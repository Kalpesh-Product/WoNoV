import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Chip,
  CircularProgress,
  MenuItem,
  Popover,
  TextField,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateRangePicker } from "react-date-range";
import { MdCalendarToday, MdClose, MdDeleteForever, MdHistory } from "react-icons/md";
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
import DailyLogEditHistory from "./DailyLogEditHistory";

const formatDate = (value) =>
  value && dayjs(value).isValid() ? dayjs(value).format("DD-MM-YYYY") : "-";

const formatUserName = (user) =>
  user && typeof user === "object"
    ? [user.firstName, user.middleName, user.lastName]
        .filter(Boolean)
        .join(" ") ||
      user.empId ||
      "-"
    : "-";

const initialDateRange = () => ({
  startDate: dayjs().startOf("month").toDate(),
  endDate: dayjs().endOf("month").toDate(),
  key: "selection",
});

const emptyForm = () => ({
  dueTaskName: "",
  parentKpa: "",
  identificationDate: dayjs().format("YYYY-MM-DD"),
  taskIdentifier: "",
  deadline: "",
  comments: "",
});

const DueTaskActionCell = ({
  data,
  node,
  onEdit,
  onHistory,
  onAction,
  canEdit,
  canDelete,
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
      <button type="button" title="View Edit History" aria-label={`View edit history for ${data.dueTaskName}`} disabled={disabled} onClick={() => onHistory(data)} className="flex h-8 w-8 shrink-0 items-center justify-center disabled:cursor-not-allowed">
        <MdHistory size={25} color={disabled ? "#9ca3af" : "#111827"} />
      </button>
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
  const isIndividualRoute = location.pathname.includes("/kra-kpa/individual/");
  const member = isIndividualRoute
    ? null
    : location.state?.selectedMember || selectedMember;
  const departmentId = isIndividualRoute
    ? auth?.user?.departments?.[0]?._id
    : location.state?.selectedDepartment ||
      selectedDepartment ||
      auth?.user?.departments?.[0]?._id;
  const employeeId = member?.memberId || auth?.user?._id;
  const employeeName =
    member?.memberName ||
    [auth?.user?.firstName, auth?.user?.middleName, auth?.user?.lastName]
      .filter(Boolean)
      .join(" ");
  const departmentName = isIndividualRoute
    ? auth?.user?.departments?.[0]?.name
    : location.state?.selectedDepartmentName ||
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
  const [historyRecord, setHistoryRecord] = useState(null);
  const [pendingAction, setPendingAction] = useState(null);
  const [selectedDueTasks, setSelectedDueTasks] = useState([]);
  const [dailyLogTargets, setDailyLogTargets] = useState([]);
  const [dailyLogForm, setDailyLogForm] = useState({
    date: dayjs().format("YYYY-MM-DD"),
  });
  const [dailyLogErrors, setDailyLogErrors] = useState({});
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const selectedKpaMonth = form.identificationDate
    ? dayjs(form.identificationDate).format("YYYY-MM")
    : "";
  const selectedKpaMonthLabel = form.identificationDate
    ? dayjs(form.identificationDate).format("MMMM")
    : "Month";

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

  const { data: deadlineAccess } = useQuery({
    queryKey: ["kraKpaIndividualMonthlyKpaReviewAccess", departmentId],
    enabled: Boolean(departmentId),
    queryFn: async () => {
      const response = await axios.get(
        "/api/kra-kpa/individual-monthly-kpa/review-access",
        { params: { department: departmentId } },
      );
      return response.data;
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

  const { data: parentKpaOptions = [], isLoading: isLoadingParentKpas } =
    useQuery({
      queryKey: [
        "kraKpaDueTaskParentKpas",
        departmentId,
        employeeId,
        selectedKpaMonth,
      ],
      enabled: Boolean(
        modalOpen && departmentId && employeeId && selectedKpaMonth,
      ),
      queryFn: async () => {
        const response = await axios.get(
          "/api/kra-kpa/individual-monthly-kpa",
          {
            params: {
              department: departmentId,
              employee: employeeId,
              month: selectedKpaMonth,
            },
          },
        );
        return [...(response.data || [])]
          .filter(
            (kpa) => !kpa.approvalStatus || kpa.approvalStatus === "Approved",
          )
          .sort((first, second) => {
            const firstDeadline = first.deadline
              ? dayjs(first.deadline).valueOf()
              : Number.MAX_SAFE_INTEGER;
            const secondDeadline = second.deadline
              ? dayjs(second.deadline).valueOf()
              : Number.MAX_SAFE_INTEGER;
            return firstDeadline - secondDeadline;
          });
      },
    });

  const selectedParentKpa = parentKpaOptions.find(
    (kpa) => kpa._id === form.parentKpa,
  );
  const selectedParentDeadline = selectedParentKpa?.deadline
    ? dayjs(selectedParentKpa.deadline).startOf("day")
    : null;
  const taskDeadline = form.deadline
    ? dayjs(form.deadline).startOf("day")
    : null;
  const identificationMaxDate =
    selectedParentDeadline && taskDeadline
      ? taskDeadline.isBefore(selectedParentDeadline)
        ? taskDeadline
        : selectedParentDeadline
      : selectedParentDeadline || taskDeadline;

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
    mutationFn: async ({ record }) => {
      await axios.delete(`/api/kra-kpa/due-task/${record._id}`);
    },
    onSuccess: () => {
      refresh();
      setPendingAction(null);
      setViewRecord(null);
      toast.success("Due Task deleted");
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message || "Unable to update Due Task",
      );
    },
  });

  const addToDailyLogs = useMutation({
    mutationFn: async ({ records: selectedRecords, date }) => {
      const response = await axios.post("/api/kra-kpa/due-task/daily-log", {
        dueTaskIds: selectedRecords.map((record) => record._id),
        date,
      });
      return response.data;
    },
    onSuccess: (createdLogs) => {
      queryClient.invalidateQueries({ queryKey: ["kraKpaDailyLogs"] });
      refresh();
      setDailyLogTargets([]);
      setSelectedDueTasks([]);
      setDailyLogForm({
        date: dayjs().format("YYYY-MM-DD"),
      });
      setDailyLogErrors({});
      toast.success(
        `${createdLogs.length} Due Task${createdLogs.length === 1 ? "" : "s"} added to Daily Logs`,
      );
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
      parentKpa: record.parentKpa?._id || record.parentKpa || "",
      identificationDate: record.identificationDate
        ? dayjs(record.identificationDate).format("YYYY-MM-DD")
        : "",
      taskIdentifier: record.taskIdentifier?._id || record.taskIdentifier || "",
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
    if (!form.dueTaskName.trim()) errors.dueTaskName = "KPA Task is required";
    if (!form.parentKpa) errors.parentKpa = "Main KPA is required";
    if (!form.identificationDate) {
      errors.identificationDate = "Identification Date is required";
    }
    if (!form.taskIdentifier) {
      errors.taskIdentifier = "Task Identifier is required";
    }
    if (!form.deadline) errors.deadline = "Deadline is required";
    const identificationDate = form.identificationDate
      ? dayjs(form.identificationDate).startOf("day")
      : null;
    const kpaTaskDeadline = form.deadline
      ? dayjs(form.deadline).startOf("day")
      : null;
    if (
      kpaTaskDeadline &&
      selectedParentDeadline &&
      kpaTaskDeadline.isAfter(selectedParentDeadline)
    ) {
      errors.deadline = "KPA Task deadline cannot be after the KPA deadline";
    }
    if (
      identificationDate &&
      kpaTaskDeadline &&
      identificationDate.isAfter(kpaTaskDeadline)
    ) {
      errors.identificationDate =
        "Identification Date cannot be after the KPA Task deadline";
    } else if (
      identificationDate &&
      selectedParentDeadline &&
      identificationDate.isAfter(selectedParentDeadline)
    ) {
      errors.identificationDate =
        "Identification Date cannot be after the KPA deadline";
    }
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
          if (record.isAddedToDailyLogs) return false;
          const date = dayjs(record.identificationDate);
          return (
            (date.isAfter(dayjs(dateRange.startDate).startOf("day")) ||
              date.isSame(dayjs(dateRange.startDate), "day")) &&
            (date.isBefore(dayjs(dateRange.endDate).endOf("day")) ||
              date.isSame(dayjs(dateRange.endDate), "day"))
          );
        })
        .map((record, index) => ({
          ...record,
          srNo: index + 1,
          leadName: formatUserName(record.lead),
          assignedByName: formatUserName(record.assignedBy || record.createdBy),
          identifierName: formatUserName(record.taskIdentifier),
          parentKpaName: record.parentKpa?.target || "-",
          parentKpaDeadline: record.parentKpa?.deadline || null,
        })),
    [records, dateRange],
  );

  const canEditRecord = (record) =>
    canManageOthers ||
    String(record.employee?._id || record.employee) ===
      String(auth?.user?._id) ||
    String(record.createdBy?._id || record.createdBy) ===
      String(auth?.user?._id);
  const isTaskEmployee = (record) =>
    String(record?.employee?._id || record?.employee) ===
    String(auth?.user?._id);
  const canDeleteRecord = (record) =>
    canManageOthers && !isTaskEmployee(record);
  const canCloseRecord = (record) =>
    String(record.lead?._id || record.lead) === String(auth?.user?._id);
  const canAddToDailyLogsRecord = (record) =>
    !record.isAddedToDailyLogs &&
    record.status !== "Closed" &&
    Boolean(record.deadline && dayjs(record.deadline).isValid()) &&
    !dayjs(record.deadline).isBefore(dayjs(), "day") &&
    (isTaskEmployee(record) || canCloseRecord(record));

  const canAddSelectedTasks =
    selectedDueTasks.length > 0 &&
    selectedDueTasks.every(canAddToDailyLogsRecord);

  const dailyLogMaxDate = dailyLogTargets.reduce((earliest, record) => {
    if (!record.deadline || !dayjs(record.deadline).isValid()) return earliest;
    const deadline = dayjs(record.deadline).startOf("day");
    return !earliest || deadline.isBefore(earliest) ? deadline : earliest;
  }, null);

  const openAddToDailyLogs = () => {
    if (!canAddSelectedTasks) return;
    setDailyLogTargets(selectedDueTasks);
    setDailyLogForm({
      date: dayjs().format("YYYY-MM-DD"),
    });
    setDailyLogErrors({});
  };

  const submitDailyLog = (event) => {
    event.preventDefault();
    const errors = {};
    if (!dailyLogForm.date) errors.date = "Date is required";
    if (
      dailyLogForm.date &&
      dayjs(dailyLogForm.date).isBefore(dayjs(), "day")
    ) {
      errors.date = "Schedule Date cannot be in the past";
    }
    if (
      dailyLogForm.date &&
      dailyLogMaxDate &&
      dayjs(dailyLogForm.date).isAfter(dailyLogMaxDate, "day")
    ) {
      errors.date = "Date cannot be after the selected task deadline";
    }
    setDailyLogErrors(errors);
    if (Object.keys(errors).length > 0 || dailyLogTargets.length === 0) return;
    addToDailyLogs.mutate({
      records: dailyLogTargets,
      date: dailyLogForm.date,
    });
  };

  const actionsColumnWidth = Math.max(
    92,
    ...tableData.map((record) => {
      const controlWidths = [
        32,
        record.status !== "Closed" && canEditRecord(record) ? 32 : 0,
        canDeleteRecord(record) ? 32 : 0,
      ].filter(Boolean);
      return (
        24 +
        controlWidths.reduce((total, width) => total + width, 0) +
        Math.max(0, controlWidths.length - 1) * 8
      );
    }),
  );

  const columns = [
    { headerName: "Sr No", field: "srNo", width: 85 },
    {
      headerName: "KPA Task",
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
    {
      headerName: "KPA Task Deadline",
      field: "deadline",
      width: 190,
      valueFormatter: ({ value }) => formatDate(value),
    },
    {
      headerName: "Main KPA",
      field: "parentKpaName",
      minWidth: 240,
      flex: 2,
    },
    {
      headerName: "Main KPA Deadline",
      field: "parentKpaDeadline",
      width: 170,
      valueFormatter: ({ value }) => formatDate(value),
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
      width: actionsColumnWidth,
      sortable: false,
      filter: false,
      cellRenderer: ({ data, node }) => (
        <DueTaskActionCell
          data={data}
          node={node}
          onEdit={openEdit}
          onHistory={setHistoryRecord}
          onAction={(type, record) => setPendingAction({ type, record })}
          canEdit={canEditRecord(data)}
          canDelete={canDeleteRecord(data)}
          isPending={rowAction.isPending || addToDailyLogs.isPending}
        />
      ),
    },
  ];

  return (
    <PageFrame>
      {historyRecord && <DailyLogEditHistory record={historyRecord} onClose={() => setHistoryRecord(null)} />}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-title font-pmedium uppercase text-primary">
          {departmentName ? `${departmentName} - ` : ""}
          {employeeName}
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
          showDateControls={false}
          data={tableData}
          columns={columns}
          hideTitle
          enableCheckbox
          checkAll
          search
          onSelectionChange={setSelectedDueTasks}
          searchRowActions={
            <PrimaryButton
              type="button"
              title={`Add Daily Logs (${selectedDueTasks.length})`}
              handleSubmit={openAddToDailyLogs}
              disabled={!canAddSelectedTasks || addToDailyLogs.isPending}
              className="!w-[230px]"
            />
          }
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
            <DetalisFormatted
              title="KPA Task"
              detail={viewRecord.dueTaskName}
            />
            <DetalisFormatted
              title="Main KPA"
              detail={viewRecord.parentKpa?.target || "-"}
            />
            <DetalisFormatted
              title="Main KPA Deadline"
              detail={formatDate(viewRecord.parentKpa?.deadline)}
            />
            <DetalisFormatted
              title="Lead"
              detail={formatUserName(viewRecord.lead)}
            />
            <DetalisFormatted
              title="Assigned By"
              detail={formatUserName(
                viewRecord.assignedBy || viewRecord.createdBy,
              )}
            />
            <DetalisFormatted
              title="Identification Date"
              detail={formatDate(viewRecord.identificationDate)}
            />
            <DetalisFormatted
              title="Task Identifier"
              detail={formatUserName(viewRecord.taskIdentifier)}
            />
            <DetalisFormatted
              title="Deadline"
              detail={formatDate(viewRecord.deadline)}
            />
            <DetalisFormatted title="Status" detail={viewRecord.status} />
            <DetalisFormatted
              title="Closure Date"
              detail={formatDate(viewRecord.closureDate)}
            />
            <DetalisFormatted
              title="Delayed Days"
              detail={viewRecord.delayedDays || 0}
            />
            <DetalisFormatted
              title="Comments"
              detail={viewRecord.comments || "-"}
            />
          </div>
        )}
      </MuiModal>

      <ConfirmationModal
        open={Boolean(pendingAction)}
        onClose={() => setPendingAction(null)}
        onConfirm={() => pendingAction && rowAction.mutate(pendingAction)}
        title="Delete Due Task"
        message="Are you sure you want to delete this Due Task?"
        confirmText="Delete"
        cancelText="Cancel"
        cancelFirst
        isLoading={rowAction.isPending}
      />

      <MuiModal
        open={dailyLogTargets.length > 0}
        onClose={() => setDailyLogTargets([])}
        title="Add to Daily Logs"
        widthClass="w-[92vw] max-w-[680px]"
      >
        <form className="grid gap-4" onSubmit={submitDailyLog} noValidate>
          <div>
            <div className="mb-2 text-sm font-medium text-primary">
              Selected KPAs ({dailyLogTargets.length})
            </div>
            <div className="max-h-52 space-y-2 overflow-y-auto rounded-lg border border-gray-200 bg-gray-50 p-3">
              {dailyLogTargets.map((record, index) => (
                <div
                  key={record._id}
                  className="flex items-start justify-between gap-3 rounded-md bg-white px-3 py-2"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-medium text-primary">
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-gray-800">
                      {record.dueTaskName}
                    </div>
                    <div className="mt-0.5 text-xs text-gray-500">
                      {record.parentKpa?.target || "KPA"}
                    </div>
                    <div className="mt-1 text-xs text-primary">
                      Deadline: {formatDate(record.deadline)}
                    </div>
                  </div>
                  <button
                    type="button"
                    title="Remove KPA Task"
                    aria-label={`Remove ${record.dueTaskName}`}
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-gray-500 hover:bg-red-50 hover:text-red-600"
                    onClick={() =>
                      setDailyLogTargets((current) =>
                        current.filter((item) => item._id !== record._id),
                      )
                    }
                  >
                    <MdClose size={20} />
                  </button>
                </div>
              ))}
            </div>
          </div>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Schedule Date *"
              format="DD-MM-YYYY"
              minDate={dayjs().startOf("day")}
              value={dailyLogForm.date ? dayjs(dailyLogForm.date) : null}
              maxDate={dailyLogMaxDate || undefined}
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
          <div className="flex justify-end gap-3">
            <SecondaryButton
              type="button"
              title="Cancel"
              handleSubmit={() => setDailyLogTargets([])}
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
          <div className="grid gap-4 md:grid-cols-2">
            <TextField
              label={`${selectedKpaMonthLabel} KPA *`}
              select
              size="small"
              value={form.parentKpa}
              onChange={updateForm("parentKpa")}
              error={Boolean(formErrors.parentKpa)}
              helperText={formErrors.parentKpa}
              disabled={!selectedKpaMonth || isLoadingParentKpas}
              SelectProps={{
                renderValue: (selected) => {
                  const selectedKpa = parentKpaOptions.find(
                    (kpa) => kpa._id === selected,
                  );
                  if (!selectedKpa) return "Select KPA";
                  return (
                    <div className="flex min-w-0 items-center justify-between gap-3">
                      <span className="truncate font-medium text-primary">
                        {selectedKpa.target}
                      </span>
                      <span className="shrink-0 rounded-full bg-blue-50 px-2 py-0.5 text-xs text-primary">
                        {formatDate(selectedKpa.deadline)}
                      </span>
                    </div>
                  );
                },
                MenuProps: {
                  PaperProps: {
                    sx: {
                      maxHeight: 340,
                      mt: 1,
                      border: "1px solid #e5e7eb",
                      borderRadius: "10px",
                      boxShadow: "0 10px 30px rgba(15, 23, 42, 0.14)",
                    },
                  },
                },
              }}
            >
              <MenuItem value="" disabled>
                {isLoadingParentKpas
                  ? "Loading KPAs..."
                  : parentKpaOptions.length
                    ? `Select ${selectedKpaMonthLabel} KPA`
                    : `No KPAs available for ${selectedKpaMonthLabel}`}
              </MenuItem>
              {parentKpaOptions.map((kpa) => (
                <MenuItem
                  key={kpa._id}
                  value={kpa._id}
                  sx={{
                    alignItems: "flex-start",
                    mx: 0.75,
                    my: 0.5,
                    borderRadius: "8px",
                    py: 1.1,
                    whiteSpace: "normal",
                    "&.Mui-selected": { backgroundColor: "#edf4ff" },
                    "&.Mui-selected:hover": { backgroundColor: "#e3edfc" },
                  }}
                >
                  <div className="min-w-0">
                    <div className="font-medium leading-5 text-primary">
                      {kpa.target}
                    </div>
                    <div className="mt-1 text-xs text-gray-500">
                      Deadline: {formatDate(kpa.deadline)}
                    </div>
                  </div>
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="KPA Task *"
              size="small"
              value={form.dueTaskName}
              onChange={updateForm("dueTaskName")}
              error={Boolean(formErrors.dueTaskName)}
              helperText={formErrors.dueTaskName}
              disabled={!form.parentKpa}
              inputProps={{ maxLength: 500 }}
            />
          </div>
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
                maxDate={identificationMaxDate || undefined}
                value={
                  form.identificationDate
                    ? dayjs(form.identificationDate)
                    : null
                }
                onChange={(date) => {
                  const nextIdentificationDate = date?.isValid()
                    ? date.format("YYYY-MM-DD")
                    : "";
                  setForm((current) => ({
                    ...current,
                    identificationDate: nextIdentificationDate,
                    ...(dayjs(current.identificationDate).format("YYYY-MM") !==
                      dayjs(nextIdentificationDate).format("YYYY-MM") && {
                      parentKpa: "",
                    }),
                  }));
                  setFormErrors((current) => ({
                    ...current,
                    identificationDate: "",
                    parentKpa: "",
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
                minDate={
                  form.identificationDate
                    ? dayjs(form.identificationDate)
                    : undefined
                }
                maxDate={selectedParentDeadline || undefined}
                value={form.deadline ? dayjs(form.deadline) : null}
                disabled={Boolean(
                  editingRecord && !deadlineAccess?.canEditManagerReview,
                )}
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
