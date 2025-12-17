import { useQuery } from "@tanstack/react-query";
import AgTable from "../../../components/AgTable";
import WidgetSection from "../../../components/WidgetSection";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setSelectedDepartment } from "../../../redux/slices/performanceSlice";
import { useTopDepartment } from "../../../hooks/useTopDepartment";
import useAuth from "../../../hooks/useAuth";
import PageFrame from "../../../components/Pages/PageFrame";
import { CircularProgress } from "@mui/material";

const DepartmentTasks = () => {
  const axios = useAxiosPrivate();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { auth } = useAuth();
  const currentDepartmentId = auth.user?.departments?.[0]?._id;
  const currentDepartment = auth.user?.departments?.[0]?.name;

  useTopDepartment({
    additionalTopUserIds: ["67b83885daad0f7bab2f1888"], //utkarsha
    onNotTop: () => {
      dispatch(setSelectedDepartment(currentDepartmentId));
      navigate(`/app/tasks/department-tasks/${currentDepartment}`);
    },
  });

  const fetchDepartments = async () => {
    try {
      const response = await axios.get("api/tasks/get-depts-tasks");
      return response.data;
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  const { data: fetchedDepartments = [], isPending: departmentLoading } =
    useQuery({
      queryKey: ["fetchedDepartmentsTasks"],
      queryFn: fetchDepartments,
    });

  const departmentColumns = [
    { headerName: "Sr No", field: "srNo", width: 100 },
    {
      headerName: "Department",
      field: "department",
      cellRenderer: (params) => {
        return (
          <span
            role="button"
            onClick={() => {
              dispatch(setSelectedDepartment(params.data.mongoId));
              navigate(`${params.value}`);
            }}
            className="text-primary font-pregular hover:underline cursor-pointer"
          >
            {params.value}
          </span>
        );
      },
    },
    { headerName: "Total Current Month's Tasks", field: "totalTasks", flex: 1 },
    { headerName: "Open Tasks", field: "pendingTasks" },
    { headerName: "Closed Tasks", field: "completedTasks" },
  ];
  return (
    <div className="flex flex-col gap-4">
      <PageFrame>
        <WidgetSection layout={1} padding>
          {departmentLoading ? (
            <div className="flex justify-center items-center py-20">
              <CircularProgress />
            </div>
          ) : (
            <AgTable
              data={fetchedDepartments.map((item, index) => ({
                srNo: index + 1,
                mongoId: item.department?._id,
                department: item.department?.name,
                totalTasks: item.totalTasks,
                pendingTasks: item.pendingTasks,
                completedTasks: item.completedTasks,
              }))}
              columns={departmentColumns}
              tableTitle="ACTIVE DEPARTMENT WISE TASKS"
              hideFilter
            />
          )}
        </WidgetSection>
      </PageFrame>
    </div>
  );
};

export default DepartmentTasks;
