import { useLocation, useParams } from "react-router-dom";
import AgTable from "../../../components/AgTable";
import WidgetSection from "../../../components/WidgetSection";
import DateWiseTable from "../../../components/Tables/DateWiseTable";
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

const TasksViewDepartment = () => {
  const axios = useAxiosPrivate();
  const { auth } = useAuth();
  const { department } = useParams();
  const [openModal, setOpenModal] = useState(false);
  const deptId = useSelector((state) => state.performance.selectedDepartment);

  const {
    handleSubmit: submitDailyKra,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      taskName: "",
      description: "",
      startDate: null,
      endDate: null,
      dueTime: null,
    },
  });

  //--------------POST REQUEST FOR DAILY KRA-----------------//
  const { mutate: addDailyKra, isPending: isAddKraPending } = useMutation({
    mutationKey: ["addDailyKra"],
    mutationFn: async (data) => {
      const response = await axios.post("/api/tasks/create-tasks", {
        taskName: data.taskName,
        startDate: data.startDate,
        endDate: data.endDate,
        dueTime: data.dueTime,
        description: data.description,
        department: deptId,
      });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["fetchedDepartments"] });
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
    mutationKey: ["updateDailyKra"],
    mutationFn: async (data) => {
      const response = await axios.patch(
        `/api/performance/update-task-status/${data}`
      );
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["fetchedDepartments"] });
      toast.success(data.message || "DATA UPDATED");
    },
    onError: (error) => {
      toast.error(error.message || "Error Updating");
    },
  });

  //--------------POST REQUEST FOR DAILY KRA-----------------//

  const fetchDepartments = async () => {
    try {
      const response = await axios.get(
        `api/performance/get-tasks?dept=${deptId}&type=KRA`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  const { data: departmentKra = [], isPending: departmentLoading } = useQuery({
    queryKey: ["fetchedDepartments"],
    queryFn: fetchDepartments,
  });
  const completedEntries = departmentKra.filter(
    (item) => item.status === "Completed"
  );
  const departmentColumns = [
    { headerName: "Sr no", field: "srno", width: 100 },
    { headerName: "Task List", field: "taskName", width: 300 },
    // { headerName: "Assigned Time", field: "assignedDate" },
    { headerName: "Assigned By", field: "assignedBy", width: 300 },
    { headerName: "Assigned Date", field: "assignedDate" },
    { headerName: "Due Date", field: "dueDate" },
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
              title={<FaCheck />}
              disabled={!params.node.selected}
            />
          </div>
        );
      },
    },
  ];
  const completedColumns = [
    { headerName: "Sr no", field: "srno", width: 100 },
    { headerName: "Task List", field: "taskName", width: 300 },
    // { headerName: "Assigned Time", field: "assignedDate" },
    { headerName: "Completed By", field: "completedBy", width: 300 },
    { headerName: "Assigned Date", field: "assignedDate" },
    { headerName: "Due Time", field: "dueTime" },
    { headerName: "Due Date", field: "dueDate" },
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
        {!departmentLoading ? (
          <WidgetSection padding layout={1}>
            <DateWiseTable
              formatTime
              checkbox
              buttonTitle={"Add Task"}
              handleSubmit={() => setOpenModal(true)}
              tableTitle={`${department} DEPARTMENT TASKS`}
              data={(departmentKra || [])
                .filter((item) => item.status !== "Completed")
                .map((item, index) => ({
                  srno: index + 1,
                  id: item.id,
                  taskName: item.taskName,
                  assignedDate: item.assignedDate,
                  dueDate: item.dueDate,
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

        {!departmentLoading ? (
          <WidgetSection padding>
            <DateWiseTable
              formatTime
              tableTitle={`COMPLETED TASKS`}
              data={(completedEntries || [])
                .filter((item) => item.status !== "Completed")
                .map((item, index) => ({
                  srno: index + 1,
                  id: item.id,
                  taskName: item.taskName,
                  assignedDate: item.assignedDate,
                  dueDate: item.dueDate,
                  status: item.status,
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

      <MuiModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        title={"Add Task"}
      >
        <form
          onSubmit={submitDailyKra(handleFormSubmit)}
          className="grid grid-cols-1 lg:grid-cols-1 gap-4"
        >
          <Controller
            name="taskName"
            control={control}
            rules={{ required: "Task Name is required" }}
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
    </>
  );
};

export default TasksViewDepartment;
