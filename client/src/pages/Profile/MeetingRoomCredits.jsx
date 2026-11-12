import React, { useState } from "react";
import AgTable from "../../components/AgTable";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useMutation, useQuery } from "@tanstack/react-query";
import { CircularProgress, TextField } from "@mui/material";
import { toast } from "sonner";
import { MdOutlineRateReview, MdOutlineRemoveRedEye } from "react-icons/md";
import DetalisFormatted from "../../components/DetalisFormatted";
import PrimaryButton from "../../components/PrimaryButton";
import { Controller, useForm } from "react-hook-form";
import MuiModal from "../../components/MuiModal";
import { queryClient } from "../../main";
import useAuth from "../../hooks/useAuth";
import CustomRating from "../../components/CustomRating";
import humanTime from "../../utils/humanTime";
import humanDateFormat from "../../utils/humanDateForamt";
import humanDate from "../../utils/humanDateForamt";
import { formatMeetingDateRange } from "../../utils/formatMeetingDateRange";
import PageFrame from "../../components/Pages/PageFrame";
import YearWiseTable from "../../components/Tables/YearWiseTable";

const MeetingRoomCredits = ({ pageTitle }) => {
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [detailsModal, setDetailsModal] = useState(false);
  const { auth } = useAuth();
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
  const {
    handleSubmit: reviewForm,
    control: reviewControl,
    formState: { errors: reviewErrors },
  } = useForm({
    defaultValues: {
      review: "",
      rating: 0,
    },
  });

  const { mutate: addReview, isPending: isAddReviewPending } = useMutation({
    mutationKey: ["addReview"],
    mutationFn: async (review) => {
      const response = await axios.post("/api/meetings/create-review", review);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["myMeetings"] });
      toast.success(data.message || "REVIEW added");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to add review");
    },
  });

  const submitReview = (data) => {
    addReview({
      meetingId: selectedMeeting.meetingId,
      review: data.review,
      rate: data.rating,
      reviewerEmail: auth.user?.email,
      reviewerName: `${auth.user?.firstName} ${auth.user?.lastName}`,
    });
    setOpenModal(false);
  };

  const handleAddReview = (data) => {
    setSelectedMeeting(data);
    setOpenModal(true);
  };

  const handleViewDetails = (meeting) => {
    setSelectedMeeting(meeting);
    setDetailsModal(true);
  };

  const myMeetingsColumn = [
    { field: "srNo", headerName: "Sr No", sort: "desc" },
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
    <>
    <PageFrame>
      <YearWiseTable
        loading={isMyMeetingsPending}
        dateColumn={"date"}
        tableTitle={"My Meetings"}
        data={[
          ...myMeetings.map((meeting, index) => {
            const bookedByName =
              typeof meeting.bookedBy === "string" &&
              meeting.bookedBy !== "Unknown"
                ? meeting.bookedBy
                : meeting.bookedBy?.firstName
                  ? `${meeting.bookedBy.firstName || ""} ${meeting.bookedBy.lastName || ""}`.trim()
                  : meeting.clientBookedBy?.employeeName ||
                    meeting.clientBookedBy?.name ||
                    "Unknown";

            return {
              srNo: index + 1,
              meetingId: meeting._id,
              agenda: meeting.agenda,
              client: meeting.client,
              roomName: meeting.roomName,
              duration: meeting.duration,
              meetingStatus: meeting.meetingStatus,
              meetingType: meeting.meetingType,
              date: meeting.date,
              startDate: meeting.startDate,
              endDate: meeting.endDate,
              bookingSlots: meeting.bookingSlots,
              bookedBy: bookedByName,
              clientBookedBy: meeting.clientBookedBy,
              receptionist: meeting.receptionist || "Unknown",
              reviews: meeting.reviews,
              location: meeting.location ? `${meeting.location?.unitNo}` : "N/A",
              buildingName: meeting.location.building.buildingName,
              participants:
                meeting.participants
                  .map((p) =>
                    p.employeeName
                      ? p.employeeName
                      : p.firstName
                        ? `${p.firstName} ${p.lastName}`
                        : "N/A",
                  )
                  .join(", ") || "N/A",
            };
          }),
        ]}
        columns={myMeetingsColumn}
        search
      />
    </PageFrame>

      <MuiModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        title={"Add review"}
      >
        <form
          onSubmit={reviewForm(submitReview)}
          className="flex flex-col gap-4"
        >
          <div className="flex gap-4 items-center">
            <span className="text-content">
              How was your meeting room experience ?
            </span>
            <Controller
              name="rating"
              control={reviewControl}
              rules={{ required: "Rating is required" }}
              render={({ field }) => <CustomRating {...field} />}
            />
            {reviewErrors.rating && (
              <span className="text-small text-red-600">
                {reviewErrors.rating.message}
              </span>
            )}
          </div>
          <Controller
            name="review"
            control={reviewControl}
            rules={{ required: "Review is required" }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Review"
                fullWidth
                multiline
                rows={4}
                error={!!reviewErrors.review}
                helperText={reviewErrors.review?.message}
              />
            )}
          />
          <PrimaryButton
            title={"Submit"}
            type={"submit"}
            isLoading={isAddReviewPending}
            disabled={isAddReviewPending}
          />
        </form>
      </MuiModal>
      <MuiModal
        open={detailsModal}
        onClose={() => setDetailsModal(false)}
        title={"Meeting Details"}
      >
        {selectedMeeting ? (
          <div className="w-full grid grid-cols-1 md:grid-cols-1 gap-4">
            {/* <DetalisFormatted
              title="Agenda"
              detail={selectedMeeting?.agenda || "N/A"}
            />
            <DetalisFormatted
              title="Date"
              detail={selectedMeeting?.date || "N/A"}
            />
            <DetalisFormatted
              title="Room"
              detail={selectedMeeting?.roomName || "N/A"}
            />
            <DetalisFormatted
              title="Location"
              detail={selectedMeeting?.location || "N/A"}
            /> */}
            <div className="font-bold">Basic Info</div>
            <DetalisFormatted
              title="Title"
              detail={selectedMeeting?.title || "Title"}
            />
            <DetalisFormatted
              title="Agenda"
              detail={selectedMeeting.agenda || "N/A"}
            />
            <DetalisFormatted
              title="Date"
              detail={formatMeetingDateRange(selectedMeeting)}
            />
            {/* <DetalisFormatted
              title="Time"
              detail={`${humanTime(selectedMeeting.startTime)} - ${humanTime(
                selectedMeeting.endTime
              )}`}
            /> */}
            <DetalisFormatted
              title="Duration"
              detail={selectedMeeting.duration || "N/A"}
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
              detail={selectedMeeting.client || "N/A"}
            />
            {/* fffff */}

            {/* <DetalisFormatted
                          title={"Booked By"}
                          detail={
                            selectedMeeting?.bookedBy ||
                            selectedMeeting?.clientBookedBy ||
                            "N/A"
                          }
                        />
                        <DetalisFormatted
                          title={"Client Name"}
                          detail={selectedMeeting?.client}
                        />
                        <DetalisFormatted
                          title={"Date"}
                          detail={humanDate(selectedMeeting?.date)}
                        />
                        <DetalisFormatted
                          title={"Start Time"}
                          detail={humanTime(selectedMeeting?.startTime)}
                        />
                        <DetalisFormatted
                          title={"End Time"}
                          detail={humanTime(selectedMeeting?.endTime)}
                        />
                        {selectedMeeting.extendTime && (
                          <DetalisFormatted
                            title={"Extended Time"}
                            detail={humanTime(selectedMeeting?.extendTime)}
                          />
                        )} */}
            <br />
            <div className="font-bold">People Involved</div>
            {/* <div className="col-span-1 ">
                          <DetalisFormatted
                            title={"Participants"}
                            detail={selectedMeeting?.participants.map((item) => (
                              <span>{`${item.firstName || item.employeeName || "unknown"} ${
                                item.lastName || ""
                              }`}</span>
                            ))}
                          />
                        </div>
                        <DetalisFormatted
                          title={"House Keeping Status"}
                          detail={selectedMeeting?.housekeepingStatus}
                        /> */}

            {/* dddd */}

            {selectedMeeting.participants?.length > 0 && (
              <DetalisFormatted
                title="Participants"
                detail={selectedMeeting.participants}
              />
            )}

            <DetalisFormatted
              title="Booked By"
              detail={
                selectedMeeting.bookedBy ||
                selectedMeeting.clientBookedBy?.employeeName ||
                selectedMeeting.clientBookedBy?.name ||
                "Unknown"
              }
            />
            <DetalisFormatted
              title="Receptionist"
              // detail={selectedMeeting.receptionist}
              detail={`N/A`}
            />
            <DetalisFormatted
              title="Department"
              detail={selectedMeeting.department || "Top Management"}
            />

            <br />
            <div className="font-bold">Venue Details</div>
            {/* <DetalisFormatted
                          title={"Room Name"}
                          detail={selectedMeeting?.roomName}
                          upperCase
                        /> */}

            {/* vvvv */}
            <DetalisFormatted title="Room" detail={selectedMeeting.roomName} />
            <DetalisFormatted
              title="Location"
              detail={`${selectedMeeting.location}`}
            />
            <DetalisFormatted
              title="Building"
              detail={selectedMeeting.buildingName}
            />
            {/* <DetalisFormatted
              title="Housekeeping Status"
              detail={selectedMeeting.housekeepingStatus}
            /> */}

            {/* <DetalisFormatted
                          title={"Department"}
                          detail={selectedMeeting?.department}
                        /> */}
          </div>
        ) : (
          <CircularProgress />
        )}
      </MuiModal>
    </>
  );
};

export default MeetingRoomCredits;
