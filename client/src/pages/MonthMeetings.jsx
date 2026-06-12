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

  const EMPTY_DISPLAY_VALUES = new Set([
    "",
    "na",
    "n/a",
    "null",
    "undefined",
    "unknown",
    "invalid date",
    "invalid time",
  ]);

  const sanitizeDisplayValue = (value, fallback = "") => {
    if (value === null || value === undefined) return fallback;
    if (typeof value !== "string") return value;

    const trimmedValue = value.trim();
    if (!trimmedValue) return fallback;

    return EMPTY_DISPLAY_VALUES.has(trimmedValue.toLowerCase())
      ? fallback
      : trimmedValue;
  };

  const getDisplayDuration = (meeting) => {
    const startTime = meeting?.startTime;
    const endTime = meeting?.endTime;

    if (!startTime || !endTime) {
      return sanitizeDisplayValue(meeting?.duration);
    }

    const durationInMinutes = dayjs(endTime).diff(dayjs(startTime), "minute");

    if (!Number.isFinite(durationInMinutes) || durationInMinutes < 0) {
      return sanitizeDisplayValue(meeting?.duration);
    }

    return `${durationInMinutes}min`;
  };

  const getPersonDisplayName = (person) => {
    if (!person) return "";
    if (typeof person === "string") return sanitizeDisplayValue(person);

    return sanitizeDisplayValue(
      person.employeeName ||
      [person.firstName, person.middleName, person.lastName]
        .filter(Boolean)
        .join(" ") ||
      person.name
    );
  };

  const getDepartmentDisplayName = (department) => {
    if (!department) return "";
    if (typeof department === "string") return sanitizeDisplayValue(department);
    if (Array.isArray(department)) {
      return sanitizeDisplayValue(
        department.map((item) => item?.name || item).filter(Boolean).join(", ")
      );
    }

    return sanitizeDisplayValue(department.name);
  };

  const getCompanyDisplayName = (meeting, fallback = "") =>
    sanitizeDisplayValue(
      meeting?.client ||
      meeting?.externalClient ||
      meeting?.companyName ||
      meeting?.company?.companyName,
      fallback
    );


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
    if (typeof participant === "string") {
      return sanitizeDisplayValue(participant);
    }
    if (!participant || typeof participant !== "object") return "";

    const directName = sanitizeDisplayValue(
      participant?.employeeName ||
      participant?.name ||
      participant?.fullName ||
      participant?.userName
    );
    if (directName) return directName;

    const combinedName = sanitizeDisplayValue(
      [
        participant?.firstName,
        participant?.middleName,
        participant?.lastName,
      ]
        .filter(Boolean)
        .join(" ")
    );
    if (combinedName) return combinedName;

    return sanitizeDisplayValue(
      participant?.user?.employeeName ||
      participant?.user?.name ||
      participant?.user?.fullName ||
      [
        participant?.user?.firstName,
        participant?.user?.middleName,
        participant?.user?.lastName,
      ]
        .filter(Boolean)
        .join(" ")
    );
  };

  const formatParticipantsForExport = (participants = []) =>
    (Array.isArray(participants) ? participants : [])
      .map(getParticipantDisplayName)
      .filter(Boolean)
      .join(", ");

  const formatMeetingDate = (value) => {
    if (!value) return "";
    const parsedDate = dayjs(value);
    return parsedDate.isValid() ? parsedDate.format("DD-MM-YYYY") : "";
  };


  const columns = [
    { field: "srNo", headerName: "Sr No" },
    { field: "meetingType", headerName: "Type"},
    { field: "roomName", headerName: "Room Name" },
    { field: "meetingDay", headerName: "Date" },
    { field: "meetingStart", headerName: "Start Time" },
    { field: "meetingEnd", headerName: "End Time" },
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
                if (!participantName) return null;
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

      meetingDay: !isNaN(parsedStartDate)
        ? dayjs(parsedStartDate).format("DD-MM-YYYY")
        : "",

      meetingStart: !isNaN(parsedStartTime)
        ? new Intl.DateTimeFormat("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }).format(parsedStartTime).toUpperCase()  // AM/PM uppercase
        : "",

      meetingEnd: !isNaN(parsedEndTime)
        ? new Intl.DateTimeFormat("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }).format(parsedEndTime).toUpperCase()
        : "",

      clientCompanyName: getCompanyDisplayName(meeting, "BIZ Nest"),
      durationDisplay: getDisplayDuration(meeting),
      companyDisplay: getCompanyDisplayName(meeting),
      bookedByDisplay: getPersonDisplayName(meeting.bookedBy),
      receptionistDisplay: getPersonDisplayName(meeting.receptionist),
      departmentDisplay: getDepartmentDisplayName(meeting.department),
      locationDisplay:
        meeting.location?.unitNo || meeting.location?.unitName
          ? sanitizeDisplayValue(
              `${sanitizeDisplayValue(meeting.location?.unitNo) || ""}${
                sanitizeDisplayValue(meeting.location?.unitName)
                  ? ` (${sanitizeDisplayValue(meeting.location?.unitName)})`
                  : ""
              }`
            )
          : "",
      buildingDisplay: sanitizeDisplayValue(
        meeting.location?.building?.buildingName
      ),

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
              detail={formatMeetingDate(selectedMeeting?.date)}
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
                  .join(", ")
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
