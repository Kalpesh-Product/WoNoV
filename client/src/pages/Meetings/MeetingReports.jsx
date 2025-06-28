import { useQuery } from "@tanstack/react-query";
import AgTable from "../../components/AgTable";
import YearWiseTable from "../../components/Tables/YearWiseTable";
import { Chip, CircularProgress } from "@mui/material";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { toast } from "sonner";
import MuiModal from "../../components/MuiModal";
import ThreeDotMenu from "../../components/ThreeDotMenu";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import { useEffect, useState } from "react";
import DetalisFormatted from "../../components/DetalisFormatted";
import dayjs from "dayjs";
import PageFrame from "../../components/Pages/PageFrame";
import { useTopDepartment } from "../../hooks/useTopDepartment";
import useAuth from "../../hooks/useAuth";

const MeetingReports = () => {
  const axios = useAxiosPrivate();
  const { auth } = useAuth();
  const [openModal, setOpenModal] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const { isTop } = useTopDepartment({
    additionalTopUserIds: ["67b83885daad0f7bab2f1864"],
    additionalTopDepartmentIds: [
      "6798bae6e469e809084e24a4",
      "6798ba9de469e809084e2494",
    ], //Admin//Tech
  });
  const {
    data: meetings = [],
    isPending: isMeetingsPending,
    error,
  } = useQuery({
    queryKey: ["meetings"],
    queryFn: async () => {
      try {
        const response = await axios.get("/api/meetings/get-meetings");
        return response.data;
      } catch (error) {
        toast.error("Failed to fetch meetings");
        throw error;
      }
    },
  });

  const loggedDeptIds = auth.user?.departments?.map((d) => d._id) || [];

  const filteredMeetings = isMeetingsPending
    ? []
    : meetings.filter((meeting) => {
        const bookedByDepts =
          meeting.bookedBy?.departments?.map((d) => d._id) || [];
        return bookedByDepts.some((deptId) => loggedDeptIds.includes(deptId));
      });

  const handleSelectedMeeting = (meeting) => {
    setSelectedMeeting(meeting);
    setOpenModal(true);
  };

  const meetingReportsData = isTop ? meetings : filteredMeetings;

  const meetingReportsColumn = [
    { field: "srNo", headerName: "Sr No" },
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

  return (
    <div className="flex flex-col gap-8 p-4">
      <PageFrame>
        <div>
          {!isMeetingsPending ? (
            <YearWiseTable
              search={true}
              exportData
              dateColumn={"date"}
              tableTitle={"Meetings Reports"}
              data={[
                ...meetingReportsData.map((item, index) => ({
                  srNo: index + 1,
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
      </PageFrame>
      <MuiModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        title={"Meeting Details"}
      >
        {!isMeetingsPending && selectedMeeting ? (
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
