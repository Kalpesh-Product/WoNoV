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
import { CircularProgress } from "@mui/material";
import { useMemo } from "react";

const ManageTicketsHome = () => {
  const axios = useAxiosPrivate();
  const { auth } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const currentDepartmentId = auth.user?.departments?.[0]?._id;
  const currentDepartment = auth.user?.departments?.[0]?.name;

  useTopDepartment({
    additionalTopUserIds: [
      // "67b83885daad0f7bab2f1852",
      // "681a10b13fc9dc666ede401c",
      // "67b83885daad0f7bab2f1888",
      "6961fcd737afa664ab215d10",
    ],
    onNotTop: () => {
      dispatch(setSelectedDepartment(currentDepartmentId));
      navigate(`/app/tickets/manage-tickets/${currentDepartment}`);
    },
  });

  const { data: getAllTickets = [], isLoading } = useQuery({
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

  const ticketSummary = useMemo(
    () =>
      getAllTickets.reduce(
        (summary, item) => ({
          total: summary.total + (Number(item?.totalTickets) || 0),
          open: summary.open + (Number(item?.openTickets) || 0),
          closed: summary.closed + (Number(item?.closedTickets) || 0),
          rejected: summary.rejected + (Number(item?.rejectedTickets) || 0),
        }),
        { total: 0, open: 0, closed: 0, rejected: 0 }
      ),
    [getAllTickets]
  );

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
    { headerName: "Rejected Tickets", field: "rejectedTickets" },
  ];
  return (
    <div className="flex flex-col gap-4 p-4">
      <PageFrame>
        <WidgetSection layout={1} padding>
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <CircularProgress />
            </div>
          ) : (
            <>
              <div className="w-full pb-3">
                <div className="flex justify-between items-center gap-3 flex-wrap">
                  <span className="text-title text-primary font-pmedium uppercase">
                    DEPARTMENT WISE TICKETS
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <div className="flex gap-1 justify-center items-center uppercase bg-[#dbe4ff] text-sm text-[#274784] font-pmedium px-3 py-1.5 rounded-lg border border-[#aec6fb]">
                      <div>Total :</div>
                      <div>{ticketSummary.total}</div>
                    </div>
                    <div className="flex gap-1 justify-center items-center uppercase bg-[#d8f0df] text-sm text-[#16784d] font-pmedium px-3 py-1.5 rounded-lg border border-[#a9ddba]">
                      <div>Open :</div>
                      <div>{ticketSummary.open}</div>
                    </div>
                    <div className="flex gap-1 justify-center items-center uppercase bg-[#fce8e3] text-sm text-[#d96b4f] font-pmedium px-3 py-1.5 rounded-lg border border-[#f3b7a8]">
                      <div>Closed :</div>
                      <div>{ticketSummary.closed}</div>
                    </div>
                    <div className="flex gap-1 justify-center items-center uppercase bg-[#FFECC5] text-sm text-[#CC8400] font-pmedium px-3 py-1.5 rounded-lg border border-[#F6D48F]">
                      <div>Rejected :</div>
                      <div>{ticketSummary.rejected}</div>
                    </div>
                  </div>
                </div>
              </div>
              <AgTable
                data={[
                  ...getAllTickets.map((item, index) => ({
                    srNo: index + 1,
                    mongoId: item.department?._id,
                    department: item.department?.name,
                    totalTickets: item.totalTickets,
                    openTickets: item.openTickets,
                    closedTickets: item.closedTickets,
                    rejectedTickets: item.rejectedTickets,
                  })),
                ]}
                columns={departmentColumns}
                tableTitle={"DEPARTMENT WISE TICKETS"}
                hideTitle
                hideFilter
              />
            </>
          )}
        </WidgetSection>
      </PageFrame>
    </div>
  );
};

export default ManageTicketsHome;
