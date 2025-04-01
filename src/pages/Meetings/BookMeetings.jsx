import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import PrimaryButton from "../../components/PrimaryButton";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useQuery } from "@tanstack/react-query";
import {toast} from 'sonner'

const BookMeetings = () => {
  const navigate = useNavigate();
  const axios = useAxiosPrivate();


  const { control, handleSubmit, watch } = useForm({
    defaultValues: {
      location: "",
      meetingRoom: "",
    },
  });

  const selectedLocation = watch("location");

  // Fetch Work Locations
  const {
    data: workLocations = [],
    isLoading: locationsLoading,
    error: locationsError,
  } = useQuery({
    queryKey: ["workLocations"],
    queryFn: async () => {
      const response = await axios.get(
        "/api/company/get-company-data?field=workLocations"
      );
      console.log(response.data.workLocations);
      return response.data.workLocations;
    },
  });

  // Fetch all Meeting Rooms
  const {
    data: allMeetingRooms = [],
    isLoading: meetingRoomsLoading,
    error: meetingRoomsError,
  } = useQuery({
    queryKey: ["meetingRooms"],
    queryFn: async () => {
      const response = await axios.get("/api/meetings/get-rooms");
      console.log(response.data);
      return response.data;
    },
  });

  // Filter meeting rooms based on selected location
  const filteredMeetingRooms = selectedLocation
    ? allMeetingRooms.filter((room) => room.location.name === selectedLocation)
    : [];

  const onSubmit = (data) => {
    const { location, meetingRoom } = data;

    if (!location || !meetingRoom) {
      toast.error("Please select both location and meeting room")
      return;
    }

    const selectedRoom = allMeetingRooms.find(
      (room) => room.name === meetingRoom
    );

    if (!selectedRoom) {
      toast.error("Invalid meeting room selected")
      return;
    }

    navigate(
      `/app/meetings/schedule-meeting?location=${location}&meetingRoom=${meetingRoom}`,
      { state: { roomId: selectedRoom._id } } // Passing _id in state
    );
  };

  return (
    <div className="border-default border-borderGray m-4 p-4 rounded-md text-center">
      <h2 className="font-pregular text-title text-primary mt-20 mb-10">
        Book A Meeting
      </h2>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col items-center"
      >
        <div className="flex justify-center gap-4 mb-10 px-20 w-full">
          {/* Location Dropdown */}
          <FormControl className="w-1/2">
            <InputLabel>Select Location</InputLabel>
            <Controller
              name="location"
              control={control}
              render={({ field }) => {
                const uniqueLocations = Array.from(
                  new Map(workLocations.map((loc) => [loc.name, loc])).values()
                );
                return(
                <Select {...field} label="Select Location">
                  <MenuItem value="" disabled>Select Location</MenuItem>
                  {locationsLoading ? (
                    <MenuItem disabled>
                      <CircularProgress size={20} />
                    </MenuItem>
                  ) : locationsError ? (
                    <MenuItem disabled>Error fetching locations</MenuItem>
                  ) : (
                    uniqueLocations.map((location) => (
                      <MenuItem key={location._id} value={location.name}>
                        {location.name}
                      </MenuItem>
                    ))
                  )}
                </Select>
              )}}
            />
          </FormControl>

          {/* Meeting Room Dropdown */}
          <FormControl className="w-1/2">
            <InputLabel>Select Meeting Room</InputLabel>
            <Controller
              name="meetingRoom"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  label="Select Meeting Room"
                  disabled={!selectedLocation || meetingRoomsLoading}
                  value={
                    filteredMeetingRooms.some(
                      (room) => room.name === field.value
                    )
                      ? field.value
                      : ""
                  }
                  onChange={(event) => field.onChange(event.target.value)}
                >
                  <MenuItem value="">Select Meeting Room</MenuItem>
                  {meetingRoomsLoading ? (
                    <MenuItem disabled>
                      <CircularProgress size={20} />
                    </MenuItem>
                  ) : meetingRoomsError ? (
                    <MenuItem disabled>Error fetching meeting rooms</MenuItem>
                  ) : filteredMeetingRooms.length === 0 ? (
                    <MenuItem disabled>No rooms available</MenuItem>
                  ) : (
                    filteredMeetingRooms.map((room) => (
                      <MenuItem key={room._id} value={room.name}>
                        {room.name}
                      </MenuItem>
                    ))
                  )}
                </Select>
              )}
            />
          </FormControl>
        </div>

        <PrimaryButton
          title="Next"
          type="submit"
          fontSize="text-content"
          externalStyles="w-48 mb-20"
        />
      </form>
    </div>
  );
};

export default BookMeetings;
