import { useLocation, useParams } from "react-router-dom";
import AgTable from "../../../components/AgTable";
import WidgetSection from "../../../components/WidgetSection";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useDispatch, useSelector } from "react-redux";
import humanTime from "../../../utils/humanTime";
import humanDate from "../../../utils/humanDateForamt";
import { Chip, CircularProgress, MenuItem, TextField } from "@mui/material";
import PrimaryButton from "../../../components/PrimaryButton";
import { Controller, useForm } from "react-hook-form";
import MuiModal from "../../../components/MuiModal";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import { FaCheck } from "react-icons/fa6";
import { PERMISSIONS } from "../../../constants/permissions";
import { queryClient } from "../../../main";
import { toast } from "sonner";
import useAuth from "../../../hooks/useAuth";
import PageFrame from "../../../components/Pages/PageFrame";
import YearWiseTable from "../../../components/Tables/YearWiseTable";
import { isAlphanumeric, noOnlyWhitespace } from "../../../utils/validators";
import { FaCheckSquare } from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";
import { HiPencilSquare } from "react-icons/hi2";
import ConfirmationModal from "../../../components/ConfirmationModal";

const PerformanceTeamKpa = () => {
  const axios = useAxiosPrivate();
  const location = useLocation();
  const { auth } = useAuth();
  const { department } = useParams();
  const [openModal, setOpenModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
    const [activeViewMonthBucket, setActiveViewMonthBucket] = useState("current");
     const [selectedMonthRange, setSelectedMonthRange] = useState(null);
  const deptId = useSelector((state) => state.performance.selectedDepartment);
  const selectedDepartmentName = useSelector(
    (state) => state.performance.selectedDepartmentName
  );
  const selectedMember = useSelector((state) => state.performance.selectedMember);
  const departmentName =
    selectedDepartmentName ||
    department ||
    auth?.user?.departments?.find((dept) => dept._id === deptId)?.name ||
    "Department";
  const loggedInUserName = [auth?.user?.firstName, auth?.user?.middleName, auth?.user?.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();
  const selectedMemberFromRoute = location.state?.selectedMember;
  const activeMember = selectedMemberFromRoute || selectedMember;
  const activeMemberName = activeMember?.memberName || loggedInUserName || "User Name";
  const userId = auth.user._id;
  const normalizeValue = (value) =>
    (value || "").toString().replace(/\s+/g, " ").trim().toLowerCase();
  const { data: selectedDepartments = [] } = useQuery({
    queryKey: ["performance-selectedDepartments-team"],
    queryFn: async () => {
      const response = await axios.get("api/company/get-company-data?field=selectedDepartments");
      return response.data?.selectedDepartments || [];
    },
  });
  const selectedDepartmentManagerName = useMemo(() => {
    const normalize = (value) =>
      (value || "").toString().replace(/\s+/g, " ").trim().toLowerCase();

    const matchedDepartment = selectedDepartments.find((item) => {
      const itemDepartmentId = item?.department?._id?.toString?.();
      const itemDepartmentName = item?.department?.name;

      return (
        (deptId && itemDepartmentId && deptId.toString() === itemDepartmentId) ||
        (departmentName &&
          itemDepartmentName &&
          normalize(departmentName) === normalize(itemDepartmentName))
      );
    });

    return matchedDepartment?.admin || "";
  }, [departmentName, deptId, selectedDepartments]);
  const isSelectedMemberManager =
    normalizeValue(activeMember?.memberRole).includes("manager") ||
    normalizeValue(activeMember?.memberName) === normalizeValue(selectedDepartmentManagerName);
  const isViewingOwnMember =
    normalizeValue(activeMember?.memberId) === normalizeValue(userId) ||
    normalizeValue(activeMember?.memberName) === normalizeValue(loggedInUserName);
  const shouldPrefillAssignTo = !!activeMember?.memberId && !isViewingOwnMember;

  const restrictedRoles = [
    "IT Employee",
    "Admin Employee",
    "Tech Employee",
    "Administration Employee",
    "HR Employee",
    "Maintenance Employee",
    "Cafe Employee",
    "Finance Employee",
    "Marketing Employee",
  ];
  const isAddKpaDisabled = auth?.user?.role?.some((role) =>
    restrictedRoles.includes(role.roleTitle)
  );

  const canDeleteRecurrence = !isAddKpaDisabled;

  const userPermissions = auth?.user?.permissions?.permissions || [];
  const isManager = userPermissions.includes(
    PERMISSIONS.PERFORMANCE_TEAM_KPA.value,
  );

  const roleTitles = (auth?.user?.role || []).map((role) => role?.roleTitle?.toLowerCase?.() || "");
  const isMasterOrSuperAdmin = roleTitles.some((title) =>
    ["master admin", "super admin"].includes(title)
  );

  const getRowMonthBucket = (row) => {
    const rowDate = dayjs(row?.dueDate || row?.assignedDate);
    if (!rowDate.isValid()) return "current";

    const rowMonth = rowDate.startOf("month");
    const currentMonth = dayjs().startOf("month");

    if (rowMonth.isBefore(currentMonth)) return "previous";
    if (rowMonth.isAfter(currentMonth)) return "next";
    return "current";
  };

  const getRowPermissions = (row) => {
    if (isMasterOrSuperAdmin) {
      return {
        showActionColumn: true,
        showEdit: true,
        showDelete: true,
        disableRowSelection: false,
      };
    }

    const monthBucket = getRowMonthBucket(row);

    if (monthBucket === "previous") {
      return {
        showActionColumn: false,
        showEdit: false,
        showDelete: false,
        disableRowSelection: true,
      };
    }

    if (monthBucket === "next") {
      return {
        showActionColumn: true,
        showEdit: true,
        showDelete: true,
        disableRowSelection: false,
      };
    }

    return {
      showActionColumn: true,
      showEdit: true,
      showDelete: true,
      disableRowSelection: false,
    };
  };

  const shouldHideActionsColumnForManager =
    !isMasterOrSuperAdmin && isManager && activeViewMonthBucket === "previous";
  const shouldHideAddButtonForManager =
    !isMasterOrSuperAdmin &&
    isManager &&
    ["previous", "next"].includes(activeViewMonthBucket);
  const showActionsColumn = !isAddKpaDisabled && !shouldHideActionsColumnForManager;

  const {
    handleSubmit: submitMonthlyKpa,
    control,
    formState: { errors },
    watch,
    reset,
  } = useForm({
    mode: "onChange",
    defaultValues: {
      teamKpaName: "",
      startDate: null,
      endDate: null,
      assignTo: shouldPrefillAssignTo ? [activeMember.memberId.toString()] : [], // Multi-select
    },
  });
  const startDate = watch("startDate");

  useEffect(() => {
    if (isEditMode) return;

    reset({
      teamKpaName: "",
      startDate: null,
      endDate: null,
      assignTo: shouldPrefillAssignTo ? [activeMember.memberId.toString()] : [],
    });
  }, [activeMember?.memberId, isEditMode, reset, shouldPrefillAssignTo]);

  const { mutate: deleteMonthlyKpaRecurrence, isPending: isDeletePending } = useMutation({
    mutationKey: ["deleteMonthlyKpaRecurrence"],
    mutationFn: async (taskId) => {
      const response = await axios.patch(`/api/performance/delete-recurrence/${taskId}`);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.refetchQueries({ queryKey: ["fetchedTeamKPA", deptId] });
      queryClient.refetchQueries({ queryKey: ["completedEntriesKPA", deptId] });
      toast.success(data.message || "KPA recurrence removed");
    },
    onError: () => {
      toast.error("Failed to remove recurrence");
    },
  });

  const handleConfirmDelete = () => {
    if (!deleteTargetId) return;
    deleteMonthlyKpaRecurrence(deleteTargetId);
    setDeleteTargetId(null);
  };

  const { mutate: addMonthlyKpa, isPending: isAddKpaPending } = useMutation({
    mutationKey: ["addTeamMonthlyKpa"],
    mutationFn: async (data) => {
      const response = await axios.post("/api/performance/create-task", {
        task: data.teamKpaName,
        taskType: "TEAMKPA",
        department: deptId,
        assignedDate: data.startDate,
        dueDate: data.endDate,
        kpaDuration: "Monthly",
        assignTo: data.assignTo,
      });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["fetchedTeamKPA", deptId] });
      toast.success(data.message || "Team KPA Added");
      reset();
      setOpenModal(false);
      setIsEditMode(false);
      setEditingTaskId(null);
    },
    onError: (error) => {
      toast.error("Task type should be KRA");
    },
  });
  const { data: completedEntries, isLoading: isCompletedLoading } = useQuery({
    queryKey: ["completedEntriesKPA", deptId],
    queryFn: async () => {
      try {
        const response = await axios.get(
          `/api/performance/get-completed-tasks?dept=${deptId}&type=TEAMKPA`,
        );
        return response.data;
      } catch (error) {
        console.error(error);
      }
    },
  });

  const handleOpenEditModal = (task) => {
    setIsEditMode(true);
    setEditingTaskId(task.id);
    reset({
      teamKpaName: task.taskName || "",
      startDate: task.startDate || task.assignedDate || null,
      endDate: task.endDate || task.dueDate || null,
      assignTo: Array.isArray(task.assignedTo)
        ? task.assignedTo
        : task.assignedTo
          ? [task.assignedTo]
          : [],
    });
    setOpenModal(true);
  };

  const handleFormSubmit = async (data) => {
    if (isEditMode && editingTaskId) {
      await axios.patch(`/api/performance/update-task/${editingTaskId}`, {
        task: data.teamKpaName,
        assignedDate: data.startDate,
        dueDate: data.endDate,
        kpaDuration: "Monthly",
      });
      toast.success("Team KPA updated successfully");
      queryClient.invalidateQueries({ queryKey: ["fetchedTeamKPA", deptId] });
      setOpenModal(false);
      setIsEditMode(false);
      setEditingTaskId(null);
      reset();
      return;
    }
    const normalizedAssignees = Array.isArray(data.assignTo)
      ? data.assignTo
      : typeof data.assignTo === "string"
        ? data.assignTo
          .split(",")
          .map((id) => id.trim())
          .filter(Boolean)
        : [];

    addMonthlyKpa({
      ...data,
      assignTo: normalizedAssignees,
    });
  };

  const fetchTasks = async () => {
    try {
      const response = await axios.get(
        `/api/performance/get-tasks?dept=${deptId}&type=TEAMKPA`,
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const { data: teamKpa = [], isPending: teamLoading } = useQuery({
    queryKey: ["fetchedTeamKPA", deptId],
    queryFn: fetchTasks,
    enabled: !!deptId,
  });

  const { data: assignees = [] } = useQuery({
    queryKey: ["fetchAssignees", deptId],
    queryFn: async () => {
      const response = await axios.get(`/api/users/assignees?deptId=${deptId}`);
      return response.data;
    },
    enabled: !!deptId,
  });
  const { data: departmentKra = [], isPending: departmentLoading } = useQuery({
    queryKey: ["fetchedIndividualKRA"],
    queryFn: fetchTasks,
  });

  const filteredTeamKpa = useMemo(() => {
     if (!activeMember?.memberId) return teamKpa || [];

     if (isSelectedMemberManager) return teamKpa || [];

    return (teamKpa || []).filter((item) => {
      const assignedToList = Array.isArray(item?.assignedTo)
        ? item.assignedTo
        : item?.assignedTo
          ? [item.assignedTo]
          : [];
      const assignedToId = item?.assignToId?.toString?.() || item?.assignedToId?.toString?.();

      return (
        normalizeValue(assignedToId) === normalizeValue(activeMember.memberId) ||
        assignedToList.some((name) => {
          const normalizedName = normalizeValue(name);
          return (
            normalizedName === normalizeValue(activeMember.memberName) ||
            normalizedName === normalizeValue(activeMember.memberId)
          );
        })
      );
    });
      }, [activeMember?.memberId, activeMember?.memberName, isSelectedMemberManager, teamKpa]);

  const filteredCompletedEntries = useMemo(() => {
       if (!activeMember?.memberId) return completedEntries || [];

       if (isSelectedMemberManager) return completedEntries || [];

    return (completedEntries || []).filter(
      (item) =>
        normalizeValue(item?.completedBy) === normalizeValue(activeMember.memberName) ||
        normalizeValue(item?.completedBy) === normalizeValue(activeMember.memberId)
    );
 }, [activeMember?.memberId, activeMember?.memberName, completedEntries, isSelectedMemberManager]);
  const selectedMonthLabel = selectedMonthRange?.startDate
    ? dayjs(selectedMonthRange.startDate).format("MMMM YYYY")
    : dayjs().format("MMMM YYYY");
  const completedEntriesForSelectedMonth = selectedMonthRange
    ? filteredCompletedEntries.filter((item) => {
      const completionDate = dayjs(item?.completionDate);
      if (!completionDate.isValid()) return false;

      const start = dayjs(selectedMonthRange.startDate).startOf("day");
      const end = dayjs(selectedMonthRange.endDate).endOf("day");
      return completionDate.isAfter(start.subtract(1, "millisecond")) &&
        completionDate.isBefore(end.add(1, "millisecond"));
    })
    : filteredCompletedEntries;
  const showCompletedExport = activeViewMonthBucket !== "next";
  const formatDateTime = (value) =>
    value ? `${humanDate(value)}, ${humanTime(value)}` : "N/A";

  const teamColumns = [
    { headerName: "Sr No", field: "srNo", width: 100 },
    { headerName: "KPA List", field: "taskName", flex: 1 },
    { headerName: "Assigned To", field: "assignedTo", flex: 1 },
    {
      headerName: "Start Date",
      field: "assignedDate",
      flex: 1,
      cellRenderer: (params) => formatDateTime(params.value),
    },
    {
      headerName: "End Date",
      field: "dueDate",
      flex: 1,
      cellRenderer: (params) => formatDateTime(params.value),
    },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      cellRenderer: (params) => {
        const statusColorMap = {
          Pending: { backgroundColor: "#FFECC5", color: "#CC8400" },
          Completed: { backgroundColor: "#16f8062c", color: "#00731b" },
        };
        const { backgroundColor, color } = statusColorMap[params.value] || {
          backgroundColor: "gray",
          color: "white",
        };
        return <Chip label={params.value} style={{ backgroundColor, color }} />;
      },
    },
  ...(showActionsColumn
      ? [
        {
          headerName: "Actions",
          field: "actions",
          pinned:"right",
          cellRenderer: (params) => (
            <div className="p-2 flex gap-2 items-center">
                            {getRowPermissions(params.data).showEdit && (

              <button
                                    type="button"
                                    title="Edit"
                                    onClick={() => handleOpenEditModal(params.data)}
                                    className="ml-2"
                                >
                                    <HiPencilSquare size={24} color="#111827" />
                                </button>
                                  )}

                            {canDeleteRecurrence && getRowPermissions(params.data).showDelete && (
                <button
                  type="button"
                  title="Delete Recurrence"
                  // disabled={!params.node.selected || isDeletePending}
                  onClick={() => setDeleteTargetId(params.data.id)}
                  className="ml-2 disabled:cursor-not-allowed"
                >
                  {isDeletePending ? "⏳" : <MdDeleteForever size={26} color="red" />}
                </button>
              )}
            </div>
          ),
        },
      ]
      : []),
  ];

  const completedColumns = [
    { headerName: "Sr No", field: "srNo", width: 100, sort: "asc" },
    { headerName: "KPA List", field: "taskName", flex: 1 },
    {
      headerName: "Start Date",
      field: "startDateTime",
      flex: 1,
      exportFormat: "date",
      valueFormatter: (params) => (params.value ? humanDate(params.value) : ""),
    },
    {
      headerName: "End Date",
      field: "endDateTime",
      flex: 1,
      exportFormat: "date",
      valueFormatter: (params) => (params.value ? humanDate(params.value) : ""),
    },
    { headerName: "Completed By", field: "completedBy" ,flex: 1 },
    {
      headerName: "Completed At",
      field: "completedAt",
      flex: 1,
      exportFormat: "datetime-comma",
      valueFormatter: (params) =>
        params.value
          ? `${humanDate(params.value)}, ${humanTime(params.value)}`
          : "",
    },
    {
      field: "status",
      headerName: "Status",
      flex: 1 ,
      cellRenderer: (params) => {
        const statusColorMap = {
          Pending: { backgroundColor: "#FFECC5", color: "#CC8400" }, // Light orange bg, dark orange font
          InProgress: { backgroundColor: "#ADD8E6", color: "#00008B" }, // Light blue bg, dark blue font
          resolved: { backgroundColor: "#90EE90", color: "#006400" }, // Light green bg, dark green font
          open: { backgroundColor: "#E6E6FA", color: "#4B0082" }, // Light purple bg, dark purple font
          Completed: { backgroundColor: "#16f8062c", color: "#00731b" }, // Light gray bg, dark gray font
        };

        const { backgroundColor, color } = statusColorMap[params.value] || {
          backgroundColor: "gray",
          color: "white",
        };
        return (
          <>
            <Chip
              label={params.value}
              style={{
                backgroundColor,
                color,
              }}
            />
          </>
        );
      },
    },
  ];
  // const handleTeamDateFilterChange = ({ filteredData = [] }) => {
  //   if (!filteredData.length) {
  //     setActiveViewMonthBucket("current");
  //     return;
  //   }

  //   const buckets = new Set(filteredData.map((item) => getRowMonthBucket(item)));
  //   const nextBucket = buckets.size === 1 ? [...buckets][0] : "current";
  //   setActiveViewMonthBucket((prev) => (prev === nextBucket ? prev : nextBucket));
  // };
   const handleTeamDateFilterChange = ({ filteredData = [], selectedRange = null }) => {
    setSelectedMonthRange((prev) => {
      const prevStart = prev?.startDate ? dayjs(prev.startDate).valueOf() : null;
      const prevEnd = prev?.endDate ? dayjs(prev.endDate).valueOf() : null;
      const nextStart = selectedRange?.startDate ? dayjs(selectedRange.startDate).valueOf() : null;
      const nextEnd = selectedRange?.endDate ? dayjs(selectedRange.endDate).valueOf() : null;

      if (prevStart === nextStart && prevEnd === nextEnd) return prev;
      return selectedRange;
    });

    if (!filteredData.length) {
      setActiveViewMonthBucket("current");
      return;
    }

    const buckets = new Set(filteredData.map((item) => getRowMonthBucket(item)));
    const nextBucket = buckets.size === 1 ? [...buckets][0] : "current";
    setActiveViewMonthBucket((prev) => (prev === nextBucket ? prev : nextBucket));
  };

  return (
    <>
      <div className="flex flex-col gap-4">
        <PageFrame>
          {!teamLoading ? (
            <WidgetSection padding layout={1}>
              <YearWiseTable
                // buttonTitle={"Add Team Monthly KPA"}
                // buttonDisabled={isAddKpaDisabled}
                  buttonTitle={shouldHideAddButtonForManager ? "" : "Add Team Monthly KPA"}
                buttonDisabled={shouldHideAddButtonForManager || isAddKpaDisabled}
                handleSubmit={() => setOpenModal(true)}
                tableTitle={`${departmentName} - TEAM MONTHLY KPA - ${activeMemberName}`}
                data={filteredTeamKpa
                  .filter((item) => item.status !== "Completed")
                  .map((item, index) => ({
                    srNo: index + 1,
                    id: item.id,
                    taskName: item.taskName,
                    assignedDate: item.assignedDate,
                    dueDate: item.dueDate,
                    status: item.status,
                    assignedTo: item.assignedTo,
                  }))}
                dateColumn={"dueDate"}
                columns={teamColumns}
                preserveCurrentMonthRange
                  isRowSelectable={(rowNode) => !getRowPermissions(rowNode?.data).disableRowSelection}
                onDateFilterChange={handleTeamDateFilterChange}
              />
            </WidgetSection>
          ) : (
            <div className="h-72 flex items-center justify-center">
              <CircularProgress />
            </div>
          )}
        </PageFrame>
        <PageFrame>
          <div>
            {!isCompletedLoading ? (
              <WidgetSection padding>
                <YearWiseTable
                  formatTime
                  // tableTitle={`COMPLETED - MONTHLY KPA - ${activeMemberName}`}
                  // exportData={true}
                  tableTitle={`COMPLETED - TEAM MONTHLY KPA - ${activeMemberName} - ${selectedMonthLabel}`}
                  exportData={showCompletedExport}
                  taskExportDateTimeFormatting
                  hideDateControls
                  checkAll={false}
                  // key={filteredCompletedEntries.length}
                  // data={filteredCompletedEntries.map((item, index) => ({
                      key={`${completedEntriesForSelectedMonth.length}-${selectedMonthLabel}`}
                  data={completedEntriesForSelectedMonth.map((item, index) => ({
                    srno: index + 1,
                    id: item.id,
                    taskName: item.taskName,
                    assignedDate: item.assignedDate,
                    dueDate: item.dueDate,
                    status: item.status,
                    completedBy: item.completedBy,
                    completionDate: item.completionDate,
                    completionTime: item.completionDate,
                    startDateTime: item.assignedDate,
                    endDateTime: item.dueDate,
                    completedAt: item.completionDate,
                  }))}
                  dateColumn={"completionDate"}
                  columns={completedColumns}
                />
              </WidgetSection>
            ) : (
              <div className="h-72 flex items-center justify-center">
                <CircularProgress />
              </div>
            )}
          </div>
        </PageFrame>

      </div>

      <ConfirmationModal
        open={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleConfirmDelete}
        isLoading={isDeletePending}
      />

      <MuiModal
        open={openModal}
        onClose={() => setOpenModal(false)}
         title={isEditMode ? "Edit Task" : "Add Team Monthly KPA"}
      >
        <form
          onSubmit={submitMonthlyKpa(handleFormSubmit)}
          className="grid grid-cols-1 gap-4"
        >
          <Controller
            name="teamKpaName"
            control={control}
            rules={{
              required: "Team KPA Name is required",
              validate: { noOnlyWhitespace, isAlphanumeric },
            }}
            render={({ field }) => (
              <TextField
                {...field}
                size="small"
                label={"Team KPA Name"}
                fullWidth
                error={!!errors?.teamKpaName?.message}
                helperText={errors?.teamKpaName?.message}
              />
            )}
          />

          <Controller
            name="startDate"
            control={control}
            rules={{
              required: "Start date is required",
              validate: (value) => {
                if (!value) return true;
                const today = dayjs().startOf("day");
                const selected = dayjs(value);
                if (selected.isBefore(today))
                  return "Start date cannot be in the past.";
                return true;
              },
            }}
            render={({ field, fieldState }) => (
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  {...field}
                  label="Start Date"
                  format="DD-MM-YYYY"
                  disablePast
                  value={field.value ? dayjs(field.value) : null}
                  onChange={(date) =>
                    field.onChange(date ? date.toISOString() : null)
                  }
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: "small",
                      error: !!fieldState.error,
                      helperText: fieldState.error?.message,
                    },
                  }}
                />
              </LocalizationProvider>
            )}
          />

          <Controller
            name="endDate"
            control={control}
            rules={{
              required: "End date is required",
              validate: (value) => {
                if (!value) return true;
                const selected = dayjs(value);
                if (startDate && selected.isBefore(dayjs(startDate)))
                  return "End date cannot be before start date.";
                return true;
              },
            }}
            render={({ field, fieldState }) => (
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  {...field}
                  label="End Date"
                  disablePast
                  format="DD-MM-YYYY"
                  disabled={!startDate}
                  value={field.value ? dayjs(field.value) : null}
                  onChange={(date) =>
                    field.onChange(date ? date.toISOString() : null)
                  }
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: "small",
                      error: !!fieldState.error,
                      helperText: fieldState.error?.message,
                    },
                  }}
                />
              </LocalizationProvider>
            )}
          />

           {!isEditMode && <Controller
            name="assignTo"
            control={control}
            rules={{ required: "Select at least one team member" }}
            render={({ field, fieldState: { error } }) => (
              <TextField
                {...field}
                select
                size="small"
                label="Assign To"
                fullWidth
                value={field.value || []}
                onChange={(event) => {
                  const value = event.target.value;
                  field.onChange(
                    Array.isArray(value)
                      ? value
                      : typeof value === "string"
                        ? value
                          .split(",")
                          .map((id) => id.trim())
                          .filter(Boolean)
                        : [],
                  );
                }}
                error={!!error}
                helperText={error?.message}
                SelectProps={{
                  multiple: true,
                  renderValue: (selected) => (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                      {selected.map((value) => (
                        <Chip
                          key={value}
                          label={
                            assignees.find((a) => a.id === value)?.name || value
                          }
                          size="small"
                        />
                      ))}
                    </div>
                  ),
                }}
              >
                {assignees.map((emp) => (
                  <MenuItem key={emp.id} value={emp.id}>
                    {emp.name}
                  </MenuItem>
                ))}
              </TextField>
            )}
        />}

          <PrimaryButton
            type="submit"
            title={"Submit"}
            isLoading={isAddKpaPending}
            disabled={isAddKpaPending}
          />
        </form>
      </MuiModal>
    </>
  );
};

export default PerformanceTeamKpa;
