import { useLocation, useParams } from "react-router-dom";
import AgTable from "../../../components/AgTable";
import WidgetSection from "../../../components/WidgetSection";
import MonthWiseTable from "../../../components/Tables/MonthWiseTable";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import humanTime from "../../../utils/humanTime";
import humanDate from "../../../utils/humanDateForamt";
import { Chip, TextField } from "@mui/material";
import PrimaryButton from "../../../components/PrimaryButton";
import { Controller, useForm } from "react-hook-form";
import MuiModal from "../../../components/MuiModal";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { useState } from "react";
import { FaCheck } from "react-icons/fa6";
import { queryClient } from "../../../main";
import { toast } from "sonner";

const PerformanceMonthly = () => {
  const axios = useAxiosPrivate();
  const { department } = useParams();
  const [openModal, setOpenModal] = useState(false);
  const deptId = useSelector((state) => state.performance.selectedDepartment);

  const {
    handleSubmit: submitDailyKra,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      kraName: "",
      startDate: null,
      endDate: null,
      description: "",
    },
  });

  //--------------POST REQUEST FOR MONTHLY KPA-----------------//
  const { mutate: addMonthlyKpa, isPending: isAddKpaPending } = useMutation({
    mutationKey: ["addMonthlyKpa"],
    mutationFn: async (data) => {
      const response = await axios.post("/api/performance/create-task", {
        task: data.kpaName,
        taskType: "KPA",
        // description: data.description,
        department: deptId,
        assignedDate: data.startDate,
        dueDate: data.endDate,
        kpaDuration: "Monthly",
      });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["fetchedDepartments"] });
      toast.success(data.message || "KRA Added");
      setOpenModal(false);
    },
    onError: (error) => {
      queryClient.invalidateQueries({ queryKey: ["fetchedMonthlyKra"] });
      toast.success("DATA UPDATED");
      setOpenModal(false);
    },
  });

  const handleFormSubmit = (data) => {
    addMonthlyKpa(data);
  };
  //--------------POST REQUEST FOR MONTHLY KPA-----------------//
  //--------------UPDATE REQUEST FOR MONTHLY KPA-----------------//
  const { mutate: updateMonthlyKpa, isPending: isUpdatePending } = useMutation({
    mutationKey: ["updateMonthlyKpa"],
    mutationFn: async (data) => {
      const response = await axios.patch(
        `/api/performance/update-task-status/${data}`
      );
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["fetchedMonthlyKra"] });
      toast.success(data.message || "DATA UPDATED");
    },
    onError: (error) => {
      toast.error(error.message || "Error Updating");
    },
  });
  //--------------UPDATE REQUEST FOR MONTHLY KPA-----------------//

  const fetchDepartments = async () => {
    try {
      const response = await axios.get(
        `api/performance/get-tasks?dept=${deptId}&type=KPA`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  const { data: departmentKra = [], isPending: departmentLoading } = useQuery({
    queryKey: ["fetchedMonthlyKra"],
    queryFn: fetchDepartments,
  });
  const completedEntries = departmentLoading
    ? []
    : departmentKra.filter((item) => item.status === "Completed");
  console.log(department);
  const departmentColumns = [
    { headerName: "Sr no", field: "srno", width: 100 },
    { headerName: "KPA List", field: "taskName", flex: 1 },
    // { headerName: "Assigned Time", field: "assignedDate" },
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
      field: "actions",
      cellRenderer: (params) => {
        console.log(params.node);
        return (
          <div
            role="button"
            onClick={() => updateMonthlyKpa(params.data.id)}
            className="p-2"
          >
            <PrimaryButton
              disabled={!params.node.selected}
              title={<FaCheck />}
            />
          </div>
        );
      },
    },
  ];
  const completedColumns = [
    { headerName: "Sr no", field: "srno", width: 100, sort: "desc" },
    { headerName: "KPA List", field: "taskName", flex: 1 },
    // { headerName: "Assigned Time", field: "assignedDate" },
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
        <WidgetSection padding layout={1}>
          <MonthWiseTable
            checkbox
            tableTitle={`${department} DEPARTMENT - MONTHLY KPA`}
            buttonTitle={"Add Monthly KPA"}
            handleSubmit={() => setOpenModal(true)}
            data={[
              ...departmentKra
                .filter((item) => item.status !== "Completed")
                .map((item, index) => ({
                  srno: index + 1,
                  id: item.id,
                  taskName: item.taskName,
                  assignedDate: item.assignedDate,
                  dueDate: item.dueDate,
                  status: item.status,
                })),
            ]}
            dateColumn={"dueDate"}
            columns={departmentColumns}
          />
        </WidgetSection>
        <WidgetSection padding layout={1}>
          <MonthWiseTable
            tableTitle={`COMPLETED - MONTHLY KPA`}
            data={[
              ...completedEntries.map((item, index) => ({
                srno: index + 1,
                taskName: item.taskName,
                assignedDate: item.assignedDate,
                dueDate: item.dueDate,
                status: item.status,
              })),
            ]}
            dateColumn={"dueDate"}
            columns={completedColumns}
          />
        </WidgetSection>
      </div>

      <MuiModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        title={"Add Monthly KPA"}
      >
        <form
          onSubmit={submitDailyKra(handleFormSubmit)}
          className="grid grid-cols-1 lg:grid-cols-1 gap-4"
        >
          <Controller
            name="kpaName"
            control={control}
            rules={{ required: "KPA Name is required" }}
            render={({ field }) => (
              <TextField
                {...field}
                size="small"
                label={"KPA Name"}
                fullWidth
                error={!!errors?.kraName?.message}
                helperText={errors?.kraName?.message}
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
