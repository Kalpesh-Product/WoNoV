import { useQuery } from "@tanstack/react-query";
import YearWiseTable from "../../../../components/Tables/YearWiseTable";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import PageFrame from "../../../../components/Pages/PageFrame";
import { Chip } from "@mui/material";

export default function PendingLeaveRequests() {
  const axios = useAxiosPrivate();

  const { data: leavesData = [], isPending: isLeavesPending } = useQuery({
    queryKey: ["leave-requests"],
    queryFn: async () => {
      const response = await axios.get("/api/leaves/view-all-leaves");
      return response.data.filter((data) => data.status === "Pending");
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
    {
      field: "status",
      headerName: "Status",
      cellRenderer: ({ value }) => {
        let bgColor = "#FEF3C7"; // default: yellow-100
        let textColor = "#92400E"; // default: yellow-700

        if (value === "Approved") {
          bgColor = "#D1FAE5"; // green-100
          textColor = "#047857"; // green-700
        } else if (value === "Rejected") {
          bgColor = "#FECACA"; // red-100
          textColor = "#B91C1C"; // red-700
        } else if (value === "Pending") {
          bgColor = "#FEF3C7"; // yellow-100
          textColor = "#92400E"; // yellow-700
        }

        return (
          <Chip
            label={value}
            sx={{
              backgroundColor: bgColor,
              color: textColor,
              fontWeight: "bold",
            }}
          />
        );
      },
    }
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
