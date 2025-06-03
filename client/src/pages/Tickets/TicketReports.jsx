import React, { useEffect, useState } from "react";
import AgTable from "../../components/AgTable";
import { useQuery } from "@tanstack/react-query";
import useAuth from "../../hooks/useAuth";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import humanDate from "../../utils/humanDateForamt";
import { Chip, CircularProgress } from "@mui/material";
import MuiModal from "../../components/MuiModal";
import MonthWiseTable from "../../components/Tables/MonthWiseTable";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import DetalisFormatted from "../../components/DetalisFormatted";
import dayjs from "dayjs";

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
        // const response = await axios.get(
        //   `/api/tickets/get-all-tickets`
        // );

        return response.data;
      } catch (error) {
        console.error("Error fetching tickets:", error);
        throw new Error("Failed to fetch tickets");
      }
    },
  });

  const kraColumn = [
    { field: "id", headerName: "Sr No", flex: 1 },
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
          Rejected: { backgroundColor: "#FFE0DC", color: "#C2410C" },
          Open: { backgroundColor: "#E6E6FA", color: "#4B0082" },
          Escalated: { backgroundColor: "#E6E6FA", color: "#4B0082" },
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

  return (
    <div className="flex flex-col gap-8 p-4">
      <div>
        {!isLoading ? (
          <AgTable
            search={true}
            tableTitle={"Ticket Reports"}
            data={[
              ...ticketsData.map((item, index) => ({
                id: index + 1,
                ticket: item.ticket || "",
                raisedToDepartment: item.raisedToDepartment?.name || "",
                raisedBy: `${item.raisedBy?.firstName || ""} ${
                  item.raisedBy?.lastName || ""
                }`.trim(),
                description: item.description || "",
                status: item.status || "",
                assignees:
                  item.assignees?.map(
                    (assignee) => `${assignee.firstName} ${assignee.lastName}`
                  ) || "",
                company: item.company?.companyName,
                createdAt: dayjs(item.createdAt).format("DD-MM-YYYY") || "",
                updatedAt: humanDate(item.updatedAt) || "",
                acceptedBy: `${item.acceptedBy?.firstName || ""} ${
                  item.acceptedBy?.lastName || ""
                }`,
                rejectedBy: `${item.reject?.rejectedBy?.firstName || ""} ${
                  item.reject?.rejectedBy?.lastName || ""
                }`,
                reason: item.reject?.reason,
              })),
            ]}
            exportData
            columns={kraColumn}
          />
        ) : (
          // <MonthWiseTable

          // />
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
        {!isLoading && selectedMeeting ? (
          <div className="w-full grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-4">
            <DetalisFormatted
              title={"Ticket"}
              detail={selectedMeeting?.ticket || ""}
            />
            <DetalisFormatted
              title={"Raised To Department"}
              detail={selectedMeeting?.raisedToDepartment || ""}
            />
            <DetalisFormatted
              title={"Raised By"}
              detail={`${selectedMeeting?.raisedBy}`}
            />
            <DetalisFormatted
              title={"Description"}
              detail={selectedMeeting?.description || ""}
            />
            <DetalisFormatted
              title={"Status"}
              detail={selectedMeeting?.status || ""}
            />
            <DetalisFormatted
              title={"Assignees"}
              detail={
                Array.isArray(selectedMeeting?.assignees) &&
                selectedMeeting.assignees.length > 0
                  ? selectedMeeting.assignees
                      .map((assignee) => assignee)
                      .join(", ")
                  : "None"
              }
            />
            <DetalisFormatted
              title={"Accepted By"}
              detail={selectedMeeting.acceptedBy || "None"}
            />

            <DetalisFormatted
              title={"Rejected By"}
              detail={selectedMeeting?.rejectedBy || "None"}
            />
            {selectedMeeting.reason ? (
              <DetalisFormatted
                title={"Reason"}
                detail={selectedMeeting?.reason || "None"}
              />
            ) : (
              ""
            )}
          </div>
        ) : (
          <CircularProgress />
        )}
      </MuiModal>
    </div>
  );
};

export default TicketReports;
