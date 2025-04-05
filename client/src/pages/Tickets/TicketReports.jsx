import React, { useEffect, useState } from "react";
import AgTable from "../../components/AgTable";
import { useQuery } from "@tanstack/react-query";
import useAuth from "../../hooks/useAuth";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import humanDate from "../../utils/humanDateForamt";
import { Chip, CircularProgress } from "@mui/material";
import MuiModal from "../../components/MuiModal";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import DetalisFormatted from "../../components/DetalisFormatted";

const TicketReports = () => {
  const { auth } = useAuth();
  const axios = useAxiosPrivate();
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [detailsModal, setDetailsModal] = useState(false);

  const handleSelectedMeeting = (meeting) => {
    setSelectedMeeting(meeting);
    setDetailsModal(true);
  };
  const { data: ticketsData = [], isLoading } = useQuery({
    queryKey: ["tickets-data"],
    queryFn: async () => {
      try {
        const response = await axios.get(
          `/api/tickets/department-tickets/${auth.user?.departments?.map(
            (dept) => dept._id
          )}`
        );

        return response.data;
      } catch (error) {
        console.error("Error fetching tickets:", error);
        throw new Error("Failed to fetch tickets");
      }
    },
  });
  const kraColumn = [
    { field: "id", headerName: "ID", flex: 1 },
    { field: "ticket", headerName: "Ticket", flex: 1 },
    { field: "createdAt", headerName: "Date", flex: 1 },
    { field: "raisedToDepartment", headerName: "Raised To", flex: 1 },
    { field: "raisedBy", headerName: "Raised By", flex: 1 },
    {
      field: "status",
      headerName: "Status",
      cellRenderer: (params) => {
        const statusColorMap = {
          "In Progress": { backgroundColor: "#FFECC5", color: "#CC8400" },
          Closed: { backgroundColor: "#90EE90", color: "#02730a" },
        };

        const { backgroundColor, color } = statusColorMap[params.value] || {
          backgroundColor: "gray",
          color: "white",
        };
        return <Chip label={params.value} style={{ backgroundColor, color }} />;
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      cellRenderer: (params) => (
        <>
          <div className="flex gap-2 items-center">
            <div
              onClick={() => {
                handleSelectedMeeting(params.data);
              }}
              className="hover:bg-gray-200 cursor-pointer p-2 rounded-full transition-all"
            >
              <span className="text-subtitle">
                <MdOutlineRemoveRedEye />
              </span>
            </div>
          </div>
        </>
      ),
    },
  ];
  useEffect(()=>{console.log("Selected Meetings : ", selectedMeeting)},[selectedMeeting])

  return (
    <div className="flex flex-col gap-8 p-4">
      <div>
        {!isLoading ? (
          <AgTable
            search={true}
            buttonTitle={"Export"}
            tableTitle={"Ticket Reports"}
            data={[
              ...ticketsData
                .filter((item) => item.raisedBy?._id === auth.user?._id)
                .map((item, index) => ({
                  id: index + 1,
                  ticket: item.ticket,
                  raisedToDepartment: item.raisedToDepartment?.name,
                  raisedBy: `${item.raisedBy?.firstName || ""} ${
                    item.raisedBy?.lastName || ""
                  }`.trim(),
                  description: item.description,
                  status: item.status,
                  assignees: item.assignees,
                  // company: item.company,
                  createdAt: humanDate(item.createdAt),
                  updatedAt: humanDate(item.updatedAt),
                  // acceptedBy: item.acceptedBy,
                })),
            ]}
            columns={kraColumn}
          />
        ) : (
          <div className="flex justify-center items-center">
            <CircularProgress />
          </div>
        )}
      </div>
      <MuiModal
        open={detailsModal}
        onClose={() => setDetailsModal(false)}
        title={"Ticket Detials"}
      >
        <div className="w-full grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-4">
          <DetalisFormatted title={"Ticket"} detail={selectedMeeting.ticket || ""} />
          <DetalisFormatted
            title={"Raised To Department"}
            detail={selectedMeeting.raisedToDepartment || ""}
          />
          <DetalisFormatted
            title={"Raised By"}
            detail={`${selectedMeeting.raisedBy}`}
          />
          <DetalisFormatted
            title={"Description"}
            detail={selectedMeeting.description || ""}
          />
          <DetalisFormatted title={"Status"} detail={selectedMeeting.status || ""} />
          <DetalisFormatted
            title={"Assignees"}
            detail={
              Array.isArray(selectedMeeting.assignees)
                ? selectedMeeting.assignees.join(", ")
                : ""
            }
          />
          <DetalisFormatted
            title={"Created At"}
            detail={humanDate(selectedMeeting.createdAt)}
          />
          <DetalisFormatted
            title={"Updated At"}
            detail={humanDate(selectedMeeting.updatedAt)}
          />
          <DetalisFormatted
            title={"Accepted By"}
            detail={selectedMeeting.acceptedBy || ""}
          />
        </div>
      </MuiModal>
    </div>
  );
};

export default TicketReports;
