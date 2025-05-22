import { useLocation, useParams } from "react-router-dom";
import AgTable from "../../../components/AgTable";
import WidgetSection from "../../../components/WidgetSection";
import DateWiseTable from "../../../components/Tables/DateWiseTable";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import humanTime from "../../../utils/humanTime";
import humanDate from "../../../utils/humanDateForamt";

const PerformanceAnnual = () => {
  const axios = useAxiosPrivate();
  const { department } = useParams();
  const deptId = useSelector((state) => state.performance.selectedDepartment);

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
  console.log(department);
  const departmentColumns = [
    { headerName: "Sr no", field: "srno",width:100 },
    { headerName: "KRA List", field: "taskName", flex : 1 },
    // { headerName: "Assigned Time", field: "assignedDate" },
    { headerName: "Due Date", field: "dueDate" },
    { headerName: "Status", field: "status" },
  ];
  return (
    <div className="flex flex-col gap-4">
      <WidgetSection padding layout={1}>
        <DateWiseTable
        tableTitle={`${department} DEPARTMENT - ANNUAL KRA`}
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
        {/* <AgTable
          data={[...departmentKra.map((item)=>({}))]}
          columns={[]}
          tableTitle={`${department || ""} DEPARTMENT DAILY KRA`}
          buttonTitle={"Add Daily KRA"}
          hideFilter
        /> */}
      </WidgetSection>
    </div>
  );
};

export default PerformanceAnnual;
