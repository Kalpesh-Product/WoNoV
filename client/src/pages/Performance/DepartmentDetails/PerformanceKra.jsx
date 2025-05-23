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
import { useState } from "react";
import MuiModal from "../../../components/MuiModal";
import { Controller, useForm } from "react-hook-form";
import PrimaryButton from "../../../components/PrimaryButton";
import useAuth from "../../../hooks/useAuth";

const PerformanceKra = () => {
  const axios = useAxiosPrivate();
  const { auth } = useAuth()
  const { department } = useParams();
  const [openModal, setOpenModal] = useState(false);
  const deptId = useSelector((state) => state.performance.selectedDepartment);

  const {
    handleSubmit: submitDailyKra,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      dailyKra: "",
      description : '',
    },
  });

  //--------------POST REQUEST FOR DAILY KRA-----------------//
  const { mutate: addDailyKra, isPending: isAddKraPending } = useMutation({
    mutationKey: ["addDailyKra"],
    mutationFn: async (data) => {
      console.log("Submitted");
    },
  });

  const handleFormSubmit = (data) => {
    addDailyKra({
      task: data.dailyKra,
      taskType : "KRA",
      description : data.description,
      department : auth.user?.departments?._id
    });
  };
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
    (item) => item.status === "Completed" || "completed"
  );
  console.log(
    departmentKra.filter((item) => item.status === "Completed" || "completed")
  );
  const departmentColumns = [
    { headerName: "Sr no", field: "srno", width: 100 },
    { headerName: "KRA List", field: "taskName", flex: 1 },
    // { headerName: "Assigned Time", field: "assignedDate" },
    { headerName: "DueTime", field: "dueDate" },
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
              buttonTitle={"Add Daily KRA"}
              handleSubmit={() => setOpenModal(true)}
              tableTitle={`${department} DEPARTMENT - DAILY KRA`}
              data={[
                ...departmentKra
                  .filter((item) => item.status !== "Completed")
                  .map((item, index) => ({
                    srno: index + 1,
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
        ) : (
          <div className="h-72 flex items-center justify-center">
            <CircularProgress />
          </div>
        )}

        {!departmentLoading ? (
          <WidgetSection>
            <DateWiseTable
              formatTime
              tableTitle={`COMPLETED - DAILY KRA`}
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
              columns={departmentColumns}
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
        title={"Add Daily KRA"}
      >
        <form
          onSubmit={submitDailyKra(handleFormSubmit)}
          className="grid grid-cols-1 lg:grid-cols-1 gap-4"
        >
          <Controller
            name="dailyKra"
            control={control}
            rules={{ required: "Daily KRA is required" }}
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
          <PrimaryButton type="submit" title={"Submit"} />
        </form>
      </MuiModal>
    </>
  );
};

export default PerformanceKra;
