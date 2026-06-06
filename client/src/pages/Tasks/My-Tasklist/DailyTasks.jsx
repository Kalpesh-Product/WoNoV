import { useLocation, useParams } from "react-router-dom";
import AgTable from "../../../components/AgTable";
import WidgetSection from "../../../components/WidgetSection";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useDispatch, useSelector } from "react-redux";
import humanTime from "../../../utils/humanTime";
import humanDate from "../../../utils/humanDateForamt";
import { Chip, CircularProgress, TextField } from "@mui/material";

import { Controller, useForm } from "react-hook-form";
import PrimaryButton from "../../../components/PrimaryButton";
import MuiModal from "../../../components/MuiModal";
import {
  DatePicker,
  LocalizationProvider,
  TimePicker,
} from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import { FaCheck } from "react-icons/fa6";
import { queryClient } from "../../../main";
import { toast } from "sonner";
import ThreeDotMenu from "../../../components/ThreeDotMenu";
import DetalisFormatted from "../../../components/DetalisFormatted";
import { MdDeleteForever, MdOutlineRemoveRedEye } from "react-icons/md";
import { HiPencilSquare } from "react-icons/hi2";
import { setSelectedDepartment } from "../../../redux/slices/performanceSlice";
import useAuth from "../../../hooks/useAuth";
import PageFrame from "../../../components/Pages/PageFrame";
import { isAlphanumeric, noOnlyWhitespace } from "../../../utils/validators";
import YearWiseTable from "../../../components/Tables/YearWiseTable";
import { formatDateTimeFields } from "../../../utils/formatDateTime";

const DailyTasks = () => {
  const taskFormDefaultValues = {
    taskName: "",
    startDate: null,
    endDate: null,
    description: "",
    dueTime: null,
  };
  const axios = useAxiosPrivate();
  const dispatch = useDispatch();
  const [openModal, setOpenModal] = useState(false);
  const [modalMode, setModalMode] = useState("");
  const [selectedTask, setSelectedTask] = useState({});
  const { auth } = useAuth();
  const currentDepartmentId = auth.user?.departments?.[0]?._id;
  const deptId = useSelector((state) => state.performance.selectedDepartment);
  const myTaskDepartmentId = currentDepartmentId || deptId;
  const currentUserId = auth?.user?._id;
  const isCurrentUserTaskOwner = (task) => {
    const ownerId =
      task?.assignedBy?._id ||
      task?.assignedBy?.id ||
      task?.assignedBy ||
      "";

    return String(ownerId) === String(currentUserId);
  };
  useEffect(() => {
    if (!deptId) {
      dispatch(setSelectedDepartment(currentDepartmentId));
    }
  }, [currentDepartmentId, deptId, dispatch]);

  const {
    handleSubmit: submitDailyKra,
    control,
    formState: { errors },
    watch,
    reset,
  } = useForm({
    mode: "onChange",
    defaultValues: taskFormDefaultValues,
  });
  const startDate = watch("startDate");

  const { data: departmentKra = [], isPending: departmentLoading } = useQuery({
    queryKey: ["fetchMyTask"],
    queryFn: async () => {
      try {
        const response = await axios.get("api/tasks/my-tasks?flag=pending");
        return response.data;
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    },
  });
  const { data: completedEntries, isLoading: isCompletedLoading } = useQuery({
    queryKey: ["completedTasks"],
    queryFn: async () => {
      try {
        const response = await axios.get(`/api/tasks/get-my-completed-tasks`);
        return response.data;
      } catch (error) {
        console.error(error);
      }
    },
  });

  //--------------POST REQUEST FOR MONTHLY KPA-----------------//
  const { mutate: addMonthlyKpa, isPending: isAddKpaPending } = useMutation({
    mutationKey: ["addMonthlyKpa"],
    mutationFn: async (data) => {
      const response = await axios.post("/api/tasks/create-tasks", {
        taskName: data.taskName,
        startDate: data.startDate,
        endDate: data.endDate,
        dueTime: data.dueTime,
        description: data.description,
        department: myTaskDepartmentId,
        taskType: "Self",
      });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["fetchMyTask"] });
      toast.success(data.message || "KRA Added");
      reset(taskFormDefaultValues);
      setOpenModal(false);
    },
    onError: (error) => {
      queryClient.invalidateQueries({ queryKey: ["fetchMyTask"] });
      toast.error(error.message || "Error Adding Tasks");
      setOpenModal(false);
    },
  });

  const handleFormSubmit = (data) => {
    if (modalMode === "edit-task" && selectedTask?.id) {
      editMyTask({
        id: selectedTask.id,
        data: {
          taskName: data.taskName,
          description: data.description,
          startDate: data.startDate,
          endDate: data.endDate,
          dueTime: data.dueTime,
        },
      });
      return;
    }
    addMonthlyKpa(data);
  };
  //--------------POST REQUEST FOR MONTHLY KPA-----------------//
  //--------------UPDATE REQUEST FOR MONTHLY KPA-----------------//
  const { mutate: updateMonthlyKpa, isPending: isUpdatePending } = useMutation({
    mutationKey: ["updateMyTasks"],
    mutationFn: async (data) => {
      const response = await axios.patch(
        `/api/tasks/update-task-status/${data}`,
      );
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.refetchQueries({ queryKey: ["fetchMyTask"] });
      queryClient.invalidateQueries({ queryKey: ["fetchMyTask"] });
      queryClient.invalidateQueries({ queryKey: ["completedTasks"] });
      toast.success(data.message || "Task updated");
    },
    onError: (error) => {
      toast.error(error.message || "Error Updating");
    },
  });
  //--------------UPDATE REQUEST FOR MONTHLY KPA-----------------//
  const { mutate: deleteMyTask, isPending: isDeletePending } = useMutation({
    mutationKey: ["deleteMyTask"],
    mutationFn: async (taskId) => {
      const response = await axios.patch(`/api/tasks/delete-task/${taskId}`);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["fetchMyTask"] });
      queryClient.invalidateQueries({ queryKey: ["completedTasks"] });
      toast.success(data.message || "Task deleted");
    },
    onError: (error) => {
      toast.error(error.message || "Error deleting task");
    },
  });

  const { mutate: editMyTask, isPending: isEditPending } = useMutation({
    mutationKey: ["editMyTask"],
    mutationFn: async ({ id, data }) => {
      const response = await axios.patch(`/api/tasks/update-task/${id}`, data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["fetchMyTask"] });
      toast.success(data.message || "Task updated");
      reset(taskFormDefaultValues);
      setOpenModal(false);
    },
    onError: (error) => {
      toast.error(error.message || "Error updating task");
    },
  });


  //--------Column configs----------------//

  const formatDateTime = (value) =>
    value ? `${humanDate(value)}, ${humanTime(value)}` : "N/A";

  const departmentColumns = [
    { headerName: "Sr No", field: "srNo", width: 100, sort: "asc" },
    {
      headerName: "Task List",
      field: "taskList",
      flex:1,
      cellRenderer: (params) => (
        <div role="button" onClick={() => handleViewTask(params.data)}>
          <span className="underline text-primary cursor-pointer">
            {params.value}
          </span>
        </div>
      ),
    },
    {
      headerName: "Start Date",
      field: "assignedDate",
      flex:1
    },
    // { headerName: "Assigned Time", field: "createdAt" },
    {
      headerName: "Due Date",
      field: "dueDate",
      flex:1,
      cellRenderer: (params) => {
        const formattedDate = humanDate(params.data?.dueDate);
        const formattedTime = humanTime(params.data?.dueTime);
        return `${formattedDate}, ${formattedTime}`;
      },
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
      field: "actions",
      pinned: "right",
      width: 250,
      cellRenderer: (params) => {
        return (
          <div className="flex items-center">
            {/* Mark As Done */}
            <div
              role="button"
              onClick={() => {
                if (!params.node.selected || isUpdatePending || isDeletePending)
                  return;
                updateMonthlyKpa(params.data.id);
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
                reset({
                  taskName: taskData?.taskList || "",
                  description: taskData?.description || "",
                  startDate: taskData?.assignedDate
                    ? dayjs(taskData.assignedDate).toISOString()
                    : null,
                  endDate: taskData?.dueDate
                    ? dayjs(taskData.dueDate).toISOString()
                    : null,
                  dueTime: taskData?.dueTime ? dayjs(taskData.dueTime) : null,
                });
                setOpenModal(true);
              }}
              className="ml-2 p-1 h-7 w-7 flex items-center justify-center disabled:cursor-not-allowed"
            >
              <HiPencilSquare size={26} color={!params.node.selected ? "#9ca3af" : "#111827"} />
            </button>

               {/* Delete Button */}
            <button
              type="button"
              title="Delete Task"
              disabled={
                !params.node.selected || isDeletePending || isUpdatePending
              }
              onClick={() => deleteMyTask(params.data.id)}
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
          </div>
        );
      },
    },
    // {
    //   field: "actions",
    //   headerName: "Actions",
    //   pinned: "right",
    //   cellRenderer: (params) => (
    //     <div className="flex gap-2">
    //       <ThreeDotMenu
    //         disabled={!params.node.selected}
    //         rowId={params.data.id}
    //         menuItems={[
    //           {
    //             label: "View Details",
    //             onClick: () => handleViewTask(params.data),
    //           },
    //           {
    //             label: "Mark As Done",
    //             onClick: () => updateMonthlyKpa(params.data.id),
    //           },
    //         ]}
    //       />
    //     </div>
    //   ),
    // },
  ];
  const completedColumns = [
    { headerName: "Sr No", field: "srNo", width: 100, sort: "desc" },
    {
      headerName: "Task List",
      field: "taskList",
      flex: 1,
      cellRenderer: (params) => (
        <div
          role="button"
          onClick={() => {
            setModalMode("view-completed");
            setSelectedTask(formatDateTimeFields(params.data));
            setOpenModal(true);
          }}
          className="text-primary underline cursor-pointer"
        >
          {params.value}
        </div>
      ),
    },
    { headerName: "Start Date", field: "assignedDate", hide: true },
    { headerName: "Due Date", field: "dueDate", hide: true },
    { headerName: "Due Time", field: "dueTime", hide: true },
    { headerName: "Department", field: "department", hide: true },
    // { headerName: "Completed By", field: "completedBy" },
    { headerName: "Assigned By", field: "assignedBy" },
    // { headerName: "Completed Date", field: "completedDate" },
    {
      headerName: "Completed Date",
      // field: "completedTime",
      // cellRenderer: (params) => {
      //   const completedDate = params.data?.completedDate;
      //   const completedTime = params.data?.completedTime;

      //   const formattedDate = completedDate;
      //   const formattedTime = completedTime;

      //   return [formattedDate, formattedTime].filter(Boolean).join(", ");
      // },
      field: "completedDate",
    },
    {
      headerName: "Completed Time",
      field: "completedTime",
    },
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
  //--------Column configs----------------//

  //----------function handlers-------------//
  const handleViewTask = (data) => {
    setModalMode("view");
    setOpenModal(true);
    setSelectedTask(formatDateTimeFields(data));
  };
  //----------function handlers-------------//

  const completedData = isCompletedLoading
    ? []
    : completedEntries.map((item, index) => ({
        srno: index + 1,
        mongoId: item._id,
        taskList: item.taskName,
        department: item.department?.name,
        description: item.description,
        completedBy: item.completedBy,
        assignedBy: item.assignedBy.firstName + " " + item.assignedBy.lastName,
        assignedDate: item.assignedDate,
        dueDate: item.dueDate,
        dueTime: item.dueTime,
        completedDate: item.completedDate,
        completedTime: item.completedDate,
        completedDateTime: `${humanDate(item.completedDate)}, ${humanTime(
          item.completedDate,
        )}`,
        status: item.status,
      }));

  const visiblePendingTasks = useMemo(
    () =>
      Array.isArray(departmentKra)
        ? departmentKra.filter((item) => isCurrentUserTaskOwner(item))
        : [],
    [departmentKra, currentUserId],
  );

  const visibleCompletedEntries = useMemo(
    () =>
      Array.isArray(completedEntries)
        ? completedEntries.filter((item) => isCurrentUserTaskOwner(item))
        : [],
    [completedEntries, currentUserId],
  );

  const visibleCompletedData = useMemo(
    () =>
      visibleCompletedEntries.map((item, index) => ({
        srno: index + 1,
        mongoId: item._id,
        taskList: item.taskName,
        department: item.department?.name,
        description: item.description,
        completedBy: item.completedBy,
        assignedBy: item.assignedBy.firstName + " " + item.assignedBy.lastName,
        assignedDate: item.assignedDate,
        dueDate: item.dueDate,
        dueTime: item.dueTime,
        completedDate: item.completedDate,
        completedTime: item.completedDate,
        completedDateTime: `${humanDate(item.completedDate)}, ${humanTime(
          item.completedDate,
        )}`,
        status: item.status,
      })),
    [visibleCompletedEntries],
  );

  const pendingOnlyTasks = useMemo(
    () =>
      visiblePendingTasks.filter(
        (item) => String(item?.status || "").toLowerCase() !== "completed",
      ),
    [visiblePendingTasks],
  );

  const myTaskSummary = useMemo(
    () => {
      const uniqueTaskIds = new Set([
        ...pendingOnlyTasks.map((item) => String(item?._id || item?.id || "")),
        ...visibleCompletedEntries.map((item) =>
          String(item?._id || item?.id || ""),
        ),
      ]);

      return {
        pending: pendingOnlyTasks.length,
        completed: visibleCompletedEntries.length,
        total: Array.from(uniqueTaskIds).filter(Boolean).length,
      };
    },
    [pendingOnlyTasks, visibleCompletedEntries],
  );

  return (
    <>
      <div className="flex flex-col gap-4">
        <PageFrame>
          <WidgetSection padding layout={1}>
            <div className="w-full pb-3">
              <div className="flex justify-between items-center gap-3 flex-wrap">
                <span className="text-title text-primary font-pmedium uppercase">
                  MY TASKS
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <div className="flex gap-1 justify-center items-center uppercase bg-[#dbe4ff] text-sm text-[#274784] font-pmedium px-3 py-1.5 rounded-lg border border-[#aec6fb]">
                    <div>Total :</div>
                    <div>{myTaskSummary.total}</div>
                  </div>
                  <div className="flex gap-1 justify-center items-center uppercase bg-[#fce8e3] text-sm text-[#d96b4f] font-pmedium px-3 py-1.5 rounded-lg border border-[#f3b7a8]">
                    <div>Pending :</div>
                    <div>{myTaskSummary.pending}</div>
                  </div>
                  <div className="flex gap-1 justify-center items-center uppercase bg-[#d8f0df] text-sm text-[#16784d] font-pmedium px-3 py-1.5 rounded-lg border border-[#a9ddba]">
                    <div>Completed :</div>
                    <div>{myTaskSummary.completed}</div>
                  </div>
                </div>
              </div>
            </div>
            <YearWiseTable
              key={pendingOnlyTasks.length}
              checkbox
              tableTitle={""}
              buttonTitle={"Add Task"}
              handleSubmit={() => {
                reset(taskFormDefaultValues);
                setModalMode("add-task");
                setOpenModal(true);
              }}
              data={[
                ...pendingOnlyTasks
                  .map((item, index) => ({
                    srno: index + 1,
                    id: item._id,
                    taskList: item.taskName,
                    assignedDate: item.assignedDate,
                    dueDate: item.dueDate,
                    status: item.status,
                    dueTime: item.dueTime,
                    description: item.description,
                    // createdAt: humanTime(item.createdAt),
                    assignedBy: `${item.assignedBy.firstName} ${item.assignedBy.lastName}`,
                  })),
              ]}
              dateColumn={"dueDate"}
              columns={departmentColumns}
            />
          </WidgetSection>
        </PageFrame>
        <PageFrame>
          {!isCompletedLoading ? (
            <WidgetSection padding layout={1}>
              <YearWiseTable
                exportData={true}
                key={visibleCompletedData.length}
                tableTitle={`MY COMPLETED TASKS`}
                data={visibleCompletedData}
                dateColumn={"completionDate"}
                columns={completedColumns}
              />
            </WidgetSection>
          ) : (
            <div className="h-72 flex items-center justify-center">
              <CircularProgress color="black" />
            </div>
          )}
        </PageFrame>
      </div>

      <MuiModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        title={
          modalMode === "add-task"
            ? "Add My Task"
              : modalMode === "edit-task"
              ? "Edit My Task"
            : modalMode === "view"
              ? "View Task"
              : "Completed task"
        }
      >
          {(modalMode === "add-task" || modalMode === "edit-task") && (
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
                  isAlphanumeric,
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
                  isAlphanumeric,
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
              name="startDate"
              control={control}
              rules={{ required: "Start date is required" }}
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
              rules={{ required: "End date is required" }}
              render={({ field, fieldState }) => (
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    {...field}
                    label="End Date"
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
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Controller
                name="dueTime"
                control={control}
                rules={{ required: "Due time is required" }}
                render={({ field }) => (
                  <TimePicker
                    label="Due Time"
                    {...field}
                    disabled={!startDate}
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
       title={modalMode === "edit-task" ? "Update" : "Submit"}
              isLoading={
                modalMode === "edit-task" ? isEditPending : isAddKpaPending
              }
              disabled={
                modalMode === "edit-task" ? isEditPending : isAddKpaPending
              }
            />
          </form>
        )}

        {modalMode === "view" && selectedTask && (
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-4">
            <DetalisFormatted title={"Task"} detail={selectedTask?.taskList} />
            <DetalisFormatted title={"Description"} detail={selectedTask?.description} />
            <DetalisFormatted
              title={"Start Date"}
              detail={`${selectedTask?.assignedDate}`}
            />
            <DetalisFormatted
              title={"Due Date"}
              detail={`${selectedTask?.dueDate}, ${selectedTask?.dueTime}`}
            />

            <DetalisFormatted
              title={"Added  By"}
              detail={selectedTask?.assignedBy}
            />

            <DetalisFormatted title={"Status"} detail={selectedTask?.status} />
          </div>
        )}
        {modalMode === "view-completed" && selectedTask && (
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-4">
            <DetalisFormatted title={"Task"} detail={selectedTask?.taskList} />
            <DetalisFormatted title={"Description"} detail={selectedTask?.description}/>
            <DetalisFormatted
              title={"Start Date"}
              detail={selectedTask?.assignedDate}
            />
            <DetalisFormatted
              title={"Completed Date"}
              detail={`${selectedTask?.completedDate}, ${selectedTask?.completedTime}`}
            />

            <DetalisFormatted
              title={"Due Date"}
              detail={`${selectedTask?.dueDate}, ${selectedTask?.dueTime}`}
            />

            <DetalisFormatted
              title={"Assigned By"}
              detail={selectedTask?.assignedBy}
            />

            <DetalisFormatted
              title={"Completed By"}
              detail={selectedTask?.completedBy}
            />

            <DetalisFormatted title={"Status"} detail={selectedTask?.status} />
          </div>
        )}
      </MuiModal>
    </>
  );
};

export default DailyTasks;
