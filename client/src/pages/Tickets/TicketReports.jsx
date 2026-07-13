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
  //const departmentId = auth.user?.departments?.[0]?._id;
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
        const response = await axios.get(`/api/tickets/get-all-tickets`);

    // queryKey: ["tickets-data", departmentId],
    // enabled: Boolean(departmentId),
    // queryFn: async () => {
    //   try {
    //     const response = await axios.get(
    //       `/api/tickets/department-tickets/${departmentId}`,
    //     );
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

  const splitDateAndTime = (value) => ({
    date: value ? humanDate(value) : "",
    time: value ? humanTime(value) : "",
  });

  const formatDateTimeOrEmpty = (value) => {
    if (!value) return "";
    const formatted = formatDateTime(value);
    return formatted === "N/A" ? "" : formatted;
  };

  const getFromDepartment = (ticket) => {
    const departments = [
      ...(Array.isArray(ticket?.raisedBy?.departments)
        ? ticket.raisedBy.departments
        : []),
      ...(Array.isArray(ticket?.ticket?.raisedBy?.departments)
        ? ticket.ticket.raisedBy.departments
        : []),
    ];

    const departmentNames = departments
      .map((department) => department?.name)
      .filter(Boolean);

    return departmentNames.length ? departmentNames.join(", ") : "";
  };

  const kraColumn = [
    { field: "srNo", headerName: "Sr No" },
    { field: "ticket", headerName: "Ticket Title" },
    { field: "fromDepartment", headerName: "From Department" },
    { field: "raisedBy", headerName: "Raised By" },
    {
      field: "raisedAt",
      headerName: "Raised At",
    },
    { field: "raisedToDepartment", headerName: "Raised To Department" },
    { field: "acceptedBy", headerName: "Accepted By" },
    {
      field: "status",
      headerName: "Status",
      cellRenderer: (params) => <StatusChip status={params.value } />,
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
    { field: "priority", headerName: "Priority", hide: true },
    { field: "description", headerName: "Description", hide: true },
    //{ field: "company", headerName: "Company", hide: true },
    { field: "assignedTo", headerName: "Assigned To", hide: true },
    { field: "assignedAtDate", headerName: "Assign At", hide: true },
   // { field: "acceptedBy", headerName: "Accepted By", hide: true },
    {
      // field: "acceptedAtDate",
      field: "acceptedAt",
      headerName: "Accepted At",
      hide: true,
      // cellRenderer: (params) => params.value,
    },

    // {
    //   field: "assignedAtTime",
    //   headerName: "Assigned Time",
    //   hide: true,
    //   cellRenderer: (params) => humanTime(params.value),
    // },
    { field: "escalatedTo", headerName: "Escalated To", hide: true },
    { field: "escalatedStatus", headerName: "Escalated Status", hide: true },
    {
      // field: "escalatedAtDate",
      field: "escalatedAt",
      headerName: "Escalated At",
      hide: true,
    },
    // {
    //   field: "escalatedAtTime",
    //   headerName: "Escalated Time",
    //   hide: true,
    //   cellRenderer: (params) => params.value,
    // },
    { field: "closedBy", headerName: "Closed By", hide: true },
    {
      // field: "closedAtDate",
      field: "closedAt",
      headerName: "Closed At",
      hide: true,
      // cellRenderer: (params) => params.value,
    },
    // {
    //   field: "closedAtTime",
    //   headerName: "Closed Time",
    //   hide: true,
    //   cellRenderer: (params) => params.value,
    // },
    { field: "rejectedBy", headerName: "Rejected By", hide: true },
    { field: "rejectedAt", headerName: "Rejected At", hide: true },
    { field: "reason", headerName: "Rejection Reason", hide: true },
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
            ? formatDateTime(assignment.assignedAt)
            : "";

          // `${humanDate(assignment.assignedAt)}, ${humanTime(
          //     assignment.assignedAt
          //   )}`
          return { assigneeName, assignedAtFormatted };
        })
      : [];

    // const assignedToDisplay = assignmentDetails
    //   .map(({ assigneeName, assignedAtFormatted }) =>
    //     assignedAtFormatted
    //       ? `${assigneeName} (${assignedAtFormatted})`
    //       : assigneeName,
    //   )
    //   .join(", ");
    const assignedToDisplay = assignmentDetails
  .map(({ assigneeName }) => assigneeName)
  .join(", ");

    return { assignedToDisplay, assignmentDetails };
  };

  // const formatEscalation = (escalations = []) => {
  //   if (!Array.isArray(escalations) || !escalations.length) {
  //     return {
  //       escalatedTo: "",
  //       escalatedStatus: "",
  //       escalatedAt: "",
  //       escalatedAtDate: "",
  //       escalatedAtTime: "",
  //     };
  //   }

  //   const latest = escalations[escalations.length - 1];

  //   return {
  //     escalatedTo: latest?.raisedToDepartment?.name || "",
  //     escalatedStatus: latest?.status || "",
  //     escalatedAt: latest?.createdAt
  // ? formatDateTime(latest.createdAt)
  // : "",
  //     // escalatedAt: latest?.createdAt
  //     //   ? `${humanDate(latest.createdAt)}, ${humanTime(latest.createdAt)}`
  //     //   : "",
  //     escalatedAtDate: latest?.createdAt,
  //     escalatedAtTime: latest?.createdAt,
  //   };
  // };
  const getFullName = (user) => {
    if (!user) return "";
    if (typeof user === "string") return user;

    return `${user?.firstName || ""} ${user?.lastName || ""}`.trim();
  };

  const getDepartmentName = (department) => {
    if (!department) return "";
    if (typeof department === "string") return department;

    return department?.name || department?.departmentName || "";
  };

  const getRejectedByUser = (ticket) =>
    ticket?.reject?.rejectedBy ||
    ticket?.rejectedBy ||
    ticket?.rejectBy ||
    null;

  const formatEscalation = (ticket) => {
    const escalationList = Array.isArray(ticket?.escalatedTo)
      ? ticket.escalatedTo
      : ticket?.escalatedTo
        ? [ticket.escalatedTo]
        : [];

    const isEscalatedTicket =
      ticket?.status === "Escalated" || escalationList.length > 0;

    if (!isEscalatedTicket) {
      return {
        escalatedTo: "",
        escalatedStatus: "",
        escalatedAt: "",
        escalatedAtDate: "",
        escalatedAtTime: "",
      };
    }

    const latest = escalationList[escalationList.length - 1];

    const escalatedTo =
      getDepartmentName(latest?.raisedToDepartment) ||
      getDepartmentName(ticket?.raisedToDepartment) ||
      "";

    const escalatedStatus = ticket?.status || latest?.status || "";

    const escalatedAtRaw =
      ticket?.escalatededAt || latest?.createdAt || ticket?.updatedAt || "";

    return {
      escalatedTo,
      escalatedStatus,
      escalatedAt: escalatedAtRaw ? formatDateTime(escalatedAtRaw) : "",
      escalatedAtDate: escalatedAtRaw || "",
      escalatedAtTime: escalatedAtRaw || "",
    };
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
                  fromDepartment: getFromDepartment(item),
                  raisedToDepartment: getDepartmentName(item.raisedToDepartment),
                  raisedBy: getFullName(item.raisedBy),
                  description: item.description || "",
                  status: item.status || "",
                  image: item?.image?.url || "",
                  assignees:
                    item.assignees?.map(
                      (assignee) =>
                        `${assignee.firstName} ${assignee.lastName}`,
                    ) || "",
                  company: item.company?.companyName,
                  priority: item.priority || "",
                  raisedAt: formatDateTime(item.createdAt) || "",
                  updatedAt: item.updatedAt || "",
                  acceptedBy: getFullName(item.acceptedBy),
                  closedBy: getFullName(item.closedBy),
                  closedAt: item.closedAt ? formatDateTime(item.closedAt) : "",
                  closedAtDate: item.closedAt || "",
                  closedAtTime: item.closedAt || "",
                  rejectedBy: getFullName(getRejectedByUser(item)),
                  rejectedAt:
                    formatDateTimeOrEmpty(
                      item.reject?.rejectedAt ||
                        (item.status === "Rejected" ? item.updatedAt : ""),
                    ) || "",
                  acceptedAtDate: item.acceptedAt || "",
                  acceptedAtTime: item.acceptedAt || "",
                  acceptedAt: item.acceptedAt
  ? formatDateTime(item.acceptedAt)
  : "",
                  assignedAt:
                    item.assignedAt ||
                    (Array.isArray(item.assignedTo) &&
                      item.assignedTo[item.assignedTo.length - 1]
                        ?.assignedAt) ||
                    "",
                  reason: item.reject?.reason || "",
                  ...(() => {
                    const { assignedToDisplay, assignmentDetails } =
                      formatAssignments(item.assignedTo);
                    return {
                      assignedTo: assignedToDisplay,
                      assignedToDetails: assignmentDetails,
                    };
                  })(),
                  ...formatEscalation(item),
                  ...(() => {
                    // const { assignedToDisplay, assignmentDetails } =
                    //   formatAssignments(item.assignedTo);

                    const latestAssignment =
                      Array.isArray(item.assignedTo) && item.assignedTo.length
                        ? item.assignedTo[item.assignedTo.length - 1]
                        : null;

                    const assignedAtRaw =
                      item.assignedAt || latestAssignment?.assignedAt;

                    const { time: assignedAtTime } =
                      splitDateAndTime(assignedAtRaw);

                    return {
                      // assignedTo: assignedToDisplay,
                      // assignedToDetails: assignmentDetails,

                      assignedAtDate:
                        formatDateTimeOrEmpty(assignedAtRaw) || "",
                      assignedAtTime,
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
                title={"Ticket Title"}
                detail={selectedMeeting?.ticket || ""}
              />
              <DetalisFormatted
                title={"Description"}
                detail={selectedMeeting?.description || ""}
              />
            <DetalisFormatted
              title={"From Department"}
              detail={selectedMeeting?.fromDepartment || ""}
            />
            <DetalisFormatted
              title={"Raised By"}
              detail={`${selectedMeeting?.raisedBy}`}
            />
            <DetalisFormatted
              title={"Raised At"}
              detail={`${formatDateTime(selectedMeeting?.createdAt) || ""}`}
            />
              <DetalisFormatted
                title={"Raised To Department"}
                detail={selectedMeeting?.raisedToDepartment || ""}
              />
              <DetalisFormatted
                title={"Priority"}
                detail={selectedMeeting?.priority || ""}
              />
              <DetalisFormatted
                title={"Status"}
                detail={selectedMeeting?.status || ""}
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
                detail={selectedMeeting.acceptedBy || ""}
              />
            <DetalisFormatted
              title={"Accepted At"}
              detail={formatDateTime(selectedMeeting?.acceptedAt) || ""}
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
                          {assignment.assignedAtFormatted || ""}
                        </div>
                      </div>
                    ),
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
              title={"Escalated To"}
              detail={selectedMeeting?.escalatedTo || ""}
            />
            <DetalisFormatted
              title={"Escalated Status"}
              detail={selectedMeeting?.escalatedStatus || ""}
            />
            <DetalisFormatted
              title={"Escalated At"}
              detail={selectedMeeting?.escalatedAt || ""}
            />
            <DetalisFormatted
              title="Closed By"
              detail={selectedMeeting?.closedBy || ""}
            />
            <DetalisFormatted
              title="Closed At"
              detail={formatDateTime(selectedMeeting?.closedAt) || ""}
            />
            {/* <DetalisFormatted
              title={"Rejected By"}
              detail={selectedMeeting?.rejectedBy || "None"}
            /> */}
            {selectedMeeting.reason ? (
              <DetalisFormatted
                title={"Reason"}
                detail={selectedMeeting?.reason || ""}
              />
            ) : (
              ""
            )}
            {selectedMeeting?.image && (
              <div className="lg:col-span-1">
                <img
                  src={selectedMeeting.image}
                  alt="Ticket Attachment"
                  className="max-w-full max-h-96 rounded border"
                />
              </div>
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
