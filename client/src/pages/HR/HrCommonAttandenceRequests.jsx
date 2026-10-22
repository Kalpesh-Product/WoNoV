import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useQuery } from "@tanstack/react-query";
import YearWiseTable from "../../components/Tables/YearWiseTable";
import useAuth from "../../hooks/useAuth";
import humanDate from "../../utils/humanDateForamt";
import humanTime from "../../utils/humanTime";
import { Chip, CircularProgress } from "@mui/material";

export default function HrCommonAttandenceRequests() {
  const axios = useAxiosPrivate();
  const { auth } = useAuth();

  const {
    data: correctionRequests,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["attandence-correction-requests"],
    queryFn: async () => {
      const response = await axios.get(
        `/api/attendance/get-attendance-requests?userId=${auth.user?._id}`
      );
      return Array.isArray(response.data) ? response.data : [];
    },
    enabled: !!auth?.user?._id,
  });

  const columns = [
    { field: "srNo", headerName: "Sr No", width: 100 },
    { field: "employee", headerName: "Employee" },
    { field: "inTime", headerName: "Corrected In Time" },
    { field: "outTime", headerName: "Corrected Out Time" },
    { field: "originalInTime", headerName: "Original In Time" },
    { field: "originalOutTime", headerName: "Original Out Time" },
    { field: "reason", headerName: "Reason" },

    { field: "date", headerName: "Requested On", width: 150 },
    {
      field: "status",
      headerName: "Status",
      width: 120,
      pinned: "right",
      cellRenderer: (params) => {
        const status = params.value;

        const statusColorMap = {
          Approved: { backgroundColor: "#DFF5E1", color: "#218739" }, // Light green bg, dark green font
          Pending: { backgroundColor: "#FFF8E1", color: "#F5A623" }, // Light yellow bg, orange font
          Rejected: { backgroundColor: "#FDECEA", color: "#D32F2F" }, // Light red bg, red font
        };

        const { backgroundColor, color } = statusColorMap[status] || {
          backgroundColor: "gray",
          color: "white",
        };

        return (
          <Chip
            label={status}
            style={{
              backgroundColor,
              color,
              fontWeight: 500,
            }}
            size="small"
          />
        );
      },
    },
  ];

  const formattedData = correctionRequests?.map((req, idx) => ({
    id: req._id, // Important for MUI or other tables
    srNo: idx + 1,
    employee: `${req.user?.firstName} ${req.user?.lastName}`,
    inTime: req.inTime ? humanTime(req.inTime) : "-",
    outTime: req.outTime ? humanTime(req.outTime) : "-",
    originalInTime: req.originalInTime ? humanTime(req.originalInTime) : "-",
    originalOutTime: req.originalOutTime ? humanTime(req.originalOutTime) : "-",
    reason: req.reason,
    status: req.status,
    date: req.createdAt,
  }));

  return (
    <div className="flex flex-col gap-8">
      <div>
        {isLoading ? (
          <div>
            <CircularProgress color="#1E3D73" />
          </div>
        ) : (
          <div>
            <YearWiseTable
              tableTitle="Attendance Correction Requests"
              search={true}
              dateColumn="date"
              data={formattedData}
              columns={columns}
            />
          </div>
        )}
      </div>
    </div>
  );
}
