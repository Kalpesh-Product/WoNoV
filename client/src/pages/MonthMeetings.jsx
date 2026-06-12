import React, { useState } from 'react'
import AgTable from '../components/AgTable'
import { useLocation } from 'react-router-dom';
import humanTime from "../utils/humanTime";
import { Avatar, AvatarGroup, Chip } from '@mui/material';
import { MdOutlineRemoveRedEye } from 'react-icons/md';
import dayjs from 'dayjs';
import MuiModal from '../components/MuiModal';
import DetalisFormatted from '../components/DetalisFormatted';

const MonthMeetings = () => {

  const location = useLocation();
  const { meetings = [] } = location.state || {};
  const [selectedMeeting, setSelectedMeeting] = useState(null);

  const handleViewMeeting = (meeting) => {
    const originalMeeting = meeting?._id
      ? meetings.find((item) => item._id === meeting._id)
      : null;
    setSelectedMeeting(originalMeeting || meeting);
  };

  const getDisplayDuration = (meeting) => {
    const startTime = meeting?.startTime;
    const endTime = meeting?.endTime;

    if (!startTime || !endTime) return meeting?.duration || "N/A";

    const durationInMinutes = dayjs(endTime).diff(dayjs(startTime), "minute");

    if (!Number.isFinite(durationInMinutes) || durationInMinutes < 0) {
      return meeting?.duration || "N/A";
    }

    return `${durationInMinutes}min`;
  };

  const getPersonDisplayName = (person) => {
    if (!person) return "N/A";
    if (typeof person === "string") return person;

    return (
      person.employeeName ||
      [person.firstName, person.middleName, person.lastName]
        .filter(Boolean)
        .join(" ") ||
      person.name ||
      "N/A"
    );
  };

  const getDepartmentDisplayName = (department) => {
    if (!department) return "Unknown";
    if (typeof department === "string") return department;
    if (Array.isArray(department)) {
      return department.map((item) => item?.name || item).filter(Boolean).join(", ") || "Unknown";
    }

    return department.name || "Unknown";
  };

  const getCompanyDisplayName = (meeting, fallback = "N/A") =>
    meeting?.client ||
    meeting?.externalClient ||
    meeting?.companyName ||
    meeting?.company?.companyName ||
    fallback;


  const statusColors = {
    Upcoming: { bg: "#E3F2FD", text: "#1565C0" }, // Light Blue
    Ongoing: { bg: "#FFF3E0", text: "#E65100" }, // Light Orange
    Completed: { bg: "#E8F5E9", text: "#1B5E20" }, // Light Green
    Cancelled: { bg: "#FFEBEE", text: "#B71C1C" }, // Light Red
    Available: { bg: "#E3F2FD", text: "#0D47A1" },
    Occupied: { bg: "#ECEFF1", text: "#37474F" },
    Cleaning: { bg: "#E0F2F1", text: "#00796B" },
    Pending: { bg: "#FFFDE7", text: "#F57F17" },
    "In Progress": { bg: "#FBE9E7", text: "#BF360C" },
  };

  const getParticipantDisplayName = (participant = {}) => {
    if (typeof participant === "string") return participant;
    if (participant?.employeeName) return participant.employeeName;

    return [participant?.firstName, participant?.middleName, participant?.lastName]
      .filter(Boolean)
      .join(" ");
  };

  const formatParticipantsForExport = (participants = []) =>
    (Array.isArray(participants) ? participants : [])
      .map(getParticipantDisplayName)
      .filter(Boolean)
      .join(", ");


  const columns = [
    { field: "srNo", headerName: "Sr No" },
    { field: "roomName", headerName: "Room Name" },
    { field: "startDate", headerName: "Date" },
    { field: "startTime", headerName: "Start Time" },
    { field: "endTime", headerName: "End Time" },
    {
      field: "meetingStatus",
      headerName: "Meeting Status",
      sort: "desc",
      cellRenderer: (params) => (
        <Chip
          label={params.value || ""}
          sx={{
            backgroundColor: statusColors[params.value]?.bg || "#F5F5F5",
            color: statusColors[params.value]?.text || "#000",
            fontWeight: "bold",
          }}
        />
      ),
    },
    {
      field: "clientCompanyName",
      headerName: "Client company name",
    },
    {
      field: "participants",
      headerName: "Participants",
      cellRenderer: (params) => {
        const participants = Array.isArray(params.data?.participantsData)
          ? params.data?.participantsData
          : [];
        return (
          <div className="flex justify-start items-center">
            <AvatarGroup max={4}>
              {participants?.map((participant, index) => {
                const participantName = getParticipantDisplayName(participant);
                return (
                  <Avatar
                    key={index}
                    alt={participantName || "Participant"}
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                      participantName || "Participant"
                    )}&background=random`}
                    sx={{ width: 23, height: 23 }}
                  />
                );
              })}
            </AvatarGroup>
          </div>
        );
      },
    },
    { field: "subject", headerName: "Title", hide: true },
    { field: "agenda", headerName: "Agenda", hide: true },
    { field: "durationDisplay", headerName: "Duration", hide: true },
    { field: "meetingType", headerName: "Type", hide: true },
    { field: "companyDisplay", headerName: "Company", hide: true },
    { field: "bookedByDisplay", headerName: "Booked By", hide: true },
    { field: "receptionistDisplay", headerName: "Receptionist", hide: true },
    { field: "departmentDisplay", headerName: "Department", hide: true },
    { field: "locationDisplay", headerName: "Location", hide: true },
    { field: "buildingDisplay", headerName: "Building", hide: true },
    {
      field: "housekeepingStatus",
      headerName: "Housekeeping Status",
      hide: true,
    },
     {
      field: "actions",
      headerName: "Actions",
      pinned: "right",
      sortable: false,
      filter: false,
      cellRenderer: (params) => (
        <button
          type="button"
          aria-label="View meeting details"
          title="View meeting details"
          onClick={() => handleViewMeeting(params.data)}
          className="hover:bg-gray-200 cursor-pointer p-2 rounded-full transition-all"
        >
          <span className="text-subtitle">
            <MdOutlineRemoveRedEye />
          </span>
        </button>
      ),
    },
  ];

  const month = new Date(meetings[0].date).toLocaleString("default", { month: "long" });
  const year = new Date(meetings[0].date).toLocaleString("default", { year: "numeric" });

  const rows = (meetings || []).map((meeting, index) => {
    const parsedStartDate = new Date(meeting.date);
    const parsedStartTime = new Date(meeting.startTime);
    const parsedEndTime = new Date(meeting.endTime);

    return {
      ...meeting,
      participantsData: Array.isArray(meeting.participants)
        ? meeting.participants
        : [],
      participants: formatParticipantsForExport(meeting.participants),

      startDate: !isNaN(parsedStartDate)
        ? dayjs(parsedStartDate).format("DD-MM-YYYY")
        : "Invalid Date",

      startTime: !isNaN(parsedStartTime)
        ? new Intl.DateTimeFormat("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }).format(parsedStartTime).toUpperCase()  // AM/PM uppercase
        : "Invalid Time",

      endTime: !isNaN(parsedEndTime)
        ? new Intl.DateTimeFormat("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }).format(parsedEndTime).toUpperCase()
        : "Invalid Time",

      clientCompanyName:
        meeting.client || meeting.externalClient || "BIZ Nest",
          durationDisplay: getDisplayDuration(meeting),
      companyDisplay: getCompanyDisplayName(meeting),
      bookedByDisplay: getPersonDisplayName(meeting.bookedBy),
      receptionistDisplay: getPersonDisplayName(meeting.receptionist),
      departmentDisplay: getDepartmentDisplayName(meeting.department),
      locationDisplay:
        meeting.location?.unitNo || meeting.location?.unitName
          ? `${meeting.location?.unitNo || "N/A"} (${meeting.location?.unitName || "N/A"})`
          : "N/A",
      buildingDisplay: meeting.location?.building?.buildingName || "N/A",

      srNo: index + 1,
    };
  });


  return (
    <div className="p-4 flex flex-col gap-4">
      <AgTable
        key={meetings.length}
        search
        tableTitle={`${month} ${year} Meetings`}
        data={rows || []}
        columns={columns}
        exportData
      />  
       <MuiModal
        open={Boolean(selectedMeeting)}
        onClose={() => setSelectedMeeting(null)}
        title="Meeting Details"
      >
        {selectedMeeting && (
          <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-4 w-full">
            <div className="font-bold">Basic Info</div>
            <DetalisFormatted
              title="Title"
              detail={selectedMeeting?.subject || "Title"}
            />
            <DetalisFormatted
              title="Agenda"
              detail={selectedMeeting.agenda || "N/A"}
            />
            <DetalisFormatted
              title="Date"
              detail={selectedMeeting?.date || "N/A"}
            />
            <DetalisFormatted
              title="Time"
              detail={`${humanTime(selectedMeeting.startTime)} - ${humanTime(
                selectedMeeting.endTime,
              )}`}
            />
            <DetalisFormatted
              title="Duration"
              detail={getDisplayDuration(selectedMeeting)}
            />
            <DetalisFormatted
              title="Status"
              detail={selectedMeeting.meetingStatus || "N/A"}
            />
            <DetalisFormatted
              title="Type"
              detail={selectedMeeting.meetingType || "N/A"}
            />
            <DetalisFormatted
              title="Company"
              detail={getCompanyDisplayName(selectedMeeting)}
            />

            <br />
            <div className="font-bold">People Involved</div>
            <DetalisFormatted
              title="Participants"
              detail={
                selectedMeeting.participants
                  ?.map(getParticipantDisplayName)
                  .filter(Boolean)
                  .join(", ") || "N/A"
              }
            />
            <DetalisFormatted
              title="Booked By"
              detail={getPersonDisplayName(selectedMeeting.bookedBy)}
            />
            <DetalisFormatted
              title="Receptionist"
              detail={getPersonDisplayName(selectedMeeting.receptionist)}
            />
            <DetalisFormatted
              title="Department"
              detail={getDepartmentDisplayName(selectedMeeting.department)}
            />
            <DetalisFormatted
              title="Company"
              detail={getCompanyDisplayName(selectedMeeting, "Unknown")}
            />

            <br />
            <div className="font-bold">Venue Details</div>
            <DetalisFormatted
              title="Room"
              detail={selectedMeeting.roomName || "N/A"}
            />
            <DetalisFormatted
              title="Location"
              detail={
                selectedMeeting.location?.unitNo || selectedMeeting.location?.unitName
                  ? `${selectedMeeting.location?.unitNo || "N/A"} (${selectedMeeting.location?.unitName || "N/A"})`
                  : "N/A"
              }
            />
            <DetalisFormatted
              title="Building"
              detail={selectedMeeting.location?.building?.buildingName || "N/A"}
            />
            <DetalisFormatted
              title="Housekeeping Status"
              detail={selectedMeeting.housekeepingStatus || "N/A"}
            />
          </div>
        )}
      </MuiModal>
    </div>
  )
}

export default MonthMeetings
