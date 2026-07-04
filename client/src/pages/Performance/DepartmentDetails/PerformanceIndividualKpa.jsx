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
import {
    setSelectedDepartment,
    setSelectedDepartmentName,
} from "../../../redux/slices/performanceSlice";
import { FaCheckSquare } from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";
import { HiPencilSquare } from "react-icons/hi2";

const PerformanceIndividualKpa = () => {
    const axios = useAxiosPrivate();
     const location = useLocation();
    const dispatch = useDispatch();
    const { auth } = useAuth();
    const { department } = useParams();
    const [openModal, setOpenModal] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingTaskId, setEditingTaskId] = useState(null);
      const [modalTaskType, setModalTaskType] = useState("INDIVIDUALKPA");
    const deptId = useSelector((state) => state.performance.selectedDepartment);

    const selectedDepartmentName = useSelector(
        (state) => state.performance.selectedDepartmentName
    );

    const selectedMember = useSelector((state) => state.performance.selectedMember);
    const isEmployeeKraKpaRoute = location.pathname.includes("/employee-KRA-KPA");
    const primaryUserDepartment = auth?.user?.departments?.[0];
    const effectiveDeptId = isEmployeeKraKpaRoute
        ? primaryUserDepartment?._id
        : deptId;
    const effectiveDepartmentName = isEmployeeKraKpaRoute
        ? primaryUserDepartment?.name
        : selectedDepartmentName;
    const departmentName =
        effectiveDepartmentName ||
        department ||
        auth?.user?.departments?.find((dept) => dept._id === effectiveDeptId)?.name ||
        "Department";
    const loggedInUserName = [auth?.user?.firstName, auth?.user?.middleName, auth?.user?.lastName]
        .filter(Boolean)
        .join(" ")
        .trim();
    const selectedMemberFromRoute = location.state?.selectedMember;
    const activeMember = selectedMemberFromRoute || selectedMember;
     //const isEmployeeKraKpaRoute = location.pathname.includes("/employee-KRA-KPA");
    const activeMemberName = isEmployeeKraKpaRoute
        ? loggedInUserName || "User Name"
        : activeMember?.memberName || loggedInUserName || "User Name";
    //const activeMemberName = activeMember?.memberName || loggedInUserName || "User Name";

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

    const userId = auth.user._id;
    const roleTitles =
        auth?.user?.role?.map((role) => role?.roleTitle?.toLowerCase()) || [];
    const isRoleEmployee = roleTitles.some((roleTitle) =>
        roleTitle?.includes("employee")
    );
    const userPermissions = auth?.user?.permissions?.permissions || [];
    const isManager =
        userPermissions.includes(PERMISSIONS.PERFORMANCE_INDIVIDUAL_KPA.value) ||
        userPermissions.includes(PERMISSIONS.PERFORMANCE_MONTHLY_KPA.value);
    const isHr = department === "HR";
     const isMasterOrSuperAdmin = roleTitles.some(
        (roleTitle) =>
            roleTitle?.includes("master admin") || roleTitle?.includes("super admin")
    );
    const isManagerAdmin = isManager && !isMasterOrSuperAdmin;
    const isEmployeeOnly = isRoleEmployee && !isManager && !isMasterOrSuperAdmin;

    const [selectedMonthContext, setSelectedMonthContext] = useState("current");
     const [selectedMonthRange, setSelectedMonthRange] = useState(null);

    const getMonthContext = (dateValue) => {
        if (!dateValue) return "current";
        const selected = dayjs(dateValue);
        if (!selected.isValid()) return "current";
        const selectedMonth = selected.startOf("month");
        const currentMonth = dayjs().startOf("month");
        if (selectedMonth.isBefore(currentMonth)) return "previous";
        if (selectedMonth.isAfter(currentMonth)) return "next";
        return "current";
    };

     const isSameRange = (prevRange, nextRange) => {
        if (!prevRange && !nextRange) return true;
        if (!prevRange || !nextRange) return false;
        const prevStart = prevRange?.startDate ? dayjs(prevRange.startDate).format("YYYY-MM-DD") : "";
        const prevEnd = prevRange?.endDate ? dayjs(prevRange.endDate).format("YYYY-MM-DD") : "";
        const nextStart = nextRange?.startDate ? dayjs(nextRange.startDate).format("YYYY-MM-DD") : "";
        const nextEnd = nextRange?.endDate ? dayjs(nextRange.endDate).format("YYYY-MM-DD") : "";
        return prevStart === nextStart && prevEnd === nextEnd;
    };
    // const showCheckBox = !isTop || isHr
    // const showCheckBox = allowedDept;
     const showCheckBox = allowedDept || isManager || isMasterOrSuperAdmin;

    const matchingDepartment = auth.user?.departments?.some(
          (dept) => dept._id === effectiveDeptId
    );

       const normalizeValue = (value) =>
        (value || "").toString().replace(/\s+/g, " ").trim().toLowerCase();
    const selectedMemberRole = normalizeValue(activeMember?.memberRole);
    const isSelectedMemberManager = selectedMemberRole.includes("manager");
    const isSelectedMemberEmployee = !!activeMember?.memberId && !isSelectedMemberManager;
    const targetMemberId = isEmployeeKraKpaRoute
        ? userId?.toString?.()?.trim()
        : activeMember?.memberId?.toString?.()?.trim() || userId?.toString?.()?.trim();
    const targetMemberName = isEmployeeKraKpaRoute
        ? loggedInUserName?.toString?.()?.trim()
        : activeMember?.memberName?.toString?.()?.trim() || loggedInUserName?.toString?.()?.trim();
      const hideMemberLevelControls =
   isEmployeeKraKpaRoute
            ? false
            : isSelectedMemberEmployee && !isMasterOrSuperAdmin && !isManager;
    const isViewingOwnMember =
        normalizeValue(activeMember?.memberId) === normalizeValue(userId) ||
        normalizeValue(activeMember?.memberName) === normalizeValue(loggedInUserName);
    const shouldHideAddButtonForSelectedMemberView =
        //isManager && activeMember?.memberId && !isViewingOwnMember;
                    !isManager && !isMasterOrSuperAdmin && activeMember?.memberId && !isViewingOwnMember;
    const shouldHideRowActionsForSelectedMemberView = shouldHideAddButtonForSelectedMemberView;
    // const showCheckBoxForCurrentView =
    //     showCheckBox && !shouldHideRowActionsForSelectedMemberView;
    const shouldShowManagerControlsInEmployeeRoute = isManager && isEmployeeKraKpaRoute;
    const shouldForceOwnControlsInEmployeeRoute = isEmployeeKraKpaRoute;
        const canShowControls =
            shouldForceOwnControlsInEmployeeRoute ||
            (!hideMemberLevelControls &&
            !isRoleEmployee &&
                    (isManager || isMasterOrSuperAdmin || shouldShowManagerControlsInEmployeeRoute || !shouldHideAddButtonForSelectedMemberView));
    const showCheckBoxForCurrentView =
        shouldForceOwnControlsInEmployeeRoute ||
        (!hideMemberLevelControls &&
        (showCheckBox || shouldShowManagerControlsInEmployeeRoute) &&
        canShowControls);
    const isRestrictedRoleInNonCurrentMonth =
        (isManagerAdmin || isEmployeeOnly) && selectedMonthContext !== "current";
    const showAddMonthlyKpaButton =
        (isEmployeeKraKpaRoute || isSelectedMemberManager) &&
        !(
            hideMemberLevelControls ||
            isAddKpaDisabled ||
            !canShowControls ||
            isRestrictedRoleInNonCurrentMonth
        );
    const showAddTeamMonthlyKpaButton =
        !isEmployeeKraKpaRoute &&
        !isSelectedMemberManager &&
        !hideMemberLevelControls &&
        !isAddKpaDisabled &&
        canShowControls &&
        !isRestrictedRoleInNonCurrentMonth;

    const {
        handleSubmit: submitDailyKra,
        control,
        formState: { errors },
        watch,
        reset,
    } = useForm({
        mode: "onChange",
        defaultValues: {
            kpaName: "",
            startDate: null,
            endDate: null,
            description: "",
            assignTo: "",
        },
    });
    const startDate = watch("startDate");

    const { mutate: deleteMonthlyKpaRecurrence, isPending: isDeletePending } = useMutation({
        mutationKey: ["deleteMonthlyKpaRecurrence"],
        mutationFn: async (taskId) => {
            const response = await axios.patch(`/api/performance/delete-recurrence/${taskId}`);
            return response.data;
        },
        onSuccess: (data) => {
            queryClient.refetchQueries({ queryKey: ["fetchedMonthlyKPA"] });
            queryClient.refetchQueries({ queryKey: ["completedEntriesIndividualKPA", effectiveDeptId] });
            toast.success(data.message || "KPA recurrence removed");
        },
        onError: () => {
            toast.error("Failed to remove recurrence");
        },
    });

    //--------------POST REQUEST FOR MONTHLY KPA-----------------//
    const { mutate: addMonthlyKpa, isPending: isAddKpaPending } = useMutation({
        mutationKey: ["addMonthlyKpa"],
        mutationFn: async (data) => {
            const response = await axios.post("/api/performance/create-task", {
                task: data.kpaName,
                  taskType: modalTaskType,
                //taskType: "INDIVIDUALKPA",
                // description: data.description,
                 department: effectiveDeptId,
                assignedDate: data.startDate,
                dueDate: data.endDate,
                kpaDuration: "Monthly",
                assignTo: data.assignTo,
            });
            return response.data;
        },
        onSuccess: (data) => {
            // queryClient.refetchQueries({ queryKey: ["fetchedMonthlyKPA"] });
            // queryClient.invalidateQueries({ queryKey: ["fetchedMonthlyKPA"] });
              queryClient.invalidateQueries({ queryKey: ["fetchedMonthlyKPA", effectiveDeptId] });
            queryClient.invalidateQueries({ queryKey: ["fetchedTeamKPAForIndividual", effectiveDeptId] });
            queryClient.refetchQueries({ queryKey: ["fetchedMonthlyKPA", effectiveDeptId] });
            queryClient.refetchQueries({ queryKey: ["fetchedTeamKPAForIndividual", effectiveDeptId] });
            toast.success(data.message || "KPA Added");
            reset();
            reset();
            setOpenModal(false);
            setIsEditMode(false);
           setEditingTaskId(null);
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || "Error Adding KPA");
        },
    });

 const resetModalState = () => {
        setOpenModal(false);
        setIsEditMode(false);
        setEditingTaskId(null);
        reset();
    };

   const handleOpenEditModal = (task) => {
    setIsEditMode(true);
    setEditingTaskId(task.mongoId || task.id || null);
    reset({
      kpaName: task.taskName || "",
      description: task.description || "",
      startDate: task.startDate || task.assignedDate || null,
      endDate: task.endDate || task.dueDate || null,
    });
    setOpenModal(true);
  };

  const handleFormSubmit = async (data) => {
        if (isEditMode) {
            if (!editingTaskId) {
                toast.error("Unable to update task. Please reopen edit popup.");
                return;
            }
 try {
                await axios.patch(`/api/performance/update-task/${editingTaskId}`, {
                    task: data.kpaName,
                    description: data.description || "",
                    assignedDate: data.startDate,
                    dueDate: data.endDate,
                    kpaDuration: "Monthly",
                    assignTo: targetMemberId,
                });
                toast.success("KPA updated successfully");
                queryClient.invalidateQueries({ queryKey: ["fetchedMonthlyKPA"] });
                resetModalState();
            } catch (error) {
                toast.error(error?.response?.data?.message || "Unable to update KPA");
            }
            return;
        }
        const payload = {
            ...data,
  assignTo:
                modalTaskType === "TEAMKPA"
                    ? Array.isArray(data.assignTo)
                        ? data.assignTo
                        : data.assignTo
                          ? [data.assignTo]
                          : []
                    : targetMemberId,
        };
        addMonthlyKpa(payload);
    };
    //--------------POST REQUEST FOR MONTHLY KPA-----------------//
    //--------------UPDATE REQUEST FOR MONTHLY KPA-----------------//
    const { mutate: updateMonthlyKpa, isPending: isUpdatePending } = useMutation({
        mutationKey: ["updateMonthlyKpa"],
        mutationFn: async (data) => {
            const response = await axios.patch(
                `/api/performance/update-status/${data}/KPA`
            );
            return response.data;
        },
        onSuccess: async (data, taskId) => {
            const removeTaskFromPending = (prev) =>
                Array.isArray(prev)
                    ? prev.filter((item) => String(item?.id) !== String(taskId))
                    : prev;

            // Remove instantly from pending lists so employee sees the change without manual refresh.
            queryClient.setQueryData(
                ["fetchedMonthlyKPA", effectiveDeptId],
                removeTaskFromPending,
            );
            queryClient.setQueryData(
                ["fetchedTeamKPAForIndividual", effectiveDeptId],
                removeTaskFromPending,
            );

            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: ["fetchedMonthlyKPA", effectiveDeptId],
                }),
                queryClient.invalidateQueries({
                    queryKey: ["fetchedTeamKPAForIndividual", effectiveDeptId],
                }),
                queryClient.invalidateQueries({
                    queryKey: ["completedEntriesIndividualKPA", effectiveDeptId],
                }),
                queryClient.invalidateQueries({
                    queryKey: ["completedTeamEntriesForIndividual", effectiveDeptId],
                }),
                queryClient.invalidateQueries({
                    queryKey: ["tasksRawData"],
                }),
                queryClient.invalidateQueries({
                    queryKey: ["performanceMemberWiseKraKpa"],
                }),
                queryClient.invalidateQueries({
                    queryKey: ["hrDepartmentKraTasks"],
                }),
                queryClient.invalidateQueries({
                    queryKey: ["hrDepartmentKraCompletedTasks"],
                }),
                queryClient.invalidateQueries({
                    queryKey: ["hrCompletedMemberKpa"],
                }),
                queryClient.refetchQueries({
                    queryKey: ["fetchedMonthlyKPA", effectiveDeptId],
                }),
                queryClient.refetchQueries({
                    queryKey: ["fetchedTeamKPAForIndividual", effectiveDeptId],
                }),
                queryClient.refetchQueries({
                    queryKey: ["completedEntriesIndividualKPA", effectiveDeptId],
                }),
                queryClient.refetchQueries({
                    queryKey: ["completedTeamEntriesForIndividual", effectiveDeptId],
                }),
                queryClient.refetchQueries({
                    queryKey: ["tasksRawData"],
                }),
                queryClient.refetchQueries({
                    queryKey: ["performanceMemberWiseKraKpa"],
                }),
                queryClient.refetchQueries({
                    queryKey: ["hrDepartmentKraTasks"],
                }),
                queryClient.refetchQueries({
                    queryKey: ["hrDepartmentKraCompletedTasks"],
                }),
                queryClient.refetchQueries({
                    queryKey: ["hrCompletedMemberKpa"],
                }),
            ]);
            toast.success(data.message || "KPA updated");
        },
        onError: (error) => {
            // toast.success("KPA updated");
            toast.error(error.message || "Error Updating");
        },
    });
    //--------------UPDATE REQUEST FOR MONTHLY KPA-----------------//

    const fetchTasks = async () => {
        try {
            const response = await axios.get(
                `/api/performance/get-tasks?dept=${effectiveDeptId}&type=INDIVIDUALKPA`
            );
            return response.data;
        } catch (error) {
            console.error("Error fetching data:", error);
             return [];
        }
    };
    const { data: departmentKra = [], isPending: departmentLoading } = useQuery({
        queryKey: ["fetchedMonthlyKPA", effectiveDeptId],
        queryFn: fetchTasks,
    });

        const { data: teamKpaForIndividual = [] } = useQuery({
         queryKey: ["fetchedTeamKPAForIndividual", effectiveDeptId],
        queryFn: async () => {
            try {
                const response = await axios.get(
                   `/api/performance/get-tasks?dept=${effectiveDeptId}&type=TEAMKPA`
                );
                return response.data;
            } catch (error) {
                console.error(error);
                return [];
            }
        },
          enabled: !!effectiveDeptId,
    });

    const { data: assignees = [] } = useQuery({
        queryKey: ["fetchAssignees", effectiveDeptId],
        queryFn: async () => {
            const response = await axios.get(`/api/users/assignees?deptId=${effectiveDeptId}`);
            return response.data;
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
    const { data: completedEntries, isLoading: isCompletedLoading } = useQuery({
         queryKey: ["completedEntriesIndividualKPA", effectiveDeptId],
        queryFn: async () => {
            try {
                const response = await axios.get(
                    `/api/performance/get-completed-tasks?dept=${effectiveDeptId}&type=INDIVIDUALKPA`
                );
                return response.data;
            } catch (error) {
                console.error(error);
                 return [];
            }
        },
    });

      const { data: completedTeamEntries = [] } = useQuery({
        queryKey: ["completedTeamEntriesForIndividual", effectiveDeptId],
        queryFn: async () => {
            try {
                const response = await axios.get(
                   `/api/performance/get-completed-tasks?dept=${effectiveDeptId}&type=TEAMKPA`
                );
                return response.data;
            } catch (error) {
                console.error(error);
                return [];
            }
        },
         enabled: !!effectiveDeptId,
    });

    const formatDateTime = (value) =>
        value ? `${humanDate(value)}, ${humanTime(value)}` : "N/A";

    const canSelectRowsForMonthContext =
        !isRestrictedRoleInNonCurrentMonth ||
        (isManagerAdmin && selectedMonthContext === "next");    

    const actionVisibility = useMemo(() => {
        if (isMasterOrSuperAdmin) {
            return { showActionColumn: true, showMarkDone: true, showEdit: true, showDelete: true, disableAll: false };
        }

        if (isManagerAdmin) {
            if (selectedMonthContext === "previous") {
                return { showActionColumn: false, showMarkDone: false, showEdit: false, showDelete: false, disableAll: true };
            }
            if (selectedMonthContext === "next") {
                return { showActionColumn: true, showMarkDone: false, showEdit: true, showDelete: true, disableAll: false };
            }
            return { showActionColumn: true, showMarkDone: true, showEdit: true, showDelete: true, disableAll: false };
        }

        if (isEmployeeOnly) {
            if (selectedMonthContext !== "current") {
                return { showActionColumn: false, showMarkDone: false, showEdit: false, showDelete: false, disableAll: true };
            }
            return { showActionColumn: true, showMarkDone: true, showEdit: true, showDelete: true, disableAll: false };
        }

        return { showActionColumn: true, showMarkDone: true, showEdit: true, showDelete: true, disableAll: false };
    }, [isMasterOrSuperAdmin, isManagerAdmin, isEmployeeOnly, selectedMonthContext]);

    const departmentColumns = [
        { headerName: "Sr No", field: "srNo", width: 100 },
        { headerName: "KPA List", field: "taskName", flex: 1 },
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
        ...((matchingDepartment || isManager) && canShowControls && actionVisibility.showActionColumn   
        // ...(matchingDepartment && canShowControls
    //    ...(matchingDepartment && !shouldHideRowActionsForSelectedMemberView
            ? [
                {
                    headerName: "Actions",
                    pinned: "right",
                    field: "actions",
                    width:250,
                    cellRenderer: (params) => {
                        return (
                            <div className="flex items-center">

                                {/* Mark As Done */}
                                 {actionVisibility.showMarkDone && (
                                <div
                                    role="button"
                                    onClick={() => {
                                        if (
                                            !params.node.selected ||
                                            isUpdatePending ||
                                            isDeletePending
                                        )
                                            return;

                                        updateMonthlyKpa(params.data.mongoId);
                                    }}
                                    className="p-2"
                                >
                                    <PrimaryButton
                                        title={isUpdatePending ? "⏳" : "Mark As Done"}
                                        disabled={
                                            !params.node.selected ||
                                            isUpdatePending ||
                                            isDeletePending
                                        }
                                        className="px-2 py-1 text-xs w-28 h-7"
                                    />
                                </div>

                )}

                 {!isAddKpaDisabled && actionVisibility.showEdit && (
                                    <button
                                        type="button"
                                        title="Edit"
                                        disabled={!params.node.selected || isUpdatePending || isDeletePending}
                                        onClick={() => handleOpenEditModal(params.data)}
                                        className="ml-2 px-2 py-1 text-xs w-10 h-7 flex items-center justify-center disabled:cursor-not-allowed"
                                    >
                                        <HiPencilSquare size={24} color={!params.node.selected ? "#9ca3af" : "#111827"} />
                                    </button>
                                )}

                {/* Delete Recurrence */}
                                {canDeleteRecurrence && actionVisibility.showDelete && (
                                    <button
                                        type="button"
                                        title="Delete Recurrence"
                                        disabled={
                                            !params.node.selected ||
                                            isDeletePending ||
                                            isUpdatePending
                                        }
                                        onClick={() =>
                                            deleteMonthlyKpaRecurrence(params.data.mongoId)
                                        }
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
            : [])
    ];

    const completedColumns = [
        { headerName: "Sr No", field: "srNo", width: 100, sort: "asc" },
        { headerName: "KPA List", field: "taskName", flex: 1 },
        {
            headerName: "Start Date",
            field: "startDate",
            flex: 1,
            exportFormat: "date",
            valueFormatter: (params) => (params.value ? humanDate(params.value) : ""),
        },
        {
            headerName: "End Date",
            field: "endDate",
            flex: 1,
            exportFormat: "date",
            valueFormatter: (params) => (params.value ? humanDate(params.value) : ""),
        },
        { headerName: "Completed By", field: "completedBy",flex: 1},
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
//   const selectedMemberId = activeMember?.memberId?.toString()?.trim();
//     const selectedMemberName = activeMember?.memberName?.toString()?.trim();
     const openAddIndividualModal = () => {
        setModalTaskType("INDIVIDUALKPA");
        setIsEditMode(false);
        setEditingTaskId(null);
        reset({ kpaName: "", startDate: null, endDate: null, description: "", assignTo: targetMemberId || "" });
        setOpenModal(true);
    };

    const openAddTeamModal = () => {
        setModalTaskType("TEAMKPA");
        setIsEditMode(false);
        setEditingTaskId(null);
        reset({
            kpaName: "",
            startDate: null,
            endDate: null,
            description: "",
            assignTo: targetMemberId ? [targetMemberId] : [],
        });
        setOpenModal(true);
    };
    
    const matchesAssignedMember = (assigneeValue) => {
        const assignees = Array.isArray(assigneeValue) ? assigneeValue : [assigneeValue];
        return assignees.some((assignee) => {
            const normalized = (assignee || "").toString().trim();
            if (!normalized) return false;
            return normalized === targetMemberId || normalized === targetMemberName;
        });
    };

    const uniqueTaskMap = new Map();
    [...(departmentKra || []), ...(teamKpaForIndividual || [])].forEach((item) => {
        const taskId = item?.id?.toString?.();
        if (!taskId || uniqueTaskMap.has(taskId)) return;
        uniqueTaskMap.set(taskId, item);
    });

    const filteredDepartmentKpa = Array.from(uniqueTaskMap.values()).filter(
        (item) => {
            if (!targetMemberId && !targetMemberName) return true;
            return matchesAssignedMember(item?.assignedTo);
        }
    );
    const uniqueCompletedMap = new Map();
    [...(completedEntries || []), ...(completedTeamEntries || [])].forEach((item) => {
        const completedId = item?.id?.toString?.() || `${item?.taskName}-${item?.completionDate}`;
        if (uniqueCompletedMap.has(completedId)) return;
        uniqueCompletedMap.set(completedId, item);
    });

    const hasSelectedMember = !!targetMemberId || !!targetMemberName;
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
     const getMonthHeaderLabel = () => {
        const startDate = selectedMonthRange?.startDate;
        if (!startDate) return "Current Month";
        const monthText = dayjs(startDate).format("MMMM YYYY");
        if (selectedMonthContext === "current") return `${monthText}`;
        if (selectedMonthContext === "previous") return `${monthText}`;
        return `${monthText}`;
    };

    const completedEntriesForSelectedMonth = filteredCompletedEntries.filter((item) => {
        if (!selectedMonthRange?.startDate || !selectedMonthRange?.endDate) return true;
        const completedDate = dayjs(item?.completionDate);
        if (!completedDate.isValid()) return false;
        const start = dayjs(selectedMonthRange.startDate).startOf("day");
        const end = dayjs(selectedMonthRange.endDate).endOf("day");
        return (
            (completedDate.isAfter(start) || completedDate.isSame(start)) &&
            (completedDate.isBefore(end) || completedDate.isSame(end))
        );
    });
    return (
        <>
            <div className="flex flex-col gap-4">
                <PageFrame>
                    {!isCompletedLoading && !isUpdatePending ? (
                        <WidgetSection padding layout={1}>
                            <YearWiseTable
                            // checkbox={showCheckBoxForCurrentView && !isRestrictedRoleInNonCurrentMonth}
                             checkbox={showCheckBoxForCurrentView && canSelectRowsForMonthContext}
                                // checkbox={showCheckBoxForCurrentView}
                               // tableTitle={`${departmentName} INDIVIDUAL - MONTHLY KPA`}
                                // tableTitle={`${departmentName} INDIVIDUAL - MONTHLY KPA - ${loggedInUserName || "User Name"}`}
                                tableTitle={`${departmentName} - INDIVIDUAL MONTHLY KPA - ${activeMemberName}`}
                                // buttonTitle={"Add Monthly KPA"}
                                // buttonDisabled={isAddKpaDisabled}
                                //    handleSubmit={() => {
                                //   buttonTitle={
                                //     shouldHideAddButtonForSelectedMemberView
                                //         ? undefined
                                //         : "Add Monthly KPA"
                                // }
                                // buttonDisabled={
                                //     isAddKpaDisabled || shouldHideAddButtonForSelectedMemberView
                                //  buttonTitle={
                                //                                       hideMemberLevelControls || !canShowControls || isRestrictedRoleInNonCurrentMonth
                                //         ? undefined
                                //         : "Add Monthly KPA"
                                buttonTitle={showAddMonthlyKpaButton ? "Add Individual Monthly KPA" : undefined}
                                buttonDisabled={
                                     hideMemberLevelControls || isAddKpaDisabled || !canShowControls || isRestrictedRoleInNonCurrentMonth
                                }
                                // handleSubmit={() => {    
                                //     setIsEditMode(false);
                                //     setEditingTaskId(null);
                                //     setOpenModal(true);
                                // }}
                                  handleSubmit={openAddIndividualModal}
                                middleButtonTitle={
                                    !showAddTeamMonthlyKpaButton
                                        ? undefined
                                        : "Add Team Monthly KPA"
                                }
                                middleButtonDisabled={
                                    !showAddTeamMonthlyKpaButton
                                }
                                handleMiddleSubmit={openAddTeamModal}
                                key={departmentKra.length}
                                data={[
                                      ...filteredDepartmentKpa
                                        .filter((item) => item.status !== "Completed")
                                        .map((item, index) => ({
                                            mongoId: item.id,
                                            taskName: item.taskName,
                                            assignedDate: item.assignedDate,
                                            dueDate: item.dueDate,
                                            status: item.status,
                                            assignedTo: item.assignedTo,
                                        })),
                                ]}
                                dateColumn={"dueDate"}
                                columns={departmentColumns}
                                preserveCurrentMonthRange
                                 onDateFilterChange={({ selectedRange }) => {
                                    const monthSource = selectedRange?.startDate || selectedRange?.endDate;
                                    setSelectedMonthContext(getMonthContext(monthSource));
                                      const nextContext = getMonthContext(monthSource);
                                    setSelectedMonthContext((prev) =>
                                        prev === nextContext ? prev : nextContext
                                    );
                                    setSelectedMonthRange((prev) =>
                                        isSameRange(prev, selectedRange || null)
                                            ? prev
                                            : (selectedRange || null)
                                    );
                                }}
                            />
                        </WidgetSection>
                    ) : (
                        <div className="h-72 flex items-center justify-center">
                            <CircularProgress />
                        </div>
                    )}
                </PageFrame>
                <PageFrame>
                    {!isCompletedLoading ? (
                        <WidgetSection padding layout={1}>
                            <YearWiseTable
                                // exportData={true}
                                // tableTitle={`COMPLETED INDIVIDUAL - MONTHLY KPA - ${loggedInUserName || "User Name"}`}
                                // key={completedEntries.length}
                                // data={[
                                //     ...completedEntries.map((item, index) => ({
                                //        tableTitle={`COMPLETED INDIVIDUAL - MONTHLY KPA - ${activeMemberName}`}
                                // key={filteredCompletedEntries.length}
                               tableTitle={`COMPLETED - INDIVIDUAL MONTHLY KPA - ${activeMemberName} - ${getMonthHeaderLabel()}`}
                                key={completedEntriesForSelectedMonth.length}
                                hideDateControls={true}
                                exportData={selectedMonthContext !== "next"}
                                taskExportDateTimeFormatting
                                data={[
                                     ...completedEntriesForSelectedMonth.map((item, index) => ({    
                                    // ...filteredCompletedEntries.map((item, index) => ({
                                        taskName: item.taskName,
                                        startDate: item.assignedDate,
                                        endDate: item.dueDate,
                                        completedAt: item.completionDate,
                                        completedBy: item.completedBy,
                                        status: item.status,
                                    })),
                                ]}
                                dateColumn={"dueDate"}
                                columns={completedColumns}
                            />
                        </WidgetSection>
                    ) : (
                        <div className="h-72 flex items-center justify-center">
                            <CircularProgress />
                        </div>
                    )}
                </PageFrame>
            </div>

            <MuiModal
                open={openModal}
                onClose={resetModalState}
             // title={isEditMode ? "Edit Task" : "Add Monthly KPA"}
                           title={isEditMode ? "Edit Task" : modalTaskType === "TEAMKPA" ? "Add Team Monthly KPA" : "Add Individual Monthly KPA"}
            >
                <form
                    onSubmit={submitDailyKra(handleFormSubmit)}
                    className="grid grid-cols-1 lg:grid-cols-1 gap-4"
                >
                    <Controller
                        name="kpaName"
                        control={control}
                        rules={{
                            required: "KPA Name is required",
                            validate: {
                                noOnlyWhitespace,
                                isAlphanumeric,
                            },
                        }}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                size="small"
                                label={"KPA Name"}
                                fullWidth
                                error={!!errors?.kpaName?.message}
                                helperText={errors?.kpaName?.message}
                            />
                        )}
                    />
                    {/* <Controller
            name="description"
            control={control}
            rules={{ required: "Description is required" }}
            render={({ field }) => (
              <TextField
                {...field}
                size="small"
                label={"Description"}
                multiline
                rows={4}
                fullWidth
                error={!!errors?.description?.message}
                helperText={errors?.description?.message}
              />
            )}
          /> */}
                    <Controller
                        name="startDate"
                        control={control}
                        rules={{
                            required: "Start date is required",
                            validate: (value) => {
                                if (!value) return true; // already handled by required
                                const today = dayjs().startOf("day");
                                const selected = dayjs(value);
                                if (selected.isBefore(today)) {
                                    return "Start date cannot be in the past.";
                                }
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
                            validate: (value) => {
                                if (!value) return "End date is required";
                                const today = dayjs().startOf("day");
                                const selected = dayjs(value);
                                if (!selected.isValid()) return "Invalid date selected";
                                if (selected.isBefore(today)) {
                                    return "End date cannot be in the past.";
                                }
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

                    {/* removed assignTo dropdown */}
                     {modalTaskType === "TEAMKPA" && (
                        <Controller
                            name="assignTo"
                            control={control}
                            rules={{ required: "Assign To is required" }}
                            render={({ field }) => (
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
                                    error={!!errors?.assignTo?.message}
                                    helperText={errors?.assignTo?.message}
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
                                    {assignees?.map((member) => (
                                        <MenuItem key={member.id} value={member.id}>
                                            {member.name}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            )}
                        />
                    )}  

                    <PrimaryButton
                        type="submit"
                        title={"Submit"}
                        disabled={isAddKpaPending}
                        isLoading={isAddKpaPending}
                    />
                </form>
            </MuiModal>
        </>
    );
};

export default PerformanceIndividualKpa;
