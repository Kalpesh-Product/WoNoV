import React, { useState } from "react";
import AgTable from "../../components/AgTable";
import WidgetSection from "../../components/WidgetSection";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useQuery } from "@tanstack/react-query";
import { CircularProgress, LinearProgress, TextField } from "@mui/material";
import { toast } from "sonner";
import { MdOutlineRateReview, MdOutlineRemoveRedEye } from "react-icons/md";
import DetalisFormatted from "../../components/DetalisFormatted";
import PrimaryButton from "../../components/PrimaryButton";
import { Controller } from "react-hook-form";
import MuiModal from "../../components/MuiModal";
import humanTime from "../../utils/humanTime"
import humanDateFormat from "../../utils/humanDateForamt"

const MeetingRoomCredits = ({ pageTitle }) => {
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [detailsModal, setDetailsModal] = useState(false);
  const axios = useAxiosPrivate();
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

  const handleAddReview = (data) => {
    setSelectedMeeting(data);
    setOpenModal(true);
  };

  const handleViewDetails = (meeting) => {
    console.log("meetings",meeting)
    setSelectedMeeting(meeting);
    setDetailsModal(true);
  };

  const myMeetingsColumn = [
    { field: "id", headerName: "Sr No", sort: "desc" },
    { field: "agenda", headerName: "Agenda", flex: 1 },
    { field: "date", headerName: "Date" },
    { field: "roomName", headerName: "Room Name" },
    {
      field: "location",
      headerName: "Location",
    },
    {
      field: "actions",
      headerName: "Actions",
      cellRenderer: (params) => {
        const rawReview = params.data?.reviews;

        const meetingReviews = Array.isArray(rawReview)
          ? rawReview
          : rawReview
          ? [rawReview]
          : [];

        return (
          <div className="p-2 flex items-center gap-2">
            {/* {meetingReviews.length > 0 ? (
              "Review added"
            ) : (
              <span
                onClick={() => handleAddReview(params.data)}
                className="cursor-pointer"
              >
                <MdOutlineRateReview size={20} />
              </span>
            )} */}
            <span
              className="text-subtitle cursor-pointer"
              onClick={() => handleViewDetails(params.data)}
            >
              <MdOutlineRemoveRedEye />
            </span>
          </div>
        );
      },
    },
  ];
  return (
    <div>

      <div>
        <div className="">
          <div>
            {!isMyMeetingsPending ? (
              <div className=" rounded-md">
                <AgTable
                  tableTitle={"My Meetings"}
                  data={[
                    ...myMeetings.map((meeting, index) => ({
                      id: index + 1,
                      meetingId: meeting._id,
                      agenda: meeting.agenda,
                      date: humanDateFormat(meeting.date),
                      subject: meeting.subject,
                      startTime: humanTime(meeting.startTime),
                      endTime: humanTime(meeting.endTime),
                      roomName: meeting.roomName,
                      reviews: meeting.reviews,
                      location: meeting.location
                        ? `${meeting.location?.unitName} - ${meeting.location.unitNo}`
                        : "N/A",
                    })),
                  ]}
                  columns={myMeetingsColumn}
                  search
                />
              </div>
            ) : (
              <LinearProgress
                sx={{
                  backgroundColor: "black",
                  "& .MuiLinearProgress-bar": { backgroundColor: "black" },
                }}
              />
            )}
          </div>
        </div>
      </div>

      <MuiModal
        open={detailsModal}
        onClose={() => setDetailsModal(false)}
        title={"Meeting Details"}
      >
        {selectedMeeting ? (
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
            <DetalisFormatted title="Agenda" detail={selectedMeeting?.agenda || "N/A"} />
            <DetalisFormatted title="Subject" detail={selectedMeeting?.subject || "N/A"} />
            <DetalisFormatted title="Start Time" detail={selectedMeeting?.startTime || "N/A"} />
            <DetalisFormatted title="End Time" detail={selectedMeeting?.endTime || "N/A"} />
            <DetalisFormatted title="Date" detail={selectedMeeting?.date || "N/A"} />
            <DetalisFormatted title="Room" detail={selectedMeeting?.roomName || "N/A"} />
            <DetalisFormatted title="Location" detail={selectedMeeting?.location || "N/A"} />
          </div>
        ) : (
          <CircularProgress />
        )}
      </MuiModal>
    </div>
  );
};

export default MeetingRoomCredits;
