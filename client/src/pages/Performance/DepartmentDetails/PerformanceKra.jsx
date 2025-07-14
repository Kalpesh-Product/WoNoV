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
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import { InsertEmoticonTwoTone } from "@mui/icons-material";
import PageFrame from "../../../components/Pages/PageFrame";
import { isAlphanumeric, noOnlyWhitespace } from "../../../utils/validators";
import YearWiseTable from "../../../components/Tables/YearWiseTable";

const PerformanceKra = () => {
  const axios = useAxiosPrivate();
  const { auth } = useAuth();
  const { department } = useParams();
  const [openModal, setOpenModal] = useState(false);
  const deptId = useSelector((state) => state.performance.selectedDepartment);
  const [selectedKra, setSelectedKra] = useState(null);

  const departmentAccess = [
    "67b2cf85b9b6ed5cedeb9a2e",
    "6798bab9e469e809084e249e",
  ];

  const isTop = auth.user.departments.some((item) => {
    return departmentAccess.includes(item._id.toString());
  });

  const allowedDept = auth.user.departments.some((item) => {
    return item._id.toString() === deptId.toString() ;
  });

  const showCheckBox = allowedDept;
  const isHr = department === "HR";

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
    },
    onError: (error) => {
      toast.error("Adding failed");
      // toast.error(error.message || "Error Adding KRA");
    },
  });
  const handleFormSubmit = (data) => {
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
        `api/performance/get-tasks?dept=${deptId}&type=KRA`
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
    { headerName: "Sr no", field: "srno", width: 100 },
    { headerName: "KRA List", field: "taskName", flex: 1 },
    { headerName: "DueTime", field: "dueTime" },
    {
      field: "status",
      headerName: "Status",
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
    ...(!isTop || isHr
      ? [
          {
            headerName: "Actions",
            field: "actions",
            cellRenderer: (params) => (
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
            ),
          },
        ]
      : []),
  ];

  const completedColumns = [
    { headerName: "Sr no", field: "srno", width: 100, sort: "desc" },
    { headerName: "KRA List", field: "taskName", flex: 1 },
    // { headerName: "Assigned Time", field: "assignedDate" },
    { headerName: "Completed Time", field: "dueDate" },
    { headerName: "Completed By", field: "completedBy" },
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
          {!departmentLoading ? (
            <WidgetSection padding layout={1}>
              <YearWiseTable
                formatTime
                checkbox={showCheckBox}
                buttonTitle={"Add Daily KRA"}
                handleSubmit={() => setOpenModal(true)}
                tableTitle={`${department} DEPARTMENT - DAILY KRA`}
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
                  tableTitle={`COMPLETED - DAILY KRA`}
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
        title={"Add Daily KRA"}
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
