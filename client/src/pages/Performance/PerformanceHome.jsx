import { useQuery } from "@tanstack/react-query";
import AgTable from "../../components/AgTable";
import WidgetSection from "../../components/WidgetSection";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useNavigate } from "react-router-dom";

const PerformanceHome = () => {
  const axios = useAxiosPrivate();
  const navigate = useNavigate()
  const fetchDepartments = async () => {
    try {
      const response = await axios.get(
        "api/company/get-company-data?field=selectedDepartments"
      );
      return response.data?.selectedDepartments;
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
      cellRenderer: (params) => (
        <span role="button" onClick={()=>navigate(`${params.value}`)} className="text-primary font-pregular hover:underline cursor-pointer">{params.value}</span>
      ),
    },
    { headerName: "Daily KRA", field: "dailyKra" },
    { headerName: "Monthly KPA", field: "monthlyKpa" },
    { headerName: "Annual KPA", field: "annualKpa" },
  ];
  return (
    <div className="flex flex-col gap-4">
      <WidgetSection layout={1} padding>
        <AgTable
          data={[
            ...fetchedDepartments.map((item, index) => ({
              srNo: index + 1,
              department: item.department?.name,
            })),
          ]}
          columns={departmentColumns}
          tableTitle={"DEPARTMENT WISE KRA/KPA"}
          hideFilter
        />
      </WidgetSection>
    </div>
  );
};

export default PerformanceHome;
