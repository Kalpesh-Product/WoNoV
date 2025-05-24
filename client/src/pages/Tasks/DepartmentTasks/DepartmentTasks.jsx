import { useQuery } from "@tanstack/react-query";
import AgTable from "../../../components/AgTable";
import WidgetSection from "../../../components/WidgetSection";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setSelectedDepartment } from "../../../redux/slices/performanceSlice";

const DepartmentTasks = () => {
  const axios = useAxiosPrivate();
  const dispatch = useDispatch()
  const navigate = useNavigate();
  const fetchDepartments = async () => {
    try {
      const response = await axios.get("api/performance/get-depts-tasks");
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

  const departmentColumns = [
    { headerName: "Sr No", field: "srNo", width: 100 },
    {
      headerName: "Department",
      field: "department",
      cellRenderer: (params) => {
        console.log(params.data.mongoId);
        return (
          <span
            role="button"
            onClick={() => {
              dispatch(setSelectedDepartment(params.data.mongoId))
              navigate(`${params.value}`);
            }}
            className="text-primary font-pregular hover:underline cursor-pointer"
          >
            {params.value}
          </span>
        );
      },
    },
    { headerName: "Total Current Month's Tasks", field: "dailyKra" ,flex:1},
    { headerName: "Open Tasks", field: "monthlyKpa" },
    { headerName: "Closed Tasks", field: "annualKpa" },
  ];
  return (
    <div className="flex flex-col gap-4">
      <WidgetSection layout={1} padding>
        <AgTable
          data={[
            ...fetchedDepartments.map((item, index) => ({
              srNo: index + 1,
              mongoId: item.department?._id,
              department: item.department?.name,
              dailyKra: item.dailyKRA,
              monthlyKpa: item.monthlyKPA,
              annualKpa: item.annualKPA,
            })),
          ]}
          columns={departmentColumns}
          tableTitle={"ACTIVE DEPARTMENT WISE TASKS"}
          hideFilter
        />
      </WidgetSection>
    </div>
  );
};

export default DepartmentTasks;
