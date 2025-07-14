import { useLocation, useParams } from "react-router-dom";
import AgTable from "../../../components/AgTable";
import WidgetSection from "../../../components/WidgetSection";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import humanTime from "../../../utils/humanTime";
import humanDate from "../../../utils/humanDateForamt";
import { Chip } from "@mui/material";
import YearWiseTable from "../../../components/Tables/YearWiseTable";

const PerformanceAnnual = () => {
  const axios = useAxiosPrivate();
  const { department } = useParams();
  const deptId = useSelector((state) => state.performance.selectedDepartment);

  const fetchDepartments = async () => {
    try {
      const response = await axios.get(
        `api/performance/get-tasks?dept=${deptId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  const { data: departmentKra = [], isPending: departmentLoading } = useQuery({
    queryKey: ["fetchedAnnualKra"],
    queryFn: fetchDepartments,
  });
  const departmentColumns = [
    { headerName: "Sr no", field: "srno",width:100 },
    { headerName: "KPA List", field: "taskName", flex : 1 },
    // { headerName: "Assigned Time", field: "assignedDate" },
    { headerName: "Due Date", field: "dueDate" },
    {
        field: "status",
        headerName: "Status",
        cellRenderer: (params) => {
          const statusColorMap = {
            Pending: { backgroundColor: "#FFECC5", color: "#CC8400" }, // Light orange bg, dark orange font
            "InProgress": { backgroundColor: "#ADD8E6", color: "#00008B" }, // Light blue bg, dark blue font
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
    <div className="flex flex-col gap-4">
      <WidgetSection padding layout={1}>
        <YearWiseTable
        tableTitle={`${department} DEPARTMENT - ANNUAL KPA`}
        // checkbox={true}
          data={[
            ...departmentKra.map((item,index) => ({
              srno: index + 1,
              taskName: item.taskName,
              assignedDate: item.assignedDate,
              dueDate: (item.dueDate),
              status: item.status,
            })),
          ]}
          dateColumn={"dueDate"}
          columns={departmentColumns}
        />
      </WidgetSection>
    </div>
  );
};

export default PerformanceAnnual;
