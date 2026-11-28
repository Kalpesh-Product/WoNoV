import dayjs from "dayjs";
import DetalisFormatted from "../../components/DetalisFormatted";
import MeetingTimeDetails from "../../components/MeetingTimeDetails";
import { formatMeetingDateRange } from "../../utils/formatMeetingDateRange";

const getDisplayDuration = (meeting) => {
  if (meeting?.bookingSlots?.length) {
    const minutes = meeting.bookingSlots.reduce((total, slot) =>
      total + dayjs(slot.endTime).diff(dayjs(slot.startTime), "minute"), 0);
    return `${minutes}min`;
  }
  const startTime = meeting?.startTime;
  const endTime = dayjs(meeting?.extendTime).isAfter(meeting?.endTime) && meeting?.extendTime
    ? meeting.extendTime
    : meeting?.endTime;

  if (!startTime || !endTime) return meeting?.duration || "N/A";

  const durationInMinutes = dayjs(endTime).diff(dayjs(startTime), "minute");

  if (!Number.isFinite(durationInMinutes) || durationInMinutes < 0) {
    return meeting?.duration || "N/A";
  }

  return `${durationInMinutes}min`;
};

export default function InternalMeetingDetails({ meeting: selectedMeeting, children }) {
  return (
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
      <DetalisFormatted title="Date" detail={formatMeetingDateRange(selectedMeeting)} />
      <MeetingTimeDetails
        startTime={selectedMeeting.startTime}
        endTime={
          selectedMeeting.scheduledEndTime || selectedMeeting.endTime
        }
        extendTime={selectedMeeting.extendTime}
        duration={getDisplayDuration(selectedMeeting)}
        bookingSlots={selectedMeeting?.bookingSlots}
      />
      <DetalisFormatted
        title="Status"
        detail={selectedMeeting.displayMeetingStatus || "N/A"}
      />
      <DetalisFormatted
        title="Type"
        detail={selectedMeeting.meetingType || "N/A"}
      />
      <DetalisFormatted
        title="Company"
        detail={selectedMeeting.client || "N/A"}
      />
      <br />
      <div className="font-bold">People Involved</div>
      {selectedMeeting.participants?.length > 0 && (
        <DetalisFormatted
          title="Participants"
          detail={
            selectedMeeting.participants
              .map((p) => {
                return p.firstName
                  ? `${p.firstName} ${p.lastName}`
                  : p.employeeName
                    ? p.employeeName
                    : "N/A";
              })
              .join(", ") || "N/A"
          }
        />
      )}

      <DetalisFormatted
        title="Booked By"
        detail={selectedMeeting.bookedBy}
      />
      <DetalisFormatted
        title="Receptionist"
        detail={selectedMeeting.receptionist}
        // detail={`N/A`}
      />
      <DetalisFormatted
        title="Department"
        detail={selectedMeeting.department || "Unknown"}
      />
      <DetalisFormatted
        title="Company"
        detail={selectedMeeting.client || "Unknown"}
      />
      <br />
      <div className="font-bold">Venue Details</div>
      <DetalisFormatted title="Room" detail={selectedMeeting.roomName} />
      <DetalisFormatted
        title="Location"
        detail={`${selectedMeeting.location?.unitNo} (${selectedMeeting.location?.unitName})`}
      />
      <DetalisFormatted
        title="Building"
        detail={selectedMeeting.location?.building?.buildingName}
      />
      <DetalisFormatted
        title="Housekeeping Status"
        detail={selectedMeeting.housekeepingStatus}
      />
      {children}
    </div>
  );
}
