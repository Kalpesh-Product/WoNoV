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
import dayjs from "dayjs";
import PageFrame from "../../components/Pages/PageFrame";
import YearWiseTable from "../../components/Tables/YearWiseTable";
import humanTime from "../../utils/humanTime";
import StatusChip from "../../components/StatusChip";
import formatDateTime from "../../utils/formatDateTime";

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
          `/api/tickets/ticket-reports/${auth.user?.departments[0]?._id}`
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
    { field: "srNo", headerName: "Sr No", flex: 1 },
    { field: "ticket", headerName: "Ticket", flex: 1 },
    {
      field: "createdAt",
      headerName: "Date",
      flex: 1,
      cellRenderer: (params) => humanDate(params.value),
    },
    { field: "raisedToDepartment", headerName: "Raised To", flex: 1 },
    { field: "raisedBy", headerName: "Raised By", flex: 1 },
    {
      field: "status",
      headerName: "Status",
      cellRenderer: (params) => <StatusChip status={params.value || "N/A"} />,
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

  const formatAssignments = (assignments = []) => {
    const assignmentDetails = Array.isArray(assignments)
      ? assignments.map((assignment) => {
          const assignee = assignment?.assignee;
          const assigneeName =
            assignee?.firstName && assignee?.lastName
              ? `${assignee.firstName} ${assignee.lastName}`
              : "Unknown";
          const assignedAtFormatted = assignment?.assignedAt
            ? `${humanDate(assignment.assignedAt)}, ${humanTime(
                assignment.assignedAt
              )}`
            : "";
          return { assigneeName, assignedAtFormatted };
        })
      : [];

    const assignedToDisplay = assignmentDetails
      .map(({ assigneeName, assignedAtFormatted }) =>
        assignedAtFormatted
          ? `${assigneeName} (${assignedAtFormatted})`
          : assigneeName
      )
      .join(", ");

    return { assignedToDisplay, assignmentDetails };
  };

  return (
    <div className="flex flex-col gap-8 p-4">
      <PageFrame>
        <div>
          {!isLoading ? (
            <YearWiseTable
              search={true}
              exportData={true}
              tableTitle={"Ticket Reports"}
              hideFilter={false}
              data={[
                ...ticketsData.map((item) => ({
                  ...item,
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
                  createdAt: item.createdAt || "",
                  updatedAt: item.updatedAt || "",
                  acceptedBy: `${item.acceptedBy?.firstName || ""} ${
                    item.acceptedBy?.lastName || ""
                  }`,
                  closedBy: item?.closedBy
                    ? `${item.closedBy.firstName} ${item.closedBy.lastName}`
                    : "None",
                  closedAt: item.closedAt ? item.closedAt : "None",
                  rejectedBy: `${item.reject?.rejectedBy?.firstName || ""} ${
                    item.reject?.rejectedBy?.lastName || ""
                  }`,
                  reason: item.reject?.reason,
                  ...(() => {
                    const { assignedToDisplay, assignmentDetails } =
                      formatAssignments(item.assignedTo);
                    return {
                      assignedTo: assignedToDisplay,
                      assignedToDetails: assignmentDetails,
                    };
                  })(),
                })),
              ]}
              dateColumn={"createdAt"}
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
      </PageFrame>
      <MuiModal
        open={detailsModal}
        onClose={() => setDetailsModal(false)}
        title={"Ticket Details"}
      >
        {!isLoading && selectedMeeting ? (
          <div className="w-full grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-4">
            <DetalisFormatted
              title={"Ticket"}
              detail={selectedMeeting?.ticket || ""}
            />
            <DetalisFormatted
              title={"Description"}
              detail={selectedMeeting?.description || ""}
            />

            <DetalisFormatted
              title={"Raised By"}
              detail={`${selectedMeeting?.raisedBy}`}
            />
            <DetalisFormatted
              title={"Raised At"}
              detail={`${selectedMeeting?.date || "N/A"}`}
            />
            <DetalisFormatted
              title={"Raised To Department"}
              detail={selectedMeeting?.raisedToDepartment || ""}
            />
            <DetalisFormatted
              title={"Status"}
              detail={selectedMeeting?.status || ""}
            />
            <DetalisFormatted
              title={"Priority"}
              detail={selectedMeeting?.priority || ""}
            />
            {/* <DetalisFormatted
              title={"Assignees"}
              detail={
                Array.isArray(selectedMeeting?.assignees) &&
                selectedMeeting.assignees.length > 0
                  ? selectedMeeting.assignees
                      .map((assignee) => assignee)
                      .join(", ")
                  : "None"
              }
            /> */}
            <DetalisFormatted
              title={"Accepted By"}
              detail={selectedMeeting.acceptedBy || "None"}
            />

            <DetalisFormatted
              title={"Accepted At"}
              detail={formatDateTime(selectedMeeting?.acceptedAt) || "N/A"}
            />

            {selectedMeeting?.assignedToDetails?.length ? (
              <div className="text-content flex items-start w-full">
                <span className="w-[50%]">Assignees</span>
                <span>:</span>
                <div className="text-content flex flex-col gap-2 items-start w-full justify-start pl-4">
                  {selectedMeeting.assignedToDetails.map(
                    (assignment, index) => (
                      <div key={`${assignment.assigneeName}-${index}`}>
                        <div className="font-medium">
                          {assignment.assigneeName}
                        </div>
                        <div className="text-borderGray">
                          {assignment.assignedAtFormatted || "N/A"}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            ) : (
              <DetalisFormatted
                title="Assignees"
                detail={selectedMeeting?.assignedTo || ""}
              />
            )}
            <DetalisFormatted
              title="Closed Date"
              detail={humanDate(selectedMeeting?.closedAt)}
            />
            <DetalisFormatted
              title="Closed At"
              detail={humanTime(selectedMeeting?.closedAt)}
            />
            <DetalisFormatted
              title="Closed By"
              detail={selectedMeeting?.closedBy}
            />

            {/* <DetalisFormatted
              title={"Rejected By"}
              detail={selectedMeeting?.rejectedBy || "None"}
            /> */}
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
