import { useQuery } from "@tanstack/react-query";
import AgTable from "../../components/AgTable";
import WidgetSection from "../../components/WidgetSection";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setSelectedDepartment } from "../../redux/slices/performanceSlice";
import { useTopDepartment } from "../../hooks/useTopDepartment";
import useAuth from "../../hooks/useAuth";
import PageFrame from "../../components/Pages/PageFrame";

const PerformanceHome = () => {
  const axios = useAxiosPrivate();
  const { auth } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const currentDepartmentId = auth.user?.departments?.[0]?._id;
  const currentDepartment = auth.user?.departments?.[0]?.name;

  useTopDepartment({
    additionalTopUserIds: [
      // "67b83885daad0f7bab2f1888",
      "681a10b13fc9dc666ede401c",
      "67b83885daad0f7bab2f188b",
    ], //utkarsha //nigel //mac
    onNotTop: () => {
      dispatch(setSelectedDepartment(currentDepartmentId));
      navigate(`/app/performance/${currentDepartment}`);
    },
  });

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
      flex: 1,
      cellRenderer: (params) => {
        return (
          <span
            role="button"
            onClick={() => {
              dispatch(setSelectedDepartment(params.data.mongoId));
              navigate(`${params.value}`);
            }}
            className="text-primary font-pregular hover:underline cursor-pointer">
            {params.value}
          </span>
        );
      },
    },
    { headerName: "Daily KRA", field: "dailyKra" },
    { headerName: "Monthly KPA", field: "monthlyKpa" },
  ];
  return (
    <div className="flex flex-col gap-4">
      <PageFrame>
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
            tableTitle={"DEPARTMENT WISE KRA/KPA"}
            hideFilter
          />
        </WidgetSection>
      </PageFrame>
    </div>
  );
};

export default PerformanceHome;
