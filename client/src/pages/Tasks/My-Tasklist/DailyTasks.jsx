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
import {
  DatePicker,
  LocalizationProvider,
  TimePicker,
} from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { FaCheck } from "react-icons/fa6";
import { queryClient } from "../../../main";
import { toast } from "sonner";
import ThreeDotMenu from "../../../components/ThreeDotMenu";
import DetalisFormatted from "../../../components/DetalisFormatted";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import { setSelectedDepartment } from "../../../redux/slices/performanceSlice";
import useAuth from "../../../hooks/useAuth";
import PageFrame from "../../../components/Pages/PageFrame";
import { isAlphanumeric, noOnlyWhitespace } from "../../../utils/validators";
import YearWiseTable from "../../../components/Tables/YearWiseTable";

const DailyTasks = () => {
  const axios = useAxiosPrivate();
  const dispatch = useDispatch();
  const [openModal, setOpenModal] = useState(false);
  const [modalMode, setModalMode] = useState("");
  const [selectedTask, setSelectedTask] = useState({});
  const { auth } = useAuth();
  const currentDepartmentId = auth.user?.departments?.[0]?._id;
  const deptId = useSelector((state) => state.performance.selectedDepartment);
  useEffect(() => {
    if (!deptId) {
      dispatch(setSelectedDepartment(currentDepartmentId));
    }
  }, []);

  const {
    handleSubmit: submitDailyKra,
    control,
    formState: { errors },
    watch,
  } = useForm({
    mode: "onChange",
    defaultValues: {
      taskName: "",
      startDate: null,
      endDate: null,
      description: "",
    },
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
        department: deptId,
        taskType:"Self"
      });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["fetchMyTask"] });
      toast.success(data.message || "KRA Added");
      setOpenModal(false);
    },
    onError: (error) => {
      queryClient.invalidateQueries({ queryKey: ["fetchMyTask"] });
      toast.error(error.message || "Error Adding Tasks");
      setOpenModal(false);
    },
  });

  const handleFormSubmit = (data) => {
    addMonthlyKpa(data);
  };
  //--------------POST REQUEST FOR MONTHLY KPA-----------------//
  //--------------UPDATE REQUEST FOR MONTHLY KPA-----------------//
  const { mutate: updateMonthlyKpa, isPending: isUpdatePending } = useMutation({
    mutationKey: ["updateMyTasks"],
    mutationFn: async (data) => {
      const response = await axios.patch(
        `/api/tasks/update-task-status/${data}`
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

  //--------Column configs----------------//
  const departmentColumns = [
    { headerName: "SR no", field: "srno", width: 100, sort: "desc" },
    {
      headerName: "Task List",
      field: "taskList",
      width: 300,
      cellRenderer: (params) => (
        <div role="button" onClick={() => handleViewTask(params.data)}>
          <span className="underline text-primary cursor-pointer">
            {params.value}
          </span>
        </div>
      ),
    },
    { headerName: "Assigned Date", field: "assignedDate" },
    // { headerName: "Assigned Time", field: "createdAt" },
    { headerName: "Due Date", field: "dueDate" },
    { headerName: "Due Time", field: "dueTime" },
    {
      field: "status",
      headerName: "Status",
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
      cellRenderer: (params) => {
        return (
          <div
            role="button"
            onClick={() => updateMonthlyKpa(params.data.id)}
            className="p-2"
          >
            <PrimaryButton
              disabled={!params.node.selected}
              title={"Mark As Done"}
            />
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
    { headerName: "Sr no", field: "srno", width: 100, sort: "desc" },
    {
      headerName: "Task List",
      field: "taskList",
      flex: 1,
      cellRenderer: (params) => (
        <div
          role="button"
          onClick={() => {
            setModalMode("view-completed");
            setSelectedTask(params.data);
            setOpenModal(true);
          }}
          className="text-primary underline cursor-pointer"
        >
          {params.value}
        </div>
      ),
    },
    // { headerName: "Assigned Date", field: "assignedDate" },
    // { headerName: "Due Date", field: "dueDate" },
    // { headerName: "Due Time", field: "dueTime" },
    // { headerName: "Department", field: "department" },
    { headerName: "Completed By", field: "completedBy" },
    // { headerName: "Completed Date", field: "completedDate" },
    { headerName: "Completed Time", field: "completedTime" },
    {
      field: "status",
      headerName: "Status",
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
  //--------Column configs----------------//

  //----------function handlers-------------//
  const handleViewTask = (data) => {
    setModalMode("view");
    setOpenModal(true);
    setSelectedTask(data);
  };
  //----------function handlers-------------//

  const completedData = isCompletedLoading
    ? []
    : completedEntries.map((item, index) => ({
        srno: index + 1,
        mongoId: item._id,
        taskList: item.taskName,
        department: item.department?.name,
        completedBy: item.completedBy,
        assignedDate: humanDate(item.assignedDate),
        dueDate: humanDate(item.dueDate),
        dueTime: humanTime(item.dueTime),
        completedDate: humanDate(item.completedDate),
        completedTime: humanTime(item.completedDate),
        status: item.status,
      }));

  return (
    <>
      <div className="flex flex-col gap-4">
        <PageFrame>
          <WidgetSection padding layout={1}>
            <YearWiseTable
              key={departmentKra.length}
              checkbox
              tableTitle={`MY TASKS`}
              buttonTitle={"Add Task"}
              handleSubmit={() => {
                setModalMode("add-task");
                setOpenModal(true);
              }}
              data={[
                ...departmentKra
                  .filter((item) => item.status !== "Completed")
                  .map((item, index) => ({
                    srno: index + 1,
                    id: item._id,
                    taskList: item.taskName,
                    assignedDate: item.assignedDate,
                    dueDate: item.dueDate,
                    status: item.status,
                    dueTime: humanTime(item.dueTime),
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
                key={completedEntries.length}
                tableTitle={`MY COMPLETED TASKS`}
                data={completedData}
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
            : modalMode === "view"
            ? "Completed task"
            : "View Task"
        }
      >
        {modalMode === "add-task" && (
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
              type="submit"
              title={"Submit"}
              isLoading={isAddKpaPending}
              disabled={isAddKpaPending}
            />
          </form>
        )}

        {modalMode === "view" && selectedTask && (
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-4">
            <DetalisFormatted title={"Task"} detail={selectedTask?.taskList} />
            <DetalisFormatted
              title={"Assigned Date"}
              detail={humanDate(selectedTask?.assignedDate)}
            />
            <DetalisFormatted
              title={"Due Date"}
              detail={humanDate(selectedTask?.dueDate)}
            />
            <DetalisFormatted
              title={"Due Time"}
              detail={selectedTask?.dueTime}
            />
            <DetalisFormatted
              title={"Assigned By"}
              detail={selectedTask?.assignedBy}
            />

            <DetalisFormatted title={"Status"} detail={selectedTask?.status} />
          </div>
        )}
        {modalMode === "view-completed" && selectedTask && (
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-4">
            <DetalisFormatted title={"Task"} detail={selectedTask?.taskList} />
            <DetalisFormatted
              title={"Assigned Date"}
              detail={selectedTask?.assignedDate}
            />
            <DetalisFormatted
              title={"Completed Date"}
              detail={selectedTask?.completedDate}
            />
            <DetalisFormatted
              title={"Completed Time"}
              detail={selectedTask?.completedDate}
            />
            <DetalisFormatted
              title={"Due Date"}
              detail={selectedTask?.dueDate}
            />
            <DetalisFormatted
              title={"Due Time"}
              detail={selectedTask?.dueTime}
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
