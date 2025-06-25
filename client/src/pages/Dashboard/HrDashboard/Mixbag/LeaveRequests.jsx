import { useQuery } from "@tanstack/react-query";
import YearWiseTable from "../../../../components/Tables/YearWiseTable";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import PageFrame from "../../../../components/Pages/PageFrame";

export default function LeaveRequests() {
  const axios = useAxiosPrivate();

  const { data: leavesData = [], isPending: isLeavesPending } = useQuery({
    queryKey: ["leave-requests"],
    queryFn: async () => {
      const response = await axios.get("/api/leaves/view-all-leaves");
      return response.data;
    },
  });

  const leaveColumns = [
    { headerName: "Sr No", field: "srNo" },
    {
      headerName: "Employee",
      field: "employee",
      valueGetter: (params) =>
        `${params.data?.takenBy?.firstName || ""} ${
          params.data?.takenBy?.lastName || ""
        }`,
    },
    { headerName: "Leave Type", field: "leaveType" },
    { headerName: "Leave Period", field: "leavePeriod" },
    { headerName: "From Date", field: "fromDate" },
    { headerName: "To Date", field: "toDate" },
    { headerName: "Hours", field: "hours" },
    { headerName: "Description", field: "description" },
    { headerName: "Status", field: "status" },
  ];

  if (isLeavesPending) return <div>Loading...</div>;

  return (
    <div className="p-4">
      <PageFrame>
        <YearWiseTable
          data={leavesData}
          columns={leaveColumns}
          dateColumn="fromDate"
          tableTitle="Leave Requests"
        />
      </PageFrame>
    </div>
  );
}
