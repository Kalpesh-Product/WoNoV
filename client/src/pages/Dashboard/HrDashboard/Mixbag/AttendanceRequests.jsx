import React, { useState } from "react";
import YearWiseTable from "../../../../components/Tables/YearWiseTable";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import PageFrame from "../../../../components/Pages/PageFrame";
import { useMutation, useQuery } from "@tanstack/react-query";
import humanDate from "../../../../utils/humanDateForamt";
import MuiModal from "../../../../components/MuiModal";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import { HiOutlinePencilSquare } from "react-icons/hi2";
import ThreeDotMenu from "../../../../components/ThreeDotMenu";
import { toast } from "sonner";
import { queryClient } from "../../../../main";
import humanTime from "../../../../utils/humanTime";
import { CircularProgress } from "@mui/material";
import DetalisFormatted from "../../../../components/DetalisFormatted";

const AttendanceRequests = () => {
  const axios = useAxiosPrivate();
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const { data: pendingRequests, isLoading } = useQuery({
    queryKey: ["pending-requests"],
    queryFn: async () => {
      try {
        const response = await axios.get(
          "/api/attendance/get-attendance-requests"
        );
        const filtered = response.data.filter(
          (item) => item.status === "Pending"
        );

        return filtered;
      } catch (error) {
        console.warn(error.mesage);
      }
    },
  });

  const { mutate: approveRequest, isPending: approveRequestPending } =
    useMutation({
      mutationFn: async (id) => {
        const response = await axios.patch(
          `/api/attendance/approve-correct-attendance/${id}`
        );
        return response.data;
      },
      onSuccess: function (data) {
        toast.success(data.message);
        queryClient.invalidateQueries({ queryKey: ["pending-requests"] });
        setSelectedRequest(null);
        setOpenModal(false);
      },
      onError: function (error) {
        toast.error(error.response.data.message);
      },
    });

  const { mutate: rejectRequest, isPending: rejectRequestPending } =
    useMutation({
      mutationFn: async (id) => {
        const response = await axios.patch(
          `/api/attendance/reject-correct-attendance/${id}`
        );
        return response.data;
      },
      onSuccess: function (data) {
        toast.success(data.message);
        queryClient.invalidateQueries(["pending-requests"]);
        setSelectedRequest(null);
        setOpenModal(false);
      },
      onError: function (error) {
        toast.error(error.response.data.message);
      },
    });

  const handleViewUser = (data) => {
    setSelectedRequest(data);
    setOpenModal(true);
  };

  const columns = [
    { field: "srNo", headerName: "Sr No", width: 100 },
    { field: "name", headerName: "Name", flex: 1 },
    { field: "addedBy", headerName: "Added By", flex: 1 },
    { field: "requestDay", headerName: "Date" },
    { field: "inTime", headerName: "Corrected In Time" },
    { field: "outTime", headerName: "Corrected Out Time" },
    {
      field: "actions",
      headerName: "Actions",
      cellRenderer: (params) => (
        <div className="flex items-center gap-4 py-2">
          <MdOutlineRemoveRedEye
        className="text-xl cursor-pointer text-black-600"
        onClick={() => handleViewUser(params.data)}
        title="View Details"
      />
          <ThreeDotMenu
            rowId={params.data.id}
            menuItems={[
              {
                label: "Approve",
                onClick: () => approveRequest(params.data._id),
                isLoading: isLoading,
              },
              {
                label: "Reject",
                onClick: () => rejectRequest(params.data._id),
                isLoading: isLoading,
              },
              // {
              //   label: "View",
              //   onClick: () => handleViewUser(params.data),
              //   isLoading: isLoading,
              // },
            ]}
          />
        </div>
      ),
    },
  ];

  const tableData = isLoading
    ? []
    : pendingRequests.map((item) => ({
        ...item,
        empId: item.user?.empId,
        addedBy: item.addedBy ? `${item.addedBy.firstName} ${item.addedBy.lastName}` : "—",
        reason: item.reason,
        name: `${item.user?.firstName} ${item.user?.lastName}`,
        requestDay: humanDate(item.inTime || item.originalInTime) || "N/A",
        inTime: item.inTime
          ? humanTime(item.inTime)
          : item.originalInTime
            ? humanTime(item.originalInTime)
            : "N/A",
        outTime: humanTime(item.outTime),
        originalInTime: item.originalInTime ? humanTime(item.originalInTime)  : "N/A",
        originalOutTime: item.originalOutTime
          ? humanTime(item.originalOutTime)
          : item.outTime
            ? humanTime(item.outTime)
            : "N/A",
        createdDate: item.createdDate,
        status: item.status,
      }));
       console.log(tableData);
  return (
    <div className="flex flex-col">
      <PageFrame>
        <YearWiseTable
          key={tableData.length}
          
          dateColumn={"createdDate"}
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
          <div className="flex flex-col gap-4">
            {/* 🧑‍💼 Employee Details */}
            <div className=" pb-2">
              <div className="mb-4">
                <span className="text-subtitle font-pmedium text-black ">
                  Employee Details
                </span>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <DetalisFormatted
                  title="Employee ID"
                  detail={selectedRequest?.empId}
                />
                <DetalisFormatted title="Name" detail={selectedRequest?.name} />
                <DetalisFormatted
                  title="Reason"
                  detail={selectedRequest?.reason}
                />
              </div>
            </div>

            {/* 📅 Request Information */}
            <div className=" pb-2">
              <div className="mb-4">
                <span className="text-subtitle font-pmedium text-black mb-4">
                  Request Information
                </span>
              </div>
           
              <div className="grid grid-cols-1 gap-4">
                 <DetalisFormatted
                  title="Raised By"
                  detail={selectedRequest?.addedBy || "N/A"}
                />
                <DetalisFormatted
                  title="Raised Date"
                  detail={humanDate(selectedRequest?.createdAt)}
                />
                <DetalisFormatted
                  title="Attendance Date"
                  detail={selectedRequest?.requestDay}
                />
                <DetalisFormatted
                  title="Status"
                  detail={selectedRequest?.status}
                />
              </div>
            </div>

            {/* ⏰ Attendance Timing */}
            <div>
              <div className="mb-4">
                <span className="text-subtitle font-pmedium text-black mb-4">
                  Attendance Timing
                </span>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <DetalisFormatted
                  title="Corrected In Time"
                  detail={selectedRequest?.inTime}
                />
                <DetalisFormatted
                  title="Corrected Out Time"
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
              
              </div>
            </div>
          </div>
        ) : (
          <div className="flex justify-center items-center py-6">
            <CircularProgress />
          </div>
        )}
      </MuiModal>
    </div>
  );
};

export default AttendanceRequests;
