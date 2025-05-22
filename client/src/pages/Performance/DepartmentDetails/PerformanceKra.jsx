import { useLocation, useParams } from "react-router-dom";
import AgTable from "../../../components/AgTable";
import WidgetSection from "../../../components/WidgetSection";
import DateWiseTable from "../../../components/Tables/DateWiseTable";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";

const PerformanceKra = () => {
  const location = useLocation();
  const axios = useAxiosPrivate();
  const { department } = useParams();
  const deptId = useSelector((state)=>state.performance.selectedDepartment)

  console.log(deptId);

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
  const { data: fetchedDepartments = [], isPending: departmentLoading } =
    useQuery({
      queryKey: ["fetchedDepartments"],
      queryFn: fetchDepartments,
    });
  console.log(department);
  return (
    <div className="flex flex-col gap-4">
      <WidgetSection padding layout={1}>
        <DateWiseTable data={[]} columns={[]} />
        <AgTable
          data={[]}
          columns={[]}
          tableTitle={`${department || ""} DEPARTMENT DAILY KRA`}
          buttonTitle={"Add Daily KRA"}
          hideFilter
        />
      </WidgetSection>
    </div>
  );
};

export default PerformanceKra;
