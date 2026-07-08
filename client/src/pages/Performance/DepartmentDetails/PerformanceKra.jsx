import { useLocation, useParams } from "react-router-dom";
import AgTable from "../../../components/AgTable";
import WidgetSection from "../../../components/WidgetSection";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import humanTime from "../../../utils/humanTime";
import humanDate from "../../../utils/humanDateForamt";
import { Chip, CircularProgress, TextField } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import MuiModal from "../../../components/MuiModal";
import { Controller, useForm } from "react-hook-form";
import PrimaryButton from "../../../components/PrimaryButton";
import useAuth from "../../../hooks/useAuth";
import { toast } from "sonner";
import { queryClient } from "../../../main";
// import { FaCheck } from "react-icons/fa6";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import { InsertEmoticonTwoTone } from "@mui/icons-material";
import PageFrame from "../../../components/Pages/PageFrame";
import { isAlphanumeric, noOnlyWhitespace } from "../../../utils/validators";
import YearWiseTable from "../../../components/Tables/YearWiseTable";
import { FaCheckSquare } from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";
import { HiPencilSquare } from "react-icons/hi2";
import { PERMISSIONS } from "../../../constants/permissions";
import useCurrentDay from "../../../hooks/useCurrentDay";
import ConfirmationModal from "../../../components/ConfirmationModal";
const PerformanceKra = () => {
  const axios = useAxiosPrivate();
  const { auth } = useAuth();
  const { department } = useParams();
  const location = useLocation();
  const [openModal, setOpenModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
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
  const [selectedKra, setSelectedKra] = useState(null);
   const [selectedDate, setSelectedDate] = useState(dayjs().startOf("day"));
  const getTodayIsoStart = () => dayjs().startOf("day").toISOString();
  const today = useCurrentDay();

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

  const showCheckBox = allowedDept;
   const userId = auth.user._id;
  const userPermissions = auth?.user?.permissions?.permissions || [];
  const roleTitles =
    auth?.user?.role?.map((role) => role?.roleTitle?.toLowerCase()) || [];
  const isManager = userPermissions.includes(PERMISSIONS.PERFORMANCE_DAILY_KRA.value);
  const isHr = department === "HR";

  const matchingDepartment = auth.user?.departments?.some(
    (dept) => dept._id?.toString() === effectiveDeptId?.toString()
  );
   const selectedMemberFromRoute = location.state?.selectedMember;
  const activeMember = selectedMemberFromRoute || selectedMember;
  //const isEmployeeKraKpaRoute = location.pathname.includes("/employee-KRA-KPA");
  const activeMemberName = isEmployeeKraKpaRoute
    ? loggedInUserName || "User Name"
    : activeMember?.memberName || loggedInUserName || "User Name";
    const loggedInUserId = auth?.user?._id;
  //  const selectedMemberFromRoute = location.state?.selectedMember;
  // const activeMember = selectedMemberFromRoute || selectedMember;
  // const activeMemberName = activeMember?.memberName || loggedInUserName || "User Name";
  const normalizeValue = (value) =>
    (value || "").toString().replace(/\s+/g, " ").trim().toLowerCase();
     const targetMemberId = activeMember?.memberId;
  const targetMemberName = activeMember?.memberName;
  const selectedMemberRole = normalizeValue(activeMember?.memberRole);
  const isSelectedMemberManager = selectedMemberRole.includes("manager");
  const isSelectedMemberEmployee = !!targetMemberId && !isSelectedMemberManager;
  const isSuperOrMasterAdmin =
    roleTitles.some((roleTitle) => roleTitle?.includes("super admin")) ||
    roleTitles.some((roleTitle) => roleTitle?.includes("master admin"));
  const isViewingOwnMember =
    normalizeValue(targetMemberId) === normalizeValue(userId) ||
    normalizeValue(targetMemberName) === normalizeValue(loggedInUserName);
  const canManageSelectedMemberView = isManager || isSuperOrMasterAdmin;
  const shouldForceOwnControlsInEmployeeRoute = isEmployeeKraKpaRoute;
  const shouldHideManagerControlsForSelectedMemberView =
    !isEmployeeKraKpaRoute &&
    isManager &&
    !isSuperOrMasterAdmin &&
    !!activeMember?.memberId &&
    !isViewingOwnMember;
  const selectedDateKey = selectedDate.format("YYYY-MM-DD");
  const todayKey = today.format("YYYY-MM-DD");
  const isCurrentDateView = selectedDateKey === todayKey;
  const isPastDateView = selectedDateKey < todayKey;
  const isFutureDateView = selectedDateKey > todayKey;
  const canShowControls = true;
  const canUseCheckbox =
    isSuperOrMasterAdmin ||
    isCurrentDateView ||
    (isManager && isFutureDateView) ||
    shouldForceOwnControlsInEmployeeRoute;
  const isEmployeeLevel = !isSuperOrMasterAdmin && !isManager;
  const shouldHideActionsForEmployeeFuture = isEmployeeLevel && isFutureDateView;
    // isManager && targetMemberId && !isViewingOwnMember;
  //const isViewingOwnMember =
  //   normalizeValue(activeMember?.memberId) === normalizeValue(userId) ||
  //   normalizeValue(activeMember?.memberName) === normalizeValue(loggedInUserName);
  // const shouldHideControlsForSelectedMemberView =
  //   isManager && activeMember?.memberId && !isViewingOwnMember;

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ["fetchedDepartmentsKRA", effectiveDeptId] });
  }, [effectiveDeptId]);

  const {
    handleSubmit: submitDailyKra,
    control,
    formState: { errors },
    reset,
  } = useForm({
    mode: "onChange",
    defaultValues: {
      dailyKra: "",
      description: "",
      assignedDate: getTodayIsoStart(),
    },
  });

  const { mutate: deleteDailyKraRecurrence, isPending: isDeletePending } = useMutation({
    mutationKey: ["deleteDailyKraRecurrence"],
    mutationFn: async (taskId) => {
      const response = await axios.patch(`/api/performance/delete-recurrence/${taskId}`);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.refetchQueries({ queryKey: ["fetchedDepartmentsKRA", effectiveDeptId] });
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
        task: data.dailyKra,
        taskType: "KRA",
        // description: data.description,
        department: effectiveDeptId,
        assignedDate: data.assignedDate,
      });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["fetchedDepartmentsKRA", effectiveDeptId] });
      queryClient.refetchQueries({ queryKey: ["fetchedDepartmentsKRA", effectiveDeptId] });
      toast.success(data.message || "KRA Added");
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
  const handleOpenEditModal = (task) => {
    setIsEditMode(true);
    setEditingTaskId(task.id);
    reset({
      dailyKra: task.taskName || "",
      assignedDate: task.assignedDate || null,
      description: task.description || "",
    });
    setOpenModal(true);
  };

  const handleOpenAddModal = () => {
    setIsEditMode(false);
    setEditingTaskId(null);
    reset({
      dailyKra: "",
      description: "",
      assignedDate: getTodayIsoStart(),
    });
    setOpenModal(true);
  };

  const handleFormSubmit = async (data) => {
    if (isEditMode && editingTaskId) {
      await axios.patch(`/api/performance/update-task/${editingTaskId}`, {
        task: data.dailyKra,
        assignedDate: data.assignedDate,
        description: data.description || "",
      });
      toast.success("KRA updated successfully");
      queryClient.invalidateQueries({ queryKey: ["fetchedDepartmentsKRA", effectiveDeptId] });
      setOpenModal(false);
      setIsEditMode(false);
      setEditingTaskId(null);
      reset();
      return;
    }
    addDailyKra(data);
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
      queryClient.setQueriesData(
        { queryKey: ["fetchedDepartmentsKRA", effectiveDeptId] },
        (oldData = []) =>
          (oldData || []).filter((item) => {
            const rowId = item?.id || item?._id;
            return rowId?.toString?.() !== taskId?.toString?.();
          })
      );
      queryClient.invalidateQueries({ queryKey: ["fetchedDepartmentsKRA", effectiveDeptId] });
      queryClient.invalidateQueries({ queryKey: ["completedEntries", effectiveDeptId] });
      toast.success(data.message || "KRA updated");
    },
    onError: (error) => {
      toast.success("KRA updated");
      reset();
      // toast.error(error.message || "Error Updating");
    },
  });

  //--------------POST REQUEST FOR DAILY KRA-----------------//

  const fetchDepartments = async () => {
    try {
      const response = await axios.get(
         `/api/performance/get-tasks?dept=${effectiveDeptId}&type=KRA&date=${selectedDateKey}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  const { data: departmentKra = [], isPending: departmentLoading } = useQuery({
    queryKey: ["fetchedDepartmentsKRA", effectiveDeptId, selectedDateKey],
    queryFn: fetchDepartments,
  });
  const uniqueDepartmentKra = useMemo(() => {
    const uniqueMap = new Map();
    (departmentKra || []).forEach((item) => {
      const taskNameKey = (item?.taskName || "").toString().trim().toLowerCase();
      const key = taskNameKey || item?.id?.toString?.() || item?._id?.toString?.();
      const previous = uniqueMap.get(key);
      if (!previous) {
        uniqueMap.set(key, item);
        return;
      }

      const previousDate = dayjs(previous?.assignedDate || previous?.dueDate || previous?.createdAt);
      const currentDate = dayjs(item?.assignedDate || item?.dueDate || item?.createdAt);
      if (currentDate.isValid() && (!previousDate.isValid() || currentDate.isAfter(previousDate))) {
        uniqueMap.set(key, item);
      }
    });
    return Array.from(uniqueMap.values());
  }, [departmentKra]);
  const { data: completedEntries = [], isLoading: isCompletedLoading } =
    useQuery({
       // scoped query key to avoid stale cross-department cache in employee route
      queryKey: ["completedEntries", effectiveDeptId],
      queryFn: async () => {
        try {
          const response = await axios.get(
            `/api/performance/get-completed-tasks?dept=${effectiveDeptId}&type=KRA`
          );
          return response.data;
        } catch (error) {
          console.error(error);
        }
      },
    });

  const departmentColumns = [
    { headerName: "Sr No", field: "srNo", width: 100 },
    { headerName: "KRA List", field: "taskName", flex: 1 },
    { headerName: "DueTime", field: "dueTime",flex: 1 },
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
      ...(((isSuperOrMasterAdmin || !isPastDateView) && canShowControls && !shouldHideActionsForEmployeeFuture && !shouldHideManagerControlsForSelectedMemberView)
   // ...(matchingDepartment && !shouldHideControlsForSelectedMemberView
      ? [
        {
          headerName: "Actions",
          pinned: "right",
          field: "actions",
          width:250,
          cellRenderer: (params) => {
            const rowCanMarkDone = !!params?.data?.canMarkDoneRow;
            const rowCanEditDelete = !!params?.data?.canEditDeleteRow;
            const showMarkAsDone = rowCanMarkDone;
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
                    updateDailyKra(params.data.id || params.data._id);
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
                  {/* Edit Recurrence */}
                  {!isAddKraDisabled && (
                  <>
                    <button
                      type="button"
                      title="Edit"
                      disabled={!isRowSelected || !rowCanEditDelete || isUpdatePending || isDeletePending}
                      onClick={() => {
                        if (!isRowSelected || !rowCanEditDelete) return;
                        handleOpenEditModal(params.data);
                      }}
                      className="ml-2 px-2 py-1 text-xs w-10 h-7 flex items-center justify-center disabled:cursor-not-allowed"
                    >
                      <HiPencilSquare size={24} color={!params.node.selected ? "#9ca3af" : "#111827"} />
                    </button>
                  </>
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

                {/* Delete Recurrence */}
                {canDeleteRecurrence && (
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
                      setDeleteTargetId(params.data.id || params.data._id);
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

    { headerName: "Completed By", field: "completedBy",flex: 1 },
    {
      headerName: "Completed Date",
      field: "completionDate",
      flex: 1,
      hide: true,
      exportFormat: "date",
     // cellRenderer: (params) => humanDate(params.value),
    },
    {
      headerName: "Completed Time",
      field: "completionTime",
      flex: 1,
      exportFormat: "time",
     // cellRenderer: (params) => humanTime(params.value),
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

  const filteredDepartmentKra = isEmployeeKraKpaRoute
    ? uniqueDepartmentKra || []
    : uniqueDepartmentKra || [];
  const uniqueCompletedMap = new Map();
  (completedEntries || []).forEach((item, index) => {
    const stableId = item?.id || item?._id;
    const key =
      stableId?.toString?.() ||
      `${(item?.taskName || "").toString().trim().toLowerCase()}-${index}`;
    if (!uniqueCompletedMap.has(key)) {
      uniqueCompletedMap.set(key, item);
    }
  });
  const filteredCompletedEntries = Array.from(uniqueCompletedMap.values());
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
    const isViewingFutureDate = selectedDateKey > todayKey;
    const canMarkDoneRow =
      isSuperOrMasterAdmin ||
      (isCurrentDateView && rowDateKey <= todayKey);
    const canEditDeleteRow =
      isSuperOrMasterAdmin ||
      (isManager && (isViewingFutureDate || (isCurrentDateView && rowDateKey <= todayKey)));

    return {
      ...item,
      isCarryoverRow: isBackdatedRow,
      canMarkDoneRow,
      canEditDeleteRow,
    };
  });
  const dateWiseCompletedEntries = filteredCompletedEntries.filter((item) => {
    const completionDateKey = toDateKey(
      item.completedDate || item.completionDate || item.completionTime
    );
    const assignedDateKey = toDateKey(item.assignedDate || item.dueDate || item.createdAt);
    return completionDateKey === selectedDateKey || assignedDateKey === selectedDateKey;
  });
  const completedTaskNamesForSelectedDate = new Set(
    dateWiseCompletedEntries.map((item) =>
      (item?.taskName || "").toString().trim().toLowerCase()
    )
  );
  const canShowAddDepartmentKraButton = isEmployeeKraKpaRoute
    ? isSuperOrMasterAdmin || isManager
    : isSuperOrMasterAdmin || isCurrentDateView;
  const getDepartmentRowStyle = (params) => {
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
                checkbox={canUseCheckbox && canShowControls && !shouldHideActionsForEmployeeFuture && !shouldHideManagerControlsForSelectedMemberView}
                buttonTitle={
                  canShowAddDepartmentKraButton
                    ? "Add Department Daily KRA"
                    : undefined
                }
                buttonDisabled={
                  isAddKraDisabled ||
                  !canShowControls ||
                  !canShowAddDepartmentKraButton
                }
                handleSubmit={handleOpenAddModal}
                  showDateNavigator
                selectedDateLabel={selectedDateLabel}
                onPreviousDay={() => setSelectedDate((prev) => prev.subtract(1, "day"))}
                onNextDay={() => setSelectedDate((prev) => prev.add(1, "day"))}
                 tableTitle={`${departmentName} - DEPARTMENT DAILY KRA - ${activeMemberName}`}
                //tableTitle={`${department} DEPARTMENT - DAILY KRA`}
                 //tableTitle={`${departmentName} DEPARTMENT - DAILY KRA`}
                 // tableTitle={`${departmentName} DEPARTMENT - DAILY KRA - ${loggedInUserName || "User Name"}`}
                // data={filteredDepartmentKra
                  data={dateWiseDepartmentKra
                  .filter((item) => {
                    const status = (item?.status || "").toString().trim().toLowerCase();
                    const taskKey = (item?.taskName || "").toString().trim().toLowerCase();
                    const isCompletedOnSelectedDate =
                      taskKey && completedTaskNamesForSelectedDate.has(taskKey);
                    return status !== "completed" && !isCompletedOnSelectedDate;
                  })
                  .map((item, index) => ({
                    srno: index + 1,
                    id: item.id || item._id,
                    _id: item._id || item.id,
                    taskName: item.taskName,
                    assignedDate: item.assignedDate,
                    dueDate: item.dueDate || item.assignedDate,
                    dueTime: item.dueTime,
                    status: item.status,
                    isCarryoverRow: item.isCarryoverRow,
                    canMarkDoneRow: item.canMarkDoneRow,
                    canEditDeleteRow: item.canEditDeleteRow,
                  }))}
                dateColumn={"assignedDate"}
                //columns={departmentColumns}
                  columns={departmentColumns}
                  isRowSelectable={(params) => !!params?.data?.canMarkDoneRow || !!params?.data?.canEditDeleteRow}
                  getRowStyle={getDepartmentRowStyle}
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
                   tableTitle={`COMPLETED - DEPARTMENT DAILY KRA - ${activeMemberName} - ${selectedDateLabel}`}
                  exportData={!isFutureDateView}
                  taskExportDateTimeFormatting
                  checkAll={false}
                  // key={filteredCompletedEntries.length}
                  // data={filteredCompletedEntries.map((item, index) => ({
                      key={dateWiseCompletedEntries.length}
                  data={dateWiseCompletedEntries.map((item, index) => ({
                    srno: index + 1,
                    id: item.id || item._id,
                    taskName: item.taskName,
                    assignedDate: item.assignedDate,
                    completionDateRaw:
                      item.completedDate || item.completionDate || item.dueDate,
                    completionDate:
                      item.completedDate || item.completionDate || item.dueDate,
                    completionTime:
                      item.completedDate ||
                      item.completionTime ||
                      item.completionDate ||
                      item.dueDate,
                 //   completionDate: item.completedDate || item.completionDate || item.dueDate,
                 //   completionTime: item.completedDate || item.completionTime || item.completionDate || item.dueDate,
                    status: item.status,
                    completedBy: item.completedBy,
                  }))}
                    dateColumn={"completionDateRaw"}
                 // dateColumn={"completionDate"}
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
         title={isEditMode ? "Edit Task" : "Add Department Daily KRA"}
      >
        <form
          onSubmit={submitDailyKra(handleFormSubmit)}
          className="grid grid-cols-1 lg:grid-cols-1 gap-4"
        >
          <Controller
            name="dailyKra"
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
                label={"Daily KRA"}
                fullWidth
                error={!!errors?.dailyKra?.message}
                helperText={errors?.dailyKra?.message}
              />
            )}
          />

          <Controller
            name="assignedDate"
            control={control}
            rules={{ required: "Assinged Date Is Required" }}
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

export default PerformanceKra;
