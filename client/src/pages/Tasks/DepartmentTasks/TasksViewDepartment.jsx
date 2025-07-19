import { useLocation, useParams } from "react-router-dom";
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
import { isAlphanumeric, noOnlyWhitespace } from "../../../utils/validators";
import YearWiseTable from "../../../components/Tables/YearWiseTable";

const TasksViewDepartment = () => {
  const axios = useAxiosPrivate();
  const { auth } = useAuth();
  const { department } = useParams();
  const [openModal, setOpenModal] = useState(false);
  const deptId = useSelector((state) => state.performance.selectedDepartment);
  const [openMultiModal, setOpenMultiModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState({});
  const [modalMode, setModalMode] = useState("");
  const EXCEPTIONAL_DEPARTMENT_IDS = [
    "67b2cf85b9b6ed5cedeb9a2e",
    // more exceptional department IDs...
  ];

  // Check if the selected department is in user's list
  const isUserDepartment = auth?.user?.departments?.some(
    (dept) => dept._id === deptId
  );

  // Check if the user has any department that is exceptional
  const isExceptionalDepartment = auth?.user?.departments?.some((dept) =>
    EXCEPTIONAL_DEPARTMENT_IDS.includes(dept._id)
  );

  const hasAccess = isUserDepartment || isExceptionalDepartment;

  const resdepartment =
    auth?.user?.departments?.find((dept) => dept._id === deptId)?.name ||
    (isExceptionalDepartment ? "EXCEPTIONAL DEPARTMENT" : "UNKNOWN");

  const allowedDept = auth.user.departments.some((item) => {
    return item._id.toString() === deptId.toString();
  });

  const showCheckBox = allowedDept;

  const {
    handleSubmit: submitDailyKra,
    control,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      taskName: "",
      description: "",
      startDate: null,
      endDate: null,
      dueTime: null,
    },
  });
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
        department: deptId,
        taskType:"Department"
      });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["fetchedTasks"] });
      toast.success(data.message || "KRA Added");
      setOpenModal(false);
    },
    onError: (error) => {
      toast.error(error.message || "Error Adding KRA");
    },
  });
  const handleFormSubmit = (data) => {
    addDailyKra(data);
  };

  const { mutate: updateDailyKra, isPending: isUpdatePending } = useMutation({
    mutationKey: ["updateDailyTasks"],
    mutationFn: async (data) => {
      const response = await axios.patch(
        `/api/tasks/update-task-status/${data}`
      );
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["fetchedTasks"] });
      queryClient.invalidateQueries({ queryKey: ["fetchedDepartmentsTasks"] });
      queryClient.invalidateQueries({ queryKey: ["fetchedCompletedTasks"] });
      toast.success(data.message || "DATA UPDATED");
    },
    onError: (error) => {
      toast.error(error.message || "Error Updating");
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
        `api/tasks/get-completed-tasks/${deptId}`
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

  const { data: completedTasks = [], isLoading: completedTasksFetchPending } =
    useQuery({
      queryKey: ["fetchedCompletedTasks"],
      queryFn: fetchCompletedTasks,
    });
  const departmentColumns = [
    { headerName: "Sr no", field: "srno", width: 100, sort: "desc" },
    {
      headerName: "Task List",
      field: "taskName",
      width: 300,
      cellRenderer: (params) => (
        <div
          role="button"
          onClick={() => {
            setModalMode("view");
            setSelectedTask(params.data);
            setOpenMultiModal(true);
          }}
          className="text-primary underline cursor-pointer"
        >
          {params.value}
        </div>
      ),
    },
    { headerName: "Assigned By", field: "assignedBy", width: 300 },
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
      pinned: "right",
      field: "actions",
      cellRenderer: (params) => {
        return (
          <div
            role="button"
            onClick={() => updateDailyKra(params.data.id)}
            className="p-2"
          >
            <PrimaryButton
              title={"Mark As Done"}
              disabled={!params.node.selected}
            />
          </div>
        );
      },
    },
  ];
  const completedColumns = [
    { headerName: "Sr no", field: "srNo", width: 100, sort: "desc" },
    {
      headerName: "Task List",
      field: "taskName",
      width: 300,
      cellRenderer: (params) => (
        <div
          role="button"
          onClick={() => {
            setModalMode("completed");
            setSelectedTask(params.data);
            setOpenMultiModal(true);
          }}
          className="text-primary underline cursor-pointer"
        >
          {params.value}
        </div>
      ),
    },
    // { headerName: "Assigned Time", field: "assignedDate" },
    // { headerName: "Assigned Date", field: "assignedDate" },
    { headerName: "Completed By", field: "completedBy", width: 300 },
    // { headerName: "Completed Date", field: "completedDate" },
    { headerName: "Completed Time", field: "completedTime" },
    // { headerName: "Due Time", field: "dueTime" },
    // { headerName: "Due Date", field: "dueDate" },
    // { headerName: "Due Time", field: "dueTime" },
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

  return (
    <>
      <div className="flex flex-col gap-4">
        <PageFrame>
          <div>
            {!departmentLoading ? (
              <WidgetSection padding layout={1}>
                <YearWiseTable
                  checkbox={showCheckBox}
                  buttonTitle={hasAccess ? "Add Task" : undefined}
                  handleSubmit={() => setOpenModal(true)}
                  tableTitle={`${department} DEPARTMENT TASKS`}
                  data={(departmentKra || [])
                    .filter((item) => item.status !== "Completed")
                    .map((item, index) => ({
                      srno: index + 1,
                      id: item._id,
                      taskName: item.taskName,
                      description: item.description,
                      assignedDate: item.assignedDate,
                      status: item.status,
                      dueDate: item.dueDate,
                      dueTime: humanTime(item.dueTime),
                      assignedBy: `${item.assignedBy.firstName} ${item.assignedBy.lastName}`,
                    }))}
                  dateColumn={"assignedDate"}
                  columns={departmentColumns}
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
                  tableTitle={`COMPLETED TASKS`}
                  exportData={true}
                  data={
                    completedTasksFetchPending
                      ? []
                      : completedTasks.map((item, index) => ({
                          id: item._id,
                          taskName: item.taskName,
                          completedBy: item.completedBy,
                          assignedDate: humanDate(item.assignedDate),
                          dueDate: humanDate(item.dueDate),
                          dueTime: humanTime(item.dueTime),
                          completedDate: item.completedDate,
                          completedTime: humanTime(item.completedDate),
                          status: item.status,
                        }))
                  }
                  dateColumn={"completedDate"}
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
        title={"Add Department Task"}
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
            title={"Submit"}
            isLoading={isAddKraPending}
            disabled={isAddKraPending}
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
        {modalMode === "completed" && selectedTask && (
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-4">
            <DetalisFormatted title={"Task"} detail={selectedTask?.taskName} />
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
              detail={selectedTask?.completedTime}
            />
            <DetalisFormatted
              title={"Comleted By"}
              detail={selectedTask?.completedBy}
            />
            <DetalisFormatted
              title={"Due Date"}
              detail={selectedTask?.dueDate}
            />
            <DetalisFormatted
              title={"Due Time"}
              detail={selectedTask?.dueTime}
            />

            <DetalisFormatted title={"Status"} detail={selectedTask?.status} />
          </div>
        )}
      </MuiModal>
    </>
  );
};

export default TasksViewDepartment;
