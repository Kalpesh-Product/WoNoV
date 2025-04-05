import { useQuery } from "@tanstack/react-query";
import AgTable from "../../components/AgTable";
import { Chip, CircularProgress } from "@mui/material";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { toast } from "sonner";
import MuiModal from "../../components/MuiModal";
import ThreeDotMenu from "../../components/ThreeDotMenu";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import { useEffect, useState } from "react";
import DetalisFormatted from "../../components/DetalisFormatted";

const MeetingReports = () => {
  const axios = useAxiosPrivate();
  const [openModal, setOpenModal] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const { data: myMeetings = [], isPending: isMyMeetingsPending } = useQuery({
    queryKey: ["myMeetings"],
    queryFn: async () => {
      try {
        const response = await axios.get("/api/meetings/my-meetings");
        return response.data;
      } catch (error) {
        toast.error(error || "Failed to load your bookings");
      }
    },
  });
  const handleSelectedMeeting = (meeting) => {
    setSelectedMeeting(meeting);
    setOpenModal(true);
  };
  useEffect(() => {
    console.log("Selected Meeting : ", selectedMeeting);
  }, [selectedMeeting]);
  const meetingReportsColumn = [
    { field: "roomName", headerName: "Room Name" },
    { field: "buildingName", headerName: "Building Name" },
    { field: "unitName", headerName: "Unit Name" },
    { field: "date", headerName: "Date" },
    { field: "meetingType", headerName: "Meeting Type" },
    { field: "duration", headerName: "Duration" },
    {
      field: "meetingStatus",
      headerName: "Status",
      cellRenderer: (params) => {
        const statusColorMap = {
          Ongoing: { backgroundColor: "#d9e8fe", color: "#385391" }, // Light blue bg, dark blue font
          Cancelled: { backgroundColor: "#f7e1e1", color: "#a5333e" }, // Light red bg, dark red font
          Upcoming: { backgroundColor: "#fcf7be", color: "#b87e33" },
        };

        const { backgroundColor, color } = statusColorMap[params.value] || {
          backgroundColor: "gray",
          color: "white",
        };
        return (
          <>
            <Chip
              label={params.value}
              style={{
                backgroundColor,
                color,
              }}
            />
          </>
        );
      },
    },
    {
      field: "action",
      headerName: "Actions",
      cellRenderer: (params) => {
        return (
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
        );
      },
    },
  ];

  const rows = [
    {
      name: "Sam",
      department: "IT",
      date: "2024-01-29",
      startTime: "10:00 AM",
      endTime: "11:00 AM",
      duration: "1h",
      creditsUsed: 20,
      status: "Ongoing",
    },
    {
      name: "Alice",
      department: "Admin",
      date: "2024-01-29",
      startTime: "11:30 AM",
      endTime: "12:15 PM",
      duration: "45m",
      creditsUsed: 50,
      status: "Cancelled",
    },
    {
      name: "Bob",
      department: "HR",
      date: "2024-01-29",
      startTime: "2:00 PM",
      endTime: "3:00 PM",
      duration: "1h",
      creditsUsed: 30,
      status: "Upcoming",
    },
    {
      name: "Emma",
      department: "Finance",
      date: "2024-01-29",
      startTime: "3:30 PM",
      endTime: "4:15 PM",
      duration: "45m",
      creditsUsed: 10,
      status: "Cancelled",
    },
    {
      name: "John",
      department: "IT",
      date: "2024-01-29",
      startTime: "4:30 PM",
      endTime: "6:00 PM",
      duration: "1h 30m",
      creditsUsed: 40,
      status: "Upcoming",
    },
  ];

  return (
    <div className="flex flex-col gap-8 p-4">
      <div>
        {!isMyMeetingsPending ? (
          <AgTable
            search={true}
            exportData
            tableTitle={"Meetings Reports"}
            data={[
              ...myMeetings.map((item, index) => ({
                id: index + 1,
                department: item.department,
                roomName: item.roomName,
                unitNo: item.location?.unitNo,
                unitName: item.location?.unitName,
                buildingName: item.location?.building?.buildingName,
                meetingType: item.meetingType,
                housekeepingStatus: item.housekeepingStatus,
                date: item.date,
                startTime: item.startTime,
                endTime: item.endTime,
                duration: item.duration,
                meetingStatus: item.meetingStatus,
                agenda: item.agenda,
                subject: item.subject,
                housekeepingChecklist: item.housekeepingChecklist,
                participants: item.participants
                  ?.map(
                    (p) =>
                      `${p.firstName || ""} ${p.lastName || ""} (${
                        p.email || ""
                      })`
                  )
                  .join(", "),
              })),
            ]}
            columns={meetingReportsColumn}
          />
        ) : (
          <CircularProgress />
        )}
      </div>
      <MuiModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        title={"Meeting Details"}
      >
        {!isMyMeetingsPending && selectedMeeting ? (
          <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-4">
            <DetalisFormatted
              title="Department"
              detail={selectedMeeting?.department}
            />
            <DetalisFormatted
              title="Room Name"
              detail={selectedMeeting?.roomName}
            />
            <DetalisFormatted
              title="Unit No"
              detail={selectedMeeting?.unitNo}
            />
            <DetalisFormatted
              title="Unit Name"
              detail={selectedMeeting?.unitName}
            />
            <DetalisFormatted
              title="Building"
              detail={selectedMeeting?.buildingName}
            />
            <DetalisFormatted
              title="Meeting Type"
              detail={selectedMeeting?.meetingType}
            />
            <DetalisFormatted
              title="Housekeeping Status"
              detail={selectedMeeting?.housekeepingStatus}
            />
            <DetalisFormatted title="Date" detail={selectedMeeting?.date} />
            <DetalisFormatted
              title="Start Time"
              detail={selectedMeeting?.startTime}
            />
            <DetalisFormatted
              title="End Time"
              detail={selectedMeeting?.endTime}
            />
            <DetalisFormatted
              title="Duration"
              detail={selectedMeeting?.duration}
            />
            <DetalisFormatted
              title="Meeting Status"
              detail={selectedMeeting?.meetingStatus}
            />
            <DetalisFormatted title="Agenda" detail={selectedMeeting?.agenda} />
            <DetalisFormatted
              title="Subject"
              detail={selectedMeeting?.subject}
            />
            <DetalisFormatted
              title="Participants"
              detail={selectedMeeting?.participants}
            />
            <DetalisFormatted
              title="Company"
              detail={selectedMeeting?.company}
            />
          </div>
        ) : (
          <CircularProgress />
        )}
      </MuiModal>
    </div>
  );
};

export default MeetingReports;
