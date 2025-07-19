import { useMutation, useQuery } from "@tanstack/react-query";
import YearWiseTable from "../../../../components/Tables/YearWiseTable";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import PageFrame from "../../../../components/Pages/PageFrame";
import { Chip } from "@mui/material";
import { toast } from "sonner";
import { queryClient } from "../../../../main";
import ThreeDotMenu from "../../../../components/ThreeDotMenu";

export default function PendingLeaveRequests() {
  const axios = useAxiosPrivate();

  const { data: leavesData = [], isPending: isLeavesPending } = useQuery({
    queryKey: ["leave-requests"],
    queryFn: async () => {
      const response = await axios.get("/api/leaves/view-all-leaves");
      return response.data.filter((data) => data.status === "Pending");
    },
  });

  const { mutate: approveLeave, isPending: isApproving } = useMutation({
    mutationFn: async (leaveId) => {
      const res = await axios.patch(`/api/leaves/approve-leave/${leaveId}`);
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Leave Approved");
      queryClient.invalidateQueries({ queryKey: ["leave-requests"] });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Approval failed");
    },
  });

  const { mutate: rejectLeave, isPending: isRejecting } = useMutation({
    mutationFn: async (leaveId) => {
      const res = await axios.patch(`/api/leaves/reject-leave/${leaveId}`);
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Leave Rejected");
      queryClient.invalidateQueries({ queryKey: ["leave-requests"] });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Rejection failed");
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
    {
      headerName: "Added By",
      field: "addedBy",
      valueGetter: (params) =>
        params.data?.addedBy ?`${params.data?.addedBy?.firstName || ""} ${
          params.data?.addedBy?.lastName || ""
        }` : "—",
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
    },
    {
      field: "action",
      headerName: "Action",
      cellRenderer: (params) => (
        <ThreeDotMenu
          rowId={params.data.id}
          menuItems={[
            { label: "Accept", onClick: () => approveLeave(params.data._id) },
            { label: "Reject", onClick: () => rejectLeave(params.data._id) },
          ]}
        />
      ),
    },
  ];

  if (isLeavesPending) return <div>Loading...</div>;

  return (
    <div>
      <PageFrame>
        <YearWiseTable
          key={leavesData?.length}
          data={leavesData}
          columns={leaveColumns}
          dateColumn="fromDate"
          tableTitle="Leave Requests"
        />
      </PageFrame>
    </div>
  );
}
