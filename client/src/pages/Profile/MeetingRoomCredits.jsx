import React, { useState } from "react";
import AgTable from "../../components/AgTable";
import WidgetSection from "../../components/WidgetSection";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useMutation, useQuery } from "@tanstack/react-query";
import { CircularProgress, LinearProgress, TextField } from "@mui/material";
import { toast } from "sonner";
import { MdOutlineRateReview, MdOutlineRemoveRedEye } from "react-icons/md";
import DetalisFormatted from "../../components/DetalisFormatted";
import PrimaryButton from "../../components/PrimaryButton";
import { Controller, useForm } from "react-hook-form";
import MuiModal from "../../components/MuiModal";
import { queryClient } from "../../main";
import useAuth from "../../hooks/useAuth";
import CustomRating from "../../components/CustomRating";

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

    const navigationCards = [
    { cardTitle: "Total Credits", quantity: "1000", bgcolor:"#0099FF",quantityColor:"#000033" },
    { cardTitle: "Remaining Credits", quantity: "450", bgcolor:"#66FFCC",quantityColor:"#006600" },
    { cardTitle: "Rooms Booked", quantity: "15 Bookings", bgcolor:"#FFFFCC",quantityColor:"#FF9900" },
  ];


  const handleAddReview = (data) => {
    setSelectedMeeting(data);
    setOpenModal(true);
  };

  const handleViewDetails = (meeting) => {
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
            {meetingReviews.length > 0 ? (
              "Review added"
            ) : (
              <span
                onClick={() => handleAddReview(params.data)}
                className="cursor-pointer"
              >
                <MdOutlineRateReview size={20} />
              </span>
            )}
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
      <div className="flex flex-col gap-4">
        <div>
          <WidgetSection layout={navigationCards.length}>
            {navigationCards.map((card, index) => (
              <div
                key={index}
                className="border  rounded-lg p-4 shadow hover:shadow-md transition-shadow duration-200 cursor-pointer "
                style={{
                  backgroundColor: card.bgcolor,
                  color: card.quantityColor,
                }}
              >
                <div className="text-md">{card.cardTitle}</div>
                <div className="text-lg font-bold">{card.quantity}</div>
              </div>
            ))}
          </WidgetSection>
        </div>
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
                    date: meeting.date,
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
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
            <DetalisFormatted
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
            />
          </div>
        ) : (
          <CircularProgress />
        )}
      </MuiModal>
    </div>
  );
};

export default MeetingRoomCredits;
