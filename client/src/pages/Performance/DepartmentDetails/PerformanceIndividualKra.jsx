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
import { InsertEmoticonTwoTone } from "@mui/icons-material";
import PageFrame from "../../../components/Pages/PageFrame";
import { isAlphanumeric, noOnlyWhitespace } from "../../../utils/validators";
import YearWiseTable from "../../../components/Tables/YearWiseTable";
import { FaCheckSquare } from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";
import { HiPencilSquare } from "react-icons/hi2";
import useCurrentDay from "../../../hooks/useCurrentDay";
import ConfirmationModal from "../../../components/ConfirmationModal";

const PerformanceIndividualKra = () => {
    const axios = useAxiosPrivate();
    const { auth } = useAuth();
    const location = useLocation();
    const { department } = useParams();
    const [openModal, setOpenModal] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingTaskId, setEditingTaskId] = useState(null);
    const [deleteTargetId, setDeleteTargetId] = useState(null);
    const [selectedDate, setSelectedDate] = useState(dayjs().startOf("day"));
    const today = useCurrentDay();
    const selectedMember = useSelector((state) => state.performance.selectedMember);
    const selectedDepartment = useSelector((state) => state.performance.selectedDepartment);
    const selectedDepartmentName = useSelector(
        (state) => state.performance.selectedDepartmentName
    );
    const primaryUserDepartment = auth?.user?.departments?.[0];
 const isEmployeeKraKpaRoute = location.pathname.includes("/employee-KRA-KPA");
    const effectiveDeptId = isEmployeeKraKpaRoute
        ? primaryUserDepartment?._id
        : selectedDepartment?.toString?.() || primaryUserDepartment?._id;
    const effectiveDepartmentName = isEmployeeKraKpaRoute
        ? primaryUserDepartment?.name
        : selectedDepartmentName || primaryUserDepartment?.name;
    const departmentName =
        effectiveDepartmentName ||
        department ||
        auth?.user?.departments?.find((dept) => dept._id?.toString() === effectiveDeptId?.toString())?.name ||
        "Department";
         const loggedInUserName = [auth?.user?.firstName, auth?.user?.middleName, auth?.user?.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();
    const userId = auth.user._id;
     const selectedMemberFromRoute = location.state?.selectedMember;
    const activeMember = selectedMemberFromRoute || selectedMember;
   // const isEmployeeKraKpaRoute = location.pathname.includes("/employee-KRA-KPA");
    const activeMemberName = isEmployeeKraKpaRoute
        ? loggedInUserName || "User Name"
        : activeMember?.memberName || loggedInUserName || "User Name";
    const activeMemberId = activeMember?.memberId?.toString?.() || "";
    const [selectedKra, setSelectedKra] = useState(null);

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

    const departmentAccess = [
        "67b2cf85b9b6ed5cedeb9a2e",
        "6798bab9e469e809084e249e",
    ];

    const isTop = auth.user.departments.some((item) => {
        return departmentAccess.includes(item._id.toString());
    });

    const allowedDept = auth.user.departments.some((item) => {
        return item._id.toString() === effectiveDeptId?.toString();
    });

    const userPermissions = auth?.user?.permissions?.permissions || [];
    const roleTitles =
        auth?.user?.role?.map((role) => role?.roleTitle?.toLowerCase()) || [];
    const isManager = userPermissions.includes(PERMISSIONS.PERFORMANCE_DAILY_KRA.value);
    const isSuperOrMasterAdmin =
        roleTitles.some((roleTitle) => roleTitle?.includes("super admin")) ||
        roleTitles.some((roleTitle) => roleTitle?.includes("master admin"));
    const isHr = department === "HR";

    const matchingDepartment = auth.user?.departments?.some(
        (dept) => dept._id?.toString() === effectiveDeptId?.toString()
    );

     const normalizeValue = (value) =>
        (value || "").toString().replace(/\s+/g, " ").trim().toLowerCase();
    const isViewingOwnMember =
        normalizeValue(activeMember?.memberId) === normalizeValue(userId) ||
        normalizeValue(activeMember?.memberName) === normalizeValue(loggedInUserName);
    const selectedMemberCanManageView = isManager || isSuperOrMasterAdmin;
    const selectedMemberRole = normalizeValue(activeMember?.memberRole);
    const isSelectedMemberManager = selectedMemberRole.includes("manager");
    const isSelectedMemberEmployee =
        !!activeMember?.memberId && !isSelectedMemberManager;
    const shouldHideManagerControlsForSelectedMemberView =
        !isEmployeeKraKpaRoute &&
        isManager &&
        !isSuperOrMasterAdmin &&
        !!activeMember?.memberId &&
        !isViewingOwnMember;
    const shouldUseTeamAddButton =
        !isEmployeeKraKpaRoute &&
        isSelectedMemberEmployee &&
        !!activeMemberId &&
        !isViewingOwnMember;
    const addButtonLabel = shouldUseTeamAddButton
        ? "Add Team Daily KRA"
        : "Add Individual Daily KRA";
    const addFieldLabel = shouldUseTeamAddButton
        ? "Team Daily KRA"
        : "Individual Daily KRA";
    const addTaskType = shouldUseTeamAddButton ? "TEAMKRA" : "INDIVIDUALKRA";
    // const addAssignToId = activeMemberId || userId?.toString?.();
    //     const shouldForceOwnControlsInEmployeeRoute = isEmployeeKraKpaRoute;
      const addAssignToId = isEmployeeKraKpaRoute
        ? userId?.toString?.()
        : activeMemberId || userId?.toString?.();
    const shouldForceOwnControlsInEmployeeRoute = isEmployeeKraKpaRoute;
    const showCheckBox = allowedDept || selectedMemberCanManageView;
    const shouldHideControlsForSelectedMemberView =
        isSelectedMemberEmployee && activeMember?.memberId;
    const selectedDateKey = selectedDate.format("YYYY-MM-DD");
    const todayKey = today.format("YYYY-MM-DD");
    const isCurrentDateView = selectedDateKey === todayKey;
    const isPastDateView = selectedDateKey < todayKey;
    const isFutureDateView = selectedDateKey > todayKey;
    const canShowControls =
          shouldForceOwnControlsInEmployeeRoute ||
          isCurrentDateView ||
          selectedMemberCanManageView ||
        (!isSelectedMemberEmployee &&
        (selectedMemberCanManageView || !activeMember?.memberId || isViewingOwnMember));
    const canUseCheckbox =
        shouldForceOwnControlsInEmployeeRoute ||
        isCurrentDateView ||
        selectedMemberCanManageView ||
        (showCheckBox && !isSelectedMemberEmployee);
    const isEmployeeLevel = !isSuperOrMasterAdmin && !isManager;
    const shouldHideActionsForEmployeeFuture = isEmployeeLevel && isFutureDateView;

    const individualKraQueryKey = useMemo(
        () => ["fetchedIndividualKRA", effectiveDeptId, selectedDateKey],
        [effectiveDeptId, selectedDateKey]
    );
    const teamKraQueryKey = useMemo(
        () => ["fetchedTeamKRA", effectiveDeptId, selectedDateKey],
        [effectiveDeptId, selectedDateKey]
    );

    useEffect(() => {
        queryClient.invalidateQueries({ queryKey: individualKraQueryKey });
    }, [individualKraQueryKey]);

    const { data: assignees = [] } = useQuery({
        queryKey: ["fetchAssignees", effectiveDeptId],
        queryFn: async () => {
            const response = await axios.get(`/api/users/assignees?deptId=${effectiveDeptId}`);
            return response.data || [];
        },
        enabled: !!effectiveDeptId,
    });

    const {
        handleSubmit: submitDailyKra,
        control,
        formState: { errors },
        reset,
    } = useForm({
        mode: "onChange",
        defaultValues: {
            individualDailyKra: "",
            description: "",
            assignTo: shouldUseTeamAddButton && addAssignToId ? [addAssignToId] : [],
            assignedDate: dayjs().toISOString(),
        },
    });

    const { mutate: deleteDailyKraRecurrence, isPending: isDeletePending } = useMutation({
        mutationKey: ["deleteDailyKraRecurrence"],
        mutationFn: async (taskId) => {
            const response = await axios.patch(`/api/performance/delete-recurrence/${taskId}`);
            return response.data;
        },
        onSuccess: (data) => {
            queryClient.refetchQueries({ queryKey: individualKraQueryKey });
            queryClient.refetchQueries({ queryKey: ["completedEntries", effectiveDeptId] });
            toast.success(data.message || "KRA recurrence removed");
        },
        onError: () => {
            toast.error("Failed to remove recurrence");
        },
    });

    const handleConfirmDelete = () => {
        if (!deleteTargetId) return;
        deleteDailyKraRecurrence(deleteTargetId);
        setDeleteTargetId(null);
    };

    //--------------POST REQUEST FOR DAILY KRA-----------------//
    const { mutate: addDailyKra, isPending: isAddKraPending } = useMutation({
        mutationKey: ["addDailyKra"],
        mutationFn: async (data) => {
            const response = await axios.post("/api/performance/create-task", {
                task: data.individualDailyKra, // Fixed field name
                taskType: data.taskType || "INDIVIDUALKRA",
                // description: data.description,
                 department: effectiveDeptId,
                assignedDate: data.assignedDate,
                assignTo: data.assignTo,
            });
            return response.data;
        },
        onSuccess: (data, variables) => {
            const createdTasks = Array.isArray(data?.data)
                ? data.data
                : data?.data
                    ? [data.data]
                    : [];

            if (createdTasks.length > 0) {
                const normalizeCreatedTask = (task) => ({
                        id: task?._id || task?.id,
                        taskName: task?.task || task?.taskName || variables?.individualDailyKra || "",
                        assignedDate: task?.assignedDate || variables?.assignedDate || null,
                        dueDate: task?.dueDate || task?.assignedDate || variables?.assignedDate || null,
                        dueTime: task?.dueTime || "6:30 PM",
                        status: task?.status || "Pending",
                        assignedTo:
                            task?.assignTo?.firstName && task?.assignTo?.lastName
                                ? `${task.assignTo.firstName} ${task.assignTo.lastName}`
                                : task?.assignedTo || "N/A",
                        assignToId: task?.assignTo?._id || task?.assignToId || task?.assignTo,
                });

                queryClient.setQueryData(individualKraQueryKey, (oldData = []) => [
                    ...createdTasks.map(normalizeCreatedTask),
                    ...(oldData || []),
                ]);
                queryClient.setQueryData(teamKraQueryKey, (oldData = []) => [
                    ...createdTasks.map(normalizeCreatedTask),
                    ...(oldData || []),
                ]);
            }

            toast.success(data.message || "KRA Added");
                        queryClient.invalidateQueries({ queryKey: individualKraQueryKey });
            queryClient.invalidateQueries({
                queryKey: ["fetchedTeamKRAForIndividual", effectiveDeptId, selectedDateKey],
            });
            queryClient.invalidateQueries({ queryKey: teamKraQueryKey });
            reset();
            setOpenModal(false);
            setIsEditMode(false);
            setEditingTaskId(null);
        },
        onError: (error) => {
            toast.error("Adding failed");
            // toast.error(error.message || "Error Adding KRA");
        },
    });

    const handleOpenAddModal = () => {
        reset({
            individualDailyKra: "",
            description: "",
            assignTo: shouldUseTeamAddButton && addAssignToId ? [addAssignToId] : [],
            assignedDate: dayjs().toISOString(),
        });
        setOpenModal(true);
    };
   const handleOpenEditModal = (task) => {
    setIsEditMode(true);
    setEditingTaskId(task.id);
    reset({
      individualDailyKra: task.taskName || "",
      assignedDate: task.assignedDate || null,
      description: task.description || "",
    });
    setOpenModal(true);
  };

  const handleFormSubmit = async (data) => {
        if (isEditMode && editingTaskId) {
            await axios.patch(`/api/performance/update-task/${editingTaskId}`, {
                task: data.individualDailyKra,
                assignedDate: data.assignedDate,
                description: data.description || "",
                assignTo: addAssignToId,
            });
            toast.success("KRA updated successfully");
            queryClient.invalidateQueries({ queryKey: individualKraQueryKey });
            setOpenModal(false);
            setIsEditMode(false);
            setEditingTaskId(null);
            reset();
            return;
        }
        const payload = {
            ...data,
            assignTo: addAssignToId,
            taskType: addTaskType,
        };
        addDailyKra(payload);
    };

    const { mutate: updateDailyKra, isPending: isUpdatePending } = useMutation({
        mutationKey: ["updateDailyKra"],
        mutationFn: async (data) => {
            const response = await axios.patch(
                `/api/performance/update-status/${data}/KRA`
            );
            return response.data;
        },
        onSuccess: (data, taskId) => {
            const removeCompletedTaskFromList = (oldData = []) =>
                (oldData || []).filter((item) => {
                    const rowId = item?.id || item?._id;
                    return rowId?.toString?.() !== taskId?.toString?.();
                });

            // Remove immediately from all visible pending sources so row disappears without refresh.
            queryClient.setQueryData(individualKraQueryKey, removeCompletedTaskFromList);
            queryClient.setQueryData(
                ["fetchedTeamKRAForIndividual", effectiveDeptId, selectedDateKey],
                removeCompletedTaskFromList
            );
            queryClient.setQueryData(teamKraQueryKey, removeCompletedTaskFromList);

            queryClient.refetchQueries({ queryKey: individualKraQueryKey });
            queryClient.refetchQueries({
                queryKey: ["fetchedTeamKRAForIndividual", effectiveDeptId, selectedDateKey],
            });
            queryClient.refetchQueries({ queryKey: ["completedEntries", effectiveDeptId] });
            queryClient.invalidateQueries({ queryKey: individualKraQueryKey });
            queryClient.invalidateQueries({
                queryKey: ["fetchedTeamKRAForIndividual", effectiveDeptId, selectedDateKey],
            });
            queryClient.invalidateQueries({ queryKey: ["completedEntries", effectiveDeptId] });
            toast.success(data.message || "KRA updated");
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || "Error Updating");
        },
    });

    //--------------POST REQUEST FOR DAILY KRA-----------------//

    const fetchTasks = async () => {
        try {
            const response = await axios.get(
                  `/api/performance/get-tasks?dept=${effectiveDeptId}&type=INDIVIDUALKRA&date=${selectedDateKey}`
               //  `/api/performance/get-tasks?dept=${effectiveDeptId}&type=INDIVIDUALKRA`
            );
            return response.data;
        } catch (error) {
            console.error("Error fetching data:", error);
             return [];
        }
    };
    const { data: departmentKra = [], isPending: departmentLoading } = useQuery({
        queryKey: individualKraQueryKey,
        queryFn: fetchTasks,
    });

    const { data: teamKraForIndividual = [] } = useQuery({
        queryKey: ["fetchedTeamKRAForIndividual", effectiveDeptId, selectedDateKey],
        queryFn: async () => {
            try {
                const response = await axios.get(
                      `/api/performance/get-tasks?dept=${effectiveDeptId}&type=TEAMKRA&date=${selectedDateKey}`
                  //   `/api/performance/get-tasks?dept=${effectiveDeptId}&type=TEAMKRA`
                );
                return response.data;
            } catch (error) {
                console.error(error);
                return [];
            }
        },
        enabled: !!effectiveDeptId,
    });

    // const { data: assignees = [] } = useQuery({
    //     queryKey: ["fetchAssignees", deptId],
    //     queryFn: async () => {
    //         const response = await axios.get(`/api/user/assignees?deptId=${deptId}`);
    //         return response.data;
    //     },
    //     enabled: !!deptId,
    // });
    const { data: completedEntries = [], isLoading: isCompletedLoading } =
        useQuery({
             queryKey: ["completedEntries", effectiveDeptId],
            queryFn: async () => {
                try {
                    const response = await axios.get(
                        `/api/performance/get-completed-tasks?dept=${effectiveDeptId}&type=INDIVIDUALKRA`
                    );
                    return response.data;
                } catch (error) {
                    console.error(error);
                     return [];
                }
            },
        });
    const { data: completedTeamEntries = [] } = useQuery({
        queryKey: ["completedTeamEntriesKRA", effectiveDeptId],
        queryFn: async () => {
            try {
                const response = await axios.get(
                    `/api/performance/get-completed-tasks?dept=${effectiveDeptId}&type=TEAMKRA`
                );
                return response.data;
            } catch (error) {
                console.error(error);
                return [];
            }
        },
        enabled: !!effectiveDeptId,
    });

    const departmentColumns = [
        { headerName: "Sr No", field: "srNo", width: 100 },
        { headerName: "KRA List", field: "taskName", flex: 1 },
        { headerName: "DueTime", field: "dueTime",flex: 1},
        {
            field: "status",
            headerName: "Status",
            flex: 1,
            cellRenderer: (params) => {
                const statusColorMap = {
                    Pending: { backgroundColor: "#FFECC5", color: "#CC8400" },
                    InProgress: { backgroundColor: "#ADD8E6", color: "#00008B" },
                    resolved: { backgroundColor: "#90EE90", color: "#006400" },
                    open: { backgroundColor: "#E6E6FA", color: "#4B0082" },
                    Completed: { backgroundColor: "#16f8062c", color: "#00731b" },
                };

                const { backgroundColor, color } = statusColorMap[params.value] || {
                    backgroundColor: "gray",
                    color: "white",
                };

                return <Chip label={params.value} style={{ backgroundColor, color }} />;
            },
        },
        ...(((isSuperOrMasterAdmin || isCurrentDateView || (isFutureDateView && selectedMemberCanManageView)) && (matchingDepartment || selectedMemberCanManageView || shouldForceOwnControlsInEmployeeRoute) && canShowControls && !shouldHideActionsForEmployeeFuture && !shouldHideManagerControlsForSelectedMemberView)
        //   ...((matchingDepartment || selectedMemberCanManageView) && canShowControls
       //   ...(matchingDepartment && !shouldHideControlsForSelectedMemberView
            ? [
                {
                    headerName: "Actions",
                    pinned: "right",
                    field: "actions",
                    width:250,
                    cellRenderer: (params) => {
                        const rowCanMarkDone = !!params?.data?.canMarkDoneRow;
                        const rowCanEditDelete = !!params?.data?.canEditDeleteRow;
                        const showMarkAsDone = rowCanMarkDone && (!isFutureDateView || isSuperOrMasterAdmin);
                        const isRowSelected = !!params?.node?.selected;
                        const markAsDoneClass = isRowSelected
                            ? "bg-[#1E3D73] text-white shadow-md ring-2 ring-[#8fb2ff]"
                            : "bg-gray-300 text-gray-700";

                        return (
                            <div className="flex items-center">
                                {/* Mark As Done */}
                                {showMarkAsDone && (
                                <div
                                    role="button"
                                    onClick={() => {
                                        if (!rowCanMarkDone || !isRowSelected || isUpdatePending || isDeletePending)
                                            return;
                                        updateDailyKra(params.data.id);
                                    }}
                                    className="p-2"
                                >
                                    <PrimaryButton
                                        title={isUpdatePending ? "⏳" : "Mark As Done"}
                                        disabled={
                                            !rowCanMarkDone ||
                                            !isRowSelected ||
                                            isUpdatePending ||
                                            isDeletePending
                                        }
                                        //className="px-2 py-1 text-sm w-28"
                                        //className="px-2 py-1 text-xs w-28"
                                        className={`px-2 py-1 text-xs w-28 h-7 ${markAsDoneClass}`}
                                    />
                                </div>
                                )}

                               {/* <button
                  type="button"
                  title="Edit"
                  disabled={!params.node.selected || isUpdatePending || isDeletePending}
                  onClick={() => handleOpenEditModal(params.data)}
                  className="ml-2 px-2 py-1 text-xs w-10 h-7 flex items-center justify-center disabled:cursor-not-allowed"
                >
                  <HiPencilSquare size={24} color={!params.node.selected ? "#9ca3af" : "#111827"} />
                </button> */}
                {rowCanEditDelete && !isAddKraDisabled && (
                                    <button
                                        type="button"
                                        title="Edit"
                                        disabled={!isRowSelected || !rowCanEditDelete || isUpdatePending || isDeletePending}
                                        //disabled={!params.node.selected || isUpdatePending || isDeletePending}
                                        onClick={() => {
                                            if (!isRowSelected || !rowCanEditDelete) return;
                                            handleOpenEditModal(params.data);
                                        }}
                                        className="ml-2 px-2 py-1 text-xs w-10 h-7 flex items-center justify-center disabled:cursor-not-allowed"
                                    >
                                        <HiPencilSquare size={24} color={!params.node.selected ? "#9ca3af" : "#111827"} />
                                    </button>
                                )}

                {/* Delete Recurrence */}
                {rowCanEditDelete && canDeleteRecurrence && (
                                    <button
                                        type="button"
                                        title="Delete Recurrence"
                                        disabled={
                                            !isRowSelected ||
                                            !rowCanEditDelete ||
                                            isDeletePending ||
                                            isUpdatePending
                                        }
                                        onClick={() => {
                                            if (!isRowSelected || !rowCanEditDelete) return;
                                            setDeleteTargetId(params.data.id);
                                        }}
                                        // className="ml-2 disabled:cursor-not-allowed"
                                        className="ml-2 px-2 py-1 text-xs w-28 h-7 flex items-center justify-center disabled:cursor-not-allowed"
                                    >
                                        {isDeletePending ? (
                                            "⏳"
                                        ) : (
                                            <MdDeleteForever
                                                size={26}
                                                color={!params.node.selected ? "gray" : "red"}
                                            />
                                        )}
                                    </button>
                                )}
                            </div>
                        );
                    },
                },
            ]
            : []),
    ];

    const formatDateTime = (value) =>
        value ? `${humanDate(value)}, ${humanTime(value)}` : "N/A";

    const completedColumns = [
        { headerName: "Sr No", field: "srNo", width: 100, sort: "asc" },
        { headerName: "KRA List", field: "taskName", flex: 1 },
        // { headerName: "Assigned Time", field: "assignedDate" },

        { headerName: "Completed By", field: "completedBy",flex: 1},
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
            flex: 1,
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
     const uniqueTaskMap = new Map();
    [...(departmentKra || []), ...(teamKraForIndividual || [])].forEach((item) => {
        const taskId = item?.id?.toString?.();
        if (!taskId || uniqueTaskMap.has(taskId)) return;
        uniqueTaskMap.set(taskId, item);
    });
      const targetMemberName = isEmployeeKraKpaRoute ? loggedInUserName : activeMember?.memberName;
    const targetMemberId = isEmployeeKraKpaRoute ? userId : activeMember?.memberId;
    const filteredDepartmentKra = Array.from(uniqueTaskMap.values()).filter((item) => {
         if (!targetMemberName && !targetMemberId) return true;
        return (
            normalizeValue(item?.assignedTo) === normalizeValue(targetMemberName) ||
            normalizeValue(item?.assignToId) === normalizeValue(targetMemberId)
        );
    });
    const uniqueCompletedMap = new Map();
    [...(completedEntries || []), ...(completedTeamEntries || [])].forEach((item) => {
        const completedDay = item?.completionDate
            ? dayjs(item.completionDate).isValid()
                ? dayjs(item.completionDate).format("YYYY-MM-DD")
                : String(item.completionDate)
            : "no-date";
        const completedByKey =
            item?.completedById || item?.completedByName || item?.completedBy || "unknown";
        const completedId =
            item?.id?.toString?.() ||
            `${item?.taskName}-${completedDay}-${completedByKey}`;
        if (uniqueCompletedMap.has(completedId)) return;
        uniqueCompletedMap.set(completedId, item);
    });

    const hasSelectedMember = !!targetMemberName || !!targetMemberId;
    const matchesCompletedMember = (value) => {
        const normalizedValue = normalizeValue(value);
        if (!normalizedValue || !hasSelectedMember) return false;

        return (
            normalizedValue === normalizeValue(targetMemberId) ||
            normalizedValue === normalizeValue(targetMemberName)
        );
    };

    const filteredCompletedEntries = Array.from(uniqueCompletedMap.values()).filter((item) => {
        if (!hasSelectedMember) return true;

        const completedByCandidates = [
            item?.completedBy,
            item?.completedById,
            item?.completedByName,
        ];

        return completedByCandidates.some(matchesCompletedMember);
    });
    const selectedDateLabel = selectedDate.format("DD MMM YYYY");
    const toDateKey = (value) => {
      if (!value) return null;
      const parsed = dayjs(value);
      return parsed.isValid() ? parsed.format("YYYY-MM-DD") : null;
    };
    const dateWiseDepartmentKra = filteredDepartmentKra
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
        (isManager && (isFutureDateView || (isCurrentDateView && rowDateKey <= todayKey)));

      return {
        ...item,
        isCarryoverRow: isBackdatedRow,
        canMarkDoneRow,
        canEditDeleteRow,
      };
    });
    const dateWiseCompletedEntries = filteredCompletedEntries.filter((item) => {
      const completionDate = item.completedDate || item.completionDate || item.dueDate;
      return toDateKey(completionDate) === selectedDateKey;
    });
    const normalizeTaskKey = (taskName, dateValue) =>
      `${normalizeValue(taskName)}-${toDateKey(dateValue) || "no-date"}`;
    const completedTaskIdsForSelectedDate = new Set(
      dateWiseCompletedEntries
        .map((item) => item?.taskId?.toString?.())
        .filter(Boolean)
    );
    const completedTaskKeysForSelectedDate = new Set(
      dateWiseCompletedEntries.map((item) =>
        normalizeTaskKey(item?.taskName, item?.assignedDate || item?.dueDate)
      )
    );
    const canShowAddIndividualKraButton = isEmployeeKraKpaRoute
        ? isSuperOrMasterAdmin || isManager
        : isSuperOrMasterAdmin || isCurrentDateView;
    const getIndividualRowStyle = (params) => {
      if (params?.data?.canMarkDoneRow || params?.data?.canEditDeleteRow) return {};

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
                    {!departmentLoading ? (
                        <WidgetSection padding layout={1}>
                            <YearWiseTable
                                formatTime
                                // checkbox={showCheckBox}
                                //  checkbox={showCheckBox && !shouldHideControlsForSelectedMemberView}
                                // buttonTitle={
                                //     shouldHideControlsForSelectedMemberView
                                //         ? undefined
                                //         : "Add Daily KRA"
                                // }
                                // buttonDisabled={
                                //     isAddKraDisabled || shouldHideControlsForSelectedMemberView
                                checkbox={canUseCheckbox && canShowControls && !(isEmployeeLevel && isFutureDateView) && !shouldHideManagerControlsForSelectedMemberView}
                                buttonTitle={
                                     canShowAddIndividualKraButton
                                        ? addButtonLabel
                                        : undefined
                                }
                                buttonDisabled={
                                    isAddKraDisabled ||
                                    !canShowControls ||
                                    !canShowAddIndividualKraButton
                                   // isAddKraDisabled || !canShowControls
                                }
                                handleSubmit={handleOpenAddModal}
                                  showDateNavigator
                                selectedDateLabel={selectedDateLabel}
                                onPreviousDay={() => setSelectedDate((prev) => prev.subtract(1, "day"))}
                                onNextDay={() => setSelectedDate((prev) => prev.add(1, "day"))}
                                tableTitle={`${departmentName} - INDIVIDUAL DAILY KRA - ${activeMemberName}`}
                               // tableTitle={`${departmentName} INDIVIDUAL - DAILY KRA - ${loggedInUserName || "User Name"}`}
                                 // tableTitle={`${departmentName} INDIVIDUAL - DAILY KRA`}
                                //tableTitle={`${department} INDIVIDUAL - DAILY KRA`}
                                // data={filteredDepartmentKra
                                data={dateWiseDepartmentKra
                                    .filter((item) => {
                                        if (item.status === "Completed") return false;

                                        const taskId = item?.id?.toString?.();
                                        if (taskId && completedTaskIdsForSelectedDate.has(taskId)) {
                                            return false;
                                        }

                                        const taskKey = normalizeTaskKey(
                                            item?.taskName,
                                            item?.assignedDate || item?.dueDate || item?.createdAt
                                        );
                                        return !completedTaskKeysForSelectedDate.has(taskKey);
                                    })
                                    .map((item, index) => ({
                                        srno: index + 1,
                                        id: item.id,
                                        taskName: item.taskName,
                                        assignedDate: item.assignedDate,
                                        dueTime: item.dueTime,
                                        status: item.status,
                                        assignedTo: item.assignedTo,
                                        isCarryoverRow: item.isCarryoverRow,
                                        canMarkDoneRow: item.canMarkDoneRow,
                                        canEditDeleteRow: item.canEditDeleteRow,
                                    }))}
                                      dateColumn={"assignedDate"}
                                columns={departmentColumns}
                                isRowSelectable={(params) => !!params?.data?.canMarkDoneRow || !!params?.data?.canEditDeleteRow}
                                getRowStyle={getIndividualRowStyle}
                                // dateColumn={"dueDate"}
                                // columns={departmentColumns}
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
                        {!departmentLoading ? (
                            <WidgetSection padding>
                                <YearWiseTable
                                    formatTime
                                       tableTitle={`COMPLETED - INDIVIDUAL DAILY KRA - ${activeMemberName} - ${selectedDateLabel}`}
                                    //tableTitle={`COMPLETED INDIVIDUAL - DAILY KRA - ${loggedInUserName || "User Name"}`}
                                    exportData={!isFutureDateView}
                                    checkAll={false}
                                    //  key={filteredCompletedEntries.length}
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
                                        status: item.status,
                                        completedBy: item.completedBy,
                                    }))}
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

            <ConfirmationModal
                open={!!deleteTargetId}
                onClose={() => setDeleteTargetId(null)}
                onConfirm={handleConfirmDelete}
                isLoading={isDeletePending}
            />

            <MuiModal
                open={openModal}
                onClose={() => setOpenModal(false)}
                title={isEditMode ? "Edit Task" : addButtonLabel}
            >
                <form
                    onSubmit={submitDailyKra(handleFormSubmit)}
                    className="grid grid-cols-1 lg:grid-cols-1 gap-4"
                >
                    <Controller
                        name="individualDailyKra"
                        control={control}
                        rules={{
                            required: "Daily KRA is required",
                            validate: {
                                noOnlyWhitespace,
                                isAlphanumeric,
                            },
                        }}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                size="small"
                                label={addFieldLabel}
                                fullWidth
                                error={!!errors?.individualDailyKra?.message}
                                helperText={errors?.individualDailyKra?.message}
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
                                onChange={(date) =>
                                    field.onChange(date ? date.toISOString() : null)
                                }
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

                    {!isEditMode && shouldUseTeamAddButton && (
                        <Controller
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
                                    disabled={!assignees.length}
                                    SelectProps={{
                                        multiple: true,
                                        renderValue: (selected) => (
                                            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                                                {selected.map((value) => (
                                                    <Chip
                                                        key={value}
                                                        label={assignees.find((a) => a.id === value)?.name || value}
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
                        />
                    )}

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

export default PerformanceIndividualKra;

