import { useLocation, useParams } from "react-router-dom";
import AgTable from "../../../components/AgTable";
import WidgetSection from "../../../components/WidgetSection";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import humanTime from "../../../utils/humanTime";
import humanDate from "../../../utils/humanDateForamt";
import { Chip, CircularProgress, MenuItem, TextField } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import MuiModal from "../../../components/MuiModal";
import { PERMISSIONS } from "../../../constants/permissions";
import { Controller, useForm } from "react-hook-form";
import PrimaryButton from "../../../components/PrimaryButton";
import useAuth from "../../../hooks/useAuth";
import { toast } from "sonner";
import { queryClient } from "../../../main";
import { FaCheck } from "react-icons/fa6";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import PageFrame from "../../../components/Pages/PageFrame";
import { isAlphanumeric, noOnlyWhitespace } from "../../../utils/validators";
import YearWiseTable from "../../../components/Tables/YearWiseTable";
import { FaCheckSquare } from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";
import { HiPencilSquare } from "react-icons/hi2";
import useCurrentDay from "../../../hooks/useCurrentDay";

const PerformanceTeamKra = () => {
    const axios = useAxiosPrivate();
    const { auth } = useAuth();
    const location = useLocation();
    const { department } = useParams();
    const [openModal, setOpenModal] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingTaskId, setEditingTaskId] = useState(null);
    const [selectedDate, setSelectedDate] = useState(dayjs().startOf("day"));
    const today = useCurrentDay();
    const selectedMember = useSelector((state) => state.performance.selectedMember);
    const selectedDepartment = useSelector((state) => state.performance.selectedDepartment);
    const selectedDepartmentName = useSelector(
        (state) => state.performance.selectedDepartmentName
    );
    const isEmployeeKraKpaRoute = location.pathname.includes("/employee-KRA-KPA");
    const primaryUserDepartment = auth?.user?.departments?.[0];
    const deptId = isEmployeeKraKpaRoute
        ? primaryUserDepartment?._id
        : selectedDepartment?.toString?.() || primaryUserDepartment?._id;
    const departmentName =
        (isEmployeeKraKpaRoute ? primaryUserDepartment?.name : selectedDepartmentName) ||
        primaryUserDepartment?.name ||
        department ||
        auth?.user?.departments?.find((dept) => dept._id?.toString() === deptId?.toString())?.name ||
        "Department";
    const loggedInUserName = [auth?.user?.firstName, auth?.user?.middleName, auth?.user?.lastName]
        .filter(Boolean)
        .join(" ")
        .trim();
    const userId = auth.user._id;
    const selectedMemberFromRoute = location.state?.selectedMember;
    const activeMember = selectedMemberFromRoute || selectedMember;
    const activeMemberName = activeMember?.memberName || loggedInUserName || "User Name";
    const normalizeValue = (value) =>
        (value || "").toString().replace(/\s+/g, " ").trim().toLowerCase();
    const roleTitles =
        auth?.user?.role?.map((role) => role?.roleTitle?.toLowerCase()) || [];
    const isSuperOrMasterAdmin =
        roleTitles.some((roleTitle) => roleTitle?.includes("super admin")) ||
        roleTitles.some((roleTitle) => roleTitle?.includes("master admin"));
    const userPermissions = auth?.user?.permissions?.permissions || [];
    const isManager = userPermissions.includes(PERMISSIONS.PERFORMANCE_TEAM_KRA.value);
    const isViewingOwnMember =
        normalizeValue(activeMember?.memberId) === normalizeValue(userId) ||
        normalizeValue(activeMember?.memberName) === normalizeValue(loggedInUserName);
    const shouldPrefillAssignTo = !!activeMember?.memberId && !isViewingOwnMember;
    const canManageSelectedMemberView = isSuperOrMasterAdmin || isManager;
    const shouldForceOwnControlsInEmployeeRoute = isEmployeeKraKpaRoute;
    const selectedDateKey = selectedDate.format("YYYY-MM-DD");
    const todayKey = today.format("YYYY-MM-DD");
    const isCurrentDateView = selectedDateKey === todayKey;
    const isPastDateView = selectedDateKey < todayKey;
    const isFutureDateView = selectedDateKey > todayKey;
    const canShowControls =
     shouldForceOwnControlsInEmployeeRoute ||
        isCurrentDateView ||
        canManageSelectedMemberView || !activeMember?.memberId || isViewingOwnMember;
    const isEmployeeLevel = !isSuperOrMasterAdmin && !isManager;
    const hasSelectedMember = !!activeMember?.memberId || !!activeMember?.memberName;
    const shouldShowAllTeamData = !hasSelectedMember || isViewingOwnMember;
    const matchesSelectedMember = (value) => {
        const normalizedValue = normalizeValue(value);
        if (!normalizedValue || !hasSelectedMember) return false;

        return (
            normalizedValue === normalizeValue(activeMember?.memberId) ||
            normalizedValue === normalizeValue(activeMember?.memberName)
        );
    };
    const getMemberMatchCandidates = (item) => [
        item?.assignToId,
        item?.assignedToId,
        item?.createdById,
        item?.managerId,
        item?.ownerId,
        item?.assignedTo,
        item?.assignTo,
        item?.createdBy,
        item?.createdByName,
        item?.managerName,
        item?.ownerName,
        item?.completedById,
        item?.completedByName,
        item?.completedBy,
    ];

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
    const isAddKraDisabled = auth?.user?.role?.some((role) =>
        restrictedRoles.includes(role.roleTitle)
    );

    const canDeleteRecurrence = !isAddKraDisabled;

    useEffect(() => {
        queryClient.invalidateQueries({ queryKey: ["fetchedTeamKRA", deptId] });
    }, [deptId]);

    const {
        handleSubmit: submitDailyKra,
        control,
        formState: { errors },
        reset,
    } = useForm({
        mode: "onChange",
        defaultValues: {
            teamDailyKra: "",
            assignTo: shouldPrefillAssignTo ? [activeMember.memberId.toString()] : [], // Multi-select
            assignedDate: dayjs().toISOString(),
        },
    });

    useEffect(() => {
        if (isEditMode) return;

        reset({
            teamDailyKra: "",
            assignTo: shouldPrefillAssignTo ? [activeMember.memberId.toString()] : [],
            assignedDate: dayjs().toISOString(),
        });
    }, [activeMember?.memberId, isEditMode, reset, shouldPrefillAssignTo]);

    const { mutate: deleteDailyKraRecurrence, isPending: isDeletePending } = useMutation({
        mutationKey: ["deleteDailyKraRecurrence"],
        mutationFn: async (taskId) => {
            const response = await axios.patch(`/api/performance/delete-recurrence/${taskId}`);
            return response.data;
        },
        onSuccess: (data) => {
            queryClient.refetchQueries({ queryKey: ["fetchedTeamKRA", deptId] });
            queryClient.refetchQueries({ queryKey: ["completedEntriesKPA", deptId] });
            toast.success(data.message || "KRA recurrence removed");
        },
        onError: () => {
            toast.error("Failed to remove recurrence");
        },
    });

    const { mutate: addDailyKra, isPending: isAddKraPending } = useMutation({
        mutationKey: ["addTeamDailyKra"],
        mutationFn: async (data) => {
            const response = await axios.post("/api/performance/create-task", {
                task: data.teamDailyKra,
                taskType: "TEAMKRA",
                department: deptId,
                assignedDate: data.assignedDate,
                assignTo: data.assignTo,
            });
            return response.data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["fetchedTeamKRA", deptId] });
            toast.success(data.message || "Team KPA Added");
            reset();
            setOpenModal(false);
            setIsEditMode(false);
            setEditingTaskId(null);
        },
        onError: (error) => {
            toast.error("Adding failed");
        },
    });
    const { data: completedEntries, isLoading: isCompletedLoading } = useQuery({
        queryKey: ["completedEntriesKPA", deptId],
        queryFn: async () => {
            try {
                const response = await axios.get(
                    `/api/performance/get-completed-tasks?dept=${deptId}&type=TEAMKRA`,
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
      teamDailyKra: task.taskName || "",
      assignedDate: task.assignedDate || null,
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
                task: data.teamDailyKra,
                assignedDate: data.assignedDate,
            });
            toast.success("Team KRA updated successfully");
            queryClient.invalidateQueries({ queryKey: ["fetchedTeamKRA", deptId] });
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

        addDailyKra({
            ...data,
            assignTo: normalizedAssignees,
        });
    };

    const fetchTasks = async () => {
        try {
            const response = await axios.get(
                `/api/performance/get-tasks?dept=${deptId}&type=TEAMKRA&date=${selectedDateKey}`
            );
            return response.data;
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    const { data: teamKra = [], isPending: teamLoading } = useQuery({
        queryKey: ["fetchedTeamKRA", deptId, selectedDateKey],
        queryFn: fetchTasks,
        enabled: !!deptId,
    });
    const uniqueTeamKra = useMemo(() => {
        const uniqueMap = new Map();
        (teamKra || []).forEach((item) => {
            const key = item?.id?.toString?.() || item?._id?.toString?.() || `${item?.taskName}-${item?.assignedDate}`;
            if (!uniqueMap.has(key)) {
                uniqueMap.set(key, item);
            }
        });
        return Array.from(uniqueMap.values());
    }, [teamKra]);

    const { data: assignees = [] } = useQuery({
        queryKey: ["fetchAssignees", deptId],
        queryFn: async () => {
            const response = await axios.get(`/api/users/assignees?deptId=${deptId}`);
            return response.data;
        },
        enabled: !!deptId,
    });

    const filteredTeamKra = useMemo(() => {
        if (shouldShowAllTeamData) {
            return uniqueTeamKra || [];
        }

        return (uniqueTeamKra || []).filter((item) => {
            const assignedCandidates = [
                item?.assignToId,
                item?.assignedToId,
                item?.createdById,
                item?.managerId,
                item?.ownerId,
                ...(Array.isArray(item?.assignedTo)
                    ? item.assignedTo
                    : item?.assignedTo
                        ? [item.assignedTo]
                        : []),
                ...(Array.isArray(item?.assignTo)
                    ? item.assignTo
                    : item?.assignTo
                        ? [item.assignTo]
                        : []),
                ...(Array.isArray(item?.createdBy)
                    ? item.createdBy
                    : item?.createdBy
                        ? [item.createdBy]
                        : []),
            ];

            return assignedCandidates.some(matchesSelectedMember);
        });
    }, [
        activeMember?.memberId,
        activeMember?.memberName,
        hasSelectedMember,
        shouldShowAllTeamData,
        uniqueTeamKra,
    ]);

    const filteredCompletedEntries = useMemo(() => {
        if (shouldShowAllTeamData) {
            return completedEntries || [];
        }

        return (completedEntries || []).filter((item) => {
            const completedCandidates = getMemberMatchCandidates(item);
            return completedCandidates.some(matchesSelectedMember);
        });
    }, [
        activeMember?.memberId,
        activeMember?.memberName,
        hasSelectedMember,
        shouldShowAllTeamData,
        completedEntries,
    ]);
    const uniqueCompletedEntries = useMemo(() => {
        const uniqueMap = new Map();
        (filteredCompletedEntries || []).forEach((item) => {
            const completedDay = item?.completionDate
                ? dayjs(item.completionDate).isValid()
                    ? dayjs(item.completionDate).format("YYYY-MM-DD")
                    : String(item.completionDate)
                : "no-date";
            const key =
                item?.id?.toString?.() ||
                `${item?.taskName}-${completedDay}-${item?.completedBy || "unknown"}`;
            if (!uniqueMap.has(key)) {
                uniqueMap.set(key, item);
            }
        });
        return Array.from(uniqueMap.values());
    }, [filteredCompletedEntries]);

    const teamColumns = [
        { headerName: "Sr No", field: "srNo", width: 100 },
        { headerName: "KRA List", field: "taskName", flex: 1 },
        { headerName: "Assigned To", field: "assignedTo", flex: 1 },
        { headerName: "DueTime", field: "dueTime" ,flex: 1 },
        {
            field: "status",
            headerName: "Status",
            flex: 1 ,
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
        // ...(canShowControls && !isAddKraDisabled
         ...((canShowControls && (!isPastDateView || isSuperOrMasterAdmin))
            ? [
                {
                    headerName: "Actions",
                    field: "actions",
                    pinned: "right",
                    cellRenderer: (params) => (
                        <div className="p-2 flex gap-2 items-center">
                            <button
                                    type="button"
                                    title="Edit"
                                    onClick={() => {
                                        if (!params.data?.canEditDeleteRow) return;
                                        handleOpenEditModal(params.data);
                                    }}
                                     disabled={!params.data?.canEditDeleteRow || isDeletePending}
                                    className="ml-2"
                                >
                                    <HiPencilSquare size={24} color="#111827" />
                                </button>
                            {canDeleteRecurrence && (
                                <button
                                    type="button"
                                    title="Delete Recurrence"
                                       disabled={!params.data?.canEditDeleteRow || isDeletePending}
                                    onClick={() => {
                                        if (!params.data?.canEditDeleteRow) return;
                                        deleteDailyKraRecurrence(params.data.id);
                                    }}
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
        // { headerName: "Assigned Time", field: "assignedDate" },

        { headerName: "Completed By", field: "completedBy" ,flex: 1 },
        {
            headerName: "Completed Date",
            field: "completionDate",
            flex: 1,
            hide: true,
        },
        {
            headerName: "Completed Time",
            field: "completionTime",
            flex: 1 
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
    const selectedDateLabel = selectedDate.format("DD MMM YYYY");
    const toDateKey = (value) => {
      if (!value) return null;
      const parsed = dayjs(value);
      return parsed.isValid() ? parsed.format("YYYY-MM-DD") : null;
    };
    const dateWiseTeamKra = filteredTeamKra
      .filter((item) => {
        const rowDateKey = toDateKey(item.assignedDate || item.dueDate || item.createdAt);
        if (!rowDateKey) return false;

        return rowDateKey <= selectedDateKey;
      })
      .sort((a, b) => {
        const aKey = toDateKey(a.assignedDate || a.dueDate || a.createdAt) || "";
        const bKey = toDateKey(b.assignedDate || b.dueDate || b.createdAt) || "";
        return aKey.localeCompare(bKey);
      })
      .map((item) => {
      const rowDateKey = toDateKey(item.assignedDate || item.dueDate || item.createdAt);
      const isBackdatedRow = rowDateKey < selectedDateKey;
      const canMarkDoneRow =
        isSuperOrMasterAdmin ||
        (isCurrentDateView && rowDateKey <= todayKey);
      const canEditDeleteRow =
        isSuperOrMasterAdmin ||
        isManager ||
        (isCurrentDateView && rowDateKey <= todayKey);

      return {
        ...item,
        isCarryoverRow: isBackdatedRow,
        canMarkDoneRow,
        canEditDeleteRow,
      };
    });
    const dateWiseCompletedEntries = (uniqueCompletedEntries || []).filter((item) => {
      const completionDate = item.completedDate || item.completionDate || item.dueDate;
      return toDateKey(completionDate) === selectedDateKey;
    });
    const getTeamRowStyle = (params) => {
      if (params?.data?.canEditDeleteRow || params?.data?.canMarkDoneRow) return {};

      return {
        backgroundColor: params?.data?.isCarryoverRow ? "#f3f4f6" : "#fafafa",
        color: "#6b7280",
        opacity: 0.75,
      };
    };
    return (
        <>
            <div className="flex flex-col gap-4">
                <PageFrame>
                    {!teamLoading ? (
                        <WidgetSection padding layout={1}>
                                <YearWiseTable
                                formatTime
                                checkbox={false}
                                buttonTitle={
                                      isSuperOrMasterAdmin || isCurrentDateView
                                        ? "Add Team Daily KRA"
                                        : undefined
                                }
                               // buttonDisabled={isAddKraDisabled || !canShowControls}
                                buttonDisabled={
                                    isAddKraDisabled ||
                                    !canShowControls ||
                                    (!isSuperOrMasterAdmin && (isEmployeeLevel || !isCurrentDateView))
                                }
                                handleSubmit={() => setOpenModal(true)}
                                 showDateNavigator
                                selectedDateLabel={selectedDateLabel}
                                onPreviousDay={() => setSelectedDate((prev) => prev.subtract(1, "day"))}
                                onNextDay={() => setSelectedDate((prev) => prev.add(1, "day"))}
                                tableTitle={`${departmentName} - TEAM DAILY KRA - ${activeMemberName}`}
                               // data={filteredTeamKra
                                data={dateWiseTeamKra
                                    .filter((item) => item.status !== "Completed")
                                    .map((item, index) => ({
                                        srno: index + 1,
                                        id: item.id,
                                        taskName: item.taskName,
                                        assignedDate: item.assignedDate,
                                        dueDate: item.dueDate || item.assignedDate,
                                        dueTime: item.dueTime,
                                        status: item.status,
                                        assignedTo: item.assignedTo,
                                        isCarryoverRow: item.isCarryoverRow,
                                        canMarkDoneRow: item.canMarkDoneRow,
                                        canEditDeleteRow: item.canEditDeleteRow,
                                    }))}
                                dateColumn={"assignedDate"}
                                columns={teamColumns}
                                isRowSelectable={(params) => !!params?.data?.canMarkDoneRow || !!params?.data?.canEditDeleteRow}
                                getRowStyle={getTeamRowStyle}
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
                                    tableTitle={`COMPLETED - TEAM DAILY KRA - ${activeMemberName} - ${selectedDateLabel}`}
                                    exportData={!isFutureDateView}
                                    checkAll={false}
                                    // key={filteredCompletedEntries.length}
                                    // data={filteredCompletedEntries.map((item, index) => ({
                                     key={dateWiseCompletedEntries.length}
                                    data={dateWiseCompletedEntries.map((item, index) => ({    
                                        srno: index + 1,
                                        id: item.id,
                                        taskName: item.taskName,
                                        assignedDate: item.assignedDate,
                                        completionDateRaw: item.completedDate || item.completionDate || item.dueDate,
                                        completionDate: humanDate(item.completedDate || item.completionDate || item.dueDate),
                                        completionTime: humanTime(item.completedDate || item.completionTime || item.completionDate || item.dueDate),
                                      //  completionDate: item.completedDate || item.completionDate || item.dueDate,
                                      //  completionTime: item.completedDate || item.completionTime || item.completionDate || item.dueDate,
                                        status: item.status,
                                        completedBy: item.completedBy,
                                    }))}
                                   // dateColumn={"completionDate"}
                                    dateColumn={"completionDateRaw"}
                                    columns={completedColumns}
                                    hideDateControls
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

            <MuiModal
                open={openModal}
                onClose={() => setOpenModal(false)}
               title={isEditMode ? "Edit Task" : "Add Team Daily KRA"}
            >
                <form
                    onSubmit={submitDailyKra(handleFormSubmit)}
                    className="grid grid-cols-1 gap-4"
                >
                    <Controller
                        name="teamDailyKra"
                        control={control}
                        rules={{
                            required: "Team Daily KRA is required",
                            validate: { noOnlyWhitespace, isAlphanumeric },
                        }}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                size="small"
                                label={"Team Daily KRA"}
                                fullWidth
                                error={!!errors?.teamDailyKra?.message}
                                helperText={errors?.teamDailyKra?.message}
                            />
                        )}
                    />

                    <Controller
                        name="assignedDate"
                        control={control}
                        rules={{ required: "Assigned Date Is Required" }}
                        render={({ field, fieldState: { error } }) => (
                            <DatePicker
                                label="Assigned Date"
                                disablePast
                                format="DD-MM-YYYY"
                                value={field.value ? dayjs(field.value) : null}
                                onChange={(date) => field.onChange(date ? date.toISOString() : null)}
                                slotProps={{
                                    textField: {
                                        size: "small",
                                        fullWidth: true,
                                        error: !!error,
                                        helperText: error?.message,
                                    },
                                }}
                            />
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
                                                : []
                                    );
                                }}
                                error={!!error}
                                helperText={error?.message}
                                SelectProps={{
                                    multiple: true,
                                    renderValue: (selected) => (
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                            {selected.map((value) => (
                                                <Chip
                                                    key={value}
                                                    label={assignees.find(a => a.id === value)?.name || value}
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
                        isLoading={isAddKraPending}
                        disabled={isAddKraPending}
                    />
                </form>
            </MuiModal>
        </>
    );
};
export default PerformanceTeamKra;
