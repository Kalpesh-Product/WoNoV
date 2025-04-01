import React, { useState, useRef } from "react";
import PrimaryButton from "../../components/PrimaryButton";
import {
  Button,
  Card,
  CardContent,
  CardMedia,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import { FiMonitor, FiSun, FiWifi } from "react-icons/fi";
import MuiModal from "../../components/MuiModal";
import { Controller, useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { toast } from "sonner";
import useAuth from "../../hooks/useAuth";

const MeetingSettings = () => {
  const axios = useAxiosPrivate();
  const queryClient = useQueryClient(); // React Query client to refetch rooms
  const [openModal, setOpenModal] = useState(false);
  const { control, reset, handleSubmit } = useForm();
  const [selectedFile, setSelectedFile] = useState(null);
  const { auth } = useAuth();
  const inputRef = useRef();


  // Fetch Meeting Rooms from API
  const { data: meetingRooms = [], isPending:isMeetingRoomsLoading } = useQuery({
    queryKey: ["meetingRooms"],
    queryFn: async () => {
      try {
        const response = await axios.get("/api/meetings/get-rooms");
        return response.data;
      } catch (error) {
        throw new Error(error.response.data.message);
      }
    },
  });

  const handleFileChange = (event, field) => {
    const file = event.target.files[0];
    setSelectedFile(file);
    field.onChange(file); // Update React Hook Form state
  };

  // Mutation for creating a room
  const createRoomMutation = useMutation({
    mutationFn: async (formData) => {
      return axios.post("/api/meetings/create-room", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onSuccess: () => {
      toast.success("Room added successfully!");
      queryClient.invalidateQueries(["meetingRooms"]); // Refresh the room list
      handleCloseModal();
      reset(); // Reset form fields
      inputRef.current.value = null;
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to add room.");
    },
  });

  // Handle form submission
  // Handle form submission
  const onSubmit = async (data) => {
    // Prepare FormData for multipart request
    const formData = new FormData();
    formData.append("name", data.roomName);
    formData.append("seats", data.seats);
    formData.append("description", data.description);
    formData.append("location", data.location); // Default location

    if (selectedFile) {
      formData.append("room", selectedFile);
    }

    // Make API request
    createRoomMutation.mutate(formData);
  };

  const handleOpenModal = () => {
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    // inputRef.current.value = "";
    setSelectedFile("")
    reset();
  };

  return (
    <div className="m-4 rounded-md border-default border-borderGray">
      <div className="p-4 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-title text-primary">Meeting Rooms</span>
          </div>
          <div>
            <PrimaryButton
              handleSubmit={handleOpenModal}
              title={"Add New Room"}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {!isMeetingRoomsLoading ? meetingRooms.map((room) => (
            <Card
              key={room._id}
              className="shadow-md hover:shadow-lg transition-shadow border border-gray-200"
            >
              <CardMedia
                component="img"
                sx={{ height: "350px" }}
                image={room.image?.url || "https://via.placeholder.com/350"} // Fallback Image
                alt={room.name}
                className="object-cover"
              />
              <CardContent>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-subtitle">{room.name}</span>
                  <span
                    className={`px-4 py-1 text-content font-pregular rounded-full ${
                      room.status === "Available"
                        ? "bg-green-100 text-green-600"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {room.status}
                  </span>
                </div>
                <div className="flex items-center space-x-2 mb-4 text-gray-500">
                  <FiWifi />
                  <FiSun />
                  <FiMonitor />
                </div>
                <p className="mb-2 text-sm font-medium text-gray-800">
                  <span role="img" aria-label="person">
                    👥
                  </span>{" "}
                  Fits {room.seats} people
                </p>
                <div className="mt-4">
                  <PrimaryButton title={"Edit Room"} />
                </div>
              </CardContent>
            </Card>
          )) : <CircularProgress color="#1E3D73"/>}
        </div>
      </div>

      {/* Modal for Adding New Room */}
      <MuiModal
        open={openModal}
        onClose={handleCloseModal}
        title={"Add a Meeting Room"}
      >
        <div className="flex flex-col gap-4">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-4">
              <Controller
                name="roomName"
                control={control}
                defaultValue={""}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={"Room Name"}
                    variant={"outlined"}
                    size="small"
                    fullWidth
                  />
                )}
              />
              <Controller
                name="seats"
                control={control}
                defaultValue={""}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={"Seats"}
                    variant={"outlined"}
                    size="small"
                    fullWidth
                  />
                )}
              />
              <Controller
                name="description"
                control={control}
                defaultValue={""}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={"Description"}
                    variant={"outlined"}
                    multiline
                    rows={5}
                    fullWidth
                  />
                )}
              />
              <Controller
                name="location"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <FormControl size="small" fullWidth>
                    <InputLabel>Location</InputLabel>
                    <Select {...field} label="Work Location">
                      <MenuItem value="">Select Location</MenuItem>
                      {auth.user.company.workLocations.length > 0 ? (
                        auth.user.company.workLocations.map((loc) => (
                          <MenuItem key={loc._id} value={loc.buildingName}>
                            {loc.buildingName}
                          </MenuItem>
                        ))
                      ) : (
                        <MenuItem disabled>No Locations Available</MenuItem>
                      )}
                    </Select>
                  </FormControl>
                )}
              />

              <Controller
                name="roomImage"
                control={control}
                defaultValue={null}
                render={({ field }) => (
                  <div className="flex flex-col gap-2">
                    <span className="text-content">Upload Room Image</span>
                    <div className="flex gap-2 items-center">
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        id="upload-file"
                        onChange={(event) => handleFileChange(event, field)}
                      />
                      <label htmlFor="upload-file">
                        <Button
                          sx={{
                            backgroundColor: "#ebf5ff",
                            color: "#4b5d87",
                            fontFamily: "Poppins-Bold",
                          }}
                          variant="contained"
                          component="span"
                        >
                          Choose File
                        </Button>
                      </label>
                      <span className="text-content">
                        {selectedFile ? selectedFile.name : "No file chosen"}
                      </span>
                    </div>
                  </div>
                )}
              />
              <div className="flex justify-center">
                <PrimaryButton title={"Submit"} type={"submit"} />
              </div>
            </div>
          </form>
        </div>
      </MuiModal>
    </div>
  );
};

export default MeetingSettings;
