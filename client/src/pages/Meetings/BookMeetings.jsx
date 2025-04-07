import React, { useEffect, useState } from "react";
import {
  Chip,
  CircularProgress,
  LinearProgress,
  MenuItem,
  TextField,
} from "@mui/material";
import PrimaryButton from "../../components/PrimaryButton";
import { Controller, useForm, useWatch } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import AgTable from "../../components/AgTable";
import useAuth from "../../hooks/useAuth";
import { MdEventSeat } from "react-icons/md";
import MuiModal from "../../components/MuiModal";
import { queryClient } from "../../main";
import CustomRating from "../../components/CustomRating";

const BookMeetings = () => {
  // ------------------------------Initializations ------------------------------------//
  const navigate = useNavigate();
  const axios = useAxiosPrivate();
  const { auth } = useAuth();
  const [selectedUnitId, setSelectedUnitId] = useState("");
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const locations = auth.user.company.workLocations;
  // ------------------------------Initializations ------------------------------------//

  // ------------------------------Form Control ------------------------------------//
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      location: "",
      meetingRoom: "",
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
  const watchFields = watch();
  const selectedUnit = useWatch({ control, name: "location" });
  // ------------------------------Form Control ------------------------------------//

  // ------------------------------ API Integrations ------------------------------------//
  // Fetch all Meeting Rooms
  const {
    data: allMeetingRooms = [],
    isLoading: meetingRoomsLoading,
    error: meetingRoomsError,
  } = useQuery({
    queryKey: ["meetingRooms"],
    queryFn: async () => {
      const response = await axios.get("/api/meetings/get-rooms");
      return response.data;
    },
  });

  // Filter meeting rooms based on selected location
  const filteredMeetingRooms = selectedUnitId
    ? allMeetingRooms.filter(
        (room) => room.location?.building?._id === selectedUnitId
      )
    : [];

  useEffect(() => {
    setValue("meetingRoom", ""); // Reset meeting room selection
  }, [selectedUnit, setValue]);

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
  useEffect(() => {
    console.log(selectedMeeting);
  }, [selectedMeeting]);

  const buildings = locations.map((location) => ({
    _id: location._id,
    buildingName: location.buildingName,
  }));

  const myMeetingsColumn = [
    { field: "id", headerName: "SR NO", sort: "desc" },
    { field: "agenda", headerName: "Agenda", flex: 1 },
    { field: "date", headerName: "Date" },
    { field: "roomName", headerName: "Room Name" },
    {
      field: "location",
      headerName: "Location",
    },
    {
      field: "actions",
      headerName: "Action",
      cellRenderer: (params) => {
        const rawReview = params.data?.reviews;

        // Normalize: treat review as an array even if it's an object
        const meetingReviews = Array.isArray(rawReview)
          ? rawReview
          : rawReview
          ? [rawReview]
          : [];

        return meetingReviews.length > 0 ? (
          "Review added"
        ) : (
          <div className="p-2">
            <PrimaryButton
              title={"Add review"}
              handleSubmit={() => handleAddReview(params.data)}
            />
          </div>
        );
      },
    },
  ];
  // ------------------------------ API Integrations ------------------------------------//

  // ------------------------------ Form Handling ------------------------------------//
  const onSubmit = (data) => {
    const selectedLocation = allMeetingRooms.find(
      (location) => location.location?.building?._id === data.location
    );
    const selectedRoom = allMeetingRooms.find(
      (room) => room._id === data.meetingRoom
    );

    const selectedLocationName =
      selectedLocation.location?.building?.buildingName;
    const selectedRoomName = selectedRoom.name;
    const selectedLocationId = selectedLocation.location?.building?._id;
    const selectedRoomId = selectedRoom._id;
    navigate(
      `/app/meetings/book-meeting/schedule-meeting?location=${selectedLocationName}&meetingRoom=${selectedRoomName}`,
      {
        state: {
          meetingRoomId: selectedRoomId,
        },
      }
    );
  };
  // ------------------------------ Form Handling ------------------------------------//

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="border-default border-borderGray p-4 rounded-md text-center">
        <h2 className="font-pregular text-title text-primary my-10">
          Book A Meeting
        </h2>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col items-center"
        >
          <div className="grid grid-cols-1 px-0 sm:grid-cols-1 md:grid-cols-2 md:px-0 sm:px-0 justify-center gap-4 mb-10 w-full">
            {/* Location Dropdown */}
            <Controller
              name="location"
              control={control}
              rules={{ required: "Please select a Location" }}
              render={({ field }) => {
                return (
                  <TextField
                    {...field}
                    label="Select Location"
                    fullWidth
                    select
                    size="small"
                    error={!!errors.location}
                    helperText={errors.location?.message}
                    onChange={(e) => {
                      const locationId = e.target.value;
                      field.onChange(e.target.value);

                      const selectedLocation = buildings.find(
                        (building) => building?._id === locationId
                      );
                      setSelectedUnitId(selectedLocation?._id || "");
                    }}
                  >
                    <MenuItem value="" disabled>
                      {" "}
                      Seletc Location
                    </MenuItem>
                    {buildings.map((building) => (
                      <MenuItem key={building?._id} value={building?._id}>
                        {building?.buildingName}
                      </MenuItem>
                    ))}
                  </TextField>
                );
              }}
            />
            <Controller
              name="meetingRoom"
              control={control}
              rules={{ required: "Select a Meeting Room" }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Select Meeting Room"
                  fullWidth
                  size="small"
                  select
                  disabled={!watchFields.location}
                  error={!!errors.meetingRoom}
                  helperText={errors.meetingRoom?.message}
                >
                  <MenuItem value="" disabled>
                    {" "}
                    Select Room
                  </MenuItem>
                  {filteredMeetingRooms.map((room, index) => (
                    <MenuItem key={room._id} value={room._id}>
                      <div className="flex w-full justify-between items-center">
                        <span>{`${room.name}`}</span>
                        <div className="flex text-small gap-2 items-center py-1 px-2 rounded-full bg-primary bg-opacity-10 text-primary">
                          <span>{`${room.seats}`}</span>
                          <MdEventSeat />
                        </div>
                      </div>
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          </div>
          <div className="flex w-full justify-center items-center">
            <PrimaryButton title="Next" type="submit" externalStyles={"w-40"} />
          </div>
        </form>
      </div>

      <div>
        {!isMyMeetingsPending ? (
          <div className="border-default border-borderGray rounded-md p-4">
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
            <span className="text-content">How was your meeting room experience ?</span>
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
    </div>
  );
};

export default BookMeetings;
