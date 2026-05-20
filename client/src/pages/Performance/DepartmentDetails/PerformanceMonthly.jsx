import { useLocation, useParams } from "react-router-dom";
import AgTable from "../../../components/AgTable";
import WidgetSection from "../../../components/WidgetSection";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useDispatch, useSelector } from "react-redux";
import humanTime from "../../../utils/humanTime";
import humanDate from "../../../utils/humanDateForamt";
import { Chip, CircularProgress, TextField } from "@mui/material";
import PrimaryButton from "../../../components/PrimaryButton";
import { Controller, useForm } from "react-hook-form";
import MuiModal from "../../../components/MuiModal";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
// import { FaCheck } from "react-icons/fa6";
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
import { PERMISSIONS } from "../../../constants/permissions";
const PerformanceMonthly = () => {
  const axios = useAxiosPrivate();
  const dispatch = useDispatch();
  const { auth } = useAuth();
  const location = useLocation();
  const { department } = useParams();
  const [openModal, setOpenModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [activeViewMonthBucket, setActiveViewMonthBucket] = useState("current");
  const [selectedMonthRange, setSelectedMonthRange] = useState(null);
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
   // const activeMemberName = loggedInUserName || "User Name"; 
  //  const selectedMemberFromRoute = location.state?.selectedMember;
  // const activeMember = selectedMemberFromRoute || selectedMember;
  // const activeMemberName = activeMember?.memberName || loggedInUserName || "User Name";  

  const { data: selectedDepartments = [] } = useQuery({
    queryKey: ["performance-selectedDepartments-monthly"],
    queryFn: async () => {
      const response = await axios.get("api/company/get-company-data?field=selectedDepartments");
      return response.data?.selectedDepartments || [];
    },
  });

  const selectedDepartmentManagerName = useMemo(() => {
    const normalize = (value) =>
      (value || "").toString().replace(/\s+/g, " ").trim().toLowerCase();

     const activeDepartmentName = effectiveDepartmentName || departmentName;
    const activeDepartmentId = effectiveDeptId?.toString?.();

    const matchedDepartment = selectedDepartments.find((item) => {
      const itemDepartmentId = item?.department?._id?.toString?.();
      const itemDepartmentName = item?.department?.name;

      return (
        (activeDepartmentId && itemDepartmentId && activeDepartmentId === itemDepartmentId) ||
        (activeDepartmentName &&
          itemDepartmentName &&
          normalize(activeDepartmentName) === normalize(itemDepartmentName))
      );
    });

    return matchedDepartment?.admin || "";
 }, [departmentName, effectiveDepartmentName, effectiveDeptId, selectedDepartments]);

  const activeMemberName = isEmployeeKraKpaRoute
    ? loggedInUserName || "User Name"
    : selectedDepartmentManagerName || loggedInUserName || "User Name";
  const loggedInUserId = auth?.user?._id;

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
  const userPermissions = auth?.user?.permissions?.permissions || [];
  const isManager = userPermissions.includes(PERMISSIONS.PERFORMANCE_MONTHLY_KPA.value);
  const roleTitles = (auth?.user?.role || []).map((role) => role?.roleTitle?.toLowerCase?.() || "");
  const isMasterOrSuperAdmin = roleTitles.some((title) =>
    ["master admin", "super admin"].includes(title)
  );
  const canDeleteRecurrence = !isAddKpaDisabled;
    const getRowMonthBucket = (row) => {
    const rowDate = dayjs(row?.dueDate || row?.assignedDate);
    if (!rowDate.isValid()) return "current";

    const now = dayjs();
    const rowMonth = rowDate.startOf("month");
    const currentMonth = now.startOf("month");

    if (rowMonth.isBefore(currentMonth)) return "previous";
    if (rowMonth.isAfter(currentMonth)) return "next";
    return "current";
  };

  const getRowPermissions = (row) => {
    if (isMasterOrSuperAdmin) {
      return {
        showActionColumn: true,
        showMarkAsDone: true,
        showEdit: true,
        showDelete: true,
        disableRowSelection: false,
      };
    }

    const monthBucket = getRowMonthBucket(row);

    if (monthBucket === "previous") {
      return {
        showActionColumn: false,
        showMarkAsDone: false,
        showEdit: false,
        showDelete: false,
        disableRowSelection: true,
      };
    }

    if (monthBucket === "next") {
      return {
        showActionColumn: true,
        showMarkAsDone: false,
        showEdit: true,
        showDelete: true,
        disableRowSelection: false,
      };
    }

    return {
      showActionColumn: true,
      showMarkAsDone: true,
      showEdit: true,
      showDelete: true,
      disableRowSelection: false,
    };
  };


  const shouldHideAddButtonForManager =
    !isMasterOrSuperAdmin &&
    isManager &&
    ["previous", "next"].includes(activeViewMonthBucket);
  const shouldHideActionsColumnForManager =
    !isMasterOrSuperAdmin &&
    isManager &&
    activeViewMonthBucket === "previous";

  const departmentAccess = [
    "67b2cf85b9b6ed5cedeb9a2e",
    "6798bab9e469e809084e249e",
  ];

  const isTop = auth.user.departments.some((item) => {
    return departmentAccess.includes(item._id.toString());
  });

  const allowedDept = auth.user.departments.some((item) => {
    return item._id.toString() === deptId.toString();
  });

  const isHr = department === "HR";
  // const showCheckBox = !isTop || isHr
  //const showCheckBox = allowedDept;
  const showCheckBox = allowedDept || isManager;

  const matchingDepartment = auth.user?.departments?.some(
    (dept) => dept._id === deptId
  );
  const showActionsColumn =
    (matchingDepartment || isManager || isMasterOrSuperAdmin) &&
    !shouldHideActionsColumnForManager;

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
      assignedDate: null,
    },
  });
  const startDate = watch("startDate");

  //--------------POST REQUEST FOR MONTHLY KPA-----------------//
  const { mutate: addMonthlyKpa, isPending: isAddKpaPending } = useMutation({
    mutationKey: ["addMonthlyKpa"],
    mutationFn: async (data) => {
      const response = await axios.post("/api/performance/create-task", {
        task: data.kpaName,
        taskType: "KPA",
        // description: data.description,
       // department: deptId,
         department: effectiveDeptId,
        assignedDate: data.startDate,
        dueDate: data.endDate,
        kpaDuration: "Monthly",
      });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.refetchQueries({ queryKey: ["fetchedMonthlyKPA"] });
      queryClient.invalidateQueries({ queryKey: ["fetchedMonthlyKPA"] });
      toast.success(data.message || "KPA Added");
      reset();
      reset();
      setOpenModal(false);
         setIsEditMode(false);
      setEditingTaskId(null);
    },
    onError: (error) => {
      queryClient.invalidateQueries({ queryKey: ["fetchedMonthlyKra"] });
      queryClient.refetchQueries({ queryKey: ["fetchedMonthlyKPA"] });
      toast.error("Task type should be KRA");
      setOpenModal(false);
       setIsEditMode(false);
      setEditingTaskId(null);
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
        });
        toast.success("KPA updated successfully");
        queryClient.invalidateQueries({ queryKey: ["fetchedMonthlyKPA"] });
        resetModalState();
      } catch (error) {
        toast.error(error?.response?.data?.message || "Unable to update KPA");
      }
      return;
    }
    addMonthlyKpa(data);
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
    onSuccess: (data) => {
      queryClient.refetchQueries({ queryKey: ["fetchedMonthlyKPA"] });
      queryClient.refetchQueries({ queryKey: ["completedEntriesKPA"] });
      queryClient.invalidateQueries({ queryKey: ["fetchedMonthlyKPA"] });
      queryClient.invalidateQueries({ queryKey: ["completedEntriesKPA"] });
      toast.success(data.message || "KPA updated");
    },
    onError: (error) => {
      // toast.success("KPA updated");
      toast.error(error.message || "Error Updating");
    },
  });
  //--------------UPDATE REQUEST FOR MONTHLY KPA-----------------//

  const { mutate: deleteMonthlyKpaRecurrence, isPending: isDeletePending } = useMutation({
    mutationKey: ["deleteMonthlyKpaRecurrence"],
    mutationFn: async (taskId) => {
      const response = await axios.patch(`/api/performance/delete-recurrence/${taskId}`);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.refetchQueries({ queryKey: ["fetchedMonthlyKPA"] });
      queryClient.refetchQueries({ queryKey: ["completedEntriesKPA"] });
      toast.success(data.message || "KPA recurrence removed");
    },
    onError: () => {
      toast.error("Failed to remove recurrence");
    },
  });

  const fetchDepartments = async () => {
    try {
      const response = await axios.get(
       `/api/performance/get-tasks?dept=${effectiveDeptId}&type=KPA`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  const { data: departmentKra = [], isPending: departmentLoading } = useQuery({
     queryKey: ["fetchedMonthlyKPA", effectiveDeptId],
    queryFn: fetchDepartments,
  });
  const { data: completedEntries, isLoading: isCompletedLoading } = useQuery({
    queryKey: ["completedEntriesKPA", effectiveDeptId],
    queryFn: async () => {
      try {
        const response = await axios.get(
            `/api/performance/get-completed-tasks?dept=${effectiveDeptId}&type=KPA`
        );
        return response.data;
      } catch (error) {
        console.error(error);
      }
    },
  });

  const formatDateTime = (value) =>
    value ? `${humanDate(value)}, ${humanTime(value)}` : "N/A";

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
     ...(showActionsColumn
      ? [
        {
          headerName: "Actions",
          pinned: "right",
          field: "actions",
          width:250,
          cellRenderer: (params) => {
            const rowPermissions = getRowPermissions(params.data);
            const isSelectionBlocked = rowPermissions.disableRowSelection;
            const isRowSelected = params.node.selected && !isSelectionBlocked;

            return (
              <div className="flex items-center">

                {/* Mark As Done */}
                 {rowPermissions.showMarkAsDone && (
                <div
                  role="button"
                  onClick={() => {
                    if (
                      // !params.node.selected ||
                      !isRowSelected ||
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
                       !isRowSelected ||
                      // !params.node.selected ||
                      isUpdatePending ||
                      isDeletePending
                    }
                    className="px-2 py-1 text-xs w-28 h-7"
                  />
                </div>
                  )}

                {/* Edit Recurrence */}
                {/* {!isAddKpaDisabled && ( */}
                  {rowPermissions.showEdit && !isAddKpaDisabled && (
                  <button
                    type="button"
                    title="Edit"
                     disabled={!isRowSelected || isUpdatePending || isDeletePending}
                   // disabled={!params.node.selected || isUpdatePending || isDeletePending}
                    onClick={() => handleOpenEditModal(params.data)}
                    className="ml-2 px-2 py-1 text-xs w-10 h-7 flex items-center justify-center disabled:cursor-not-allowed"
                  >
                    {/* <HiPencilSquare size={24} color={!params.node.selected ? "#9ca3af" : "#111827"} /> */}
                    <HiPencilSquare size={24} color={!isRowSelected ? "#9ca3af" : "#111827"} />
                  </button>
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
                {/* {canDeleteRecurrence && ( */}
                 {rowPermissions.showDelete && canDeleteRecurrence && (
                  <button
                    type="button"
                    title="Delete Recurrence"
                    disabled={
                       !isRowSelected ||
                      // !params.node.selected ||
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
                        color={!isRowSelected ? "gray" : "red"}
                       // color={!params.node.selected ? "gray" : "red"}
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
    { headerName: "KPA List", field: "taskName", flex: 1},
    { headerName: "Start Date", field: "startDateTime", flex: 1, includeTime: true },
    { headerName: "End Date", field: "endDateTime", flex: 1, includeTime: true },
    { headerName: "Completed By", field: "completedBy" ,flex: 1},
    {
      headerName: "Completed At",
      field: "completedAt",
      flex: 1,
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
    const normalizeValue = (value) =>
    (value || "").toString().replace(/\s+/g, " ").trim().toLowerCase();
  const doesTaskBelongToLoggedInUser = (item) => {
   if (!isEmployeeKraKpaRoute || isManager || isMasterOrSuperAdmin) return true;
    const matchCandidates = [
      item?.assignToId,
      item?.assignedToId,
      item?.createdById,
      item?.completedById,
      item?.assignTo,
      item?.assignedTo,
      item?.createdBy,
      item?.completedBy,
    ].flatMap((candidate) => (Array.isArray(candidate) ? candidate : [candidate]));
    return matchCandidates.some((candidate) => {
      const normalizedCandidate = normalizeValue(candidate);
      if (!normalizedCandidate) return false;
      return (
        normalizedCandidate === normalizeValue(loggedInUserId) ||
        normalizedCandidate === normalizeValue(loggedInUserName)
      );
    });
  };
  const filteredDepartmentKpa = (departmentKra || []).filter(doesTaskBelongToLoggedInUser);
  const filteredCompletedEntries = (completedEntries || []).filter(doesTaskBelongToLoggedInUser);
   const selectedMonthLabel = selectedMonthRange?.startDate
    ? dayjs(selectedMonthRange.startDate).format("MMMM YYYY")
    : dayjs().format("MMMM YYYY");
  const completedEntriesForSelectedMonth = selectedMonthRange
    ? filteredCompletedEntries.filter((item) => {
        const completion = dayjs(item?.completionDate);
        if (!completion.isValid()) return false;

        const start = dayjs(selectedMonthRange.startDate).startOf("day");
        const end = dayjs(selectedMonthRange.endDate).endOf("day");
        return completion.isAfter(start.subtract(1, "millisecond")) && completion.isBefore(end.add(1, "millisecond"));
      })
    : filteredCompletedEntries;
  const showCompletedExport = activeViewMonthBucket !== "next";

   const handleDepartmentDateFilterChange = ({ filteredData = [], selectedRange = null }) => {
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

     const nextBucket = (() => {
      if (!filteredData.length) return "current";
      const buckets = new Set(filteredData.map((item) => getRowMonthBucket(item)));
      if (buckets.size === 1) return [...buckets][0];
      return "current";
    })();

    setActiveViewMonthBucket((prev) => (prev === nextBucket ? prev : nextBucket));
  };
  // const filteredDepartmentKpa = (departmentKra || []).filter((item) => {
  //   if (!activeMember?.memberName) return true;
  //   return (item?.assignedTo || "").toString().trim() === activeMember.memberName;
  // });
  // const filteredCompletedEntries = (completedEntries || []).filter((item) => {
  //   if (!activeMember?.memberName) return true;
  //   return (item?.completedBy || "").toString().trim() === activeMember.memberName;
  // });
  return (
    <>
      <div className="flex flex-col gap-4">
        <PageFrame>
          {!isCompletedLoading && !isUpdatePending ? (
            <WidgetSection padding layout={1}>
              <YearWiseTable
                checkbox={showCheckBox}
                  tableTitle={`${departmentName} - DEPARTMENT MONTHLY KPA - ${activeMemberName}`}
                //tableTitle={`${departmentName} DEPARTMENT - MONTHLY KPA - ${loggedInUserName || "User Name"}`}
                //tableTitle={`${department} DEPARTMENT - MONTHLY KPA`}
                // buttonTitle={"Add Monthly KPA"}
                // buttonDisabled={isAddKpaDisabled}
                  buttonTitle={shouldHideAddButtonForManager ? "" : "Add Department Monthly KPA"}
                buttonDisabled={shouldHideAddButtonForManager || isAddKpaDisabled}
                handleSubmit={() => {
                  setIsEditMode(false);
                  setEditingTaskId(null);
                  setOpenModal(true);
                }}
                key={departmentKra.length}
                data={[
                  // ...departmentKra
                  ...filteredDepartmentKpa
                    .filter((item) => item.status !== "Completed")
                    .map((item, index) => ({
                      mongoId: item.id,
                      taskName: item.taskName,
                      assignedDate: item.assignedDate,
                      dueDate: item.dueDate,
                      status: item.status,
                    })),
                ]}
                dateColumn={"dueDate"}
                columns={departmentColumns}
                isRowSelectable={(rowNode) => !getRowPermissions(rowNode?.data).disableRowSelection}
                onDateFilterChange={handleDepartmentDateFilterChange}

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
                // tableTitle={`COMPLETED - MONTHLY KPA - ${loggedInUserName || "User Name"}`}
                // key={completedEntries.length}
                // data={[
                //   ...completedEntries.map((item, index) => ({
                //     tableTitle={`COMPLETED - MONTHLY KPA - ${activeMemberName}`}
                // key={completedEntries.length}
                tableTitle={`COMPLETED - Department Monthly KPA - ${activeMemberName} - ${selectedMonthLabel}`}
                key={`${completedEntriesForSelectedMonth.length}-${selectedMonthLabel}`}
                exportData={showCompletedExport}
                hideDateControls
                data={[
                   ...completedEntriesForSelectedMonth.map((item, index) => ({
                    taskName: item.taskName,
                    assignedDate: item.assignedDate,
                    dueDate: item.dueDate,
                    completionDate: item.completionDate,
                    completionTime: item.completionDate,
                    completedBy: item.completedBy,
                    status: item.status,
                    startDateTime: `${humanDate(item.assignedDate)} ${humanTime(item.assignedDate)}`,
                    endDateTime: `${humanDate(item.dueDate)} ${humanTime(item.dueDate)}`,
                    completedAt: `${humanDate(item.completionDate)} ${humanTime(item.completionDate)}`,
                  })),
                ]}
                 dateColumn={"completionDate"}
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
       title={isEditMode ? "Edit Task" : "Add Department Monthly KPA"}
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

export default PerformanceMonthly;
