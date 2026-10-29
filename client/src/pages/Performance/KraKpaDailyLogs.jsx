import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Autocomplete, Chip, CircularProgress, TextField } from "@mui/material";
import { DatePicker, LocalizationProvider, TimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { MdChevronLeft, MdChevronRight, MdDeleteForever, MdHistory } from "react-icons/md";
import { HiPencilSquare } from "react-icons/hi2";
import dayjs from "dayjs";
import { toast } from "sonner";
import AgTable from "../../components/AgTable";
import WidgetSection from "../../components/WidgetSection";
import ConfirmationModal from "../../components/ConfirmationModal";
import DetalisFormatted from "../../components/DetalisFormatted";
import MuiModal from "../../components/MuiModal";
import PageFrame from "../../components/Pages/PageFrame";
import PrimaryButton from "../../components/PrimaryButton";
import SecondaryButton from "../../components/SecondaryButton";
import useAuth from "../../hooks/useAuth";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import DailyLogTypeChip from "./DailyLogTypeChip";
import DailyLogEditHistory from "./DailyLogEditHistory";

const formatDate = (value) =>
  value && dayjs(value).isValid() ? dayjs(value).format("DD-MM-YYYY") : "-";
const isCarriedForward = (record) =>
  Boolean(record.carriedFromDailyLog || record.isCarryForward);
const formatTime = (value) =>
  value && dayjs(value).isValid() ? dayjs(value).format("hh:mm A") : "-";
const formatCommentAuthor = (user) =>
  user && typeof user === "object"
    ? [user.firstName, user.middleName, user.lastName].filter(Boolean).join(" ") || "-"
    : "-";

const emptyForm = () => ({
  dayTaskName: "",
  type: "",
  managerComments: "",
  hrComments: "",
});

const DailyLogActionCell = ({
  data,
  node,
  onEdit,
  onHistory,
  onAction,
  canComplete,
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
      <button type="button" title="View Edit History" aria-label={`View edit history for ${data.dayTaskName}`} disabled={disabled} onClick={() => onHistory(data)} className="flex h-8 w-8 shrink-0 items-center justify-center disabled:cursor-not-allowed">
        <MdHistory size={25} color={disabled ? "#9ca3af" : "#111827"} />
      </button>
      {canComplete && (
        <PrimaryButton
          type="button"
          title="Mark As Done"
          handleSubmit={() => onAction("complete", data)}
          disabled={disabled}
          className="!h-7 whitespace-nowrap !px-2 !py-1 !text-xs"
        />
      )}
      {canEdit && (
        <button
          type="button"
          title="Edit"
          aria-label={`Edit ${data.dayTaskName}`}
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
          aria-label={`Delete ${data.dayTaskName}`}
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

const KraKpaDailyLogs = () => {
  const axios = useAxiosPrivate();
  const queryClient = useQueryClient();
  const location = useLocation();
  const { auth } = useAuth();
  const selectedDepartment = useSelector(
    (state) => state.performance.selectedDepartment,
  );
  const selectedMember = useSelector(
    (state) => state.performance.selectedMember,
  );
  const isIndividualRoute = location.pathname.includes(
    "/kra-kpa/individual/",
  );
  const member = isIndividualRoute
    ? null
    : location.state?.selectedMember || selectedMember;
  const departmentId = isIndividualRoute
    ? auth?.user?.departments?.[0]?._id
    : location.state?.selectedDepartment ||
      selectedDepartment ||
      auth?.user?.departments?.[0]?._id;
  const employeeId = member?.memberId || auth?.user?._id;
  const roleTitles =
    auth?.user?.role?.map((role) => role?.roleTitle?.toLowerCase()) || [];
  const canManageOthers = roleTitles.some(
    (role) =>
      role.includes("manager") ||
      role.endsWith("admin") ||
      /^hr(?:\s|$)/.test(role) ||
      role === "top management",
  );
  const isHrUser = roleTitles.some((role) => /^hr(?:\s|$)/.test(role));
  const isOwnPage = String(employeeId) === String(auth?.user?._id);
  const canEditManagerComments = canManageOthers && !isOwnPage;
  const canEditHrComments = isHrUser;
  const canAddDailyLog = isOwnPage || canManageOthers;
  const [selectedDate, setSelectedDate] = useState(() => dayjs().startOf("day"));
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [viewRecord, setViewRecord] = useState(null);
  const [historyRecord, setHistoryRecord] = useState(null);
  const [pendingAction, setPendingAction] = useState(null);
  const [completionTimes, setCompletionTimes] = useState({
    startTime: null,
    endTime: null,
    reasonForCarryForward: "",
    resourceComment: "",
  });
  const [completionTimeErrors, setCompletionTimeErrors] = useState({});
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [dailyLogInputValue, setDailyLogInputValue] = useState("");

  const { data: records = [], isLoading } = useQuery({
    queryKey: [
      "kraKpaDailyLogs",
      departmentId,
      employeeId,
      selectedDate.format("YYYY-MM-DD"),
    ],
    enabled: Boolean(departmentId && employeeId),
    queryFn: async () => {
      const response = await axios.get("/api/kra-kpa/daily-log", {
        params: {
          department: departmentId,
          employee: employeeId,
          date: selectedDate.format("YYYY-MM-DD"),
        },
      });
      return response.data || [];
    },
  });
  const { data: editAccess } = useQuery({
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
  const canEditDailyLog = Boolean(editAccess?.canEditManagerReview);
  const { data: dailyLogOptionConfig } = useQuery({
    queryKey: ["kraKpaDailyLogOptions", departmentId, employeeId],
    enabled: Boolean(departmentId && employeeId),
    queryFn: async () => {
      const response = await axios.get("/api/kra-kpa/daily-log/options", {
        params: { department: departmentId, employee: employeeId },
      });
      return response.data;
    },
  });
  const canCreateGeneralTask = Boolean(
    dailyLogOptionConfig?.canCreateGeneralTask,
  );

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["kraKpaDailyLogs"] });
    queryClient.invalidateQueries({ queryKey: ["kraKpaDailyLogOptions"] });
  };

  const saveLog = useMutation({
    mutationFn: async (payload) => {
      if (editingRecord) {
        const response = await axios.patch(
          `/api/kra-kpa/daily-log/${editingRecord._id}`,
          payload,
        );
        return response.data;
      }
      const response = await axios.post("/api/kra-kpa/daily-log", {
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
      toast.success(`Daily Log ${editingRecord ? "updated" : "created"}`);
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Unable to save Daily Log");
    },
  });

  const rowAction = useMutation({
    mutationFn: async ({
      type,
      record,
      startTime,
      endTime,
      reasonForCarryForward,
      resourceComment,
    }) => {
      if (type === "delete") {
        await axios.delete(`/api/kra-kpa/daily-log/${record._id}`);
      } else {
        await axios.patch(`/api/kra-kpa/daily-log/${record._id}/complete`, {
          startTime,
          endTime,
          reasonForCarryForward,
          resourceComment,
        });
      }
    },
    onSuccess: (_, { type }) => {
      refresh();
      if (type === "complete") {
        queryClient.invalidateQueries({ queryKey: ["kraKpaSelfKra"] });
        queryClient.invalidateQueries({ queryKey: ["kraKpaDueTask"] });
      }
      setPendingAction(null);
      setCompletionTimes({
        startTime: null,
        endTime: null,
        reasonForCarryForward: "",
        resourceComment: "",
      });
      setCompletionTimeErrors({});
      setViewRecord(null);
      toast.success(type === "delete" ? "Daily Log deleted" : "Daily Log completed");
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Unable to update Daily Log");
    },
  });

  const openRowAction = (type, record) => {
    setPendingAction({ type, record });
    setCompletionTimes({
      startTime: null,
      endTime: null,
      reasonForCarryForward: "",
      resourceComment: "",
    });
    setCompletionTimeErrors({});
  };

  const closeRowAction = () => {
    setPendingAction(null);
    setCompletionTimes({
      startTime: null,
      endTime: null,
      reasonForCarryForward: "",
      resourceComment: "",
    });
    setCompletionTimeErrors({});
  };

  const confirmRowAction = () => {
    if (pendingAction?.type !== "complete") {
      if (pendingAction) rowAction.mutate(pendingAction);
      return;
    }
    const errors = {};
    if (!completionTimes.startTime?.isValid()) {
      errors.startTime = "Start Time is required";
    }
    if (!completionTimes.endTime?.isValid()) {
      errors.endTime = "End Time is required";
    }
    if (
      completionTimes.startTime?.isValid() &&
      completionTimes.endTime?.isValid() &&
      !completionTimes.endTime.isAfter(completionTimes.startTime)
    ) {
      errors.endTime = "End Time must be after Start Time";
    }
    if (
      isCarriedForward(pendingAction.record) &&
      !completionTimes.reasonForCarryForward.trim()
    ) {
      errors.reasonForCarryForward = "Reason for Carry Forward is required";
    }
    if (!completionTimes.resourceComment.trim()) {
      errors.resourceComment = "Resource Comment is required";
    }
    setCompletionTimeErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const logDate = dayjs(pendingAction.record.date).startOf("day");
    const toLogDateTime = (time) =>
      logDate
        .hour(time.hour())
        .minute(time.minute())
        .second(0)
        .millisecond(0)
        .toISOString();
    rowAction.mutate({
      ...pendingAction,
      startTime: toLogDateTime(completionTimes.startTime),
      endTime: toLogDateTime(completionTimes.endTime),
      reasonForCarryForward: completionTimes.reasonForCarryForward.trim(),
      resourceComment: completionTimes.resourceComment.trim(),
    });
  };

  const openEdit = (record) => {
    if (!canEditDailyLog) return;
    setEditingRecord(record);
    setForm({
      dayTaskName: record.dayTaskName || "",
      type: record.type || "",
      managerComments: record.managerComments || record.reviewerComments || "",
      hrComments: record.hrComments || "",
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const openCreate = () => {
    setEditingRecord(null);
    setForm(emptyForm());
    setFormErrors({});
    setDailyLogInputValue("");
    setModalOpen(true);
  };

  const updateForm = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
    setFormErrors((current) => ({ ...current, [field]: "" }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const errors = {};
    if (!form.dayTaskName.trim()) {
      errors.dayTaskName = "Day Task Name is required";
    }
    if (editingRecord && !form.type) errors.type = "Type is required";
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;
    saveLog.mutate({
      date: editingRecord?.date
        ? dayjs(editingRecord.date).format("YYYY-MM-DD")
        : selectedDate.format("YYYY-MM-DD"),
      dayTaskName: form.dayTaskName.trim(),
      type: editingRecord ? form.type : "GENERAL",
      ...(editingRecord && canEditManagerComments && {
        managerComments: form.managerComments.trim(),
      }),
      ...(editingRecord && canEditHrComments && {
        hrComments: form.hrComments.trim(),
      }),
    });
  };

  const filteredRecords = useMemo(
    () =>
      records.filter((record) => dayjs(record.date).isSame(selectedDate, "day")),
    [records, selectedDate],
  );
  const dailyLogOptions = dailyLogOptionConfig?.options || [];

  const { dueRows, completedRows } = useMemo(() => {
    const mapRows = (items) =>
      items.map((record, index) => ({ ...record, srNo: index + 1 }));
    return {
      dueRows: mapRows(filteredRecords.filter((record) => record.status !== "Done")),
      completedRows: mapRows(filteredRecords.filter((record) => record.status === "Done")),
    };
  }, [filteredRecords]);
  const summaryCounts = {
    total: filteredRecords.length,
    due: dueRows.length,
    carryForward: filteredRecords.filter(
      (record) => isCarriedForward(record),
    ).length,
  };
  const canCompleteRecord = (record) =>
    record.sourceSelfKpa
      ? false
      : record.sourceSelfKra
      ? dayjs(record.date).isSame(dayjs(), "day") &&
        String(record.sourceSelfKra?.lead?._id || record.sourceSelfKra?.lead) ===
          String(auth?.user?._id)
      : record.type === "KPA"
        ? isOwnPage && dayjs(record.date).isSame(dayjs(), "day")
        : isOwnPage;

  const baseColumns = [
    { headerName: "Sr No", field: "srNo", width: 85 },
    {
      headerName: "Day Task Name",
      field: "dayTaskName",
      minWidth: 320,
      flex: 2,
      valueGetter: ({ data }) =>
        data.type === "KPA" && data.kpaSlot
          ? `KPA Slot ${data.kpaSlot} > ${data.dayTaskName}`
          : data.dayTaskName,
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
      headerName: "Type",
      field: "type",
      width: 125,
      cellRenderer: DailyLogTypeChip,
    },
    {
      headerName: "Task Source",
      field: "taskSource",
      width: 155,
      valueGetter: ({ data }) =>
        isCarriedForward(data) ? "Carry Forward" : "New Task",
      cellRenderer: ({ value }) => (
        <Chip
          size="small"
          label={value}
          sx={
            value === "Carry Forward"
              ? { backgroundColor: "#ede9fe", color: "#6d28d9" }
              : { backgroundColor: "#dbeafe", color: "#1d4ed8" }
          }
        />
      ),
    },
    {
      headerName: "Delay",
      field: "delayedDays",
      width: 120,
      headerTooltip: "Delayed working days (excluding Sundays and company holidays)",
      valueGetter: ({ data }) => data?.delayedDays ?? 0,
    },
    {
      headerName: "Reason for Carry Forward",
      field: "reasonForCarryForward",
      minWidth: 260,
      flex: 1,
    },
    {
      headerName: "Resource Comment",
      field: "resourceComment",
      minWidth: 220,
      flex: 1,
    },
    {
      headerName: "Manager Comments",
      field: "managerComments",
      valueGetter: ({ data }) =>
        data.managerComments || data.reviewerComments || "",
      minWidth: 240,
      flex: 1,
    },
    {
      headerName: "HR Comments",
      field: "hrComments",
      minWidth: 240,
      flex: 1,
    },
  ];

  const actionsColumnWidth = Math.max(
    92,
    ...dueRows.map((record) => {
      const controlWidths = [
        32,
        canCompleteRecord(record) ? 110 : 0,
        canEditDailyLog ? 32 : 0,
        canManageOthers && !isOwnPage ? 32 : 0,
      ].filter(Boolean);
      return (
        24 +
        controlWidths.reduce((total, width) => total + width, 0) +
        Math.max(0, controlWidths.length - 1) * 8
      );
    }),
  );
  const dueColumns = [
    ...baseColumns,
    {
      headerName: "Actions",
      field: "actions",
      pinned: "right",
      width: actionsColumnWidth,
      minWidth: actionsColumnWidth,
      maxWidth: actionsColumnWidth,
      suppressSizeToFit: true,
      sortable: false,
      filter: false,
      cellRenderer: ({ data, node }) => (
        <DailyLogActionCell
          data={data}
          node={node}
          onEdit={openEdit}
          onHistory={setHistoryRecord}
          onAction={openRowAction}
          canComplete={canCompleteRecord(data)}
          canEdit={canEditDailyLog}
          canDelete={canManageOthers && !isOwnPage}
          isPending={rowAction.isPending}
        />
      ),
    },
  ];

  const completedColumns = [...baseColumns, {
    headerName: "History",
    field: "history",
    width: 100,
    pinned: "right",
    sortable: false,
    filter: false,
    cellRenderer: ({ data }) => (
      <div className="flex h-full items-center">
        <button type="button" title="View Edit History" aria-label={`View edit history for ${data.dayTaskName}`} onClick={() => setHistoryRecord(data)} className="flex h-8 w-8 items-center justify-center">
          <MdHistory size={25} color="#111827" />
        </button>
      </div>
    ),
  }];

  return (
    <div>
      {historyRecord && <DailyLogEditHistory record={historyRecord} onClose={() => setHistoryRecord(null)} />}

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <CircularProgress />
        </div>
      ) : (
        <>
          <PageFrame>
          <WidgetSection padding>
          <AgTable
            titleRightContent={
              <div className="flex flex-wrap items-center justify-end gap-3">
                <Chip label={`Total: ${summaryCounts.total}`} sx={{ backgroundColor: "#dbeafe", color: "#1d4ed8" }} />
                <Chip label={`Due: ${summaryCounts.due}`} sx={{ backgroundColor: "#fef3c7", color: "#b45309" }} />
                <Chip label={`Carry Forward: ${summaryCounts.carryForward}`} sx={{ backgroundColor: "#ede9fe", color: "#6d28d9" }} />
              </div>
            }
            headerActions={
              canAddDailyLog && <PrimaryButton type="button" title="Add Daily Log" handleSubmit={openCreate} />
            }
            toolbarDateControls={
              <>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <div className="mb-1 flex items-center justify-center gap-3">
                        <button type="button" aria-label="Previous day" onClick={() => setSelectedDate(date => date.subtract(1, "day"))} className="flex h-[38px] w-[38px] items-center justify-center rounded-md bg-primary text-white transition-opacity hover:opacity-90">
                          <MdChevronLeft size={22} />
                        </button>
                        <DatePicker format="ddd, MMMM D, YYYY" value={selectedDate} onChange={date => {
                      if (date?.isValid()) setSelectedDate(date.startOf("day"));
                    }} slotProps={{
                      textField: {
                        size: "small",
                        sx: {
                          width: 245,
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "6px",
                            height: 38
                          },
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#1e3d73"
                          },
                          "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#1e3d73"
                          },
                          "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#1e3d73"
                          },
                          "& .MuiInputBase-input": {
                            color: "#111827",
                            fontSize: "0.875rem"
                          },
                          "& .MuiSvgIcon-root": {
                            color: "#1e3d73"
                          }
                        }
                      }
                    }} />
                        <button type="button" aria-label="Next day" onClick={() => setSelectedDate(date => date.add(1, "day"))} className="flex h-[38px] w-[38px] items-center justify-center rounded-md bg-primary text-white transition-opacity hover:opacity-90">
                          <MdChevronRight size={22} />
                        </button>
                      </div>
                    </LocalizationProvider>
              </>
            }
            data={dueRows}
            columns={dueColumns}
            tableTitle="PENDING DAILY LOGS"
            enableCheckbox
            search
            exportData
            hideFilter={false}
            processExportCell={({ value }) => value ?? ""}
            tableHeight={Math.max(300, Math.min(650, dueRows.length * 58 + 90))}
          />
          </WidgetSection>
          </PageFrame>
          <div className="mt-6">
            <PageFrame>
            <WidgetSection padding>
            <AgTable
              data={completedRows}
              columns={completedColumns}
              tableTitle="COMPLETED DAILY LOGS"
              search
              exportData
              hideFilter={false}
              processExportCell={({ value }) => value ?? ""}
              tableHeight={Math.max(
                300,
                Math.min(650, completedRows.length * 58 + 90),
              )}
            />
            </WidgetSection>
            </PageFrame>
          </div>
        </>
      )}

      <MuiModal
        open={Boolean(viewRecord)}
        onClose={() => setViewRecord(null)}
        title="Daily Log Details"
        widthClass="w-[92vw] max-w-[680px]"
      >
        {viewRecord && (
          <div className="space-y-2 py-2">
            <DetalisFormatted title="Date" detail={formatDate(viewRecord.date)} />
            <DetalisFormatted title="Day Task Name" detail={viewRecord.dayTaskName} />
            <DetalisFormatted
              title="Type"
              detail={
                viewRecord.type === "KPA"
                  ? viewRecord.sourceSelfKpa
                    ? "KPA"
                    : "KPA Task"
                  : viewRecord.type
              }
            />
            {(viewRecord.sourceDueTask?.deadline ||
              viewRecord.deadline ||
              viewRecord.type === "GENERAL") && (
              <DetalisFormatted
                title="Deadline"
                detail={formatDate(
                  viewRecord.sourceDueTask?.deadline ||
                    viewRecord.deadline ||
                    viewRecord.date,
                )}
              />
            )}
            {viewRecord.type === "KPA" && !viewRecord.sourceSelfKpa && (
              <DetalisFormatted title="KPA Slot" detail={viewRecord.kpaSlot || "-"} />
            )}
            <DetalisFormatted title="Status" detail={viewRecord.status} />
            <DetalisFormatted title="Start Time" detail={formatTime(viewRecord.startTime)} />
            <DetalisFormatted title="End Time" detail={formatTime(viewRecord.endTime)} />
            <DetalisFormatted
              title="Reason for Carry Forward"
              detail={viewRecord.reasonForCarryForward || "-"}
            />
            <DetalisFormatted
              title="Resource Comment"
              detail={viewRecord.resourceComment || "-"}
            />
            <DetalisFormatted
              title="Resource Comment By"
              detail={viewRecord.resourceComment ? formatCommentAuthor(viewRecord.resourceCommentBy) : "-"}
            />
            <DetalisFormatted
              title="Manager Comments"
              detail={viewRecord.managerComments || viewRecord.reviewerComments || "-"}
            />
            <DetalisFormatted
              title="Manager Comment By"
              detail={viewRecord.managerComments || viewRecord.reviewerComments ? formatCommentAuthor(viewRecord.managerCommentsBy) : "-"}
            />
            <DetalisFormatted
              title="HR Comments"
              detail={viewRecord.hrComments || "-"}
            />
            <DetalisFormatted
              title="HR Comment By"
              detail={viewRecord.hrComments ? formatCommentAuthor(viewRecord.hrCommentsBy) : "-"}
            />
          </div>
        )}
      </MuiModal>

      <ConfirmationModal
        open={Boolean(pendingAction)}
        onClose={closeRowAction}
        onConfirm={confirmRowAction}
        title={pendingAction?.type === "delete" ? "Delete Daily Log" : "Complete Daily Log"}
        message={
          pendingAction?.type === "delete"
            ? "Are you sure you want to delete this Daily Log?"
            : "Mark this Daily Log as done?"
        }
        confirmText={pendingAction?.type === "delete" ? "Delete" : "Mark As Done"}
        cancelText="Cancel"
        cancelFirst
        isLoading={rowAction.isPending}
      >
        {pendingAction?.type === "complete" && (
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <TimePicker
                label="Start Time *"
                value={completionTimes.startTime}
                onChange={(value) => {
                  setCompletionTimes((current) => ({ ...current, startTime: value }));
                  setCompletionTimeErrors((current) => ({ ...current, startTime: "" }));
                }}
                slotProps={{
                  textField: {
                    size: "small",
                    error: Boolean(completionTimeErrors.startTime),
                    helperText: completionTimeErrors.startTime,
                  },
                }}
              />
              <TimePicker
                label="End Time *"
                value={completionTimes.endTime}
                onChange={(value) => {
                  setCompletionTimes((current) => ({ ...current, endTime: value }));
                  setCompletionTimeErrors((current) => ({ ...current, endTime: "" }));
                }}
                slotProps={{
                  textField: {
                    size: "small",
                    error: Boolean(completionTimeErrors.endTime),
                    helperText: completionTimeErrors.endTime,
                  },
                }}
              />
            </div>
            {isCarriedForward(pendingAction.record) && (
              <TextField
                label="Reason for Carry Forward *"
                size="small"
                multiline
                minRows={2}
                value={completionTimes.reasonForCarryForward}
                onChange={(event) => {
                  setCompletionTimes((current) => ({
                    ...current,
                    reasonForCarryForward: event.target.value,
                  }));
                  setCompletionTimeErrors((current) => ({
                    ...current,
                    reasonForCarryForward: "",
                  }));
                }}
                error={Boolean(completionTimeErrors.reasonForCarryForward)}
                helperText={completionTimeErrors.reasonForCarryForward}
                inputProps={{ maxLength: 5000 }}
                fullWidth
              />
            )}
            <TextField
              label="Resource Comment *"
              size="small"
              multiline
              minRows={3}
              value={completionTimes.resourceComment}
              onChange={(event) => {
                setCompletionTimes((current) => ({
                  ...current,
                  resourceComment: event.target.value,
                }));
                setCompletionTimeErrors((current) => ({
                  ...current,
                  resourceComment: "",
                }));
              }}
              error={Boolean(completionTimeErrors.resourceComment)}
              helperText={completionTimeErrors.resourceComment}
              inputProps={{ maxLength: 5000 }}
              fullWidth
            />
          </LocalizationProvider>
        )}
      </ConfirmationModal>

      <MuiModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingRecord ? "Edit Daily Log" : "Add Daily Log"}
        widthClass="w-[92vw] max-w-[410px]"
      >
        <form className="grid gap-4" onSubmit={handleSubmit} noValidate>
          {!editingRecord ? (
            <Autocomplete
              fullWidth
              freeSolo={canCreateGeneralTask}
              autoSelect
              selectOnFocus
              options={dailyLogOptions}
              value={form.dayTaskName || null}
              inputValue={dailyLogInputValue}
              noOptionsText={
                canCreateGeneralTask
                  ? "No options — type to add"
                  : "No options available"
              }
              onInputChange={(_, value) => {
                setDailyLogInputValue(value);
                if (canCreateGeneralTask) {
                  setForm((current) => ({ ...current, dayTaskName: value }));
                }
                setFormErrors((current) => ({
                  ...current,
                  dayTaskName: "",
                }));
              }}
              onChange={(_, value) => {
                setForm((current) => ({
                  ...current,
                  dayTaskName: value || "",
                }));
                setDailyLogInputValue(value || "");
                setFormErrors((current) => ({
                  ...current,
                  dayTaskName: "",
                }));
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Daily Log *"
                  size="small"
                  error={Boolean(formErrors.dayTaskName)}
                  helperText={formErrors.dayTaskName}
                  inputProps={{ ...params.inputProps, maxLength: 1000 }}
                />
              )}
            />
          ) : (
            <>
              <TextField
                label="Day Task Name *"
                size="small"
                multiline
                minRows={2}
                value={form.dayTaskName}
                disabled
                error={Boolean(formErrors.dayTaskName)}
                helperText={formErrors.dayTaskName}
                inputProps={{ maxLength: 1000 }}
              />
            </>
          )}
          {editingRecord && canEditManagerComments && (
            <TextField
              label="Manager Comments"
              size="small"
              multiline
              minRows={2}
              value={form.managerComments}
              onChange={updateForm("managerComments")}
              inputProps={{ maxLength: 5000 }}
            />
          )}
          {editingRecord && canEditHrComments && (
            <TextField
              label="HR Comments"
              size="small"
              multiline
              minRows={2}
              value={form.hrComments}
              onChange={updateForm("hrComments")}
              inputProps={{ maxLength: 5000 }}
            />
          )}
          <div className="flex justify-end gap-3">
            <SecondaryButton
              type="button"
              title="Close"
              handleSubmit={() => setModalOpen(false)}
            />
            <PrimaryButton
              type="submit"
              title="Save"
              isLoading={saveLog.isPending}
            />
          </div>
        </form>
      </MuiModal>
    </div>
  );
};

export default KraKpaDailyLogs;
