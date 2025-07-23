import React from "react";
import YearWiseTable from "../../../../components/Tables/YearWiseTable";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import PageFrame from "../../../../components/Pages/PageFrame";
import { useQuery } from "@tanstack/react-query";
import { CircularProgress } from "@mui/material";
import humanDate from "../../../../utils/humanDateForamt";
import { useState } from "react";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import DetalisFormatted from "../../../../components/DetalisFormatted";
import MuiModal from "../../../../components/MuiModal";
import humanTime from "../../../../utils/humanTime";
import StatusChip from "../../../../components/StatusChip";

const AttendanceCompleted = () => {
  const axios = useAxiosPrivate();
  const [openModal, setOpenModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ["attendance-requests"],
    queryFn: async () => {
      try {
        const response = await axios.get(
          "/api/attendance/get-attendance-requests"
        );

        return response.data.filter((data) => data.status !== "Pending");
      } catch (error) {
        console.warn(error.mesage);
      }
    },
  });

  const columns = [
    { field: "srNo", headerName: "Sr No", width: 100 },
    {
      field: "name",
      headerName: "Name",
      flex: 1,
      cellRenderer: (params) => (
        <span
          className="text-primary cursor-pointer underline"
          onClick={() => handleViewDetails(params.data)}
        >
          {params.value}
        </span>
      ),
    },
    { field: "addedBy", headerName: "Added By", flex: 1 },
    { field: "date", headerName: "Date" },
    { field: "inTime", headerName: "Start Time" },
    { field: "outTime", headerName: "End Time" },
    { field: "status", headerName: "Status", cellRenderer : (params)=>(<StatusChip status={params.value} />) },
  ];

  const tableData = isLoading
    ? []
    : data.map((item) => ({
        ...item,
        empId: item.user?.empId,
        addedBy:
          item.addedBy ? `${item.addedBy.firstName} ${item.addedBy.lastName}` : "—",
        reason: item.reason,
        name: `${item.user?.firstName} ${item.user?.lastName}`,
        date: item.createdAt,
        inTime: humanTime(item.inTime),
        outTime: humanTime(item.outTime),
        originalInTime: humanTime(item.originalInTime),
        originalOutTime: humanTime(item.originalOutTime),
        status: item.status,
      }));

  const handleViewDetails = (row) => {
    setSelectedRequest(row);
    setOpenModal(true);
  };

  return (
    <div className="flex flex-col">
      <PageFrame>
        <YearWiseTable
          dateColumn={"date"}
          columns={columns}
          data={!isLoading ? tableData : []}
          tableTitle={"ATTENDANCE REQUESTS"}
        />
      </PageFrame>
      <MuiModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        title={"Attendance Request Details"}
      >
        {selectedRequest ? (
          <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
            <DetalisFormatted
              title="Employee ID"
              detail={selectedRequest?.empId}
            />
            <DetalisFormatted title="Name" detail={selectedRequest?.name} />
            <DetalisFormatted title="Reason" detail={selectedRequest?.reason} />
            <DetalisFormatted title="Date" detail={selectedRequest?.date} />
            <DetalisFormatted
              title="Raised By"
              detail={selectedRequest?.addedBy || "N/A"}
            />
            <DetalisFormatted
              title="Start Time"
              detail={selectedRequest?.inTime}
            />
            <DetalisFormatted
              title="End Time"
              detail={selectedRequest?.outTime}
            />
            <DetalisFormatted
              title="Original Start Time"
              detail={selectedRequest?.originalInTime}
            />
            <DetalisFormatted
              title="Original End Time"
              detail={selectedRequest?.originalOutTime}
            />
            <DetalisFormatted title="Status" detail={selectedRequest?.status} />
            {selectedRequest?.approvedBy && (
              <DetalisFormatted
                title="Approved By"
                detail={
                  selectedRequest.approvedBy?.firstName ||
                  selectedRequest.approvedBy?.lastName
                    ? `${selectedRequest.approvedBy?.firstName || ""} ${
                        selectedRequest.approvedBy?.lastName || ""
                      }`.trim()
                    : "N/A"
                }
              />
            )}
            {selectedRequest?.rejectedBy && (
              <DetalisFormatted
                title="Rejected By"
                detail={
                  selectedRequest.rejectedBy?.firstName ||
                  selectedRequest.rejectedBy?.lastName
                    ? `${selectedRequest.rejectedBy?.firstName || ""} ${
                        selectedRequest.rejectedBy?.lastName || ""
                      }`.trim()
                    : "N/A"
                }
              />
            )}
          </div>
        ) : (
          <CircularProgress />
        )}
      </MuiModal>
    </div>
  );
};

export default AttendanceCompleted;
