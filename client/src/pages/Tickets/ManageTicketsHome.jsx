import { useQuery } from "@tanstack/react-query";
import AgTable from "../../components/AgTable";
import WidgetSection from "../../components/WidgetSection";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setSelectedDepartment } from "../../redux/slices/performanceSlice";
import { useTopDepartment } from "../../hooks/useTopDepartment";
import useAuth from "../../hooks/useAuth";

const ManageTicketsHome = () => {
  const axios = useAxiosPrivate();
  const { auth } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const currentDepartmentId = auth.user?.departments?.[0]?._id;
  const currentDepartment = auth.user?.departments?.[0]?.name;

  useTopDepartment({
    onNotTop: () => {
      dispatch(setSelectedDepartment(currentDepartmentId));
      navigate(`${currentDepartment}`);
    },
  });

  const { data: getAllTickets=[], isLoading } = useQuery({
    queryKey: ["all-tickets"],
    queryFn: async () => {
      try {
        const response = await axios.get("/api/tickets/get-depts-tickets");
        return response.data;
      } catch (error) {
        console.log(error);
      }
    },
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
              console.log("Navigating with ID:", params.data?.mongoId);
            }}
            className="text-primary font-pregular hover:underline cursor-pointer"
          >
            {params.value}
          </span>
        );
      },
    },
    { headerName: "Total Tickets", field: "totalTickets" },
    { headerName: "Open Tickets", field: "openTickets" },
    { headerName: "Closed Tickets", field: "closedTickets" },
  ];
  return (
    <div className="flex flex-col gap-4 p-4">
      <WidgetSection layout={1} padding>
        <AgTable
          data={[
            ...getAllTickets.map((item, index) => ({
              srNo: index + 1,
              mongoId: item.department?._id,
              department: item.department?.name,
              totalTickets: item.totalTickets,
              openTickets: item.openTickets,
              closedTickets: item.closedTickets,
            })),
          ]}
          columns={departmentColumns}
          tableTitle={"DEPARTMENT WISE TICKETS"}
          hideFilter
        />
      </WidgetSection>
    </div>
  );
};

export default ManageTicketsHome;
