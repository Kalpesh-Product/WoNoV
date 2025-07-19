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
import humanDate from "../../utils/humanDateForamt";
import humanTime from "../../utils/humanTime";
import StatusChip from "../../components/StatusChip";

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
      cellRenderer: (params) => <StatusChip status={params.value} />,
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
                ...meetingReportsData.map((item, index) => {
                  return {
                    srNo: index + 1,
                    id: index + 1,
                    bookedBy: item.bookedBy
                      ? `${item.bookedBy.firstName} ${item.bookedBy.lastName}`
                      : item.clientBookedBy?.employeeName || "Unknown",
                    receptionist: item?.receptionist,
                    department: item.department,
                    roomName: item.roomName,
                    location: item.location?.unitNo,
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
                      ?.map((p) =>
                        p.firstName
                          ? `${p.firstName || ""} ${p.lastName || ""} `
                          : `${p.name || ""}`
                      )
                      .join(", "),
                  };
                }),
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
          <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-4 w-full">
            {/* Section 1: Basic Info */}
            <div className="font-bold">Basic Info</div>
            <DetalisFormatted
              title="Meeting Type"
              detail={selectedMeeting?.meetingType || "N/A"}
            />
            <DetalisFormatted
              title="Subject"
              detail={selectedMeeting?.subject || "N/A"}
            />
            <DetalisFormatted
              title="Agenda"
              detail={selectedMeeting?.agenda || "N/A"}
            />
            <DetalisFormatted
              title="Date"
              detail={selectedMeeting?.date ? selectedMeeting?.date : "N/A"}
            />
            <DetalisFormatted
              title="Time"
              detail={`${humanTime(selectedMeeting?.startTime)} - ${humanTime(
                selectedMeeting?.endTime
              )}`}
            />
            <DetalisFormatted
              title="Duration"
              detail={selectedMeeting?.duration || "N/A"}
            />
            <DetalisFormatted
              title="Meeting Status"
              detail={selectedMeeting?.meetingStatus || "N/A"}
            />
            <DetalisFormatted
              title="Housekeeping Status"
              detail={selectedMeeting?.housekeepingStatus || "N/A"}
            />

            {/* Section 2: People Involved */}
            <br />
            <div className="font-bold">People Involved</div>
            {selectedMeeting?.participants?.length > 0 && (
              <DetalisFormatted
                title="Participants"
                detail={selectedMeeting?.participants || "Unknown"}
              />
            )}
            <DetalisFormatted
              title="Booked By"
              detail={selectedMeeting?.bookedBy || "Unknown"}
            />
            <DetalisFormatted
              title="Receptionist"
              detail={selectedMeeting?.receptionist || "Unknown"}
            />
            <DetalisFormatted
              title="Department"
              detail={
                selectedMeeting?.department?.length
                  ? selectedMeeting.department
                      .map((item) => item.name)
                      .join(", ")
                  : "Top Management"
              }
            />

            {/* Section 3: Venue Details */}
            <br />
            <div className="font-bold">Venue Details</div>
            <DetalisFormatted
              title="Room"
              detail={selectedMeeting?.roomName || "N/A"}
            />
            <DetalisFormatted
              title="Location"
              detail={selectedMeeting?.location || "N/A"}
            />
            <DetalisFormatted
              title="Building"
              detail={selectedMeeting?.buildingName || "N/A"}
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
