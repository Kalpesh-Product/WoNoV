import { useParams } from "react-router-dom";
import AgTable from "../../../components/AgTable";
import WidgetSection from "../../../components/WidgetSection";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import humanTime from "../../../utils/humanTime";
import humanDate from "../../../utils/humanDateForamt";
import { Chip, CircularProgress, TextField } from "@mui/material";
import { useEffect, useState } from "react";
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
const PerformanceKra = () => {
  const axios = useAxiosPrivate();
  const { auth } = useAuth();
  const { department } = useParams();
  const [openModal, setOpenModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const deptId = useSelector((state) => state.performance.selectedDepartment);
   const selectedMember = useSelector((state) => state.performance.selectedMember);
  const selectedDepartmentName = useSelector(
    (state) => state.performance.selectedDepartmentName
  );
  const departmentName =
    selectedDepartmentName ||
    department ||
    auth?.user?.departments?.find((dept) => dept._id === deptId)?.name ||
    "Department";
     const loggedInUserName = [auth?.user?.firstName, auth?.user?.middleName, auth?.user?.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();
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
    return item._id.toString() === deptId.toString();
  });

  const showCheckBox = allowedDept;
   const userId = auth.user._id;
  const userPermissions = auth?.user?.permissions?.permissions || [];
  const isManager = userPermissions.includes(PERMISSIONS.PERFORMANCE_DAILY_KRA.value);
  const isHr = department === "HR";

  const matchingDepartment = auth.user?.departments?.some(
    (dept) => dept._id === deptId
  );
   const selectedMemberFromRoute = location.state?.selectedMember;
  const activeMember = selectedMemberFromRoute || selectedMember;
  const isEmployeeKraKpaRoute = location.pathname.includes("/employee-KRA-KPA");
  const activeMemberName = isEmployeeKraKpaRoute
    ? loggedInUserName || "User Name"
    : activeMember?.memberName || loggedInUserName || "User Name";
  //  const selectedMemberFromRoute = location.state?.selectedMember;
  // const activeMember = selectedMemberFromRoute || selectedMember;
  // const activeMemberName = activeMember?.memberName || loggedInUserName || "User Name";
  const normalizeValue = (value) =>
    (value || "").toString().replace(/\s+/g, " ").trim().toLowerCase();
     const targetMemberId = activeMember?.memberId;
  const targetMemberName = activeMember?.memberName;
  const isViewingOwnMember =
    normalizeValue(targetMemberId) === normalizeValue(userId) ||
    normalizeValue(targetMemberName) === normalizeValue(loggedInUserName);
  const shouldHideControlsForSelectedMemberView =
    isManager && targetMemberId && !isViewingOwnMember;
  const shouldShowManagerControlsInEmployeeRoute = isManager && isEmployeeKraKpaRoute;
  const canShowControls = shouldShowManagerControlsInEmployeeRoute || !shouldHideControlsForSelectedMemberView;
  const canUseCheckbox = showCheckBox || shouldShowManagerControlsInEmployeeRoute;
    // isManager && targetMemberId && !isViewingOwnMember;
  //const isViewingOwnMember =
  //   normalizeValue(activeMember?.memberId) === normalizeValue(userId) ||
  //   normalizeValue(activeMember?.memberName) === normalizeValue(loggedInUserName);
  // const shouldHideControlsForSelectedMemberView =
  //   isManager && activeMember?.memberId && !isViewingOwnMember;

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ["fetchedDepartmentsKRA"] });
  }, [department]);

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
      assignedDate: null,
    },
  });

  const { mutate: deleteDailyKraRecurrence, isPending: isDeletePending } = useMutation({
    mutationKey: ["deleteDailyKraRecurrence"],
    mutationFn: async (taskId) => {
      const response = await axios.patch(`/api/performance/delete-recurrence/${taskId}`);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.refetchQueries({ queryKey: ["fetchedDepartmentsKRA"] });
      queryClient.refetchQueries({ queryKey: ["completedEntries"] });
      toast.success(data.message || "KRA recurrence removed");
    },
    onError: () => {
      toast.error("Failed to remove recurrence");
    },
  });

  //--------------POST REQUEST FOR DAILY KRA-----------------//
  const { mutate: addDailyKra, isPending: isAddKraPending } = useMutation({
    mutationKey: ["addDailyKra"],
    mutationFn: async (data) => {
      const response = await axios.post("/api/performance/create-task", {
        task: data.dailyKra,
        taskType: "KRA",
        // description: data.description,
        department: deptId,
        assignedDate: data.assignedDate,
      });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["fetchedDepartmentsKRA"] });
      queryClient.refetchQueries({ queryKey: ["fetchedDepartmentsKRA"] });
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

  const handleFormSubmit = async (data) => {
    if (isEditMode && editingTaskId) {
      await axios.patch(`/api/performance/update-task/${editingTaskId}`, {
        task: data.dailyKra,
        assignedDate: data.assignedDate,
        description: data.description || "",
      });
      toast.success("KRA updated successfully");
      queryClient.invalidateQueries({ queryKey: ["fetchedDepartmentsKRA"] });
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
    onSuccess: (data) => {
      queryClient.refetchQueries({ queryKey: ["fetchedDepartmentsKRA"] });
      queryClient.refetchQueries({ queryKey: ["completedEntries"] });
      queryClient.invalidateQueries({ queryKey: ["fetchedDepartmentsKRA"] });
      queryClient.invalidateQueries({ queryKey: ["completedEntries"] });
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
        `/api/performance/get-tasks?dept=${deptId}&type=KRA`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  const { data: departmentKra = [], isPending: departmentLoading } = useQuery({
    queryKey: ["fetchedDepartmentsKRA"],
    queryFn: fetchDepartments,
  });
  const { data: completedEntries = [], isLoading: isCompletedLoading } =
    useQuery({
      queryKey: ["completedEntries"],
      queryFn: async () => {
        try {
          const response = await axios.get(
            `/api/performance/get-completed-tasks?dept=${deptId}&type=KRA`
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
      ...(matchingDepartment && canShowControls
   // ...(matchingDepartment && !shouldHideControlsForSelectedMemberView
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
                <div
                  role="button"
                  onClick={() => {
                    if (
                      !params.node.selected ||
                      isUpdatePending ||
                      isDeletePending
                    )
                      return;
                    updateDailyKra(params.data.id);
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
                    //className="px-2 py-1 text-sm w-28"
                    //className="px-2 py-1 text-xs w-28"
                    className="px-2 py-1 text-xs w-28 h-7"
                  />
                </div>
                  {/* Edit Recurrence */}
                   {!isAddKraDisabled && (
                  <>
                    <button
                      type="button"
                      title="Edit"
                      disabled={!params.node.selected || isUpdatePending || isDeletePending}
                      onClick={() => handleOpenEditModal(params.data)}
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
                      !params.node.selected ||
                      isDeletePending ||
                      isUpdatePending
                    }
                    onClick={() => deleteDailyKraRecurrence(params.data.id)}
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
      field: "dueDate",
      flex: 1,
      cellRenderer: (params) => humanDate(params.value),
    },
    {
      headerName: "Completed Time",
      field: "dueDate",
      flex: 1,
      cellRenderer: (params) => humanTime(params.value),
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
  return (
    <>
      <div className="flex flex-col gap-4">
        <PageFrame>
          {!departmentLoading ? (
            <WidgetSection padding layout={1}>
              <YearWiseTable
                formatTime
                // checkbox={showCheckBox && !shouldHideControlsForSelectedMemberView}
                // buttonTitle={
                //   shouldHideControlsForSelectedMemberView
                //     ? undefined
                //     : "Add Daily KRA"
                // }
                // buttonDisabled={
                //   isAddKraDisabled || shouldHideControlsForSelectedMemberView
                  checkbox={canUseCheckbox && canShowControls}
                buttonTitle={
                  !canShowControls
                    ? undefined
                    : "Add Daily KRA"
                }
                buttonDisabled={
                  isAddKraDisabled || !canShowControls
                }
                handleSubmit={() => setOpenModal(true)}
                 tableTitle={`${departmentName} DEPARTMENT - DAILY KRA - ${activeMemberName}`}
                //tableTitle={`${department} DEPARTMENT - DAILY KRA`}
                 //tableTitle={`${departmentName} DEPARTMENT - DAILY KRA`}
                 // tableTitle={`${departmentName} DEPARTMENT - DAILY KRA - ${loggedInUserName || "User Name"}`}
                data={(departmentKra || [])
                  .filter((item) => item.status !== "Completed")
                  .map((item, index) => ({
                    srno: index + 1,
                    id: item.id,
                    taskName: item.taskName,
                    assignedDate: item.assignedDate,
                    dueTime: item.dueTime,
                    status: item.status,
                  }))}
                dateColumn={"dueDate"}
                columns={departmentColumns}
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
                   tableTitle={`COMPLETED - DAILY KRA - ${activeMemberName}`}
                 // tableTitle={`COMPLETED - DAILY KRA - ${loggedInUserName || "User Name"}`}
                  exportData={true}
                  checkAll={false}
                  key={completedEntries.length}
                  data={completedEntries.map((item, index) => ({
                    srno: index + 1,
                    id: item.id,
                    taskName: item.taskName,
                    assignedDate: item.assignedDate,
                    dueDate: item.dueDate,
                    status: item.status,
                    completedBy: item.completedBy,
                    completedDate: humanDate(item.completedDate),
                    completedTime: humanTime(item.completedDate),
                  }))}
                  dateColumn={"dueDate"}
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

      <MuiModal
        open={openModal}
        onClose={() => setOpenModal(false)}
         title={isEditMode ? "Edit Task" : "Add Daily KRA"}
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
