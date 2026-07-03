import { useLocation, useParams } from "react-router-dom";
import AgTable from "../../../components/AgTable";
import WidgetSection from "../../../components/WidgetSection";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import humanTime from "../../../utils/humanTime";
import humanDate from "../../../utils/humanDateForamt";
import {
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import MuiModal from "../../../components/MuiModal";
import { Controller, useForm } from "react-hook-form";
import PrimaryButton from "../../../components/PrimaryButton";
import useAuth from "../../../hooks/useAuth";
import { toast } from "sonner";
import { queryClient } from "../../../main";
import { FaCheck } from "react-icons/fa6";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import {
  DatePicker,
  LocalizationProvider,
  TimePicker,
} from "@mui/x-date-pickers";
import dayjs from "dayjs";
import DetalisFormatted from "../../../components/DetalisFormatted";
import PageFrame from "../../../components/Pages/PageFrame";
// import { isAlphanumeric, noOnlyWhitespace } from "../../../utils/validators";
import { noOnlyWhitespace } from "../../../utils/validators";
import { MdDeleteForever } from "react-icons/md";
import { HiPencilSquare } from "react-icons/hi2";
import YearWiseTable from "../../../components/Tables/YearWiseTable";
import { formatDateTimeFields } from "../../../utils/formatDateTime";

const TasksViewDepartment = () => {
  const getCurrentMonthRange = () => ({
    startDate: dayjs().startOf("month").toDate(),
    endDate: dayjs().endOf("month").toDate(),
    key: "selection",
  });
  const axios = useAxiosPrivate();
  const { auth } = useAuth();
  const { department } = useParams();
  const [openModal, setOpenModal] = useState(false);
  const deptId = useSelector((state) => state.performance.selectedDepartment);
  const [openMultiModal, setOpenMultiModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState({});
  const [modalMode, setModalMode] = useState("");
  const [selectedTaskRange, setSelectedTaskRange] = useState(
    getCurrentMonthRange,
  );
  const [selectedCompletedTaskRange, setSelectedCompletedTaskRange] =
    useState(getCurrentMonthRange);
  const EXCEPTIONAL_DEPARTMENT_IDS = [
    "67b2cf85b9b6ed5cedeb9a2e",
    // more exceptional department IDs...
  ];

  const isEmployee = auth?.user?.role?.some((role) =>
    role?.roleTitle?.toLowerCase().includes("employee"),
  );
  const currentUserId = auth?.user?._id;
  const roleTitles = auth?.user?.role?.map((role) => role?.roleTitle || "") || [];
  const isMasterOrSuperAdmin = roleTitles.some(
    (roleTitle) => roleTitle === "Master Admin" || roleTitle === "Super Admin",
  );
  const isDepartmentAdmin = roleTitles.some(
    (roleTitle) =>
      roleTitle.endsWith("Admin") &&
      roleTitle !== "Master Admin" &&
      roleTitle !== "Super Admin",
  );
  const canViewAssignedSummary = isEmployee || isDepartmentAdmin;
  const canViewDepartmentWidePending = isDepartmentAdmin || isMasterOrSuperAdmin;

  // Check if the selected department is in user's list
  const isUserDepartment = auth?.user?.departments?.some(
    (dept) => dept._id === deptId,
  );

  // Check if the user has any department that is exceptional
  const isExceptionalDepartment = auth?.user?.departments?.some((dept) =>
    EXCEPTIONAL_DEPARTMENT_IDS.includes(dept._id),
  );

  const hasAccess = isUserDepartment || isExceptionalDepartment;

  const resdepartment =
    auth?.user?.departments?.find((dept) => dept._id === deptId)?.name ||
    (isExceptionalDepartment ? "EXCEPTIONAL DEPARTMENT" : "UNKNOWN");

  const allowedDept = auth.user.departments.some((item) => {
    return item._id.toString() === deptId.toString();
  });

  const showCheckBox = allowedDept;

  const refreshDepartmentTaskQueries = () => {
    queryClient.invalidateQueries({ queryKey: ["fetchedTasks"] });
    queryClient.invalidateQueries({ queryKey: ["fetchedCompletedTasks"] });
    queryClient.invalidateQueries({ queryKey: ["fetchedDepartmentsTasks"] });
    queryClient.invalidateQueries({ queryKey: ["departmentWideTasksSummary"] });
    queryClient.invalidateQueries({ queryKey: ["tasks"] });
    queryClient.invalidateQueries({ queryKey: ["tasks-summary"] });
  };

  const {
    handleSubmit: submitDailyKra,
    control,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm({
    mode: "onChange",
    defaultValues: {
      taskName: "",
      description: "",
      assignTo: "",
      startDate: null,
      endDate: null,
      dueTime: null,
      location: "",
      unit: "",
    },
  });

  const watchLocation = watch("location");

  const { data: unitsData = [], isPending: isUnitsPending } = useQuery({
    queryKey: ["departmentTaskUnits"],
    queryFn: async () => {
      const response = await axios.get("/api/company/fetch-units");
      return response.data;
    },
  });


  const { data: departmentMembers = [], isPending: isMembersPending } = useQuery({
    queryKey: ["departmentAssignees", deptId],
    queryFn: async () => {
      const response = await axios.get(`/api/users/assignees?deptId=${deptId}`);
      return response.data;
    },
    enabled: Boolean(deptId),
  });
 const assigneeOptions = useMemo(() => {
    const options = [...(departmentMembers || [])];

    const currentUserId = auth?.user?._id;
    const currentUserName =
      [auth?.user?.firstName, auth?.user?.lastName].filter(Boolean).join(" ").trim() ||
      auth?.user?.name;

    if (!currentUserId || !currentUserName) {
      return options;
    }

    const hasCurrentUser = options.some(
      (member) => member?.id === currentUserId || member?._id === currentUserId,
    );

    if (!hasCurrentUser) {
      options.unshift({
        id: currentUserId,
        name: currentUserName,
      });
    }

    return options;
  }, [departmentMembers, auth?.user?._id, auth?.user?.firstName, auth?.user?.lastName, auth?.user?.name]);
  useEffect(() => {
    setValue("unit", "");
  }, [setValue, watchLocation]);
  //----------function handlers-------------//
  const handleViewTask = (data) => {
    setModalMode("view");
    setOpenMultiModal(true);
    setSelectedTask(data);
  };
  //----------function handlers-------------//
  //--------------POST REQUEST FOR DAILY KRA-----------------//
  const { mutate: addDailyKra, isPending: isAddKraPending } = useMutation({
    mutationKey: ["addDailyTasks"],
    mutationFn: async (data) => {
      const response = await axios.post("/api/tasks/create-tasks", {
        taskName: data.taskName,
        startDate: data.startDate,
        endDate: data.endDate,
        dueTime: data.dueTime,
        description: data.description,
        assignTo: data.assignTo,
        department: deptId,
        taskType: "Department",
        location: data.unit,
      });
      return response.data;
    },
    onSuccess: (data) => {
      refreshDepartmentTaskQueries();
      toast.success(data.message || "KRA Added");
      setOpenModal(false);
      reset(); // clear out old junk after closing
    },
    onError: (error) => {
      toast.error(error.message || "Error Adding KRA");
    },
  });
  const handleFormSubmit = (data) => {
      if (modalMode === "edit-task" && selectedTask?.id) {
      editDepartmentTask({
        id: selectedTask.id,
        data: {
          taskName: data.taskName,
          description: data.description,
          assignTo: data.assignTo,
          startDate: data.startDate,
          endDate: data.endDate,
          dueTime: data.dueTime,
          location: data.unit,
        },
      });
      return;
    }
    addDailyKra(data);
  };

  const isManagerLevel = !isEmployee;

  const { mutate: deleteDepartmentTask, isPending: isDeletePending } =
    useMutation({
      mutationKey: ["deleteDepartmentTask"],
      mutationFn: async (taskId) => {
        const response = await axios.patch(`/api/tasks/delete-task/${taskId}`);
        return response.data;
      },
      onSuccess: (data) => {
        refreshDepartmentTaskQueries();
        toast.success(data.message || "Task deleted");
      },
      onError: (error) => {
        toast.error(error.message || "Error deleting task");
      },
    });

  const { mutate: updateDailyKra, isPending: isUpdatePending } = useMutation({
    mutationKey: ["updateDailyTasks"],
    mutationFn: async (data) => {
      const response = await axios.patch(
        `/api/tasks/update-task-status/${data}`,
      );
      return response.data;
    },
    onSuccess: (data) => {
      refreshDepartmentTaskQueries();
      toast.success(data.message || "DATA UPDATED");
    },
    onError: (error) => {
      toast.error(error.message || "Error Updating");
    },
  });

   const { mutate: editDepartmentTask, isPending: isEditPending } = useMutation({
    mutationKey: ["editDepartmentTask"],
    mutationFn: async ({ id, data }) => {
      const response = await axios.patch(`/api/tasks/update-task/${id}`, data);
      return response.data;
    },
    onSuccess: (data) => {
      refreshDepartmentTaskQueries();
      toast.success(data.message || "Task updated");
      setOpenModal(false);
      reset();
    },
    onError: (error) => {
      toast.error(error.message || "Error updating task");
    },
  });

  //--------------POST REQUEST FOR DAILY KRA-----------------//

  const fetchDepartments = async () => {
    try {
      const response = await axios.get(`api/tasks/get-tasks?dept=${deptId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const fetchCompletedTasks = async () => {
    try {
      const response = await axios.get(
        `api/tasks/get-completed-tasks/${deptId}`,
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const { data: departmentKra = [], isPending: departmentLoading } = useQuery({
    queryKey: ["fetchedTasks"],
    queryFn: fetchDepartments,
  });

  const { data: departmentWideTasks = [] } = useQuery({
    queryKey: ["departmentWideTasksSummary"],
    queryFn: async () => {
      const response = await axios.get("/api/tasks/get-all-tasks");
      return Array.isArray(response.data) ? response.data : [];
    },
  });

  const { data: completedTasks = [], isLoading: completedTasksFetchPending } =
    useQuery({
      queryKey: ["fetchedCompletedTasks"],
      queryFn: fetchCompletedTasks,
    });
 const departmentMemberMap = useMemo(
    () => {
      const membersMap = new Map(
        (departmentMembers || []).map((member) => [member.id, member.name]),
      );

      const currentUserId = auth?.user?._id;
      const currentUserName = [auth?.user?.firstName, auth?.user?.lastName]
        .filter(Boolean)
        .join(" ")
        .trim();

      if (currentUserId && currentUserName) {
        membersMap.set(currentUserId, currentUserName);
      }

      return membersMap;
    },
    [departmentMembers, auth?.user?._id, auth?.user?.firstName, auth?.user?.lastName],
  );

  const formatAssignedTo = (assignedTo) => {
    if (!assignedTo) return "-";

    const isObjectId = (value) => /^[a-f\d]{24}$/i.test(value);

    if (typeof assignedTo === "string") {
      const normalized = assignedTo.trim();
      if (!normalized) return "-";
      if (isObjectId(normalized)) {
        return departmentMemberMap.get(normalized) || "-";
      }
      return normalized;
    }

    if (!Array.isArray(assignedTo) || assignedTo.length === 0) {
      return "-";
    }

    const formattedNames = assignedTo
      .map((member) => {
        if (typeof member === "string") {
          if (isObjectId(member)) {
            return departmentMemberMap.get(member) || "";
          }
          return member;
        }
        return [member?.firstName, member?.lastName].filter(Boolean).join(" ");
      })
      .filter(Boolean);

    return formattedNames.length > 0 ? formattedNames.join(", ") : "-";
  };

  const isTaskAssignedToCurrentUser = (assignedTo) => {
    if (!currentUserId || !assignedTo) return false;

    if (typeof assignedTo === "string") {
      return assignedTo === currentUserId;
    }

    if (Array.isArray(assignedTo)) {
      return assignedTo.some((member) => {
        if (typeof member === "string") return member === currentUserId;
        return member?._id === currentUserId || member?.id === currentUserId;
      });
    }

    return assignedTo?._id === currentUserId || assignedTo?.id === currentUserId;
  };

  const pendingDepartmentTasks = useMemo(
    () =>
      (departmentKra || [])
        .filter(
          (item) =>
            item.taskType === "Department" && item.status !== "Completed",
        )
        .map((item, index) => ({
          srno: index + 1,
          id: item._id,
          taskName: item.taskName,
          description: item.description,
          assignedDate: item.assignedDate,
          status: item.status,
          dueDate: item.dueDate,
          dueTime: item.dueTime,
          assignToId: Array.isArray(item.assignedTo)
            ? item.assignedTo?.[0]?._id
            : item.assignedTo?._id || "",
          locationId: item.location?.building?._id || "",
          unitId: item.location?._id || "",
          location: item.location,
          unitNo: item.location?.unitNo || "N/A",
          assignedBy: `${item.assignedBy.firstName} ${item.assignedBy.lastName}`,
          assignedTo: formatAssignedTo(item.assignedTo),
          rawAssignedTo: item.assignedTo,
        })),
    [departmentKra, departmentMemberMap],
  );

  const departmentWidePendingTasks = useMemo(
    () =>
      (departmentWideTasks || [])
        .filter(
          (item) =>
            item?.taskType === "Department" &&
            item?.status !== "Completed" &&
            String(item?.department || "").toLowerCase() ===
              String(department || "").toLowerCase(),
        )
        .map((item, index) => ({
          srno: index + 1,
          id: item._id,
          taskName: item.taskName,
          description: item.description,
          assignedDate: item.assignedDate,
          status: item.status,
          dueDate: item.dueDate,
          dueTime: item.dueTime,
          assignToId: Array.isArray(item.assignedTo)
            ? item.assignedTo?.[0]?._id
            : item.assignedTo?._id || "",
          locationId: item.location?.building?._id || "",
          unitId: item.location?._id || "",
          location: item.location,
          unitNo: item.location?.unitNo || "N/A",
          assignedBy:
            item.assignedBy?.firstName || item.assignedBy?.lastName
              ? `${item.assignedBy?.firstName || ""} ${item.assignedBy?.lastName || ""}`.trim()
              : item.assignedBy || "-",
          assignedTo: formatAssignedTo(item.assignedTo),
          rawAssignedTo: item.assignedTo,
        })),
    [departmentWideTasks, department, departmentMemberMap],
  );

  const completedDepartmentTasks = useMemo(
    () =>
      completedTasksFetchPending
        ? []
        : completedTasks
            .filter((item) => item.taskType === "Department")
            .map((item) => ({
              id: item._id,
              taskName: item.taskName,
              completedBy: item.completedBy,
              assignedDate: item.assignedDate,
              description: item.description,
              dueDate: item.dueDate,
              dueTime: item.dueTime,
              location: item.location,
              unitNo: item.location?.unitNo || "N/A",
              buildingName: item.location?.building?.buildingName || "N/A",
              completedDate: item.completedDate,
              completedDateLabel: humanDate(item.completedDate),
              completedTime: item.completedDate,
              assignedTo: formatAssignedTo(item.assignedTo),
              rawAssignedTo: item.assignedTo,
              assignedBy:
                item.assignedBy?.firstName || item.assignedBy?.lastName
                  ? `${item.assignedBy?.firstName || ""} ${item.assignedBy?.lastName || ""}`.trim()
                  : item.assignedBy || "-",
              status: item.status,
            })),
    [completedTasks, completedTasksFetchPending, departmentMemberMap],
  );

  const taskSummary = useMemo(() => {
    const selectedRangeStart = selectedTaskRange?.startDate
      ? dayjs(selectedTaskRange.startDate)
      : dayjs();

    const isSelectedMonthTask = (value) => {
      if (!value) return false;
      const date = dayjs(value);
      return date.isValid() && date.isSame(selectedRangeStart, "month");
    };

    const departmentWideDepartmentTasks = (departmentWideTasks || []).filter(
      (item) =>
        item?.taskType === "Department" &&
        isSelectedMonthTask(item?.assignedDate) &&
        String(item?.department || "").toLowerCase() ===
          String(department || "").toLowerCase(),
    );

    const departmentWideCompletedTasks = departmentWideDepartmentTasks.filter(
      (task) => task?.status === "Completed",
    );

    const departmentWidePendingTasks = departmentWideDepartmentTasks.filter(
      (task) => task?.status !== "Completed",
    );

    const assignedCount = canViewAssignedSummary
      ? [...pendingDepartmentTasks, ...completedDepartmentTasks].filter((task) =>
          isTaskAssignedToCurrentUser(task.rawAssignedTo) &&
          isSelectedMonthTask(task?.assignedDate),
        ).length
      : 0;

    return {
      total: departmentWideDepartmentTasks.length,
      completed: departmentWideCompletedTasks.length,
      pending: departmentWidePendingTasks.length,
      assigned: assignedCount,
    };
  }, [
    canViewAssignedSummary,
    department,
    departmentWideTasks,
    pendingDepartmentTasks,
    completedDepartmentTasks,
    selectedTaskRange,
  ]);

  const visiblePendingTasks = canViewDepartmentWidePending
    ? departmentWidePendingTasks
    : pendingDepartmentTasks;
  const currentMonthLabel = (
    selectedTaskRange?.startDate ? dayjs(selectedTaskRange.startDate) : dayjs()
  ).format("MMMM");
  const completedMonthLabel = (
    selectedCompletedTaskRange?.startDate
      ? dayjs(selectedCompletedTaskRange.startDate)
      : dayjs()
  ).format("MMMM");
  const handlePendingTaskRangeChange = ({ selectedRange }) => {
    setSelectedTaskRange((prev) => {
      const prevStart = prev?.startDate ? dayjs(prev.startDate).valueOf() : null;
      const prevEnd = prev?.endDate ? dayjs(prev.endDate).valueOf() : null;
      const nextStart = selectedRange?.startDate
        ? dayjs(selectedRange.startDate).valueOf()
        : null;
      const nextEnd = selectedRange?.endDate
        ? dayjs(selectedRange.endDate).valueOf()
        : null;

      if (prevStart === nextStart && prevEnd === nextEnd) {
        return prev;
      }

      return selectedRange;
    });
  };
  const handleCompletedTaskRangeChange = ({ selectedRange }) => {
    setSelectedCompletedTaskRange((prev) => {
      const prevStart = prev?.startDate ? dayjs(prev.startDate).valueOf() : null;
      const prevEnd = prev?.endDate ? dayjs(prev.endDate).valueOf() : null;
      const nextStart = selectedRange?.startDate
        ? dayjs(selectedRange.startDate).valueOf()
        : null;
      const nextEnd = selectedRange?.endDate
        ? dayjs(selectedRange.endDate).valueOf()
        : null;

      if (prevStart === nextStart && prevEnd === nextEnd) {
        return prev;
      }

      return selectedRange;
    });
  };

  const departmentColumns = [
    { headerName: "Sr No", field: "srNo", width: 100, sort: "asc" },
    {
      headerName: "Task List",
      field: "taskName",
      flex:1,
      cellRenderer: (params) => (
        <div
          role="button"
          onClick={() => {
            setModalMode("view");
            setSelectedTask(formatDateTimeFields(params.data));
            setOpenMultiModal(true);
          }}
          className="text-primary underline cursor-pointer"
        >
          {params.value}
        </div>
      ),
    },
    { headerName: "Added By", field: "assignedBy", flex:1,},
    { headerName: "Assign To", field: "assignedTo",flex:1, },
    { headerName: "Start Date", field: "assignedDate" ,flex:1,},
    // { headerName: "Assigned Time", field: "createdAt" },
    {
      headerName: "Due Date",
      field: "dueDate",
      flex:1,
      cellRenderer: (params) => {
        const formattedDate = humanDate(params.data?.dueDate);
        const formattedTime = humanTime(params.data?.dueTime);

        return [formattedDate, formattedTime].filter(Boolean).join(", ");
      },
    },
    {
      headerName: "Unit No",
      field: "unitNo",
      flex:1,
    },
    {
      field: "status",
      headerName: "Status",
      flex:1,
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
    {
      headerName: "Actions",
      pinned: "right",
      field: "actions",
      width:250,
      cellRenderer: (params) => {
        return (
          <div className="flex items-center">
            {/* Mark As Done */}
            <div
              role="button"
              onClick={() => {
                if (!params.node.selected || isUpdatePending || isDeletePending)
                  return;
                updateDailyKra(params.data.id);
              }}
              className="p-2"
            >
              <PrimaryButton
                title={isUpdatePending ? "⏳" : "Mark As Done"}
                disabled={
                  !params.node.selected || isUpdatePending || isDeletePending
                }
                className="px-2 py-1 text-xs w-28 h-7"
              />
            </div>

             {/* Edit Button */}
               {isManagerLevel && (
              <button
                type="button"
                title="Edit Task"
                disabled={
                  !params.node.selected ||
                  isDeletePending ||
                  isUpdatePending ||
                  isEditPending
                }
                onClick={() => {
                  const taskData = params.data;
                  setSelectedTask(taskData);
                  setModalMode("edit-task");
                  setOpenModal(true);
                  reset({
                    taskName: taskData?.taskName || "",
                    description: taskData?.description || "",
                    assignTo: taskData?.assignToId || "",
                    location: taskData?.locationId || "",
                    unit: taskData?.unitId || "",
                    startDate: taskData?.assignedDate
                      ? dayjs(taskData.assignedDate).toISOString()
                      : null,
                    endDate: taskData?.dueDate
                      ? dayjs(taskData.dueDate).toISOString()
                      : null,
                    dueTime: taskData?.dueTime ? dayjs(taskData.dueTime) : null,
                  });
                }}
                className="ml-2 p-1 h-7 w-7 flex items-center justify-center disabled:cursor-not-allowed"
              >
                <HiPencilSquare size={26} color={!params.node.selected ? "#9ca3af" : "#111827"} />
              </button>
            )}


            {/* Delete Button */}
            {isManagerLevel && (
              <button
                type="button"
                title="Delete Task"
                disabled={
                  !params.node.selected || isDeletePending || isUpdatePending
                }
                onClick={() => deleteDepartmentTask(params.data.id)}
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
  ];
  const completedColumns = [
    { headerName: "Sr No", field: "srNo", width: 100, sort: "asc" },
    {
      headerName: "Task List",
      field: "taskName",
      flex:1,
      cellRenderer: (params) => (
        <div
          role="button"
          onClick={() => {
            setModalMode("completed");
            setSelectedTask(formatDateTimeFields(params.data));
            setOpenMultiModal(true);
          }}
          className="text-primary underline cursor-pointer"
        >
          {params.value}
        </div>
      ),
    },
    // { headerName: "Assigned Time", field: "assignedDate" },
    {headerName: "Added By", field: "assignedBy", flex:1,hide: true,},
    { headerName: "Assign To", field: "assignedTo", flex:1, },
    { headerName: "Description", field: "description", hide: true },
    { headerName: "Assigned Date", field: "assignedDate", hide: true },
    { headerName: "Due Date", field: "dueDate", hide: true },
    { headerName: "Due Time", field: "dueTime", hide: true },
    { headerName: "Completed By", field: "completedBy", flex:1, },
    { headerName: "Completed Date", field: "completedDate" },
    {
      headerName: "Unit No",
      field: "unitNo",
      flex:1,
    },
    {
      headerName: "Building Name",
      field: "buildingName",
      flex:1,
      hide: true,
    },
    {
      headerName: "Completed Time",
      field: "completedTime",
      flex:1,
    },
    {headerName: "Status", field: "status", hide: true },

    // {
    //   field: "status",
    //   headerName: "Status",
    //   cellRenderer: (params) => {
    //     const statusColorMap = {
    //       Pending: { backgroundColor: "#FFECC5", color: "#CC8400" }, // Light orange bg, dark orange font
    //       InProgress: { backgroundColor: "#ADD8E6", color: "#00008B" }, // Light blue bg, dark blue font
    //       resolved: { backgroundColor: "#90EE90", color: "#006400" }, // Light green bg, dark green font
    //       open: { backgroundColor: "#E6E6FA", color: "#4B0082" }, // Light purple bg, dark purple font
    //       Completed: { backgroundColor: "#16f8062c", color: "#00731b" }, // Light gray bg, dark gray font
    //     };

    //     const { backgroundColor, color } = statusColorMap[params.value] || {
    //       backgroundColor: "gray",
    //       color: "white",
    //     };
    //     return (
    //       <>
    //         <Chip
    //           label={params.value}
    //           style={{
    //             backgroundColor,
    //             color,
    //           }}
    //         />
    //       </>
    //     );
    //   },
    // },
  ];

  return (
    <>
      <div className="flex flex-col gap-4">
        <PageFrame>
          <div>
            {!departmentLoading ? (
              <WidgetSection padding layout={1}>
                <div className="w-full pb-3">
                  <div className="flex justify-between items-center gap-3 flex-wrap">
                    <span className="text-title text-primary font-pmedium uppercase">
                      {department} DEPARTMENT TASKS - {currentMonthLabel}
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <div className="flex gap-1 justify-center items-center uppercase bg-[#dbe4ff] text-sm text-[#274784] font-pmedium px-3 py-1.5 rounded-lg border border-[#aec6fb]">
                        <div>Total :</div>
                        <div>{taskSummary.total}</div>
                      </div>
                      <div className="flex gap-1 justify-center items-center uppercase bg-[#d8f0df] text-sm text-[#16784d] font-pmedium px-3 py-1.5 rounded-lg border border-[#a9ddba]">
                        <div>Completed :</div>
                        <div>{taskSummary.completed}</div>
                      </div>
                      <div className="flex gap-1 justify-center items-center uppercase bg-[#fce8e3] text-sm text-[#d96b4f] font-pmedium px-3 py-1.5 rounded-lg border border-[#f3b7a8]">
                        <div>Pending :</div>
                        <div>{taskSummary.pending}</div>
                      </div>
                      {canViewAssignedSummary && (
                        <div className="flex gap-1 justify-center items-center uppercase bg-[#FFECC5] text-sm text-[#CC8400] font-pmedium px-3 py-1.5 rounded-lg border border-[#F6D48F]">
                          <div>Assigned :</div>
                          <div>{taskSummary.assigned}</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <YearWiseTable
                  checkbox={showCheckBox}
                  buttonTitle={hasAccess && !isEmployee ? "Add Task" : undefined}
                  buttonDisabled={isEmployee}
                  handleSubmit={() => {
                    reset();
                    setModalMode("add-task");
                    setOpenModal(true);
                  }}
                  tableTitle=""
                  data={visiblePendingTasks}
                  dateColumn={"assignedDate"}
                  columns={departmentColumns}
                  initialDateRange={selectedTaskRange}
                  onDateFilterChange={handlePendingTaskRangeChange}
                  hideTitle
                />
              </WidgetSection>
            ) : (
              <div className="h-72 flex items-center justify-center">
                <CircularProgress />
              </div>
            )}
          </div>
        </PageFrame>

        <PageFrame>
          <div>
            {!departmentLoading ? (
              <WidgetSection padding>
                <YearWiseTable
                  tableTitle={`COMPLETED TASK - ${completedMonthLabel}`}
                  exportData={true}
                  taskExportDateTimeFormatting
                  data={completedDepartmentTasks}
                  dateColumn={"completedDate"}
                  columns={completedColumns}
                  initialDateRange={selectedCompletedTaskRange}
                  onDateFilterChange={handleCompletedTaskRangeChange}
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
        title={modalMode === "edit-task" ? "Edit Department Task" : "Add Department Task"}
      >
        <form
          onSubmit={submitDailyKra(handleFormSubmit)}
          className="grid grid-cols-1 lg:grid-cols-1 gap-4"
        >
          <Controller
            name="taskName"
            control={control}
            rules={{
              required: "Task Name is required",
              validate: {
                noOnlyWhitespace,
                // isAlphanumeric,
              },
            }}
            render={({ field }) => (
              <TextField
                {...field}
                size="small"
                label={"Task Name"}
                fullWidth
                error={!!errors?.taskName?.message}
                helperText={errors?.taskName?.message}
              />
            )}
          />
          <Controller
            name="description"
            control={control}
            rules={{
              required: "Description is required",
              validate: {
                noOnlyWhitespace,
                // isAlphanumeric,
              },
            }}
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
          />
           <Controller
            name="assignTo"
            control={control}
            rules={{ required: "Assign To is required" }}
            render={({ field }) => (
              <FormControl size="small" fullWidth error={!!errors.assignTo}>
                <InputLabel>Assign To</InputLabel>
                <Select {...field} label="Assign To">
                  <MenuItem value="">Select Member</MenuItem>
                  {isMembersPending ? (
                    <MenuItem disabled>
                      <CircularProgress size={20} />
                    </MenuItem>
                   ) : assigneeOptions.length > 0 ? (
                    assigneeOptions.map((member) => {
                      const memberId = member.id || member._id;
                      return (
                      <MenuItem key={memberId} value={memberId}>
                        {member.name}
                      </MenuItem>
                      );
                    })
                  ) : (
                    <MenuItem disabled>No Department Members Found</MenuItem>
                  )}
                </Select>
                {errors.assignTo?.message && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.assignTo.message}
                  </p>
                )}
              </FormControl>
            )}
          />
          <Controller
            name="location"
            control={control}
            rules={{ required: "Location is required" }}
            render={({ field }) => (
              <FormControl size="small" fullWidth error={!!errors.location}>
                <InputLabel>Location</InputLabel>
                <Select {...field} label="Work Location">
                  <MenuItem value="">Select Location</MenuItem>
                  {auth.user.company.workLocations.length > 0 ? (
                    auth.user.company.workLocations.map((loc) => (
                      <MenuItem key={loc._id} value={loc._id}>
                        {loc.buildingName}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>No Locations Available</MenuItem>
                  )}
                </Select>
              </FormControl>
            )}
          />

          <Controller
            name="unit"
            control={control}
            rules={{ required: "Unit is required" }}
            render={({ field }) => (
              <TextField
                {...field}
                select
                size="small"
                label="Select Unit"
                disabled={!watchLocation}
                error={!!errors.unit}
                helperText={errors.unit?.message}
              >
                <MenuItem value="" disabled>
                  Select Unit
                </MenuItem>
                {isUnitsPending ? (
                  <MenuItem disabled>
                    <CircularProgress size={20} />
                  </MenuItem>
                ) : (
                  unitsData
                    .filter((item) => item.building?._id === watchLocation)
                    .map((item) => (
                      <MenuItem key={item._id} value={item._id}>
                        {item.unitNo}
                      </MenuItem>
                    ))
                )}
              </TextField>
            )}
          />
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
                  disablePast
                  format="DD-MM-YYYY"
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
                const selected = dayjs(value);
                const today = dayjs().startOf("day");
                if (!selected.isValid()) return "Invalid date selected";
                if (selected.isBefore(today))
                  return "End date cannot be in the past.";
                if (
                  control._formValues.startDate &&
                  selected.isBefore(dayjs(control._formValues.startDate))
                ) {
                  return "End date cannot be before start date.";
                }
                return true;
              },
            }}
            render={({ field, fieldState }) => (
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  {...field}
                  label="End Date"
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
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Controller
              name="dueTime"
              control={control}
              rules={{ required: "Due time is required" }}
              render={({ field }) => (
                <TimePicker
                  label="Due Time"
                  {...field}
                  slotProps={{ textField: { size: "small" } }}
                  renderInput={(params) => (
                    <TextField
                      fullWidth
                      size="small"
                      {...params}
                      helperText={errors?.dueTime?.message}
                      error={!!errors?.dueTime}
                    />
                  )}
                />
              )}
            />
          </LocalizationProvider>
          <PrimaryButton
            type="submit"
            title={modalMode === "edit-task" ? "Update" : "Submit"}
            isLoading={modalMode === "edit-task" ? isEditPending : isAddKraPending}
            disabled={modalMode === "edit-task" ? isEditPending : isAddKraPending}
          />
        </form>
      </MuiModal>

      <MuiModal
        open={openMultiModal}
        onClose={() => setOpenMultiModal(false)}
        title={
          modalMode === "view"
            ? "View Task"
            : modalMode === "completed"
              ? "Completed Tasks"
              : ""
        }
      >
        {modalMode === "view" && selectedTask && (
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-4">
            <div className="col-span-1">
              <DetalisFormatted
                title={"Task"}
                detail={selectedTask?.taskName}
              />
            </div>
            <div className="col-span-1">
              <DetalisFormatted
                title={"Description"}
                detail={selectedTask?.description}
              />
            </div>
            <DetalisFormatted
              title={"Start Date"}
              detail={selectedTask?.assignedDate}
            />
            <DetalisFormatted
              title={"Added By"}
              detail={selectedTask?.assignedBy}
            />
             <DetalisFormatted
              title={"Assign To"}
              detail={selectedTask?.assignedTo || "-"}
            />
            <DetalisFormatted
              title={"Building Name"}
              detail={selectedTask?.location?.building?.buildingName || "-"}
            />
            <DetalisFormatted
              title={"Unit No"}
              detail={selectedTask?.location?.unitNo || "-"}
            />
            <DetalisFormatted
              title={"Due Date"}
              detail={`${selectedTask?.dueDate}, ${selectedTask?.dueTime}`}
            />

            <DetalisFormatted title={"Status"} detail={selectedTask?.status} />
          </div>
        )}
        {modalMode === "completed" && selectedTask && (
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-4">
            <DetalisFormatted title={"Task"} detail={selectedTask?.taskName} />
            <DetalisFormatted
              title={"Description"}
              detail={selectedTask?.description}
            />
            <DetalisFormatted
              title={"Start Date"}
              detail={selectedTask?.assignedDate}
            />
            <DetalisFormatted
              title={"Added By"}
              detail={selectedTask?.assignedBy}
            />
             <DetalisFormatted
              title={"Assign To"}
              detail={selectedTask?.assignedTo || "-"}
            />
            <DetalisFormatted
              title={"Building Name"}
              detail={selectedTask?.location?.building?.buildingName || "-"}
            />
            <DetalisFormatted
              title={"Unit No"}
              detail={selectedTask?.location?.unitNo || "-"}
            />
            <DetalisFormatted
              title={"Completed Date"}
              detail={`${selectedTask?.completedDate}, ${selectedTask?.completedTime}`}
            />
            <DetalisFormatted
              title={"Completed By"}
              detail={selectedTask?.completedBy}
            />
            <DetalisFormatted
              title={"Due Date"}
              detail={`${selectedTask?.dueDate}, ${selectedTask?.dueTime}`}
            />

            <DetalisFormatted title={"Status"} detail={selectedTask?.status} />
          </div>
        )}
      </MuiModal>
    </>
  );
};

export default TasksViewDepartment;
